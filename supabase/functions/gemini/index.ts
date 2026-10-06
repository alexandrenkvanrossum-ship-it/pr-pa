// Fonction Supabase « gemini » : relais entre l'app et l'API Gemini.
// La clé reste côté serveur (secret GEMINI_API_KEY) ; seul un utilisateur connecté peut l'appeler.
// Mode « doc » : lit un fichier déposé dans le stockage « fichiers » (avec les droits de l'utilisateur)
// et en extrait les exercices (avec une estimation du temps) ou les énoncés du cours.
import { unzipSync, strFromU8 } from "npm:fflate@0.8.2";
import { PDFDocument } from "npm:pdf-lib@1.17.1";
const SUPA = Deno.env.get("SUPABASE_URL") ?? "";
const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const MODELS = (Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash,gemini-2.5-flash-lite,gemini-2.0-flash,gemini-flash-latest,gemini-flash-lite-latest")
  .split(",").map((m) => m.trim()).filter(Boolean);
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function callGemini(body: unknown) {
  let last: unknown = null;
  const tried: string[] = [];
  for (const m of MODELS) {
    tried.push(m);
    const b: any = structuredClone(body);
    if (b.generationConfig?.maxOutputTokens && !/2\.5|latest/.test(m)) b.generationConfig.maxOutputTokens = Math.min(b.generationConfig.maxOutputTokens, 8192);
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": KEY },
      body: JSON.stringify(b),
    });
    const j = await r.json();
    if (r.ok) return j;
    last = j;
    // modèle inconnu (404), sans quota gratuit (429) ou indisponible (503) : on essaie le suivant
    if (![404, 429, 503].includes(r.status)) break;
  }
  const err = (last as any)?.error ?? last;
  throw new Error(`Modèles essayés : ${tried.join(", ")}. Dernière erreur : ${err?.code ?? ""} ${err?.message ?? JSON.stringify(err)}`.slice(0, 600));
}
const textOf = (j: any) =>
  (j?.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? "").join("").trim();
const jsonOf = (t: string) => {
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  return JSON.parse(a >= 0 && b > a ? t.slice(a, b + 1) : t);
};

const SYSTEM =
  "Tu es l'assistant intégré à l'application de prépa d'Alexandre (ECG2 au lycée Sainte-Geneviève, objectif HEC). " +
  "Réponds en français, de façon concise et précise, en allant droit au but. " +
  "Règle absolue : n'invente jamais une citation, un extrait ou un chiffre ; si tu n'es pas sûr, dis-le clairement. " +
  "Pour l'allemand, réponds en allemand si la question est posée en allemand.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    if (!KEY) throw new Error("Secret GEMINI_API_KEY absent.");
    const body = await req.json();
    const { mode, messages, context, input, date } = body;
    let out: unknown;

    if (mode === "chat") {
      const j = await callGemini({
        system_instruction: { parts: [{ text: SYSTEM + "\nContexte de l'écran ouvert : " + (context ?? "") }] },
        contents: (messages ?? []).slice(-12).map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: String(m.text ?? "") }],
        })),
        generationConfig: { temperature: 0.6, maxOutputTokens: 1500 },
      });
      out = { text: textOf(j) };
    } else if (mode === "news") {
      // Flux RSS (Le Monde International, France 24 en secours) : Gemini choisit et résume
      // uniquement à partir des textes fournis, sans rien ajouter.
      const FEEDS = ["https://www.lemonde.fr/international/rss_full.xml", "https://www.france24.com/fr/monde/rss"];
      let items: { title: string; desc: string; link: string }[] = [];
      for (const url of FEEDS) {
        try {
          const xml = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
          const strip = (x: string) => x.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").replace(/&#039;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").trim();
          items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 12).map((m) => ({
            title: strip(m[1].match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ""),
            desc: strip(m[1].match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? "").slice(0, 600),
            link: strip(m[1].match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? ""),
          })).filter((x) => x.title && x.link);
          if (items.length) break;
        } catch (_) { /* flux suivant */ }
      }
      if (!items.length) throw new Error("Flux d'actualités injoignables.");
      const list = items.map((x, i) => `[${i}] ${x.title} — ${x.desc}`).join("\n");
      const j = await callGemini({
        contents: [{ role: "user", parts: [{ text:
          "Voici les derniers articles de la rubrique internationale d'un grand quotidien. Choisis l'information internationale la plus importante " +
          "(géopolitique, politique ou société ; pas d'économie sauf si incontournable). Résume-la en trois phrases courtes et factuelles en français, " +
          "en t'appuyant UNIQUEMENT sur le titre et le chapô fournis, sans rien ajouter. Réponds avec un objet JSON {\"index\": n, \"titre\": \"...\", \"resume\": \"...\"}.\n\n" + list }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      });
      const o = jsonOf(textOf(j));
      const it = items[Number(o.index)] ?? items[0];
      out = { titre: o.titre || it.title, resume: o.resume || it.desc, sources: [{ title: new URL(it.link).hostname.replace("www.", ""), url: it.link }] };
    } else if (mode === "classify") {
      const j = await callGemini({
        contents: [{ role: "user", parts: [{ text:
          "Classe cette tâche d'un étudiant en prépa ECG. Matières possibles : maths, hgg (histoire-géographie-géopolitique), " +
          "csh (culture générale : philosophie, littérature, synthèse), ang (anglais), all (allemand), perso (vie quotidienne). " +
          "Types possibles : Lecture, Vidéo, Fiche, Exercice, Plan, Dissertation, Flashcards, Traduction, RAC, Essay, Révision, DM, Rendez-vous, Autre. " +
          "Estime une durée réaliste en minutes. Tâche : " + String(input ?? "") }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: { type: "OBJECT", properties: {
            sub: { type: "STRING", enum: ["maths", "hgg", "csh", "ang", "all", "perso"] },
            type: { type: "STRING" }, dur: { type: "INTEGER" } }, required: ["sub", "type", "dur"] },
        },
      });
      out = jsonOf(textOf(j));
    } else if (mode === "doc") {
      out = await analyseDoc(body, req.headers.get("Authorization") ?? "");
    } else {
      throw new Error("Mode inconnu.");
    }
    return new Response(JSON.stringify(out), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error)?.message ?? e) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});

/* ---------- mode « doc » ---------- */
function encodeBase64(u8: Uint8Array) { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000)); return btoa(s); }
const PAGES = 6, CHARS = 18000;
async function fetchFile(path: string, auth: string) {
  const r = await fetch(`${SUPA}/storage/v1/object/authenticated/fichiers/${path.split("/").map(encodeURIComponent).join("/")}`, { headers: { Authorization: auth, apikey: ANON } });
  if (!r.ok) throw new Error(`Fichier illisible (${r.status}) : ${path.split("/").pop()}`);
  return new Uint8Array(await r.arrayBuffer());
}
function xmlText(x: string) {
  return x.replace(/<\/w:p>|<\/a:p>|<w:br\/>/g, "\n").replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
}
function officeText(buf: Uint8Array, name: string) {
  const z = unzipSync(buf);
  if (z["word/document.xml"]) return xmlText(strFromU8(z["word/document.xml"]));
  const slides = Object.keys(z).filter((k) => /^ppt\/slides\/slide\d+\.xml$/.test(k)).sort((a, b) => +a.match(/\d+/)![0] - +b.match(/\d+/)![0]);
  if (slides.length) return slides.map((k, i) => `[Diapo ${i + 1}]\n` + xmlText(strFromU8(z[k]))).join("\n");
  throw new Error("Format non reconnu : " + name);
}
// Transforme un fichier en morceaux envoyables à Gemini ; renvoie aussi le nombre total de morceaux.
async function partsOf(f: any, auth: string, chunk: number | null) {
  const buf = await fetchFile(f.path, auth);
  const name = String(f.name || "");
  const mime = String(f.mime || "");
  if (/pdf/.test(mime) || /\.pdf$/i.test(name)) {
    if (chunk == null) return { parts: [{ inline_data: { mime_type: "application/pdf", data: encodeBase64(buf) } }], chunks: 1, label: "" };
    try {
      const src = await PDFDocument.load(buf, { ignoreEncryption: true });
      const n = src.getPageCount(), chunks = Math.max(1, Math.ceil(n / PAGES));
      const from = chunk * PAGES, to = Math.min(n, from + PAGES);
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, Array.from({ length: to - from }, (_, i) => from + i));
      pages.forEach((p) => out.addPage(p));
      return { parts: [{ inline_data: { mime_type: "application/pdf", data: encodeBase64(await out.save()) } }], chunks, label: `pages ${from + 1} à ${to} sur ${n}` };
    } catch (_) {
      return { parts: [{ inline_data: { mime_type: "application/pdf", data: encodeBase64(buf) } }], chunks: 1, label: "" };
    }
  }
  if (/^image\//.test(mime) || /\.(png|jpe?g|webp|heic)$/i.test(name)) {
    return { parts: [{ inline_data: { mime_type: mime || "image/jpeg", data: encodeBase64(buf) } }], chunks: 1, label: "" };
  }
  const txt = /\.(docx|pptx)$/i.test(name) || /officedocument/.test(mime) ? officeText(buf, name) : new TextDecoder().decode(buf);
  if (chunk == null) return { parts: [{ text: txt.slice(0, 120000) }], chunks: 1, label: "" };
  const chunks = Math.max(1, Math.ceil(txt.length / CHARS));
  return { parts: [{ text: txt.slice(chunk * CHARS, (chunk + 1) * CHARS) }], chunks, label: `partie ${chunk + 1} sur ${chunks}` };
}
const EXO_SCHEMA = { type: "OBJECT", properties: {
  chapitre: { type: "STRING" },
  exercices: { type: "ARRAY", items: { type: "OBJECT", properties: {
    num: { type: "STRING" }, titre: { type: "STRING" }, questions: { type: "INTEGER" },
    difficulte: { type: "INTEGER" }, minutes: { type: "INTEGER" }, classique: { type: "BOOLEAN" },
    notions: { type: "ARRAY", items: { type: "STRING" } }, base: { type: "STRING", enum: ["corrigé", "énoncé"] },
  }, required: ["num", "titre", "questions", "difficulte", "minutes", "classique", "base"] } },
}, required: ["exercices"] };
const COURS_SCHEMA = { type: "OBJECT", properties: {
  chapitre: { type: "STRING" },
  items: { type: "ARRAY", items: { type: "OBJECT", properties: {
    type: { type: "STRING", enum: ["Définition", "Proposition", "Théorème", "Propriété", "Lemme", "Corollaire", "Méthode", "Formule", "Remarque"] },
    nom: { type: "STRING" }, enonce: { type: "STRING" }, section: { type: "STRING" },
  }, required: ["type", "nom", "enonce", "section"] } },
}, required: ["items"] };

async function analyseDoc(b: any, auth: string) {
  if (!auth) throw new Error("Connexion requise.");
  const files: any[] = (b.files ?? []).slice(0, 4);
  if (!files.length) throw new Error("Aucun fichier.");
  if (b.kind === "cours") {
    const chunk = Number(b.chunk ?? 0);
    const p = await partsOf(files[0], auth, chunk);
    const j = await callGemini({
      contents: [{ role: "user", parts: [{ text:
        "Voici un extrait (" + (p.label || "document entier") + ") d'un cours de mathématiques de prépa ECG2" + (b.chap ? ", chapitre « " + b.chap + " »" : "") + ". " +
        "Relève, dans l'ordre, chaque définition, proposition, propriété, théorème, lemme, corollaire, méthode et formule à connaître. " +
        "Pour chacun : type ; nom (numéro et nom tels qu'écrits, ex. « Théorème 4 (critère de Riemann) », sinon un intitulé court et neutre) ; " +
        "enonce : RECOPIE FIDÈLEMENT l'énoncé tel qu'il figure dans le document, sans le reformuler, le compléter ni le corriger, sans la démonstration, " +
        "les formules en LaTeX entre $…$ ; section : titre de la partie du cours. N'ajoute RIEN qui ne soit pas dans le document. " +
        "Si un énoncé est coupé par la fin de l'extrait, recopie la partie visible." }, ...p.parts] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 60000, responseMimeType: "application/json", responseSchema: COURS_SCHEMA },
    });
    const o = jsonOf(textOf(j));
    return { chapitre: o.chapitre ?? "", items: o.items ?? [], chunk, chunks: p.chunks };
  }
  // exercices (TD, feuille, DM), avec le corrigé s'il est fourni
  const parts: any[] = [];
  for (const f of files) {
    const p = await partsOf(f, auth, null);
    parts.push({ text: `\n--- ${f.role === "corrige" ? "CORRIGÉ" : "ÉNONCÉ"} : « ${f.name} » ---` }, ...p.parts);
  }
  const hasCorr = files.some((f) => f.role === "corrige");
  const j = await callGemini({
    contents: [{ role: "user", parts: [{ text:
      "Tu reçois une feuille d'exercices de mathématiques de prépa ECG2 (" + (b.kind === "dm" ? "devoir maison" : "TD ou dossier d'exercices") + ")" +
      (hasCorr ? " ET son corrigé" : "") + ". Liste chaque exercice dans l'ordre de l'énoncé. Pour chacun : " +
      "num (numéro tel qu'écrit), titre (thème en 6 mots maximum, tiré de l'énoncé), questions (nombre de questions et sous-questions), " +
      "difficulte (1 facile, 2 moyen, 3 difficile), minutes (temps réaliste pour un bon élève de prépa qui cherche, calcule puis rédige proprement ; " +
      (hasCorr ? "appuie-toi sur la longueur des calculs et des raisonnements du corrigé" : "appuie-toi sur la longueur des calculs prévisibles") + "), " +
      "classique (vrai si c'est un exercice-type du chapitre à savoir refaire), notions (2 à 4 mots-clés), base (« corrigé » si ton estimation repose sur le corrigé, sinon « énoncé »). " +
      "chapitre : le chapitre concerné. N'invente aucun exercice." }, ...parts] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 16000, responseMimeType: "application/json", responseSchema: EXO_SCHEMA },
  });
  const o = jsonOf(textOf(j));
  return { chapitre: o.chapitre ?? "", exercices: o.exercices ?? [], corrige: hasCorr };
}
