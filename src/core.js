/* Outils de dates, stockage local (en attendant Supabase) et analyse de la saisie. */
var MONTHS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
var MON_S = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
var DAYS = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
var DAYS_S = ["dim.","lun.","mar.","mer.","jeu.","ven.","sam."];

function pad(n){ return (n<10?"0":"")+n; }
function iso(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
function parseISO(s){ if(!s) return null; var p=s.split("-"); return new Date(+p[0],+p[1]-1,+p[2]); }
function today(){ var d=new Date(); d.setHours(0,0,0,0); return d; }
function addDays(d,n){ var x=new Date(d); x.setDate(x.getDate()+n); return x; }
function diffDays(a,b){ return Math.round((parseISO(a)-parseISO(b))/864e5); }
function toMin(hm){ var p=hm.split(":"); return +p[0]*60+ +p[1]; }
function fromMin(m){ return pad(Math.floor(m/60))+":"+pad(m%60); }
function hLabel(hm){ var p=hm.split(":"); return (+p[0])+"h"+(p[1]==="00"?"":p[1]); }
function fmtDay(s){ var d=parseISO(s); return DAYS_S[d.getDay()]+" "+d.getDate()+" "+MON_S[d.getMonth()]; }
function fmtLong(s){ var d=parseISO(s); return DAYS[d.getDay()]+" "+d.getDate()+" "+MONTHS[d.getMonth()]; }
function relDay(s){
  var n=diffDays(s,iso(today()));
  if(n===0) return "Aujourd'hui"; if(n===1) return "Demain"; if(n===-1) return "Hier";
  if(n>1 && n<7) return DAYS[parseISO(s).getDay()].replace(/^./,function(c){return c.toUpperCase();});
  return fmtDay(s);
}
function mondayOf(d){ var x=new Date(d); var w=(x.getDay()+6)%7; x.setDate(x.getDate()-w); x.setHours(0,0,0,0); return x; }
function norm(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,""); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
function uid(p){ return (p||"x")+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

/* ---------- stockage ---------- */
var Store = (function(){
  var KEY="prepa.v1", mem=null;
  function blank(){ return {tasks:[],notes:[],goals:{},ressentis:{},slotDone:{},seeded:false,cshSkip:0,news:null,files:{},mathsEx:{},mathsCours:{},mathsDone:{},mathsCfg:{},quiz:{},quizOff:{},hgg:{fait:{},done:{},prog:{},min:{}}}; }
  function load(){
    if(mem) return mem;
    try{ var raw=localStorage.getItem(KEY); mem=raw?JSON.parse(raw):blank(); }catch(e){ mem=blank(); }
    var b=blank(); Object.keys(b).forEach(function(k){ if(mem[k]==null) mem[k]=b[k]; });
    return mem;
  }
  function save(silent){ try{ localStorage.setItem(KEY,JSON.stringify(mem)); }catch(e){} if(!silent && typeof Sync!=="undefined") Sync.schedule(); }
  return {get:load, save:save};
})();

/* ---------- analyse de la saisie (façon Todoist) ---------- */
var WD = {dimanche:0,lundi:1,mardi:2,mercredi:3,jeudi:4,vendredi:5,samedi:6};
var MO = {janvier:0,janv:0,fevrier:1,fevr:1,fev:1,mars:2,avril:3,avr:3,mai:4,juin:5,juillet:6,juil:6,aout:7,septembre:8,sept:8,octobre:9,oct:9,novembre:10,nov:10,decembre:11,dec:11};
var SUBJ_WORDS = [
  ["maths",/\b(maths?|mathematiques?|td de maths|proba\w*|algebre|analyse|integrale\w*|matrice\w*|suites?|python|pyzo|exos? de maths)\b/],
  ["hgg",/\b(hgg|geo\w*|geopolitique|croquis|chine|inde|europe|ue|etats-unis|usa|afrique|asie|russie|bresil|moyen-orient|mondialisation|quinzaine)\b/],
  ["csh",/\b(csh|philo\w*|litterature|dissert\w*|culture generale|cg|synthese|francais|humanite|oeuvre|duo)\b/],
  ["ang",/\b(anglais|english|essay|rac|uk|royaume-uni|britain|american)\b/],
  ["all",/\b(allemand|deutsch|allemagne|germany|bundestag|afd)\b/]
];
var TYPES = [
  ["DM",/\bdm\b/,240],["Lecture",/\b(lire|lecture|relire)\b/,30],["Vidéo",/\b(video|regarder|podcast|ecouter)\b/,20],
  ["Fiche",/\b(fiche|ficher)\b/,45],["Exercice",/\b(exo|exos|exercice|exercices|td)\b/,45],["Plan",/\bplan\b/,90],
  ["Dissertation",/\bdissert\w*/,240],["Flashcards",/\b(anki|flashcards?)\b/,20],["Traduction",/\b(traduction|theme|version)\b/,30],
  ["RAC",/\brac\b/,120],["Essay",/\bessay\b/,90],["Révision",/\b(reviser|revision|revoir|apprendre)\b/,45],["Colle",/\bcolle\b/,60]
];
function parseTask(raw, now){
  now = now || new Date();
  var t0=new Date(now); t0.setHours(0,0,0,0);
  var s=" "+raw.replace(/\s+/g," ")+" ";
  var out={title:"",due:null,day:null,time:null,remind:15,prio:0,sub:null,type:null,dur:null,action:null,tokens:[]};
  function cut(re,fn){ var n=norm(s), m=n.match(re); if(!m) return false; if(fn(m)===false) return false; out.tokens.push(s.substr(m.index,m[0].length).trim()); s=s.slice(0,m.index)+" "+s.slice(m.index+m[0].length); return true; }

  cut(/\s(!{1,3})(?=\s)/, function(m){ out.prio=m[1].length; });
  cut(/\s(?:avec\s+)?rappel\s+(\d{1,3})\s*min(?:utes?)?\s+avant(?=\s)/, function(m){ out.remind=+m[1]; });
  /* durée explicite : 20 min, 1h30 de travail, (long) */
  cut(/\s(\d{1,3})\s*(?:min|mn|minutes?)(?=\s|[,.;)])/, function(m){ out.dur=+m[1]; });
  if(out.dur==null) cut(/\s(?:pendant|duree|en)\s+(\d)\s?h(\d{2})?(?=\s)/, function(m){ out.dur=+m[1]*60+(+m[2]||0); });
  /* heure : 19h, 19h30, à 9h (une heure < 7 sans « à » est lue comme une durée) */
  cut(/\s(a\s+)?(\d{1,2})\s?h(\d{2})?(?=\s|[,.;)])/, function(m){
    var h=+m[2], mi=+m[3]||0; if(h>23) return false;
    if(!m[1] && h<7){ if(out.dur!=null) return false; out.dur=h*60+mi; return; }
    out.time=pad(h)+":"+pad(mi);
  });
  var longHint=/\((tres )?long\)|\blong(ue)?\b/.test(norm(s)), shortHint=/\(court\)|\bcourt(e)?\b/.test(norm(s));

  /* dates : « pour X » = échéance ; sinon jour à faire */
  function setDate(d, isDue){ if(isDue) out.due=iso(d); else out.day=iso(d); }
  var rules=[
    [/\s(pour\s+)?(aujourd'hui|aujourdhui|ce soir|ce midi|ce matin)(?=\s)/, function(m){ return t0; }],
    [/\s(pour\s+)?(apres-demain|apres demain)(?=\s)/, function(){ return addDays(t0,2); }],
    [/\s(pour\s+)?(demain)(?=\s)/, function(){ return addDays(t0,1); }],
    [/\s(pour\s+)?dans\s+(\d+)\s+(jours?|semaines?)(?=\s)/, function(m){ return addDays(t0,(/^sem/.test(m[3])?7:1)*+m[2]); }],
    [/\s(pour\s+)?(ce week-end|ce weekend|ce we)(?=\s)/, function(){ var d=new Date(t0); var k=(6-d.getDay()+7)%7; return addDays(d,k); }],
    [/\s(pour\s+)?(?:le\s+)?(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)(\s+prochain)?(?=\s)/, function(m){ var w=WD[m[2]], diff=(w-t0.getDay()+7)%7; if(diff===0) diff=7; return addDays(t0,diff); }],
    [/\s(pour\s+)?(?:le\s+)?(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?(?=\s)/, function(m){ var y=m[4]?(+m[4]<100?2000+ +m[4]:+m[4]):t0.getFullYear(); var d=new Date(y,+m[3]-1,+m[2]); if(!m[4]&&d<t0) d.setFullYear(y+1); return d; }],
    [/\s(pour\s+)?(?:le\s+)?(\d{1,2})(?:er)?\s+(janvier|janv|fevrier|fevr|fev|mars|avril|avr|mai|juin|juillet|juil|aout|septembre|sept|octobre|oct|novembre|nov|decembre|dec)\.?(?=\s)/, function(m){ var d=new Date(t0.getFullYear(),MO[m[3]],+m[2]); if(d<t0) d.setFullYear(d.getFullYear()+1); return d; }]
  ];
  for(var i=0;i<rules.length;i++){
    var n=norm(s), m=n.match(rules[i][0]);
    if(m){ var d=rules[i][1](m); setDate(d, !!m[1]); out.tokens.push(s.substr(m.index,m[0].length).trim()); s=s.slice(0,m.index)+" "+s.slice(m.index+m[0].length); break; }
  }

  var n2=norm(s);
  /* actions reconnues par mot-clé */
  var km;
  if((km=n2.match(/^\s*(ref|reference)\b\s*:?\s*/))){ out.action="csh-oeuvre"; out.sub="csh"; out.type="Œuvre"; s=s.replace(/^\s*r[ée]f(?:[ée]rence)?\s*:?\s*/i," "); }
  else if((km=n2.match(/^\s*(ex|exemple|concept)\b\s*:?\s*/))){ out.action="hgg-fiche"; out.sub="hgg"; out.type=km[1]==="concept"?"Concept":"Exemple"; s=s.replace(/^\s*(ex(?:emple)?|concept)\s*:?\s*/i," "); }
  else if((km=n2.match(/^\s*civi\b\s*:?\s*/))){ out.action="civi"; out.type="CIVI"; s=s.replace(/^\s*civi\s*:?\s*/i," "); }
  var subjHit=SUBJ_WORDS.some(function(x){ return x[1].test(n2); }) || /\b(devoirs?|a rendre|exos?|exercices?|td|dm|texte|lecture|fiche|chapitre|cours|copie)\b/.test(n2);
  if(!out.action && /\b(ne pas oublier|n'oublie pas|penser a|pense a|rappel)\b/.test(n2) && !out.time && subjHit && !/\b(rdv|rendez-vous|medecin|dentiste|appeler)\b/.test(n2)){ out.devoir=true; out.rappelDevoir=true; s=s.replace(/\b(ne pas oublier|n'oublie pas|penser à|pense à|penser a|pense a|rappel)\s*(de\s+|d'|:)?/i," "); }
  if(!out.action && !out.devoir && /\b(rdv|rendez-vous|rendez vous|ne pas oublier|rappel|appeler|medecin|dentiste)\b/.test(n2)){ out.action="rappel"; out.sub=out.sub||"perso"; out.type="Rendez-vous"; }
  if(!out.action && /\bdm\b/.test(n2)){ out.action="dm"; }

  if(!out.sub){ for(var j=0;j<SUBJ_WORDS.length;j++){ if(SUBJ_WORDS[j][1].test(n2)){ out.sub=SUBJ_WORDS[j][0]; break; } } }
  if(out.action==="civi" && !out.sub) out.sub=/\b(deutsch|allemagne|afd|bundestag|berlin|merz)\b/.test(n2)?"all":"ang";
  if(out.action==="dm" && !out.sub) out.sub="maths";
  if(!out.type){ for(var k=0;k<TYPES.length;k++){ if(TYPES[k][1].test(n2)){ out.type=TYPES[k][0]; if(out.dur==null) out.dur=TYPES[k][2]; break; } } }
  if(out.action==="csh-oeuvre" && out.dur==null) out.dur=60;
  if(out.action==="hgg-fiche" && out.dur==null) out.dur=20;
  if(out.action==="civi" && out.dur==null) out.dur=10;
  if(out.dur!=null && !/\d\s*(min|mn|h)/.test(norm(raw))){ if(longHint) out.dur=Math.round(out.dur*1.5); if(shortHint) out.dur=Math.round(out.dur*0.6); }
  if(out.type==="Lecture" && /\b(texte|article|extrait|poeme)\b/.test(n2) && !/\d\s*(min|mn|h)/.test(norm(raw))) out.dur=longHint?15:10;
  if(out.action==="rappel" && !out.day && !out.due && out.time) out.day=iso(t0);
  if(out.action!=="rappel" && (out.due || /\b(devoirs?|a rendre|a faire pour|pour (le )?(prochain )?cours|dm)\b/.test(n2))) out.devoir=true;
  if(out.rappelDevoir && /\b(rendre|apporter|imprimer|envoyer|donner|signer|deposer)\b/.test(n2) && out.type==null){ out.memo=true; out.type="Rappel"; }
  out.durEstimee=out.dur!=null && !/\d\s*(min|mn|h)\b/.test(norm(raw));

  if(out.action==="rappel") s=s.replace(/\bne pas oublier\s+(de\s+|le\s+|la\s+|les\s+|l')?/i," ").replace(/\brdv\b/i,"RDV");
  out.title=s.replace(/\(\s*\)/g,"").replace(/\s+/g," ").replace(/^[\s:,-]+|[\s:,-]+$/g,"").trim();
  if(out.title) out.title=out.title.charAt(0).toUpperCase()+out.title.slice(1);
  return out;
}

if(typeof module!=="undefined") module.exports={parseTask:parseTask, iso:iso, parseISO:parseISO, norm:norm};
