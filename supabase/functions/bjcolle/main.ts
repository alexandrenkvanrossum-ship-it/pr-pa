// Fonction Supabase « bjcolle » : robot qui consulte BJcolle avec le compte d'Alexandre (lecture seule)
// et range planning, colles de la classe, sujets, commentaires et archives dans la base.
// Secrets à créer dans Supabase : BJ_USER, BJ_PASS (identifiants BJcolle), BJ_OWNER (identifiant du compte de l'app), BJ_KEY (clé du déclencheur horaire).
import { parseList, parseDetail, menuLinks, text } from "./parse.js";

const BASE = "https://www.bjcolle.fr/";
const SB = Deno.env.get("SUPABASE_URL")!;
const SRK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
let OWNER = Deno.env.get("BJ_OWNER") ?? "";
async function resolveOwner() {
  if (OWNER) return OWNER;
  const r = await fetch(SB + "/auth/v1/admin/users?per_page=50", { headers: { apikey: SRK, Authorization: "Bearer " + SRK } });
  const j = await r.json(); const users = j.users || [];
  const mail = (Deno.env.get("BJ_EMAIL") || "").toLowerCase();
  const u = mail ? users.find((x: any) => (x.email || "").toLowerCase() === mail) : users.length === 1 ? users[0] : null;
  OWNER = u?.id || ""; return OWNER;
}
const KEY = Deno.env.get("BJ_KEY") ?? "";
const UA = "Mozilla/5.0 (compatible; prepa-app/1.0; usage personnel)";
let DETAILS_PAR_PASSAGE = 90;

// ---------- base de données (API REST de Supabase, clé de service) ----------
async function db(path: string, init: RequestInit = {}) {
  const r = await fetch(SB + "/rest/v1/" + path, { ...init, headers: { apikey: SRK, Authorization: "Bearer " + SRK, "Content-Type": "application/json", ...(init.headers || {}) } });
  if (!r.ok) throw new Error("base " + r.status + " " + (await r.text()).slice(0, 300));
  const t = await r.text(); return t ? JSON.parse(t) : null;
}
const upsert = (table: string, rows: unknown[]) => rows.length ? db(table + "?on_conflict=" + (table === "bj_state" ? "owner" : "owner,id"), { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows) }) : null;

// ---------- session BJcolle ----------
class Bj {
  jar = new Map<string, string>();
  cookie() { return [...this.jar].map(([k, v]) => k + "=" + v).join("; "); }
  keep(r: Response) { for (const c of r.headers.getSetCookie()) { const [kv] = c.split(";"); const i = kv.indexOf("="); if (i > 0) this.jar.set(kv.slice(0, i).trim(), kv.slice(i + 1).trim()); } }
  async req(path: string, init: RequestInit = {}, hops = 0): Promise<string> {
    const r = await fetch(BASE + path.replace(/^\//, ""), { ...init, redirect: "manual", headers: { "User-Agent": UA, Cookie: this.cookie(), ...(init.headers || {}) } });
    this.keep(r);
    if (r.status >= 300 && r.status < 400 && hops < 5) { const loc = r.headers.get("location") || ""; await r.body?.cancel(); return this.req(loc.replace(BASE, "").replace(/^https?:\/\/[^/]+\//, ""), {}, hops + 1); }
    const buf = new Uint8Array(await r.arrayBuffer());
    const ct = r.headers.get("content-type") || "";
    let html = new TextDecoder(/8859-1|latin/i.test(ct) ? "iso-8859-1" : "utf-8").decode(buf);
    if (!/charset/i.test(ct) && /charset=["']?iso-8859-1/i.test(html.slice(0, 2000))) html = new TextDecoder("iso-8859-1").decode(buf);
    await new Promise((s) => setTimeout(s, 250)); // une requête à la fois, sans brusquer le site
    return html;
  }
  get(path: string) { return this.req(path); }
  post(path: string, fields: Record<string, string>) { return this.req(path, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(fields).toString() }); }
  async login() {
    await this.get("acces.php");
    const h = await this.post("acces.php", { USERNAME_ACCES: Deno.env.get("BJ_USER") ?? "", PASSWORD_ACCES: Deno.env.get("BJ_PASS") ?? "", SOUVENIR: "on", valider_ident: "Valider" });
    const home = /Déconnexion|deconnexion\.php/i.test(h) ? h : await this.get("index.php");
    if (!/deconnexion\.php/i.test(home)) throw new Error("Connexion à BJcolle refusée : vérifie les secrets BJ_USER et BJ_PASS.");
    return home;
  }
}

// ---------- outils ----------
const noteNum = (n?: string) => { const m = String(n || "").match(/^(\d+(?:[.,]\d+)?)\s*\/\s*20/); return m ? +m[1].replace(",", ".") : null; };
const today = () => new Date(Date.now() + 2 * 3600e3).toISOString().slice(0, 10);
const annee = (d?: string) => { if (!d) return null; const y = +d.slice(0, 4), m = +d.slice(5, 7); return m >= 8 ? y + "-" + (y + 1) : (y - 1) + "-" + y; };
const FR_J = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const quand = (d: string, h?: string) => { const x = new Date(d + "T12:00:00"); return FR_J[x.getDay()] + " " + x.getDate() + "/" + (x.getMonth() + 1) + (h ? " " + h.replace(":", "h") : ""); };

function row(o: any, moiNom: string) {
  const moi = o.scope.endsWith("moi") || o.scope.endsWith("kore") || (!!o.eleve && norm(o.eleve) === norm(moiNom));
  return { owner: OWNER, id: o.id, scope: o.scope, annee: annee(o.date), discipline: o.discipline, date: o.date || null, debut: o.debut || null, fin: o.fin || null, duree: o.duree || null,
    tirage: o.tirage || null, type: o.type || null, colleur: o.colleur || null, salle: o.salle || null, eleve: o.eleve || (moi ? moiNom : null), moi, note: o.note ?? null, note_num: noteNum(o.note),
    ordre: o.ordre || null, href: o.href || null, updated_at: new Date().toISOString() };
}
const norm = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/\s+/).sort().join(" ");

// Toutes les pages d'une liste (affichage 60 colles par page, page 1, 2, … jusqu'à répétition)
async function allPages(bj: Bj, page: string, scope: string, maxPages = 60) {
  await bj.get(page + "?disp=60");
  const out: any[] = []; let prev = "";
  for (let p = 1; p <= maxPages; p++) {
    const items = parseList(await bj.get(page + "?page=" + p), scope);
    const sig = items.map((x: any) => x.id).join(",");
    if (!items.length || sig === prev) break;
    prev = sig; out.push(...items);
  }
  const last = parseList(await bj.get(page + "?page=0"), scope); out.push(...last);
  return dedupe(out);
}
function dedupe(list: any[]) { const m = new Map(); for (const x of list) m.set(x.id, x); return [...m.values()]; }

// ---------- passage ----------
async function run(mode: string) {
  const bj = new Bj();
  const home = await bj.login();
  const moiNom = text((home.match(/<header[\s\S]*?<\/header>/i) || [""])[0]).split("\n").find((l) => /^[A-ZÉÈ][a-zéèëï-]+ [A-Z' -]{2,}$/.test(l)) || "";
  const menu = menuLinks(home);
  const [state] = (await db("bj_state?owner=eq." + OWNER + "&select=data")) || [];
  const st: any = state?.data || {};
  const backfill = mode === "complet" || !st.archivesFaites;
  if (backfill) DETAILS_PAR_PASSAGE = 30;
  const events: any[] = [];

  // 1. Ancien état de mes colles (pour repérer les changements)
  const avant: any[] = await db("bj_colles?owner=eq." + OWNER + "&moi=eq.true&select=id,date,debut,salle,colleur,note,discipline,sujet,scope&date=gte." + new Date(Date.now() - 60 * 864e5).toISOString().slice(0, 10)) || [];
  const avantMap = new Map(avant.map((x) => [x.id, x]));

  // 2. Année en cours : mes colles, Gox et Khass, colles de la classe
  if (menu["Mes colles"]?.href) await bj.get(menu["Mes colles"].href); // remet la session en mode « année en cours »
  await bj.get("students_dashboard_disc.php?disp=60");
  const mes = dedupe([...parseList(await bj.get("students_dashboard_disc.php?page=0"), "moi"), ...parseList(await bj.get("students_dashboard_disc.php?page=1"), "moi")]);
  await bj.get("kore_students_dashboard_disc.php?disp=60");
  const kore = parseList(await bj.get("kore_students_dashboard_disc.php?page=0"), "kore");
  let classe: any[];
  if (backfill || !st.classeComplete) { classe = await allPages(bj, "students_dashboard_class.php", "classe"); st.classeComplete = true; }
  else { await bj.get("students_dashboard_class.php?disp=60"); classe = dedupe([...parseList(await bj.get("students_dashboard_class.php?page=0"), "classe")]); }
  await bj.get("students_dashboard_disc.php?disp=0"); await bj.get("students_dashboard_class.php?disp=0"); await bj.get("kore_students_dashboard_disc.php?disp=0");

  const rows = [...mes, ...kore, ...classe].map((o) => row(o, moiNom));

  // 3. Archives des années précédentes (une seule fois, puis une vérification par semaine)
  const semaine = Math.floor(Date.now() / (7 * 864e5));
  if (backfill || st.archivesSemaine !== semaine) {
    try {
      if (menu["Archives Mes colles"]?.post) {
        await bj.post("index.php", { [menu["Archives Mes colles"].post]: "Archives Mes colles" });
        await bj.get("students_dashboard_disc.php?disp=60");
        const am = dedupe([...parseList(await bj.get("students_dashboard_disc.php?page=0"), "archive-moi"), ...parseList(await bj.get("students_dashboard_disc.php?page=1"), "archive-moi")]);
        const ac = await allPages(bj, "students_dashboard_class.php", "archive-classe");
        rows.push(...am.map((o) => row(o, moiNom)), ...ac.map((o) => row(o, moiNom)));
      }
      if (menu["Archives Gox et Khass"]?.post) {
        await bj.post("index.php", { [menu["Archives Gox et Khass"].post]: "Archives Gox et Khass" });
        await bj.get("kore_students_dashboard_disc.php?disp=60");
        rows.push(...parseList(await bj.get("kore_students_dashboard_disc.php?page=0"), "archive-kore").map((o) => row(o, moiNom)));
      }
      st.archivesFaites = true; st.archivesSemaine = semaine;
    } finally {
      if (menu["Mes colles"]?.href) await bj.get(menu["Mes colles"].href);
      await bj.get("students_dashboard_disc.php?disp=0"); await bj.get("students_dashboard_class.php?disp=0"); await bj.get("kore_students_dashboard_disc.php?disp=0");
    }
  }

  // Une même colle peut figurer dans plusieurs listes (la mienne et celle de la classe) : on fusionne
  const RANG: Record<string, number> = { moi: 0, kore: 1, "archive-moi": 2, "archive-kore": 3, classe: 4, "archive-classe": 5 };
  const fus = new Map<string, any>();
  for (const r of rows) {
    const a = fus.get(r.id);
    if (!a) { fus.set(r.id, r); continue; }
    const [hi, lo] = (RANG[r.scope] ?? 9) < (RANG[a.scope] ?? 9) ? [r, a] : [a, r];
    const m: any = { ...lo, ...Object.fromEntries(Object.entries(hi).filter(([, v]) => v !== null && v !== undefined && v !== "")) };
    m.moi = !!(a.moi || r.moi); m.scope = hi.scope;
    fus.set(r.id, m);
  }
  rows.splice(0, rows.length, ...fus.values());

  // 4. Changements sur mes colles → nouveautés
  const t0 = today();
  for (const r of rows.filter((x) => x.moi && x.scope === "moi" || x.scope === "kore")) {
    const a = avantMap.get(r.id);
    const nom = r.discipline + (r.colleur ? " avec " + r.colleur : "");
    if (!a) { if (st.dejaVu && r.date && r.date >= t0) events.push({ kind: "nouvelle", titre: "Nouvelle colle : " + nom, detail: quand(r.date, r.debut) + (r.salle ? " · " + r.salle : ""), colle_id: r.id }); continue; }
    if (a.date !== r.date || a.debut !== r.debut) events.push({ kind: "deplacee", titre: r.discipline + " déplacée", detail: quand(a.date, a.debut) + " → " + quand(r.date!, r.debut!), colle_id: r.id });
    else if ((a.salle || "") !== (r.salle || "") && r.salle) events.push({ kind: "salle", titre: r.discipline + " : changement de salle", detail: (a.salle || "?") + " → " + r.salle, colle_id: r.id });
    if ((a.colleur || "") !== (r.colleur || "") && r.colleur && a.colleur) events.push({ kind: "colleur", titre: r.discipline + " : changement de colleur", detail: a.colleur + " → " + r.colleur, colle_id: r.id });
    if (!a.note && r.note && noteNum(r.note) !== null) events.push({ kind: "note", titre: "Note de " + r.discipline + " : " + r.note, detail: quand(r.date!, r.debut!) + (r.colleur ? " · " + r.colleur : ""), colle_id: r.id });
  }
  // Disparition d'une de mes colles à venir
  const ids = new Set(rows.map((r) => r.id));
  for (const a of avant) if (a.scope === "moi" && a.date >= t0 && !ids.has(a.id)) events.push({ kind: "annulee", titre: a.discipline + " retirée du planning", detail: quand(a.date, a.debut), colle_id: a.id });
  // Publication du planning de la semaine suivante
  const futurs = rows.filter((r) => r.scope === "moi" && r.date && r.date > t0 && !avantMap.has(r.id));
  if (st.dejaVu && futurs.length >= 2) events.push({ kind: "planning", titre: "Planning de colles publié", detail: futurs.map((r) => r.discipline + " " + quand(r.date!, r.debut!)).join(" · ") });
  st.dejaVu = true;

  for (let i = 0; i < rows.length; i += 400) await upsert("bj_colles", rows.slice(i, i + 400));

  // 5. Feuilles de colle (sujet, commentaire) : récentes d'abord, puis l'historique petit à petit
  const ilYa = (j: number) => new Date(Date.now() - j * 864e5).toISOString().slice(0, 10);
  const recents: any[] = await db("bj_colles?owner=eq." + OWNER + "&href=not.is.null&date=gte." + ilYa(21) + "&or=(detail_at.is.null,sujet.is.null,commentaire.is.null,detail_at.lt." + new Date(Date.now() - 6 * 3600e3).toISOString() + ")&select=id,href,moi,discipline,colleur,date,sujet&order=date.desc&limit=" + DETAILS_PAR_PASSAGE) || [];
  const reste = DETAILS_PAR_PASSAGE - recents.length;
  const anciens: any[] = reste > 0 ? await db("bj_colles?owner=eq." + OWNER + "&href=not.is.null&detail_at=is.null&select=id,href,moi,discipline,colleur,date,sujet&order=date.desc&limit=" + reste) || [] : [];
  const details: any[] = []; let nouveauxSujets = 0;
  for (const c of [...recents, ...anciens]) {
    try {
      const d = parseDetail(await bj.get(c.href));
      details.push({ owner: OWNER, id: c.id, sujet: d.sujet || null, commentaire: d.commentaire || null, champs: d.champs, salle_detail: d.salle || null, absent: d.absent, detail_at: new Date().toISOString() });
      if (!c.sujet && d.sujet && c.date >= ilYa(10)) { nouveauxSujets++; if (c.moi) events.push({ kind: "commentaire", titre: "Feuille de colle de " + c.discipline + " disponible", detail: d.sujet.slice(0, 140), colle_id: c.id }); }
    } catch (_) { /* on réessaiera au prochain passage */ }
  }
  for (const d of details) await db("bj_colles?owner=eq." + OWNER + "&id=eq." + encodeURIComponent(d.id), { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ sujet: d.sujet, commentaire: d.commentaire, champs: d.champs, absent: d.absent, detail_at: d.detail_at }) });
  if (nouveauxSujets >= 3 && st.dejaVuSujets) events.push({ kind: "sujets", titre: nouveauxSujets + " nouveaux sujets dans la classe", detail: "Colles des derniers jours" });
  st.dejaVuSujets = true;

  if (events.length) await db("bj_events", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(events.map((e) => ({ owner: OWNER, ...e }))) });
  const total = await fetch(SB + "/rest/v1/bj_colles?owner=eq." + OWNER + "&select=id", { method: "HEAD", headers: { apikey: SRK, Authorization: "Bearer " + SRK, Prefer: "count=exact" } });
  st.nom = moiNom; st.total = +(total.headers.get("content-range") || "/0").split("/")[1];
  await upsert("bj_state", [{ owner: OWNER, data: st, last_run: new Date().toISOString(), last_ok: new Date().toISOString(), error: null }]);
  return { ok: true, colles: rows.length, details: details.length, nouveautes: events.length };
}

Deno.serve(async (req) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bj-key" };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const u = new URL(req.url);
  await resolveOwner();
  // Appel autorisé : déclencheur horaire (clé BJ_KEY) ou Alexandre connecté dans l'app (bouton « Vérifier maintenant »)
  let ok = !!KEY && (req.headers.get("x-bj-key") === KEY || u.searchParams.get("key") === KEY);
  if (!ok) {
    const jwt = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const r = await fetch(SB + "/auth/v1/user", { headers: { apikey: SRK, Authorization: "Bearer " + jwt } });
    ok = r.ok && (await r.json())?.id === OWNER;
  }
  if (!ok || !OWNER) return new Response(JSON.stringify({ error: "non autorisé" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
  const mode = u.searchParams.get("mode") || "";
  const job = run(mode).catch(async (e) => {
    await upsert("bj_state", [{ owner: OWNER, last_run: new Date().toISOString(), error: String(e?.message || e).slice(0, 400) }]).catch(() => {});
    return { ok: false, error: String(e?.message || e) };
  });
  if (u.searchParams.get("wait") === "1") return new Response(JSON.stringify(await job), { headers: { ...cors, "Content-Type": "application/json" } });
  // @ts-ignore EdgeRuntime est fourni par Supabase
  EdgeRuntime.waitUntil(job);
  return new Response(JSON.stringify({ ok: true, lance: true }), { status: 202, headers: { ...cors, "Content-Type": "application/json" } });
});
