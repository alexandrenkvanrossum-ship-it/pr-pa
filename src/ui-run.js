/* ---------- Running : 30 min par semaine dans Versailles, en plus du sport du jeudi ---------- */
var RUN_START="2 Rue de l'École des Postes, 78000 Versailles";
var RUN_ROUTES=[
  {id:"paris",n:"Avenue de Paris, contre-allée",km:"≈ 4,5 km",d:"Descends jusqu'à l'avenue de Paris, remonte la contre-allée sous les arbres jusqu'à l'hôtel de ville, puis reviens. Tout plat : idéal pour tenir un rythme régulier.",w:["Domaine de Madame Élisabeth, 73 Avenue de Paris, Versailles","Hôtel de Ville de Versailles"]},
  {id:"gonards",n:"Bois des Gonards",km:"≈ 5 km",d:"Par la rue de Montreuil jusqu'au bois (entrée en face du 11 rue du Pont-Colbert) : petites boucles en sous-bois, avec un peu de dénivelé.",w:["11 Rue du Pont Colbert, Versailles"]},
  {id:"fausses",n:"Forêt de Fausses-Reposes",km:"≈ 5 km",d:"Monte vers le haut de Montreuil et entre en forêt : chemins forestiers qui grimpent. Fais demi-tour au bout de 15 minutes pour rester à 30.",w:["Forêt domaniale de Fausses-Reposes"]},
  {id:"parcs",n:"Parcs de Montreuil",km:"≈ 4 km",d:"Deux tours du parc de la Bonne Aventure (ouvert de 8 h 30 à 21 h), puis le jardin des Musiciens italiens et retour par la rue de Montreuil.",w:["Parc de la Bonne Aventure, Versailles","Jardin des Musiciens Italiens, Versailles"]}
];
function runWeek(dISO){ return iso(mondayOf(dISO?parseISO(dISO):today())); }
function runRoute(k,R){ var id=R&&R.r; var x=RUN_ROUTES.filter(function(r){ return r.id===id; })[0]; if(x) return x; var n=Math.round(diffDays(k,"2026-01-05")/7); return RUN_ROUTES[((n%RUN_ROUTES.length)+RUN_ROUTES.length)%RUN_ROUTES.length]; }
function runMaps(r){ var e=encodeURIComponent; return "https://www.google.com/maps/dir/?api=1&origin="+e(RUN_START)+"&destination="+e(RUN_START)+"&waypoints="+e(r.w.join("|"))+"&travelmode=walking"; }
/* créneau posé directement dans l'agenda (créneau ajouté ou tâche avec heure) : il fait foi pour la semaine */
var RUN_RX=/\b(running|footing|jogging|course à pied|courir|run)\b/i;
function runFromAgenda(k){
  var s=Store.get(), A=s.agendaEdits||{}, out=null;
  for(var i=0;i<7&&!out;i++){
    var d=iso(addDays(parseISO(k),i)), wd=parseISO(d).getDay();
    [d,"w"+wd].forEach(function(key){ var L=A[key]; if(out||!L||!L.add) return; L.add.forEach(function(x){ if(!out&&x.s&&RUN_RX.test(x.t||"")&&!(A[d]&&A[d].hide&&A[d].hide[x.id])) out={d:d,s:x.s,e:x.e,src:"agenda",id:x.id,t:x.t}; }); });
    if(!out) (s.tasks||[]).forEach(function(t){ if(!out&&t.day===d&&t.time&&RUN_RX.test(t.title||"")) out={d:d,s:t.time,e:fromMin(toMin(t.time)+(t.dur||30)),src:"task",id:t.id,t:t.title}; });
  }
  return out;
}
function runEff(k){ var R=(st().runs||{})[k]||{}, a=runFromAgenda(k), o={}; for(var x in R) o[x]=R[x]; if(a){ o.d=a.d; o.s=a.s; o.e=a.e; o.src=a.src; o.aid=a.id; } return o; }
function runsDone(){ var R=st().runs||{}; return Object.keys(R).filter(function(k){ return R[k]&&R[k].done; }).length; }
function runCard(){
  var t=iso(today()), k=runWeek(t), R=runEff(k), nextW=false;
  if(today().getDay()===0){ var k2=iso(addDays(parseISO(k),7)), R2=runEff(k2); if(R2.d||R.done||!R.d||R.d<t){ k=k2; R=R2; nextW=true; } }
  S.runK=k; var h='<section class="card runc"><div class="card-h"><h2>🏃 Running '+(nextW?'de la semaine prochaine':'de la semaine')+'</h2><span class="small muted">'+plural(runsDone(),"footing")+'</span></div>';
  if(!R.d){
    var days=[]; for(var i=0;i<7;i++){ var d=iso(addDays(parseISO(k),i)); if(d>=t) days.push(d); }
    h+='<p class="small muted" style="margin:0 0 10px">30 minutes dans Versailles, en plus des 2 h de sport du jeudi. Pose un créneau « Running » dans l\'agenda (le dimanche pour la semaine) : il s\'affiche ici tout seul. Ou fixe-le directement :</p>';
    h+='<div class="runset"><select class="field sm" id="run-day">'+days.map(function(d){ return '<option value="'+d+'">'+esc(relDay(d))+'</option>'; }).join("")+'</select><input class="field sm" id="run-time" type="time" value="07:15" step="300"><button class="btn primary sm" data-a="runset">Fixer</button></div>';
    return h+'</section>';
  }
  var r=runRoute(k,R), when=relDay(R.d), past=R.d<t||(R.d===t&&nowMin()>toMin(R.e||fromMin(toMin(R.s)+30)));
  if(R.done) return h+'<div class="runok"><span>✓</span><div><b>Fait '+esc(relDay(R.done).toLowerCase())+'</b><div class="small muted">'+esc(r.n)+' · '+plural(runsDone(),"footing")+' depuis le début</div></div><button class="link-btn" data-a="rundone">Annuler</button></div></section>';
  h+='<div class="runwhen"><b>'+esc(when)+' · '+hLabel(R.s)+' – '+hLabel(R.e||fromMin(toMin(R.s)+30))+'</b>'+(R.src?'<span class="chip">depuis ton agenda</span>':'')+(past?'<span class="chip warn">C\'était prévu : coche si c\'est fait</span>':R.d===t?'<span class="chip blu">Aujourd\'hui</span>':'')+'</div>';
  h+='<div class="runroute"><div><b>'+esc(r.n)+'</b> <span class="small muted">'+r.km+' · départ de Ginette</span></div><p class="small" style="margin:4px 0 8px;color:var(--ink-2)">'+esc(r.d)+'</p><div class="row" style="gap:8px"><a class="btn tint sm" href="'+runMaps(r)+'" target="_blank" rel="noopener">Itinéraire '+I.arrow+'</a><button class="btn sm" data-a="runroute">Autre itinéraire</button></div></div>';
  h+='<div class="row" style="gap:8px;margin-top:12px"><button class="btn primary sm" data-a="rundone">C\'est fait</button>'+(R.src?'<button class="btn sm" data-a="runag" data-v="'+R.d+'">Voir dans l\'agenda</button>':'<button class="btn sm" data-a="runedit">Changer le créneau</button>')+'</div>';
  return h+'<p class="small muted" style="margin:8px 0 0">Distances estimées : l\'itinéraire s\'ouvre dans Google Maps. Règle simple : demi-tour à 15 minutes.</p></section>';
}
function runClick(a,b){
  var k=S.runK||runWeek(), RS=st().runs=st().runs||{};
  if(a==="runset"){ var d=document.getElementById("run-day").value, tm=document.getElementById("run-time").value||"07:15"; RS[k]=Object.assign({},RS[k]||{},{d:d,s:tm}); save(); render(); toast("Running fixé : "+relDay(d).toLowerCase()+" à "+hLabel(tm)+". Il est dans l'agenda."); return true; }
  if(a==="rundone"){ var R=RS[k]=RS[k]||{}; var E=runEff(k); if(R.done){ delete R.done; } else { R.done=iso(today()); if(E.src==="task"){ var tk=(st().tasks||[]).find(function(x){ return x.id===E.aid; }); if(tk) tk.done=true; } } save(); render(); if(R.done){ toast("Bravo, footing fait."); var fr=Ann.checkBadges(); if(fr.length) setTimeout(function(){ toast("Badge débloqué : "+fr[0].n); },1800); } return true; }
  if(a==="runag"){ S.agDate=b.getAttribute("data-v"); go("agenda"); return true; }
  if(a==="runedit"){ if(RS[k]){ delete RS[k].d; delete RS[k].s; } save(); render(); return true; }
  if(a==="runroute"){ var cur=runRoute(k,RS[k]), ix=RUN_ROUTES.indexOf(cur); RS[k]=Object.assign({},RS[k]||{},{r:RUN_ROUTES[(ix+1)%RUN_ROUTES.length].id}); save(); render(); return true; }
  return false;
}
