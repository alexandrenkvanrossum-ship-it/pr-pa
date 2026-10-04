// Fonction Supabase « gemini » : relais entre l'app et l'API Gemini.
// La clé reste côté serveur (secret GEMINI_API_KEY) ; seul un utilisateur connecté peut l'appeler.
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
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": KEY },
      body: JSON.stringify(body),
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
    const { mode, messages, context, input, date } = await req.json();
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
      const j = await callGemini({
        contents: [{ role: "user", parts: [{ text:
          `Nous sommes le ${date}. Cherche l'actualité internationale la plus importante des dernières 24 heures ` +
          `(géopolitique, politique ou société, pas d'économie sauf si incontournable). ` +
          `Réponds uniquement avec un objet JSON : {"titre": "titre court en français", "resume": "trois phrases courtes et factuelles en français"}` }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.2 },
      });
      const o = jsonOf(textOf(j));
      const chunks = j?.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const sources = chunks.map((c: any) => c.web).filter(Boolean).slice(0, 3)
        .map((w: any) => ({ title: w.title, url: w.uri }));
      out = { titre: o.titre ?? "", resume: o.resume ?? "", sources };
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
