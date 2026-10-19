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
  /* jeudi : DDL (dîner de ligne) de 19 h 30 à 21 h 30 */
  4:[{s:"13:00",e:"15:00",t:"Trinôme maths (jeu. ou ven.)",sub:"maths"},
     {s:"15:00",e:"19:00",t:"Maths",sub:"maths",crit:true},
     {s:"21:45",e:"22:45",t:"CSH",sub:"csh"}],
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
  /* running de la semaine (30 min, fixé sur l'accueil) */
  var rr=(Store.get().runs||{})[iso(mondayOf(parseISO(dISO)))];
  if(rr&&rr.d===dISO&&rr.s&&!(typeof runFromAgenda==="function"&&runFromAgenda(iso(mondayOf(parseISO(dISO)))))) add({kind:"fixed",s:rr.s,e:fromMin(Math.min(toMin(rr.s)+30,23*60+59)),t:"Running 30 min"+(rr.done?" ✓":""),sub:"perso",run:true,id:"run"});
  var vp=vac && typeof VAC_PLAN!=="undefined" && VAC_PLAN[dISO];
  if(vp){
    vp.slots.forEach(function(x,i){ var o={}; for(var k in x) o[k]=x[k]; o.kind=x.kind||"work"; o.id="vp"+i; o.vac=true; add(o); });
  }
  if(!vac){
    (WORK[wd]||[]).forEach(function(w){
      if(wd===6 && pales.length){ return; }
      var o={}; for(var k in w) o[k]=w[k]; o.kind="work"; add(o);
    });
    if(wd===6 && pales.length) add({kind:"fixed",s:"13:00",e:"13:25",t:"Anki (facultatif)",sub:"neutral",anki:true});
  }
  if(!vp && !(wd===6 && pales.length)){
    if(wd===4 && !vac) add({kind:"fixed",s:"19:30",e:"21:30",t:"DDL",sub:"neutral",ddl:true});
    else add({kind:"fixed",s:"20:00",e:"20:40",t:"Dîner",sub:"neutral"});
    if(!vac || wd!==6) add({kind:"fixed",s:"23:00",e:"23:20",t:"Actualité",sub:"neutral",actu:true});
  }
  ev=applyAgendaEdits(ev,dISO,wd);
  // Colles BJcolle : bloquées de 10 min avant la préparation à la fin du passage ; le travail qui chevauche est raccourci
  if(typeof BJ!=="undefined"){
    BJ.mineOn(dISO).forEach(function(c){
      var b=BJ.block(c), cs=toMin(b.s), ce=toMin(b.e);
      ev=ev.reduce(function(acc,w){
        if(w.kind!=="work" || toMin(w.e)<=cs || toMin(w.s)>=ce){ acc.push(w); return acc; }
        if(toMin(w.s)<cs && cs-toMin(w.s)>=20){ var a={}; for(var k in w) a[k]=w[k]; a.e=fromMin(cs); a.id=w.id+"-a"; acc.push(a); }
        if(toMin(w.e)>ce && toMin(w.e)-ce>=20){ var z={}; for(var k2 in w) z[k2]=w[k2]; z.s=fromMin(ce); z.id=w.id+"-z"; acc.push(z); }
        return acc;
      },[]);
      add({kind:"exam",s:b.s,e:b.e,t:(BJ.isAumonier(c)?"Colle aumônier":BJ.isEntretien(c)?"Entretien de personnalité":"Colle – "+c.discipline.replace(/ LV\d$/,""))+(c.colleur?" ("+c.colleur+")":""),sub:BJ.subOf(c),colle:c.id,lieu:c.salle||""});
    });
  }
  /* jour de colle de maths : tout le travail de l'après-midi avant la colle devient des maths (révision du programme) */
  if(typeof BJ!=="undefined"){
    var cm=BJ.mineOn(dISO).filter(function(c){ return BJ.subOf(c)==="maths" && !BJ.isAumonier(c); })[0];
    if(cm){
      var lim=toMin(BJ.block(cm).s);
      ev=ev.map(function(w){
        if(w.kind!=="work" || w.taskId || toMin(w.e)>lim || toMin(w.s)<12*60 || w.sub==="maths") return w;
        var o={}; for(var k in w) o[k]=w[k];
        o.t="Maths · avant la colle"; o.sub="maths"; delete o.subs; o.preColle=true; delete o.trad; delete o.rac; delete o.plan; delete o.light;
        return o;
      });
      ev.forEach(function(w){ if(w.kind==="work" && w.sub==="maths" && toMin(w.e)<=lim && toMin(w.s)>=12*60) w.preColle=true; });
    }
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
  if(ev.items){ ev.items.forEach(function(x){ var o={}; for(var k in x) o[k]=x[k]; push(o); }); return items; }
  if(ev.anki){ push({lab:"Anki anglais",min:20}); push({lab:"Anki allemand",min:20}); return items; }
  if(ev.actu){ push({lab:"Lecture de l'actualité (HGG et langues)",min:20}); return items; }
  if(ev.kind!=="work") return items;
  var subs=ev.subs||[ev.sub];
  if(ev.preColle){ var pg=(typeof Ann!=="undefined")?Ann.progAt(dISO):null; push({lab:"Avant la colle : revoir le cours et les démonstrations"+(pg?" ("+pg.t+")":""),min:Math.min(40,Math.max(15,Math.round(cap/2))),sub:"maths"}); }
  else if(ev.sub==="maths" && ev.crit) push({lab:"Quiz de cours (partie vue en classe)",min:15,sub:"maths",quiz:true});
  if(ev.rac) push({lab:"RAC d'anglais (objectif : 2h, puis 1h45)",min:110,sub:"ang"});
  if(ev.plan) push({lab:"Plan détaillé d'HGG (sujet de la semaine)",min:90,sub:"hgg"});
  if(ev.trad){ push({lab:"Traduction d'anglais",min:30,sub:"ang"}); push({lab:"Traduction d'allemand",min:30,sub:"all"}); }
  var pauseEvery=ev.crit?30:55, pauseLen=ev.crit?5:10, sinceP=0;
  var planned=(typeof Plan!=="undefined")? Plan.forSlot(dISO,ev) : [];
  planned.forEach(function(p){
    if(used>=cap-5) return;
    var m=Math.min(p.min, cap-used); if(m<5) return;
    if(sinceP+m>pauseEvery && items.length && used+pauseLen<cap){ push({lab:"Pause",min:pauseLen,pause:true}); sinceP=0; }
    var o={lab:p.lab+(p.partial?" (une partie)":""),min:m,sub:p.sub,partial:p.partial,late:p.late,star:p.star,ref:p.ref};
    if(p.ref&&p.ref.k==="task") o.task=p.ref.id;
    push(o); sinceP+=m;
  });
  if(used<cap-10){
    var fill={maths:"Exercices du chapitre en cours (ajoute ton TD dans la page Maths pour un plan précis)",hgg:ev.soir?"HGG : travail actif d'abord (plan, problématique), lecture de fiches à la fin":"HGG : fiches et exemples",csh:"Œuvre du jour (encart CSH)",ang:"Anki d'anglais et CIVI",all:"Anki d'allemand et CIVI"}[ev.sub]||"Travail libre";
    if(sinceP>pauseEvery-10 && used+pauseLen<cap){ push({lab:"Pause",min:pauseLen,pause:true}); }
    push({lab:fill,min:cap-used,sub:ev.sub,filler:true});
  }
  return items;
}

/* Modifications de l'agenda faites dans l'app : chaque semaine (par jour de la semaine) puis ce jour-là seulement.
   {hide:{id:true}, mod:{id:{s,e,t,sub}}, add:[{id,s,e,t,sub,kind}]} */
function applyAgendaEdits(ev,dISO,wd){
  var st=Store.get(), A=st.agendaEdits||{}, layers=[A["w"+wd], A[dISO]];
  layers.forEach(function(L){
    if(!L) return;
    ev=ev.filter(function(e){ return !(L.hide&&L.hide[e.id]); }).map(function(e){
      var m=L.mod&&L.mod[e.id]; if(!m) return e; var o={}; for(var k in e) o[k]=e[k];
      ["s","e","t","sub"].forEach(function(k){ if(m[k]) o[k]=m[k]; });
      if(m.sub && !(m.subs)) { if(o.subs && o.subs.indexOf(m.sub)<0) o.subs=null; }
      if(o.subs===null) delete o.subs;
      o.edited=true; return o;
    });
    (L.add||[]).forEach(function(x){ var o={}; for(var k in x) o[k]=x[k]; o.kind=o.kind||"work"; o.added=true; ev.push(o); });
  });
  return ev;
}
