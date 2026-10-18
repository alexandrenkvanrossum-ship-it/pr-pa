/**
 * Passerelle Google de l'app Prépa (Google Apps Script, déployée en « Application Web »).
 * - GET  ?action=news[&date=AAAA-MM-JJ]  → presse du jour en anglais et en allemand (fichier JSON écrit chaque matin)
 * - GET  ?action=sections                → titres de niveau 1 de tes documents de civi (anglais, allemand)
 * - POST {action:"civi", ...}            → ajoute une news, en prise de notes, dans la bonne partie du document de civi
 * - POST {action:"anki", cards:[...]}    → met des cartes en file d'attente (feuille « Prépa — Anki à envoyer »)
 * L'adresse de déploiement sert de clé : ne la partage pas.
 */
var CIVI = {
  en: '1IAtxlkQi-rZg4czoK_PkzHdynwslKpz2AAljBstiqho', // NOTHING NEW ON THE ENGLISH-SPEAKING FRONT
  de: '1N1yQu4GTpNpne1TUWBkwg8i2zWYCY7pp6GQnBDUg7vM'  // CIVI
};
var NEWS_FOLDER = '1iAkjo9k0VvYR98uYx1XPIGf6iszpuz2f';   // Prépa — Presse en langues (app)
var ANKI_SHEET = '1q2Eq3Xt5SWtRte6570hyKKKZF6MVuSDrxFy9KrukiJY'; // Prépa — Anki à envoyer

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function norm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function doGet(e) {
  try {
    var a = (e && e.parameter && e.parameter.action) || 'news';
    if (a === 'news') return out(news(e.parameter.date));
    if (a === 'sections') return out({ ok: true, en: sections(CIVI.en), de: sections(CIVI.de) });
    if (a === 'ping') return out({ ok: true });
    return out({ ok: false, error: 'Action inconnue.' });
  } catch (err) {
    return out({ ok: false, error: String(err && err.message || err) });
  }
}

function doPost(e) {
  try {
    var b = JSON.parse(e.postData.contents);
    if (b.action === 'civi') return out(addCivi(b));
    if (b.action === 'anki') return out(addAnki(b));
    return out({ ok: false, error: 'Action inconnue.' });
  } catch (err) {
    return out({ ok: false, error: String(err && err.message || err) });
  }
}

/* ---------- presse du jour ---------- */
function news(date) {
  var it = DriveApp.getFolderById(NEWS_FOLDER).getFiles(), best = null, dates = {};
  while (it.hasNext()) {
    var f = it.next(), n = f.getName(), m = n.match(/^langues-(\d{4}-\d{2}-\d{2})\.json$/);
    if (!m) continue;
    dates[m[1]] = 1;
    if (date && m[1] !== date) continue;
    if (!best || m[1] > best.d || (m[1] === best.d && f.getLastUpdated() > best.f.getLastUpdated())) best = { d: m[1], f: f };
  }
  if (!best) return { ok: false, error: date ? 'Pas de presse pour cette date.' : 'Aucune presse pour l\'instant.', dates: Object.keys(dates).sort() };
  return { ok: true, data: JSON.parse(best.f.getBlob().getDataAsString()), dates: Object.keys(dates).sort() };
}

/* ---------- documents de civi ---------- */
function sections(docId) {
  var body = DocumentApp.openById(docId).getBody(), out = [];
  for (var i = 0; i < body.getNumChildren(); i++) {
    var el = body.getChild(i);
    if (el.getType() !== DocumentApp.ElementType.PARAGRAPH) continue;
    var p = el.asParagraph();
    if (p.getHeading() === DocumentApp.ParagraphHeading.HEADING1 && p.getText().trim()) out.push(p.getText().trim());
  }
  return out;
}

/* texte avec **gras** */
function rich(el, t) {
  var tx = el.editAsText(), parts = String(t || '').split(/(\*\*[^*]+\*\*)/);
  for (var i = 0; i < parts.length; i++) {
    var s = parts[i]; if (!s) continue;
    var bold = /^\*\*[\s\S]+\*\*$/.test(s), v = bold ? s.slice(2, -2) : s;
    var start = tx.getText().length;
    tx.appendText(v);
    if (v.length) tx.setBold(start, start + v.length - 1, bold);
  }
}

function addCivi(b) {
  var id = CIVI[b.lang];
  if (!id) throw new Error('Langue inconnue.');
  var doc = DocumentApp.openById(id), body = doc.getBody(), n = body.getNumChildren();
  var H1 = DocumentApp.ParagraphHeading.HEADING1, want = norm(b.section), start = -1, end = n;
  for (var i = 0; i < n; i++) {
    var el = body.getChild(i);
    if (el.getType() !== DocumentApp.ElementType.PARAGRAPH) continue;
    var p = el.asParagraph();
    if (p.getHeading() !== H1) continue;
    if (start >= 0) { end = i; break; }
    if (want && norm(p.getText()) === want) start = i;
  }
  var idx;
  if (start < 0) {
    // nouvelle partie, avant « VOC » ou « Random » s'ils existent, sinon à la fin
    idx = n;
    for (var j = 0; j < n; j++) {
      var e2 = body.getChild(j);
      if (e2.getType() !== DocumentApp.ElementType.PARAGRAPH) continue;
      var p2 = e2.asParagraph();
      if (p2.getHeading() === H1 && /^(voc|random)$/.test(norm(p2.getText()))) { idx = j; break; }
    }
    var h1 = body.insertParagraph(idx++, String(b.section || 'NEWS').toUpperCase());
    h1.setHeading(H1); h1.editAsText().setBold(true);
  } else {
    idx = end;
  }
  var h2 = body.insertParagraph(idx++, String(b.titre || 'News'));
  h2.setHeading(DocumentApp.ParagraphHeading.HEADING2); h2.editAsText().setBold(true);
  (b.puces || []).forEach(function (t) {
    var li = body.insertListItem(idx++, '');
    li.setGlyphType(DocumentApp.GlyphType.BULLET);
    rich(li, t);
  });
  if (b.source && b.source.url) {
    var src = body.insertParagraph(idx++, '');
    src.setHeading(DocumentApp.ParagraphHeading.NORMAL);
    var label = (b.date ? b.date + ' · ' : '') + (b.source.label || 'Source');
    src.appendText(label).setLinkUrl(b.source.url).setItalic(true).setFontSize(9);
  }
  body.insertParagraph(idx++, '').setHeading(DocumentApp.ParagraphHeading.NORMAL);
  doc.saveAndClose();
  return { ok: true, nouvelle: start < 0, url: 'https://docs.google.com/document/d/' + id + '/edit' };
}

/* ---------- file d'attente Anki ---------- */
function addAnki(b) {
  var sh = SpreadsheetApp.openById(ANKI_SHEET).getSheets()[0], now = new Date().toISOString();
  var rows = (b.cards || []).map(function (c) {
    return [c.id || '', now, c.lang || '', c.deck || '', c.model || '', c.front || '', c.back || '', c.note || '', c.tags || '', 'à envoyer', ''];
  });
  if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  return { ok: true, n: rows.length };
}
