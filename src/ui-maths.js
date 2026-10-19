/* ---------- Espace maths (inspiré de BJAPP) : Aujourd'hui, Grange, Planning, Analyses, Progrès, Cours ---------- */
var DOMC={A:"#1C7ED6",L:"#9C36B5",P:"#F08C00"}, DIFFC={f:"#2F9E44",m:"#F08C00",d:"#E03131",td:"#9C36B5"};
var RINGC=["#FF2D55","#34C759","#0A84FF"];
var SEARCH_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';
var MTABS=[["today","Aujourd'hui"],["grange","Grange"],["plan","Planning"],["stats","Analyses"],["prog","Progrès"],["cours","Cours et TD"]];
function annF(){ return S.annF=S.annF||{mode:"ex",eps:[],chs:[],diff:[],per:[],stat:[],ot:[],sort:"score",n:60}; }
function mTab(){ if(!S.mTab){ try{ S.mTab=localStorage.getItem("prepa.mtab")||"today"; }catch(e){ S.mTab="today"; } } return S.mTab; }
function setMTab(t){ S.mTab=t; try{ localStorage.setItem("prepa.mtab",t); }catch(e){} }
function mathsSpace(){
  annBoot();
  var t=mTab(), h='<div class="mtabs" role="tablist">'+MTABS.map(function(x){ return '<button class="'+(t===x[0]?"on":"")+'" data-a="mtab" data-v="'+x[0]+'" role="tab" aria-selected="'+(t===x[0])+'">'+x[1]+'</button>'; }).join("")+'</div>';
  if(t==="cours") return h+mCours();
  if(!Ann.ready()) return h+'<section class="card"><div class="empty">'+(S.annErr?'<b>Annales indisponibles</b>'+esc(S.annErr):'Chargement des 984 exercices…')+'</div></section>';
  return h+({today:mToday,grange:mGrange,plan:mPlanning,stats:mStats,prog:mProgress}[t]||mToday)();
}
function mCours(){
  var h='<section class="card"><div class="card-h"><h2>Chapitre en cours</h2></div><input class="field" id="m-chap" list="m-chaps" value="'+esc(mathsChap())+'"><datalist id="m-chaps">'+mathsChaps().map(function(c){ return '<option value="'+esc(c)+'">'; }).join("")+'</datalist><p class="small muted" style="margin:6px 0 0">Sert de chapitre par défaut pour tes dépôts et met en avant ses énoncés dans les quiz.</p></section>';
  h+='<div class="grid g2">'+mathsTodayCard()+quizCard()+'</div>'+exoCard()+filesCard("maths");
  return h+'<div class="note-box">DM : dépose-le en type « DM » avec sa date de rendu ; il devient une tâche découpée sur jeudi, vendredi et dimanche (2 h max par créneau).</div>';
}
function ringsSVG(vals,size){
  var R=[78,57,36], W=18, s='<svg class="rings" viewBox="0 0 184 184" style="width:'+(size||150)+'px;height:'+(size||150)+'px" role="img" aria-label="Objectifs de la semaine">';
  vals.forEach(function(v,i){ var r=R[i], C=2*Math.PI*r, p=Math.max(0,Math.min(1,v.p||0));
    s+='<circle cx="92" cy="92" r="'+r+'" fill="none" stroke="'+v.c+'" stroke-opacity=".18" stroke-width="'+W+'"/>';
    if(p>0) s+='<circle cx="92" cy="92" r="'+r+'" fill="none" stroke="'+v.c+'" stroke-width="'+W+'" stroke-linecap="round" stroke-dasharray="'+(C*p).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 92 92)"/>'; });
  return s+'</svg>';
}
function bigRing(p,color,label){
  var r=70, C=2*Math.PI*r;
  return '<svg viewBox="0 0 170 170" style="width:140px;height:140px" role="img" aria-label="'+esc(label)+'"><circle cx="85" cy="85" r="'+r+'" fill="none" stroke="'+color+'" stroke-opacity=".16" stroke-width="16"/>'+(p>0?'<circle cx="85" cy="85" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="16" stroke-linecap="round" stroke-dasharray="'+(C*Math.min(1,p)).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 85 85)"/>':'')+'</svg>';
}
function annList(items,opts){ opts=opts||{}; return items.length?'<div class="alist">'+items.map(function(it){ return annRow(it,opts.noScore?null:Ann.score(it,Ann.focusNow())); }).join("")+'</div>':'<div class="empty">'+(opts.empty||"Rien ici pour l'instant.")+'</div>'; }
function gameToast(res){
  if(!res) return;
  if(res.level) toast("Niveau "+(res.level.i+1)+" atteint : "+res.level.n);
  else if(res.badges&&res.badges.length) toast("Badge débloqué : "+res.badges[0].n);
  else if(res.xp>0) toast("+"+res.xp+" XP");
}

/* ---------- Aujourd'hui ---------- */
function mToday(){
  var ws=Ann.weekStats(), g=Ann.goal(), xp=Ann.totalXP(), L=Ann.level(xp), stk=Ann.streak(), t=iso(today());
  var ev=Ann.nextEvent(), focus=Ann.focusNow(), av=+(S.annAvail||0), o={};
  if(av){ if(av>=240) o={minT:120,allowFull:true,ds:true}; else o={maxT:av,orals:av<=60}; }
  var recs=Ann.recommend(focus,5,o), shown={}; recs.forEach(function(x){ shown[x.id]=1; });
  var evDs=ev&&ev.ds?ev.ds.map(Ann.get).filter(Boolean):[];
  var classics=Ann.items().filter(function(it){ var k=Ann.feas(it).k; return !it.ex&&it.rd&&!shown[it.id]&&Ann.statusOf(it.id)!=="done"&&it.lb!=="s"&&(k==="ok"||k==="cur"); }).sort(function(a,b){ return Ann.score(b,focus)-Ann.score(a,focus); }).slice(0,4);
  var doing=Ann.items().filter(function(it){ return Ann.statusOf(it.id)==="doing"; }), redo=Ann.items().filter(function(it){ return Ann.statusOf(it.id)==="redo"; });
  var favs=Ann.items().filter(function(it){ var r=Ann.rec(it.id); return r&&r.f&&r.s!=="done"; });
  var h='<section class="card mhero"><div class="mhero-in">'+ringsSVG([{p:ws.ex/g.ex,c:RINGC[0]},{p:ws.min/g.min,c:RINGC[1]},{p:ws.eps/g.ep,c:RINGC[2]}])+
    '<div class="mleg"><div><span style="color:'+RINGC[0]+'">Exercices cette semaine</span><b>'+ws.ex+'<small>/'+g.ex+'</small></b></div><div><span style="color:#248A3D">Minutes d\'annales</span><b>'+ws.min+'<small>/'+g.min+' min</small></b></div><div><span style="color:'+RINGC[2]+'">Concepteurs différents</span><b>'+ws.eps+'<small>/'+g.ep+'</small></b></div></div></div>'+
    '<div class="mmeta"><button class="mstat" data-a="mtab" data-v="prog"><span>Série</span><b>'+plural(stk,"jour")+'</b></button><button class="mstat" data-a="mtab" data-v="prog"><span>Niveau '+(L.i+1)+'</span><b>'+esc(L.n)+'</b><i class="xpbar"><i style="width:'+(L.p*100).toFixed(1)+'%"></i></i></button></div></section>';
  h+=trinomeCard();
  if(ev){
    var days=diffDays(ev.d,t);
    h+='<section class="card"><div class="mcount"><div style="flex:1;min-width:0"><div class="eyebrow">Prochaine échéance</div><div class="mcount-t">'+esc(ev.n)+'</div><div class="small muted">'+(ev.approx?"≈ ":"")+fmtLong(ev.d)+'</div></div><div class="mcount-n"><b>'+(ev.approx?"≈":"")+days+'</b><span>'+(days>1?"jours":"jour")+'</span></div></div>';
    h+='<p class="small muted" style="margin:8px 0 0">'+esc(ev.t)+'</p><div class="apills" style="margin-top:8px">'+ev.ch.slice(0,6).map(function(c){ return chChip(c); }).join("")+(ev.ch.length>6?'<span class="chip">+'+(ev.ch.length-6)+'</span>':'')+'</div>';
    h+='<div class="row" style="gap:8px;margin-top:12px"><button class="btn tint sm" data-a="mgoev" data-v="'+Ann.EVENTS.indexOf(ev)+'">Voir les annales ciblées</button></div>';
    if(evDs.length) h+='<div class="group-h" style="margin-top:14px">Les '+esc(ev.n)+' des promos précédentes</div>'+annList(evDs,{noScore:true})+'<p class="small muted" style="margin:6px 0 0">'+esc(ev.prep)+'</p>';
    h+='</section>';
  }
  h+='<section class="card"><div class="card-h"><h2>Ma to-do list d\'annales</h2><button class="link-btn" data-a="mtab" data-v="grange">Ajouter un exo</button></div>'+(favs.length?annList(favs):'<p class="small muted" style="margin:0">Les exos que tu as envie de faire : ouvre un exo dans la Grange et ajoute-le à ta liste. Il reste ici jusqu\'à ce que tu le termines.</p>')+'</section>';
  if(doing.length) h+='<section class="card"><div class="card-h"><h2>Reprendre</h2></div>'+annList(doing)+'</section>';
  var fsel=Ann.state().focus||"";
  h+='<section class="card"><div class="card-h"><h2>Pour ton chapitre</h2><select class="field sm" id="ann-focus" aria-label="Chapitre travaillé"><option value="">Auto : '+esc(Colles.chLabel(Ann.defaultFocus()[0]))+'</option>'+Ann.CHL.map(function(c){ return '<option value="'+c.id+'"'+(fsel===c.id?" selected":"")+'>'+esc(Colles.chLabel(c.id))+'</option>'; }).join("")+'</select></div>';
  h+='<div class="eyebrow" style="margin:0 0 6px">J\'ai devant moi</div><div class="seg wide">'+[["0","Peu importe"],["30","30 min"],["60","1 h"],["120","2 h"],["240","4 h"]].map(function(x){ return '<button class="'+(String(av)===x[0]?"on":"")+'" data-a="annavail" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>';
  h+='<div style="margin-top:8px">'+annList(recs,{empty:av?"Rien de faisable dans ce temps pour ce chapitre : essaie une autre durée.":"Tout est fait pour ce chapitre. Change de chapitre ou va dans la Grange."})+'</div>';
  h+='<p class="small muted" style="margin:8px 0 0">Écrits, oraux et DS que tu peux faire à ton niveau, classés par pertinence : intérêt (Major Prépa), lien avec le chapitre, faisabilité à ce stade de l\'année, difficulté, proximité avec le programme ECG.'+(av&&av<=60?" Sur un créneau court, les exercices d'oral et les questions sans préparation sont inclus.":"")+'</p>';
  h+='<button class="link-btn" style="margin-top:6px" data-a="mgoch" data-v="'+esc(focus[0])+'">Tous les exercices de ce chapitre →</button></section>';
  if(classics.length) h+='<section class="card"><div class="card-h"><h2>Super classiques à mémoriser</h2><button class="link-btn" data-a="mgoclassics">Tout voir</button></div>'+annList(classics)+'<p class="small muted" style="margin:6px 0 0">Les ★★★ rouges de Major Prépa : des astuces qui reviennent sans cesse (Cauchy-Schwarz, Wallis, fonction implicite, Gamma…). À maîtriser par cœur.</p></section>';
  if(redo.length) h+='<section class="card"><div class="card-h"><h2>À refaire</h2></div>'+annList(redo)+'</section>';
  return h;
}

/* ---------- Grange ---------- */
function mGrange(){
  var F=annF(), fc=(F.dom?1:0)+F.chs.length+F.diff.length+(F.stars?1:0)+F.per.length+(F.feas?1:0)+F.stat.length+(F.hp?1:0)+(F.py?1:0);
  var all=Ann.items(), ne=all.filter(function(i){ return !i.ex&&!i.k; }).length, no=all.filter(function(i){ return !i.ex&&i.k==="o"; }).length, nd=all.filter(function(i){ return i.k==="d"; }).length;
  var sub=F.mode==="oral"?no+" exercices d'oral HEC et ESCP, avec corrigés officiels":F.mode==="ds"?nd+" devoirs de Ginette des deux dernières promos, avec ce que le prof a relevé":F.mode==="subj"?"Les sujets complets par concepteur, avec sujet, corrigé et rapport":ne+" exercices d'écrit de 2000 à 2026, sujets, corrigés et rapports du jury";
  var h='<p class="subtitle" style="margin:4px 2px 10px">'+sub+'</p>';
  h+='<label class="msearch">'+SEARCH_SVG+'<input class="field" id="ann-q" type="search" placeholder="EDHEC 2014, Wallis, loi de Cauchy…" value="'+esc(S.annQ||"")+'" autocomplete="off" aria-label="Rechercher dans la Grange"></label>';
  h+='<div class="seg wide" style="margin:10px 0">'+[["ex","Écrits"],["subj","Sujets"],["oral","Oraux"],["ds","DS"]].map(function(x){ return '<button class="'+(F.mode===x[0]?"on":"")+'" data-a="annmode" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>';
  var eps=F.mode==="oral"?Ann.OEP_ORDER:F.mode==="ds"?[]:Ann.EP_ORDER;
  if(eps.length) h+='<div class="chips-x"><button class="chip'+(!F.eps.length?" on":"")+'" data-a="anneps" data-v="">Tous</button>'+eps.map(function(e){ return '<button class="chip'+(F.eps.indexOf(e)>=0?" on":"")+'" data-a="anneps" data-v="'+e+'">'+epTile(e,true)+esc(Ann.EPS[e].n)+'</button>'; }).join("")+(F.mode==="oral"?'<button class="chip'+(F.ot.indexOf("ex")>=0?" on":"")+'" data-a="mf" data-k="ot" data-v="ex">Exercices</button><button class="chip'+(F.ot.indexOf("qsp")>=0?" on":"")+'" data-a="mf" data-k="ot" data-v="qsp">QSP</button>':'')+'</div>';
  if(F.mode==="ex"||F.mode==="oral") h+='<div class="seg wide" style="margin:2px 0 10px">'+[["","Toutes durées"],["30","≤ 30 min"],["60","≤ 1 h"],["120","≤ 2 h"],["long","4 h"]].map(function(x){ return '<button class="'+((F.dur||"")===x[0]?"on":"")+'" data-a="mseg" data-k="dur" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>';
  var R=F.mode==="subj"?null:Ann.search(S.annQ||"",F), cnt=F.mode==="subj"?null:R.L.length;
  h+='<div class="mtool"><span class="small muted" id="mg-count">'+(cnt==null?"":plural(cnt,F.mode==="ds"?"devoir":"exercice"))+'</span><span class="sp"></span><button class="btn sm'+(fc?" tint":"")+'" data-a="mfilters">Filtres'+(fc?" ("+fc+")":"")+'</button>'+(F.mode!=="subj"?'<select class="field sm" id="annf-sort" aria-label="Trier">'+[["score","Pertinence"],["recent","Plus récents"],["easy","Plus accessibles"],["stars","Intérêt"]].concat(F.mode==="ds"?[["date","Date"]]:[]).map(function(x){ return '<option value="'+x[0]+'"'+((F.sort||"score")===x[0]?" selected":"")+'>'+x[1]+'</option>'; }).join("")+'</select>':'')+'</div>';
  if(F.mode==="subj") return h+mSubjects();
  var L=R.L;
  if(F.mode==="ds"){
    var ys=[]; L.forEach(function(i){ if(ys.indexOf(i.sub)<0) ys.push(i.sub); }); ys.sort().reverse();
    h+='<p class="small muted" style="margin:0 2px 8px">Ton prof reprend souvent des sujets de concours : la fiche de chaque DS indique le sujet d\'origine, la durée et ce qu\'il a relevé dans les copies.</p>';
    return h+(ys.length?ys.map(function(y){ return '<section class="card"><div class="card-h"><h2>Promo '+esc(y)+'</h2></div><div class="alist">'+L.filter(function(i){ return i.sub===y; }).sort(function(a,b){ return String(a.dsd).localeCompare(String(b.dsd)); }).map(function(it){ return dsRow(it); }).join("")+'</div></section>'; }).join(""):'<section class="card"><div class="empty"><b>Aucun devoir</b>Retire un filtre.</div></section>');
  }
  if(!L.length) return h+'<section class="card"><div class="empty"><b>Aucun exercice</b>Élargis la recherche ou retire un filtre.<div style="margin-top:10px"><button class="btn tint sm" data-a="mreset">Réinitialiser les filtres</button></div></div></section>';
  if(F.mode==="oral") h+=oralHead();
  h+='<section class="card" style="padding:6px 12px"><div class="alist">'+L.slice(0,F.n).map(function(it){ return annRow(it,R.sc[it.id]); }).join("")+'</div></section>';
  if(L.length>F.n) h+='<div style="text-align:center;margin:12px"><button class="btn sm" data-a="annmore">Afficher '+Math.min(60,L.length-F.n)+' de plus</button></div>';
  var fl=F.chs.length?F.chs:Ann.focusNow();
  return h+'<p class="small muted" style="margin:8px 2px">Pertinence calculée pour : '+fl.map(function(c){ return esc(Colles.chLabel(c)); }).join(", ")+'. Le chiffre à droite va de 0 à 100.</p>';
}
function dsRow(it){
  var r=Ann.rec(it.id)||{};
  return '<div class="arow" data-key="ds-'+esc(it.id)+'">'+epTile("DS")+'<button class="abody" data-a="annopen" data-id="'+esc(it.id)+'"><b>'+esc(it.dsn)+' · '+esc(it.th)+'</b><span class="ameta">'+(it.dsd&&it.dsd.length>7?fmtDay(it.dsd)+" "+it.dsd.slice(0,4):"2026")+' · durée '+Ann.dur(it.tm||240)+(it.di?' · '+diffDot(it.di):'')+'</span><span class="apills">'+it.tg.filter(function(t){ return Ann.CH[t]&&Ann.CH[t].y===2; }).map(function(c){ return chChip(c); }).join("")+(r.s==="doing"?'<span class="chip warn">Commencé</span>':'')+'</span></button>'+annChk(it.id)+'</div>';
}
function oralHead(){
  var yrs=function(ep){ return Ann.oy().filter(function(o){ return o.ep===ep; }).sort(function(a,b){ return b.y-a.y; }); };
  var btn=function(u,l){ return u&&/^https?:/.test(u)?'<a class="btn tint sm" href="'+esc(u)+'" target="_blank" rel="noopener">'+l+'</a>':""; };
  var block=function(ep,title){ return '<details class="card mdet"><summary><b>'+title+'</b><span class="link-btn">Afficher</span></summary><div class="alist" style="margin-top:8px">'+yrs(ep).map(function(o){ return '<div class="arow" style="flex-wrap:wrap;gap:6px 8px"><b style="width:44px">'+o.y+'</b><span class="small muted" style="flex:1;min-width:110px">'+(o.ns&&o.ns!=="N/A"?esc(o.ns)+" sujets":"")+(o.nq&&["0","N/A",""].indexOf(o.nq)<0?", "+esc(o.nq)+" QSP":"")+'</span>'+btn(o.su,"Sujets")+btn(o.qsp,"QSP")+btn(o.cs,"Corrigés")+btn(o.cq,"Corrigés QSP")+btn(o.ra,"Rapport")+'</div>'; }).join("")+'</div></details>'; };
  return '<section class="card"><div class="grid g2" style="gap:12px"><div><b>Oral HEC</b><p class="small muted" style="margin:4px 0 0">30 min de préparation, puis 25 min de passage qui commencent par une question de cours, et une question sans préparation d\'environ 5 min.</p></div><div><b>Oral ESCP</b><p class="small muted" style="margin:4px 0 0">Depuis 2025 : un exercice traité en direct pendant 25 min, sans préparation, puis une question sans préparation d\'environ 5 min.</p></div></div></section>'+block("OH","Recueils HEC par année")+block("OE","Recueils ESCP par année");
}
function mSubjects(){
  var F=annF(), q=norm(S.annQ||"").split(/\s+/).filter(Boolean), eps=F.eps.length?F.eps:Ann.EP_ORDER, n=0, h="";
  eps.forEach(function(ep){
    var subs=Ann.subjects().filter(function(s){ return s.ep===ep; }).sort(function(a,b){ return b.y-a.y||String(b.sid).localeCompare(a.sid); }).filter(function(s){
      if(!q.length) return true; var its=Ann.items().filter(function(i){ return i.sid===s.sid; });
      var hh=norm([Ann.EPS[ep].n,s.y,s.sub||""].join(" "))+" "+its.map(function(i){ return Ann.idx(i.id); }).join(" ");
      return q.every(function(w){ return hh.indexOf(w)>=0; });
    });
    if(!subs.length) return; n+=subs.length;
    h+='<section class="card"><div class="card-h"><h2 style="display:flex;align-items:center;gap:8px">'+epTile(ep)+esc(Ann.EPS[ep].full)+'</h2>'+(Ann.EPS[ep].page?'<a class="link-btn" href="'+Ann.EPS[ep].page+'" target="_blank" rel="noopener">Major Prépa</a>':'')+'</div><div class="alist">'+subs.map(function(s){
      var its=Ann.items().filter(function(i){ return i.sid===s.sid; });
      var chips=its.map(function(i){ var st=Ann.statusOf(i.id), col=i.ex?"var(--ink-3)":st==="done"?"var(--green)":st==="doing"?"#F08C00":st==="redo"?"#6152D1":"transparent";
        return '<button class="chip" data-a="annopen" data-id="'+esc(i.id)+'"><span class="sdot" style="background:'+col+'"></span>'+esc(({e1:"Ex. 1",e2:"Ex. 2",e3:"Ex. 3",p:"Pb",p1:"Pb 1",p2:"Pb 2",p3:"Pb 3",p4:"Pb 4",s:"Sujet"})[i.lb]||i.lb)+(i.ex?" (HP)":"")+(i.tm?" · "+Ann.dur(i.tm):"")+'</button>'; }).join("");
      return '<div class="arow msubj"><div class="msy"><b>'+s.y+'</b><span>'+esc(s.sub||"")+'</span></div><div style="flex:1;min-width:0"><div class="apills">'+chips+'</div>'+(s.vi?'<div class="small muted" style="margin-top:6px">'+esc(s.vi)+'</div>':'')+'<div class="row" style="gap:6px;margin-top:8px">'+linkBtn(s.su,"Sujet")+linkBtn(s.co,"Corrigé")+linkBtn(s.ra,"Rapport")+'</div></div></div>';
    }).join("")+'</div></section>';
  });
  return n?h:'<section class="card"><div class="empty"><b>Aucun sujet</b>Essaie un nom d\'école ou une année.</div></section>';
}
function mFiltersSheet(){
  var F=annF(), R=Ann.search(S.annQ||"",F);
  var chip=function(k,v,l,on,pre){ return '<button class="chip'+(on?" on":"")+'" data-a="mf" data-k="'+k+'" data-v="'+v+'">'+(pre||"")+l+'</button>'; };
  var seg=function(k,opts,cur){ return '<div class="seg wide">'+opts.map(function(x){ return '<button class="'+(String(cur||"")===String(x[0])?"on":"")+'" data-a="mseg" data-k="'+k+'" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>'; };
  var h='<div class="sheet-h"><div class="ttl"><div class="eyebrow">'+plural(R.L.length,"exercice")+'</div><h2>Filtres</h2></div><button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><div class="sheet-b mfs">';
  h+='<div><div class="group-h">Faisabilité selon ton avancement</div>'+seg("feas",[["","Tout"],["now","Faisable maintenant"],["part","Au moins en partie"]],F.feas)+'</div>';
  h+='<div><div class="group-h">Durée estimée</div>'+seg("dur",[["","Toutes"],["30","≤ 30 min"],["60","≤ 1 h"],["120","≤ 2 h"],["long","4 h"]],F.dur)+'</div>';
  h+='<div><div class="group-h">Domaine</div>'+seg("dom",[["","Tous"],["A","Analyse"],["L","Algèbre"],["P","Probas"]],F.dom)+'</div>';
  h+='<div><div class="group-h">Chapitres de 2e année</div><div class="apills">'+Ann.CH2.map(function(c){ return chip("chs",c.id,"Ch. "+c.k+" "+esc(c.n),F.chs.indexOf(c.id)>=0); }).join("")+'</div></div>';
  h+='<div><div class="group-h">Notions de 1re année</div><div class="apills">'+Ann.CHL.filter(function(c){ return c.y===1; }).map(function(c){ return chip("chs",c.id,esc(c.n),F.chs.indexOf(c.id)>=0); }).join("")+'</div></div>';
  h+='<div><div class="group-h">Difficulté (Major Prépa)</div><div class="apills">'+Object.keys(Ann.DIFF).map(function(k){ return chip("diff",k,Ann.DIFF[k].n,F.diff.indexOf(k)>=0,'<span class="sdot" style="background:'+DIFFC[k]+'"></span>'); }).join("")+'</div></div>';
  h+='<div><div class="group-h">Intérêt (Major Prépa)</div>'+seg("stars",[["0","Tous"],["2","★★ +"],["3","★★★"],["4","★★★ rouges"]],F.stars||0)+'<p class="small muted" style="margin:6px 2px 0">Rouges : super classiques, dont il faut mémoriser les astuces.</p></div>';
  h+='<div><div class="group-h">Période et programme</div><div class="apills">'+Object.keys(Ann.PER).map(function(k){ return chip("per",k,Ann.PER[k],F.per.indexOf(k)>=0); }).join("")+'</div></div>';
  h+='<div><div class="group-h">Mon suivi</div><div class="apills">'+[["todo","À faire"],["doing","Commencés"],["done","Faits"],["redo","À refaire"],["fav","Ma to-do list"]].map(function(x){ return chip("stat",x[0],x[1],F.stat.indexOf(x[0])>=0); }).join("")+'</div></div>';
  h+='<div class="akv"><div><span>Afficher les éléments hors programme<br><span class="small muted">Nombres complexes, contraintes non linéaires, ouverts…</span></span><button class="chip'+(F.hp?" on":"")+'" data-a="mtog" data-k="hp">'+(F.hp?"Oui":"Non")+'</button></div><div><span>Seulement avec des questions Python</span><button class="chip'+(F.py?" on":"")+'" data-a="mtog" data-k="py">'+(F.py?"Oui":"Non")+'</button></div></div>';
  h+='<div class="row" style="gap:10px"><button class="btn" style="flex:1" data-a="mreset">Réinitialiser</button><button class="btn primary" style="flex:2" data-a="close">Afficher '+plural(R.L.length,"résultat")+'</button></div></div>';
  openSheet(h); layer.setAttribute("data-mf","1");
}

/* ---------- Planning ---------- */
function mPlanning(){
  var t=iso(today()), cur=Ann.mondayIso(), plan=Ann.weekPlan(), evs=Ann.EVENTS.filter(function(e){ return e.d>=t; });
  var totals={}, dones={};
  Ann.items().forEach(function(it){ if(it.ex||it.lb==="s"||it.k) return; it.tg.forEach(function(c){ totals[c]=(totals[c]||0)+1; if(Ann.statusOf(it.id)==="done") dones[c]=(dones[c]||0)+1; }); });
  var weeks=Ann.WEEKS.filter(function(w){ return S.mPast||iso(addDays(parseISO(w.d),6))>=t; }), dsShown={};
  var dsFor=function(w){ var out=[], lim=iso(addDays(parseISO(w.d),13)); Ann.EVENTS.forEach(function(e){ if(e.ds&&e.d>=w.d&&e.d<=lim) e.ds.forEach(function(id){ if(!dsShown[id]&&Ann.get(id)){ dsShown[id]=1; out.push(Ann.get(id)); } }); }); return out; };
  var ov=Ann.state().ov, ovL=function(id){ return ov[id]===true?"Vu":ov[id]===false?"Pas encore vu":"Auto"; };
  var h='<p class="subtitle" style="margin:4px 2px 10px">Ton année de 2e année, et les annales à placer chaque semaine : 3 par semaine, 5 pendant les vacances, sujets complets en 4 h à la fin.</p>';
  h+='<section class="card"><div class="card-h"><h2>Échéances</h2></div><div class="alist">'+evs.map(function(e){ var d=parseISO(e.d); return '<button class="arow mev" data-a="mgoev" data-v="'+Ann.EVENTS.indexOf(e)+'"><span class="evd"><small>'+MON_S[d.getMonth()]+'</small><b>'+d.getDate()+'</b></span><span class="abody"><b>'+esc(e.n)+'</b><span class="ameta">'+esc(e.t)+'</span></span><span class="chip">'+(e.approx?"≈ ":"")+plural(diffDays(e.d,t),"jour")+'</span></button>'; }).join("")+'</div><p class="small muted" style="margin:6px 0 0">Touche une échéance pour voir les annales qui correspondent à son programme.</p></section>';
  h+='<div class="row" style="justify-content:space-between;margin:16px 4px 8px"><b style="font-size:18px">Plan d\'annales</b><button class="link-btn" data-a="mpast">'+(S.mPast?"Masquer le passé":"Semaines passées")+'</button></div>';
  weeks.forEach(function(w){
    var end=iso(addDays(parseISO(w.d),6)), now=w.d===cur, past=end<t, picks=plan[w.d], ds=dsFor(w);
    h+='<section class="card mwk'+(now?" now":"")+(past?" past":"")+'"><div class="row" style="justify-content:space-between"><b>'+(now?"Cette semaine":"Semaine du "+fmtDay(w.d))+'</b><span class="small muted">'+fmtDay(w.d)+' → '+fmtDay(end)+'</span></div>';
    h+='<div class="small muted" style="margin:4px 0 6px;line-height:1.45">'+esc(w.c)+(w.k?'<br>'+esc(w.k):'')+(w.dm?'<br>À rendre : '+esc(w.dm):'')+'</div><div class="apills">'+(w.ev?'<span class="chip warn">'+esc(w.ev)+'</span>':'')+(w.vac?'<span class="chip" style="background:var(--green-pale);color:var(--green)">Vacances : 5 annales en conditions réelles</span>':'')+(w.full?'<span class="chip vio">Sujets complets en 4 h</span>':'')+'</div>';
    if(w.note) h+='<div class="anote" style="margin-top:8px">'+esc(w.note)+'</div>';
    h+=picks&&picks.length?'<div class="alist" style="margin-top:6px">'+picks.map(function(it){ return annRow(it,Ann.score(it,w.f,end)); }).join("")+'</div>':(past?'':'<p class="small muted">Tout est fait pour cette période.</p>');
    if(ds.length) h+='<div class="group-h" style="margin-top:8px">Refais les DS des promos précédentes</div><div class="alist">'+ds.map(dsRow).join("")+'</div>';
    h+='</section>';
  });
  h+='<section class="card"><div class="card-h"><h2>Chapitres de 2e année</h2></div><div class="alist">'+Ann.CH2.map(function(c){
    var s=Ann.chStatus(c.id), n=totals[c.id]||0, d=dones[c.id]||0;
    return '<details class="mch"><summary class="arow"><span class="cnum '+s+'">'+c.k+'</span><span class="abody"><b>'+esc(c.n)+'</b><span class="ameta">'+fmtDay(c.a)+' → '+fmtDay(c.b)+(s==="cur"?" · en cours":s==="seen"?" · vu":"")+'</span><i class="mini"><i style="width:'+(n?(100*d/n).toFixed(1):0)+'%"></i></i></span><span class="chip">'+d+'/'+n+'</span></summary>'+
      '<div class="small" style="padding:4px 0 10px 44px;line-height:1.45"><div class="muted">Démonstrations exigibles en colle</div><div>'+esc(c.demo)+'</div><div class="row" style="gap:8px;margin-top:10px"><button class="btn tint sm" data-a="mgoch" data-v="'+c.id+'">Voir les '+n+' exercices</button><button class="btn sm" data-a="mov" data-v="'+c.id+'">Statut : '+ovL(c.id)+'</button></div></div></details>';
  }).join("")+'</div><p class="small muted" style="margin:6px 0 0">Le statut suit les dates de la progression. Si ton prof prend de l\'avance ou du retard, règle-le ici : les recommandations s\'adaptent.</p></section>';
  h+='<section class="card"><div class="card-h"><h2>Comment anticiper</h2></div><div class="alist">'+Ann.ANTICIPER.map(function(x){ return '<div class="arow"><span class="abody"><b>'+esc(x[0])+'</b><span class="ameta">'+esc(x[1])+'</span></span></div>'; }).join("")+'</div></section>';
  return h;
}

/* ---------- Analyses ---------- */
var COLS_CH=["A1","A2","A3","L1","P1","C0","C1","C2","C3","C4","C5","C6","C7","C8","C9","C10"];
function shortCh(id){ var c=Ann.CH[id]; return c.y===2?"Ch"+c.k:({A1:"Suites",A2:"Fonct.",A3:"Intég.",L1:"Alg. 1A",P1:"Prob. 1A"})[id]; }
function mStats(){
  var ep=S.mStatEp||"all", all=Ann.items().filter(function(it){ return !it.ex&&!it.k&&it.lb!=="s"; });
  var pool=all.filter(function(it){ return ep==="all"||it.ep===ep; });
  var dw={A:0,L:0,P:0}; pool.forEach(function(it){ var d=Ann.doms(it); d.forEach(function(x){ dw[x]+=1/d.length; }); }); var tot=dw.A+dw.L+dw.P||1;
  var R=54, C=2*Math.PI*R, off=0;
  var arcs=["A","L","P"].map(function(k){ var p=dw[k]/tot, a='<circle cx="75" cy="75" r="'+R+'" fill="none" stroke="'+DOMC[k]+'" stroke-width="22" stroke-dasharray="'+(C*p).toFixed(2)+' '+C.toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 75 75)"><title>'+Ann.DOM[k].n+' : '+Math.round(p*100)+' %</title></circle>'; off+=C*p; return a; }).join("");
  var cnt={}; pool.forEach(function(it){ it.tg.forEach(function(c){ if(Ann.CH[c]) cnt[c]=(cnt[c]||0)+1; }); });
  var chs=Object.keys(cnt).map(function(k){ return [k,cnt[k]]; }).sort(function(a,b){ return b[1]-a[1]; }), max=chs.length?chs[0][1]:1;
  var hm={}, hmax=1; all.forEach(function(it){ it.tg.forEach(function(c){ if(Ann.CH[c]){ var k=it.ep+"|"+c; hm[k]=(hm[k]||0)+1; hmax=Math.max(hmax,hm[k]); } }); });
  var years=[], byY={}, ymax=1; for(var y=2000;y<=2026;y++) years.push(y);
  pool.forEach(function(it){ var d=Ann.doms(it), o=byY[it.y]||(byY[it.y]={A:0,L:0,P:0,n:0}); d.forEach(function(x){ o[x]+=1/d.length; }); o.n++; ymax=Math.max(ymax,o.n); });
  var diffRows=Ann.EP_ORDER.map(function(e){ var p=Ann.items().filter(function(it){ return it.ep===e&&!it.ex&&it.di; }), c={f:0,m:0,d:0,td:0}; p.forEach(function(it){ c[it.di]++; }); return [e,c,p.length]; });
  var hpc={}; pool.forEach(function(it){ Ann.hpLinks(it).forEach(function(hh){ var k=String(hh.n).replace(/\s*\(.*?\)\s*/g,"").trim(); if(!k) return; var key=norm(k), o=hpc[key]||(hpc[key]={n:k.charAt(0).toUpperCase()+k.slice(1),c:0,u:""}); o.c++; if(hh.u&&!o.u) o.u=hh.u; }); });
  var hps=Object.keys(hpc).map(function(k){ return hpc[k]; }).sort(function(a,b){ return b.c-a.c||a.n.localeCompare(b.n); }).slice(0,14);
  var cov=COLS_CH.map(function(c){ var p=all.filter(function(it){ return it.tg.indexOf(c)>=0; }); return [c,p.length,p.filter(function(it){ return Ann.statusOf(it.id)==="done"; }).length]; });
  var chName=function(c){ var x=Ann.CH[c]; return x.y===2?"Ch. "+x.k+" "+x.n:x.n+" (1A)"; };
  var h='<p class="subtitle" style="margin:4px 2px 10px">Ce qui tombe, où, et à quel niveau : '+pool.length+' exercices pour '+(ep==="all"?"tous les concepteurs":esc(Ann.EPS[ep].full))+'.</p>';
  h+='<div class="chips-x">'+[["all","Tous"]].concat(Ann.EP_ORDER.map(function(e){ return [e,Ann.EPS[e].n]; })).map(function(x){ return '<button class="chip'+(ep===x[0]?" on":"")+'" data-a="mstatep" data-v="'+x[0]+'">'+(x[0]==="all"?"":epTile(x[0],true))+esc(x[1])+'</button>'; }).join("")+'</div>';
  h+='<div class="grid g2" style="margin-top:8px"><section class="card"><div class="card-h"><h2>Répartition par domaine</h2></div><div class="donut"><svg viewBox="0 0 150 150" role="img" aria-label="Répartition par domaine">'+arcs+'<text x="75" y="72" text-anchor="middle" style="font:800 24px var(--font-display);fill:var(--ink)">'+pool.length+'</text><text x="75" y="92" text-anchor="middle" style="font:600 11px var(--font);fill:var(--ink-2)">exercices</text></svg><div class="dlg">'+["A","L","P"].map(function(k){ return '<span><i style="background:'+DOMC[k]+'"></i>'+Ann.DOM[k].n+' <b>'+Math.round(100*dw[k]/tot)+' %</b></span>'; }).join("")+'</div></div></section>';
  h+='<section class="card"><div class="card-h"><h2>Difficulté selon les concepteurs</h2></div><div class="hbars">'+diffRows.map(function(x){ var e=x[0], c=x[1], n=x[2]||1; return '<button class="hbar" data-a="mgoep" data-v="'+e+'"><span class="hl">'+epTile(e,true)+esc(Ann.EPS[e].s)+'</span><span class="ht">'+["f","m","d","td"].map(function(k){ return c[k]?'<i style="width:'+(100*c[k]/n).toFixed(1)+'%;background:'+DIFFC[k]+'" title="'+Ann.DIFF[k].n+' : '+c[k]+'"></i>':""; }).join("")+'</span><span class="hn">'+x[2]+'</span></button>'; }).join("")+'</div><div class="dlg row">'+Object.keys(Ann.DIFF).map(function(k){ return '<span><i style="background:'+DIFFC[k]+'"></i>'+Ann.DIFF[k].n+'</span>'; }).join("")+'</div></section></div>';
  h+='<section class="card"><div class="card-h"><h2>Chapitres les plus présents</h2></div><div class="hbars">'+chs.map(function(x){ return '<button class="hbar wide" data-a="mgoch" data-v="'+x[0]+'"'+(ep!=="all"?' data-ep="'+ep+'"':'')+'><span class="hl">'+esc(chName(x[0]))+'</span><span class="ht"><i style="width:'+(100*x[1]/max).toFixed(1)+'%;background:'+DOMC[Ann.CH[x[0]].d]+'"></i></span><span class="hn">'+x[1]+'</span></button>'; }).join("")+'</div><p class="small muted" style="margin:8px 0 0">Touche une barre pour ouvrir les exercices dans la Grange.</p></section>';
  h+='<section class="card"><div class="card-h"><h2>Carte de chaleur : concepteurs et chapitres</h2></div><div class="scrollx"><div class="heat" style="grid-template-columns:110px repeat('+COLS_CH.length+',minmax(30px,1fr))"><span></span>'+COLS_CH.map(function(c){ return '<span class="hh" title="'+esc(Ann.CH[c].n)+'">'+shortCh(c)+'</span>'; }).join("")+
    Ann.EP_ORDER.map(function(e){ return '<span class="hr">'+epTile(e,true)+esc(Ann.EPS[e].s)+'</span>'+COLS_CH.map(function(c){ var v=hm[e+"|"+c]||0, a=v?0.14+0.86*v/hmax:0; return '<button class="hc" data-a="mgoheat" data-ep="'+e+'" data-v="'+c+'" style="background:'+(v?hexA(DOMC[Ann.CH[c].d],a):"var(--fill)")+';'+(a>.6?"color:#fff":"")+'" title="'+esc(Ann.EPS[e].n)+', '+esc(Ann.CH[c].n)+' : '+v+'">'+(v||"")+'</button>'; }).join(""); }).join("")+'</div></div></section>';
  h+='<section class="card"><div class="card-h"><h2>Évolution par année</h2></div><div class="scrollx"><div class="ycols">'+years.map(function(y){ var o=byY[y]; if(!o) return '<div class="yc" style="height:2px;background:var(--fill)" title="'+y+' : aucun"></div>'; return '<button class="yc" data-a="mgoyear" data-v="'+y+'" style="height:'+(100*o.n/ymax).toFixed(1)+'%" title="'+y+' : '+o.n+' exercices">'+["A","L","P"].map(function(k){ return '<i style="height:'+(100*o[k]/o.n).toFixed(1)+'%;background:'+DOMC[k]+'"></i>'; }).join("")+'</button>'; }).join("")+'</div><div class="yax">'+years.map(function(y){ return '<span>'+(y%5===0||y===2026?"’"+String(y).slice(2):"")+'</span>'; }).join("")+'</div></div></section>';
  h+='<div class="grid g2"><section class="card"><div class="card-h"><h2>Notions hors programme qui reviennent</h2></div><p class="small muted" style="margin:0 0 6px">Introduites par l\'énoncé : mieux vaut les avoir déjà croisées.</p>'+(hps.length?'<div class="alist">'+hps.map(function(x){ return '<div class="arow"><button class="abody" data-a="mgoq" data-v="'+esc(x.n)+'"><b style="font-weight:500">'+esc(x.n)+'</b></button>'+(x.u?'<a class="btn tint sm" href="'+esc(x.u)+'" target="_blank" rel="noopener">Fiche</a>':'')+'<span class="chip">'+x.c+'</span></div>'; }).join("")+'</div>':'<div class="empty">Aucune notion signalée.</div>')+'</section>';
  h+='<section class="card"><div class="card-h"><h2>Ma couverture par chapitre</h2></div><div class="hbars">'+cov.map(function(x){ return '<button class="hbar wide" data-a="mgoch" data-v="'+x[0]+'"><span class="hl">'+esc(Ann.CH[x[0]].y===2?"Ch. "+Ann.CH[x[0]].k+" "+Ann.CH[x[0]].n:Ann.CH[x[0]].n)+'</span><span class="ht"><i style="width:'+(x[1]?(100*x[2]/x[1]).toFixed(1):0)+'%;background:var(--green)"></i></span><span class="hn">'+x[2]+'/'+x[1]+'</span></button>'; }).join("")+'</div><p class="small muted" style="margin:8px 0 0">Se remplit à mesure que tu coches des exercices.</p></section></div>';
  return h+'<p class="small muted" style="margin:8px 2px">Graphiques sur les écrits ; oraux et DS exclus. Un exercice qui mêle plusieurs domaines est réparti à parts égales.</p>';
}
function hexA(hex,a){ var n=parseInt(hex.slice(1),16); return "rgba("+(n>>16&255)+","+(n>>8&255)+","+(n&255)+","+a.toFixed(2)+")"; }

/* ---------- Progrès ---------- */
function mProgress(){
  Ann.checkBadges();
  var xp=Ann.totalXP(), L=Ann.level(xp), gs=Ann.gameStats(), stk=Ann.streak(), g=Ann.goal(), B=Ann.state().badges||{};
  var avg=gs.notes.length?gs.notes.reduce(function(a,b){ return a+b; },0)/gs.notes.length:null;
  var weeks=[], m=Ann.mondayIso(); for(var i=0;i<10;i++){ weeks.unshift(m); m=iso(addDays(parseISO(m),-7)); }
  var wv=weeks.map(function(w){ return Ann.weekStats(w).ex; }), wmax=Math.max.apply(null,[1].concat(wv));
  var hist=Object.keys(Ann.state().it).filter(function(id){ var r=Ann.state().it[id]; return r.d&&Ann.get(id)&&(r.s==="done"||r.s==="redo"); }).sort(function(a,b){ return Ann.state().it[b].d.localeCompare(Ann.state().it[a].d); }).slice(0,12).map(Ann.get);
  var hrs=gs.minutes/60, nb=Object.keys(B).length;
  var h='<p class="subtitle" style="margin:4px 2px 10px">'+xp.toLocaleString("fr-FR")+' XP au total</p>';
  h+='<section class="card mlevel"><div class="mring">'+bigRing(L.p,"#5E5CE6","Progression du niveau")+'<div><b>'+(L.i+1)+'</b><span>niveau</span></div></div><div style="flex:1;min-width:200px"><div class="mlv">'+esc(L.n)+'</div><div class="muted">Encore <b style="color:var(--ink)">'+Math.max(0,L.hi-xp).toLocaleString("fr-FR")+' XP</b> pour « '+esc(L.next)+' »</div><p class="small muted" style="margin:10px 0 0">Les XP dépendent de la difficulté, de l\'intérêt et de la longueur : un problème de Parisiennes rapporte trois fois plus qu\'un exercice EDHEC. Bonus de 15 % pour une note d\'au moins 14/20, et de 40 XP pour chaque exercice refait.</p></div></section>';
  h+='<div class="mmeta four"><div class="mstat"><span>Exercices faits</span><b>'+gs.done+'</b></div><div class="mstat"><span>Temps total</span><b>'+(hrs>=1?hrs.toFixed(1).replace(".",",")+" h":gs.minutes+" min")+'</b></div><div class="mstat"><span>Note moyenne</span><b>'+(avg==null?"–":avg.toFixed(1).replace(".",","))+'</b></div><div class="mstat"><span>Série / record</span><b>'+stk+' / '+gs.best+' j</b></div></div>';
  h+='<section class="card"><div class="card-h"><h2>10 dernières semaines</h2></div><div class="wkh">'+weeks.map(function(w,i){ var d=parseISO(w); return '<div class="w'+(i===9?" cur":"")+'" title="Semaine du '+fmtDay(w)+' : '+plural(wv[i],"exercice")+'"><b>'+(wv[i]||"")+'</b><i style="height:'+Math.max(4,80*wv[i]/wmax)+'px"></i><span>'+d.getDate()+'/'+(d.getMonth()+1)+'</span></div>'; }).join("")+'</div></section>';
  h+='<section class="card"><div class="card-h"><h2>Objectifs de la semaine</h2></div><div class="alist">'+[["ex","Exercices",1,RINGC[0]],["min","Minutes d'annales",30,RINGC[1]],["ep","Concepteurs différents",1,RINGC[2]]].map(function(x){ return '<div class="arow"><span class="sdot" style="background:'+x[3]+';width:12px;height:12px"></span><span class="abody"><b style="font-weight:500">'+x[1]+'</b></span><span class="stepper"><button data-a="mgoal" data-k="'+x[0]+'" data-v="'+(-x[2])+'" aria-label="Diminuer">−</button><b>'+g[x[0]]+'</b><button data-a="mgoal" data-k="'+x[0]+'" data-v="'+x[2]+'" aria-label="Augmenter">+</button></span></div>'; }).join("")+'</div></section>';
  h+='<section class="card"><div class="card-h"><h2>Badges</h2><span class="small muted">'+nb+'/'+Ann.BADGES.length+'</span></div><div class="badges">'+Ann.BADGES.map(function(b){ var on=!!B[b.id]; return '<div class="badge'+(on?"":" lock")+'" title="'+esc(b.d)+'"><div class="medal" style="--c:'+(EPC[b.c]||"#868E96")+'">'+esc(b.g)+'</div><b>'+esc(b.n)+'</b><span>'+(on?"Obtenu le "+fmtDay(B[b.id]):esc(b.d))+'</span></div>'; }).join("")+'</div></section>';
  h+='<section class="card"><div class="card-h"><h2>Historique</h2></div>'+(hist.length?annList(hist,{noScore:true}):'<div class="empty"><b>Aucun exercice terminé</b>Coche ton premier exercice dans la Grange ou sur l\'écran Aujourd\'hui.</div>')+'</section>';
  return h+'<p class="small muted" style="margin:8px 2px">Sources : répertoire Major Prépa des maths approfondies et analyses Major Prépa (sujets, corrigés, rapports, difficulté, intérêt, notions), programme officiel ECG, base d\'annales de BJAPP.</p>';
}

/* ---------- actions ---------- */
function mGoGrange(f){ var F=annF(); Object.assign(F,{mode:"ex",eps:[],chs:[],diff:[],per:[],stat:[],ot:[],dom:"",stars:0,feas:"",hp:false,py:false,dur:"",n:60,sort:"score"},f||{}); S.annQ=f&&f.q||""; setMTab("grange"); closeSheet(); if(S.view!=="matiere"||S.param!=="maths") go("matiere","maths"); else { render(); window.scrollTo(0,0); } }
function mathsClick(a,b){
  if(a==="mtab"){ setMTab(b.getAttribute("data-v")); if(S.view!=="matiere"||S.param!=="maths") go("matiere","maths"); else { render(); window.scrollTo(0,0); } return true; }
  if(a==="mgoev"){ var e=Ann.EVENTS[+b.getAttribute("data-v")]; mGoGrange({chs:e.ch.slice(),feas:"now"}); toast("Annales ciblées : "+e.n); return true; }
  if(a==="mgoch"){ var ep=b.getAttribute("data-ep"); mGoGrange({chs:[b.getAttribute("data-v")],eps:ep?[ep]:[]}); return true; }
  if(a==="mgoheat"){ mGoGrange({chs:[b.getAttribute("data-v")],eps:[b.getAttribute("data-ep")]}); return true; }
  if(a==="mgoep"){ mGoGrange({eps:[b.getAttribute("data-v")]}); return true; }
  if(a==="mgoyear"){ mGoGrange({q:b.getAttribute("data-v"),sort:"recent"}); return true; }
  if(a==="mgoq"){ mGoGrange({q:b.getAttribute("data-v"),hp:true}); return true; }
  if(a==="mgoclassics"){ mGoGrange({stars:4,sort:"score"}); return true; }
  if(a==="mfilters"){ mFiltersSheet(); return true; }
  if(a==="mf"){ var F=annF(), k=b.getAttribute("data-k"), v=b.getAttribute("data-v"), L=F[k]=F[k]||[], ix=L.indexOf(v); if(ix>=0) L.splice(ix,1); else L.push(v); F.n=60; if(layer.getAttribute("data-mf")&&layer.innerHTML) mFiltersSheet(); render(); return true; }
  if(a==="mseg"){ var F2=annF(), k2=b.getAttribute("data-k"), v2=b.getAttribute("data-v"); F2[k2]=k2==="stars"?+v2:v2; F2.n=60; if(layer.getAttribute("data-mf")&&layer.innerHTML) mFiltersSheet(); render(); return true; }
  if(a==="mtog"){ var F3=annF(), k3=b.getAttribute("data-k"); F3[k3]=!F3[k3]; F3.n=60; mFiltersSheet(); render(); return true; }
  if(a==="mreset"){ mGoGrange({mode:annF().mode}); return true; }
  if(a==="mpast"){ S.mPast=!S.mPast; render(); return true; }
  if(a==="mov"){ var id=b.getAttribute("data-v"), ov=Ann.state().ov; ov[id]=ov[id]===undefined?true:(ov[id]===true?false:undefined); if(ov[id]===undefined) delete ov[id]; save(); render(); return true; }
  if(a==="mstatep"){ S.mStatEp=b.getAttribute("data-v"); render(); return true; }
  if(a==="mgoal"){ var G=Ann.goal(), gk=b.getAttribute("data-k"); G[gk]=Math.max(gk==="min"?30:1,(G[gk]||0)+(+b.getAttribute("data-v"))); save(); render(); return true; }
  return false;
}
