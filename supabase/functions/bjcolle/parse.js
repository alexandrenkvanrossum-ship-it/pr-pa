// Analyse des pages BJcolle (texte HTML brut, sans DOM : fonctionne dans Deno comme dans un navigateur).
const ENT = {nbsp:" ",amp:"&",lt:"<",gt:">",quot:'"',apos:"'",rsquo:"’",lsquo:"‘",rdquo:"”",ldquo:"“",laquo:"«",raquo:"»",hellip:"…",ndash:"–",mdash:"—",oelig:"œ",OElig:"Œ",aelig:"æ",AElig:"Æ",
  eacute:"é",egrave:"è",ecirc:"ê",euml:"ë",agrave:"à",acirc:"â",auml:"ä",ccedil:"ç",icirc:"î",iuml:"ï",ocirc:"ô",ouml:"ö",ugrave:"ù",ucirc:"û",uuml:"ü",ntilde:"ñ",
  Eacute:"É",Egrave:"È",Ecirc:"Ê",Agrave:"À",Acirc:"Â",Ccedil:"Ç",Icirc:"Î",Ocirc:"Ô",Ucirc:"Û",deg:"°",euro:"€",middot:"·",times:"×",shy:"",zwnj:"",thinsp:" ",ensp:" ",emsp:" ",szlig:"ß"};
export function decode(s) {
  return String(s || "").replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") { const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return isNaN(n) ? m : String.fromCodePoint(n); }
    return ENT[e] !== undefined ? ENT[e] : m;
  });
}
export function text(h) {
  return decode(String(h || "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|tr|h\d)>/gi, "\n").replace(/<[^>]+>/g, ""))
    .replace(/[ \t ]+/g, " ").split("\n").map((l) => l.trim()).filter(Boolean).join("\n");
}
const MOIS = {janvier:1,février:2,fevrier:2,mars:3,avril:4,mai:5,juin:6,juillet:7,août:8,aout:8,septembre:9,octobre:10,novembre:11,décembre:12,decembre:12};
const p2 = (n) => String(n).padStart(2, "0");
function hm(h, m) { return p2(+h) + ":" + p2(+m); }
function addMin(t, d) { const x = +t.slice(0, 2) * 60 + +t.slice(3) + d; return p2(Math.floor(((x % 1440) + 1440) % 1440 / 60)) + ":" + p2(((x % 60) + 60) % 60); }
function hashId(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }

export function parseWhen(line) {
  const o = {};
  const d = line.match(/(\d{1,2})\s+([a-zéûè]+)\s+(\d{4})\s+à\s+(\d{1,2})\s*h\s*(\d{2})/i);
  if (d && MOIS[d[2].toLowerCase()]) { o.date = d[3] + "-" + p2(MOIS[d[2].toLowerCase()]) + "-" + p2(+d[1]); o.debut = hm(d[4], d[5]); }
  const du = line.match(/\((\d+)\s*min\)/); if (du) o.duree = +du[1];
  const t = line.match(/Tirage(?:\s*\(ou préparation\))?\s*à\s*(\d{1,2})\s*h\s*(\d{2})/i); if (t) o.tirage = hm(t[1], t[2]);
  if (/Tirage anticipé/i.test(line)) o.tirage = "anticipé";
  const k = line.match(/\b(KHASS|GOX)\b/); if (k) o.type = k[1];
  if (o.debut && o.duree) o.fin = addMin(o.debut, o.duree);
  return o;
}

// Cartes de colles (listes « Mes colles », « Les colles de la classe », Gox et Khass, archives)
export function parseList(html, scope) {
  const out = [];
  const re = /<a\s+class=["']?(bouton_eleve[\w-]*)["']?([^>]*)>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const cls = m[1], attrs = m[2], inner = m[3];
    const href = (attrs.match(/href=["']([^"']+)["']/) || [])[1] || "";
    const lines = inner.split(/<br\s*\/?>/i).map((x) => text(x)).filter(Boolean);
    if (!lines.length) continue;
    const o = { scope, discipline: lines[0], inactif: /inactif/.test(cls) };
    Object.assign(o, parseWhen(lines[1] || ""));
    for (const l of lines.slice(2)) {
      let x;
      if ((x = l.match(/^Salle\s*:\s*(.*)$/i))) o.salle = x[1];
      else if ((x = l.match(/^El[èe]ve\s*:\s*(.*)$/i))) o.eleve = x[1];
      else if ((x = l.match(/^Note\s*:\s*(.*)$/i))) o.note = x[1];
      else if ((x = l.match(/^Ordre de passage\s*:\s*(.*)$/i))) o.ordre = x[1].split(/\s*\/\s*/).filter(Boolean);
      else if (!o.colleur && /^(M\.|MM\.|Mme|Mmes|Mlle|Dr|Pr)(\s|$)/.test(l)) o.colleur = l;
      else (o.autres = o.autres || []).push(l);
    }
    const cid = (href.match(/colle=(\d+)/) || [])[1];
    o.href = href.replace(/&amp;/g, "&");
    o.id = cid ? "c" + cid : scope + "-" + hashId([o.discipline, o.date, o.debut, o.colleur, o.eleve || ""].join("|"));
    o.colle = cid || null;
    out.push(o);
  }
  return out;
}

// Feuille de colle (détail : note, absence, sujet, commentaire…)
export function parseDetail(html) {
  const o = { champs: {} };
  const h2 = (html.match(/<h2>([\s\S]*?)<\/h2>/i) || [])[1];
  if (h2) { const ls = text(h2).split("\n"); o.titre = ls[0]; const s = ls.find((l) => /^Salle\s*:/i.test(l)); if (s) o.salle = s.replace(/^Salle\s*:\s*/i, ""); }
  const n = html.match(/name=['"]NOTE_ELEVE['"][^>]*value=["']([^"']*)["']/i) || html.match(/value=["']([^"']*)["'][^>]*name=['"]NOTE_ELEVE['"]/i);
  if (n) o.note = decode(n[1]).trim();
  o.absent = /name=["']ABS_ELEVE["'][^>]*\bchecked\b/i.test(html);
  const re = /<legend[^>]*>([\s\S]*?)<\/legend>([\s\S]*?)<\/fieldset>/gi; let m;
  while ((m = re.exec(html))) { const k = text(m[1]); const v = text(m[2]); if (k) o.champs[k] = v; }
  o.sujet = o.champs["Sujet"] || "";
  const ck = Object.keys(o.champs).find((k) => /^Commentaire/i.test(k)); o.commentaire = ck ? o.champs[ck] : "";
  const dur = (o.commentaire.match(/Durée de l'exposé\s*:\s*([^\n.]+)/i) || [])[1]; if (dur) o.dureeExpose = dur.trim();
  return o;
}

// Liens de navigation : pages (semaines) et options d'affichage
export function pageLinks(html) {
  const box = (html.match(/flex-container_boutons_pages[^>]*>([\s\S]*?)<\/div>/i) || [])[1] || "";
  const out = []; const re = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi; let m;
  while ((m = re.exec(box))) { const label = text(m[2]); const href = m[1].replace(/&amp;/g, "&"); if (/^\d{2}\/\d{2}$/.test(label) && !out.some((x) => x.href === href)) out.push({ label, href }); }
  return out;
}
export function selectOptions(html, name) {
  const sel = (html.match(new RegExp('<select[^>]*name=["\']?' + name + '["\'\\s>][^>]*>([\\s\\S]*?)</select>', "i")) || [])[1] || "";
  const out = []; const re = /<option[^>]*value=["']([^"']*)["'][^>]*>([\s\S]*?)<\/option>/gi; let m;
  while ((m = re.exec(sel))) out.push({ value: m[1].replace(/&amp;/g, "&"), label: text(m[2]) });
  return out;
}
export function menuLinks(html) {
  const out = {}; const re = /<input[^>]*>/gi; let m;
  while ((m = re.exec(html))) {
    const tag = m[0], val = decode((tag.match(/value=["']([^"']*)["']/i) || [])[1] || "").trim();
    const oc = (tag.match(/onclick=["']([^"]*)["']/i) || [])[1] || ""; const u = (oc.match(/['"]([A-Za-z0-9_]+\.php[^'"]*)['"]/) || [])[1];
    const name = (tag.match(/name=["']([^"']+)["']/i) || [])[1];
    if (val) out[val] = u ? { href: u.replace(/&amp;/g, "&") } : name ? { post: name } : {};
  }
  return out;
}
