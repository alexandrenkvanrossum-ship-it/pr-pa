/* ---------- Objectifs : la moyenne HEC au centre, un grand bandeau par épreuve (inspiré de BJAPP) ---------- */
function objBars(){ var g=st().goals||{}; return {adm:g.__adm!=null?g.__adm:BARRE_HEC, admis:g.__admis!=null?g.__admis:14}; }
function objCalc(list){
  var num=0, den=0, gnum=0, gden=0, tot=0;
  list.forEach(function(e){ tot+=e.coef||0; var a=avg(mainNotes(e.id)), g=st().goals[e.id];
    if(a!=null&&e.coef){ num+=a*e.coef; den+=e.coef; }
    if(e.coef){ var gv=g!=null?g:(a!=null?a:null); if(gv!=null){ gnum+=gv*e.coef; gden+=e.coef; } } });
  return {avg:den?num/den:null, goal:gden?gnum/gden:null, den:den, tot:tot};
}
function objTrack(vals,lo,hi){
  lo=lo||8; hi=hi||20; var pos=function(v){ return ((Math.max(lo,Math.min(hi,v))-lo)/(hi-lo)*100).toFixed(2)+"%"; };
  var h='<div class="otrack"><div class="trk">'+(vals.avg!=null?'<div class="fill" style="width:'+pos(vals.avg)+'"></div>':'')+'</div>';
  (vals.notes||[]).forEach(function(n){ h+='<span class="dot" style="left:'+pos(n.v)+'" title="'+f1(n.v)+'"></span>'; });
  if(vals.bar!=null) h+='<span class="ln bar" style="left:'+pos(vals.bar)+'" title="Barre"></span>';
  if(vals.bar2!=null) h+='<span class="ln bar2" style="left:'+pos(vals.bar2)+'" title="Admission"></span>';
  if(vals.goal!=null) h+='<span class="ln goal" style="left:'+pos(vals.goal)+'" title="Objectif"></span>';
  if(vals.avg!=null) h+='<span class="ln avg" style="left:'+pos(vals.avg)+'" title="Moyenne"></span>';
  for(var t=lo;t<=hi;t+=2) h+='<span class="tk" style="left:'+pos(t)+'">'+t+'</span>';
  return h+'</div>';
}
function vObjectifs(){
  var m=S.notesMode||"ecrit", B=objBars();
  var list=m==="total"?EPREUVES.ecrit.concat(EPREUVES.oral):EPREUVES[m];
  var R=objCalc(list), sumLabel=m==="ecrit"?"écrits, 30 coefficients":m==="oral"?"oraux, 36 coefficients":"écrits + oraux, 66 coefficients";
  var h=topbar("Objectifs")+'<div class="ag-head"><h1 class="large-title" style="margin:0">Objectifs</h1><div class="seg">'+[["ecrit","Écrits"],["oral","Oraux"],["total","Total"]].map(function(x){ return '<button class="'+(m===x[0]?"on":"")+'" data-a="notesmode" data-m="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div></div>';
  var gap=R.avg!=null?B.adm-R.avg:null;
  h+='<section class="card ohero"><div class="ohero-top"><div><div class="eyebrow">Moyenne HEC pondérée · '+sumLabel+'</div><div class="obig">'+f1(R.avg)+'<small> /20</small></div><div class="small muted">'+(R.den?"Calculée sur "+R.den+" coefficients notés sur "+R.tot:"Ajoute tes premières notes pour la calculer")+'</div></div>';
  h+='<div class="obars"><button class="obar" data-a="objbar" data-k="__adm"><span>Barre d\'admissibilité</span><b>'+f1(B.adm)+'</b></button><button class="obar alt" data-a="objbar" data-k="__admis"><span>Barre d\'admission</span><b>'+f1(B.admis)+'</b></button><div class="obar goal"><span>Ton objectif</span><b>'+f1(R.goal)+'</b></div></div></div>';
  h+=objTrack({avg:R.avg,goal:R.goal,bar:B.adm,bar2:B.admis});
  h+='<div class="nleg"><span><i style="background:var(--blue)"></i>ta moyenne</span><span><i style="background:var(--green)"></i>ton objectif</span><span><i style="background:var(--ink)"></i>admissibilité</span><span><i style="background:#9C36B5"></i>admission</span></div>';
  if(gap!=null) h+='<div class="anote '+(gap<=0?"green":"orange")+'" style="margin-top:10px">'+(gap<=0?"<b>Au-dessus de la barre d'admissibilité</b> de "+f1(-gap)+" point.":"<b>Encore "+f1(gap)+" point de moyenne</b> pour atteindre la barre d'admissibilité.")+'</div>';
  h+='</section>';
  /* où gagner le plus : ce que rapporte un point dans chaque épreuve, et ce que rapporterait l'objectif atteint */
  var tot=R.tot||1, rows=list.filter(function(e){ return e.coef; }).map(function(e){ var a=avg(mainNotes(e.id)), g=st().goals[e.id]; var gain=(g!=null&&a!=null&&g>a)?(g-a)*e.coef/tot:0; return {e:e,a:a,g:g,pp:e.coef/tot,gain:gain}; })
    .sort(function(x,y){ return (y.gain-x.gain)||(y.pp-x.pp); });
  h+='<section class="card"><div class="card-h"><h2>Où gagner le plus</h2></div><div class="alist">'+rows.slice(0,5).map(function(r){ var s=subj(r.e.sub); return '<button class="arow ogain" data-a="notedetail" data-id="'+r.e.id+'"><span class="ogdot" style="background:var(--'+r.e.sub+'-ink,var(--ink-3))"></span><span class="abody"><b>'+esc(r.e.name)+(m==="total"?' <span class="small muted">('+(r.e.id.charAt(0)==="e"?"écrit":"oral")+')</span>':'')+'</b><span class="ameta">+1 point ici = +'+String((Math.round(r.pp*100)/100).toFixed(2)).replace(".",",")+' de moyenne'+(r.gain>0?' · atteindre ton objectif rapporterait +'+f1(r.gain):r.a==null?' · pas encore de note':r.g==null?' · fixe un objectif':' · objectif atteint')+'</span></span><span class="chip">coef. '+(r.e.coefTxt||r.e.coef)+'</span></button>'; }).join("")+'</div></section>';
  h+='<div class="row" style="justify-content:space-between;margin:16px 4px 10px"><b style="font-size:18px">Par épreuve</b><button class="btn primary sm" data-a="addnote">'+I.plus+' Ajouter une note</button></div><div class="obands">';
  list.forEach(function(e){
    var ns=mainNotes(e.id), a=avg(ns), s=subj(e.sub), last=ns.length?ns[ns.length-1].v:null, g=st().goals[e.id];
    var tr=ns.length>=2?(ns[ns.length-1].v>=avg(ns.slice(0,-1))?"↗":"↘"):"", gp=(g!=null&&a!=null)?g-a:null;
    h+='<button class="oband '+s.cls+'" data-a="notedetail" data-id="'+e.id+'"><div class="ob-l"><div class="ob-name">'+esc(e.name)+(m==="total"?' <span>'+(e.id.charAt(0)==="e"?"écrit":"oral")+'</span>':'')+'</div><div class="ob-coef">coef. '+(e.coefTxt||e.coef)+'</div></div>';
    h+='<div class="ob-avg"><b>'+f1(a)+'</b><small>'+tr+'</small></div>';
    h+='<div class="ob-mid">'+objTrack({avg:a,goal:g,bar:B.adm,notes:ns})+'<div class="ob-sub">'+(ns.length?plural(ns.length,"note")+" · dernière "+f1(last):"Aucune note")+' · '+(g==null?"objectif à fixer":gp<=0?"objectif "+f1(g)+" atteint":"objectif "+f1(g)+" : encore "+f1(gp)+" pt")+'</div></div></button>';
  });
  h+='</div><p class="small muted" style="margin:10px 4px">Touche une épreuve pour voir sa courbe, ses notes et régler ton objectif. Les barres se règlent en touchant leur valeur.</p>';
  return h;
}
function objBarSheet(k){
  var B=objBars(), cur=k==="__adm"?B.adm:B.admis;
  formSheet({title:k==="__adm"?"Barre d'admissibilité":"Barre d'admission",fields:[{k:"v",label:"Moyenne /20",value:String(cur).replace(".",","),hint:k==="__adm"?"Par défaut : barre HEC 2026 ("+String(BARRE_HEC).replace(".",",")+")":"Moyenne visée à l'issue des oraux"}],save:function(v){ var x=parseFloat(String(v.v).replace(",",".")); if(isNaN(x)||x<0||x>20) return "Entre une valeur entre 0 et 20."; st().goals[k]=x; },toast:"Barre mise à jour."});
}
