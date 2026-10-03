/* Construction des journées : cours, blocs fixes, créneaux de travail proposés, pales. */
function inVacances(dISO){ for(var i=0;i<VACANCES.length;i++){ if(dISO>=VACANCES[i].from && dISO<=VACANCES[i].to) return VACANCES[i]; } return null; }
function forumWeek(dISO){ return (Math.round(diffDays(dISO,FORUM_REF)/7)%2)===0; }
function paleOn(dISO){ return PALES.filter(function(p){ return p.date===dISO; }); }

/* Créneaux de travail par jour (1 = lundi … 0 = dimanche) — d'après la journée type */
var WORK = {
  1:[{s:"13:00",e:"14:00",t:"Midi · CSH ou langues",subs:["csh","ang","all"],sub:"csh"},
     {s:"16:15",e:"20:00",t:"Maths",sub:"maths",crit:true},
     {s:"20:40",e:"22:45",t:"Trinôme HGG",sub:"hgg"}],
  2:[{s:"13:00",e:"14:00",t:"Midi · CSH ou langues",subs:["csh","ang","all"],sub:"csh"},
     {s:"18:15",e:"20:00",t:"Maths",sub:"maths",crit:true},
     {s:"20:40",e:"22:45",t:"HGG",sub:"hgg",soir:true}],
  3:[{s:"13:00",e:"14:00",t:"Midi · CSH ou langues",subs:["csh","ang","all"],sub:"csh"},
     {s:"17:15",e:"20:00",t:"Maths",sub:"maths",crit:true},
     {s:"20:40",e:"22:45",t:"HGG",sub:"hgg",soir:true}],
  4:[{s:"13:00",e:"15:00",t:"Trinôme maths (jeu. ou ven.)",sub:"maths"},
     {s:"15:00",e:"16:00",t:"CSH",sub:"csh"},
     {s:"16:00",e:"20:00",t:"Maths",sub:"maths",crit:true},
     {s:"20:40",e:"22:45",t:"HGG",sub:"hgg",soir:true}],
  5:[{s:"13:00",e:"14:00",t:"Traductions anglais + allemand",subs:["ang","all"],sub:"ang",trad:true},
     {s:"14:00",e:"16:00",t:"CSH",sub:"csh"},
     {s:"16:00",e:"20:00",t:"Maths",sub:"maths",crit:true},
     {s:"20:40",e:"22:45",t:"HGG",sub:"hgg",soir:true}],
  6:[{s:"13:00",e:"18:00",t:"Travail léger",subs:["csh","ang","all","hgg"],sub:"csh",light:true}],
  0:[{s:"10:00",e:"12:00",t:"RAC d'anglais",sub:"ang",rac:true},
     {s:"12:00",e:"12:45",t:"Maths · DM",sub:"maths"},
     {s:"14:00",e:"15:30",t:"Revues de presse + CSH",subs:["ang","all","csh"],sub:"csh",light:true},
     {s:"15:30",e:"17:30",t:"Maths",sub:"maths"},
     {s:"18:00",e:"19:30",t:"Plan détaillé HGG",sub:"hgg",plan:true},
     {s:"20:40",e:"22:00",t:"Rattrapage léger",subs:["hgg","csh","ang","all"],sub:"hgg",light:true}]
};

function dayEvents(dISO){
  var d=parseISO(dISO), wd=d.getDay(), vac=inVacances(dISO), ev=[], pales=paleOn(dISO);
  var schoolDay=!vac && wd>=1 && wd<=6;
  function add(o){ o.id=o.id||(o.kind+"-"+o.s+"-"+o.t); ev.push(o); }
  if(schoolDay){
    if(wd<=6) add({kind:"fixed",s:"07:30",e:"08:10",t:"Anki anglais + allemand",sub:"neutral",anki:true});
    COURSES.forEach(function(c){
      if(c.d!==wd) return;
      if(c.forum && !forumWeek(dISO)){ add({kind:"work",s:c.s,e:c.e,t:"Travail (pas de Forum)",sub:"hgg",subs:["hgg","csh","ang","all"]}); return; }
      add({kind:"course",s:c.s,e:c.e,t:c.t,sub:c.sub});
    });
    add({kind:"fixed",s:"12:30",e:"13:00",t:"Déjeuner",sub:"neutral"});
  }
  pales.forEach(function(p){ add({kind:"exam",s:p.s,e:p.e,t:"DST · "+p.t,sub:p.sub}); });
  if(!vac){
    (WORK[wd]||[]).forEach(function(w){
      if(wd===6 && pales.length){ return; }
      var o={}; for(var k in w) o[k]=w[k]; o.kind="work"; add(o);
    });
    if(wd===6 && pales.length) add({kind:"fixed",s:"13:00",e:"13:25",t:"Anki (facultatif)",sub:"neutral",anki:true});
  }
  if(!(wd===6 && pales.length)){
    add({kind:"fixed",s:"20:00",e:"20:40",t:"Dîner",sub:"neutral"});
    if(!vac || wd!==6) add({kind:"fixed",s:"23:00",e:"23:20",t:"Actualité",sub:"neutral",actu:true});
  }
  ev.sort(function(a,b){ return toMin(a.s)-toMin(b.s); });
  return ev;
}

/* Tâches à placer : priorité, échéance, jour prévu */
function openTasks(subs){
  var st=Store.get();
  return st.tasks.filter(function(t){ return !t.done && !t.time && subs.indexOf(t.sub)>=0; })
    .sort(function(a,b){ return (b.prio||0)-(a.prio||0) || String(a.day||a.due||"9999").localeCompare(String(b.day||b.due||"9999")); });
}

function roadFor(ev,dISO){
  var items=[], cap=toMin(ev.e)-toMin(ev.s), used=0;
  function push(o){ items.push(o); used+=o.min; }
  if(ev.anki){ push({lab:"Anki anglais",min:20}); push({lab:"Anki allemand",min:20}); return items; }
  if(ev.actu){ push({lab:"Lecture de l'actualité (HGG et langues)",min:20}); return items; }
  if(ev.kind!=="work") return items;
  var subs=ev.subs||[ev.sub];
  if(ev.sub==="maths" && ev.crit) push({lab:"Quiz de cours (partie vue en classe)",min:15,sub:"maths"});
  if(ev.rac) push({lab:"RAC d'anglais (objectif : 2h, puis 1h45)",min:110,sub:"ang"});
  if(ev.plan) push({lab:"Plan détaillé d'HGG (sujet de la semaine)",min:90,sub:"hgg"});
  if(ev.trad){ push({lab:"Traduction d'anglais",min:30,sub:"ang"}); push({lab:"Traduction d'allemand",min:30,sub:"all"}); }
  var pauseEvery=ev.crit?30:55, pauseLen=ev.crit?5:10, sinceP=0;
  var wd=parseISO(dISO).getDay(), dmDay=(wd===4||wd===5||wd===0);
  openTasks(subs).forEach(function(t){
    if(used>=cap-5) return;
    if(t.action==="dm" && !dmDay) return; /* DM : jeudi, vendredi, dimanche */
    var left=cap-used, m=Math.min(t.action==="dm"?Math.min(t.dur||120,120):(t.dur||30),left);
    if(m<10) return;
    if(sinceP+m>pauseEvery && items.length && used+pauseLen<cap){ push({lab:"Pause",min:pauseLen,pause:true}); sinceP=0; }
    push({lab:t.title+(t.action==="dm"?" (une partie)":""),min:m,task:t.id,sub:t.sub,partial:m<(t.dur||30)}); sinceP+=m;
  });
  if(used<cap-10){
    var fill={maths:"Exercices du chapitre en cours (banque d'exercices à importer)",hgg:ev.soir?"HGG : travail actif d'abord (plan, problématique), lecture de fiches à la fin":"HGG : fiches et exemples",csh:"Œuvre du jour (encart CSH)",ang:"Anki d'anglais et CIVI",all:"Anki d'allemand et CIVI"}[ev.sub]||"Travail libre";
    if(sinceP>pauseEvery-10 && used+pauseLen<cap){ push({lab:"Pause",min:pauseLen,pause:true}); }
    push({lab:fill,min:cap-used,sub:ev.sub,filler:true});
  }
  return items;
}
