/* Planificateur : répartit sur les 14 prochains jours, dans les créneaux de la bonne matière,
   1) les tâches à jour fixé, 2) les devoirs par échéance (la plus proche d'abord),
   3) les exercices de maths et les chapitres d'HGG, uniformément jusqu'à leur date butoir,
   4) les tâches sans date, par priorité. Ce qui ne rentre pas est signalé.
   Le créneau en cours est figé (il ne bouge plus une fois commencé). */
var Plan = (function(){
  function nowMin(){ var d=new Date(); return d.getHours()*60+d.getMinutes(); }
  var HORIZON=14, DEF={maths:45,hgg:45,csh:45,ang:30,all:30};
  var SNAP="prepa.plan.snap", memo={k:null,v:null};
  function snapGet(){ try{ return JSON.parse(localStorage.getItem(SNAP)||"{}"); }catch(e){ return {}; } }
  function snapSet(m){ try{ localStorage.setItem(SNAP,JSON.stringify(m)); }catch(e){} }

  function fixedMin(ev){ var m=0; if(ev.sub==="maths"&&ev.crit) m+=15; if(ev.rac) m+=110; if(ev.plan) m+=90; if(ev.trad) m+=60; return m; }
  function pauseRatio(ev){ return ev.crit? 5/35 : 10/65; }

  /* ---------- éléments à placer ---------- */
  function hggItems(s, t){
    var out=[], H=s.hgg||{}, fait=H.fait||{}, done=H.done||{}, prog=H.prog||{}, mins=H.min||{};
    if(typeof HGG_PROG==="undefined") return out;
    HGG_PROG.quinzaines.forEach(function(q){
      q.chapitres.forEach(function(c,i){
        var k="q"+q.n+"#"+i; if(!fait[k] || done[k]) return;
        var tot=mins[k]||120, left=Math.round(tot*(1-(prog[k]||0)/100)); if(left<10) return;
        var dl=q.fin>=t? q.fin : iso(addDays(parseISO(t),4));
        out.push({key:"hgg|"+k, ref:{k:"hgg",id:k}, lab:"HGG · "+c.titre, sub:"hgg", min:left, dl:dl, late:q.fin<t, chunk:30, spread:"hgg|"+dl});
      });
    });
    return out;
  }
  function exoItems(s, t){
    var out=[], ex=s.mathsEx||{}, done=s.mathsDone||{}, files=s.files||{};
    Object.keys(ex).forEach(function(fid){
      var f=files[fid]; if(!f || f.kind==="dm" || f.off) return;
      var dl=f.target || iso(addDays(parseISO(t),HORIZON-1)); if(dl<t) dl=iso(addDays(parseISO(t),3));
      (ex[fid].exos||[]).forEach(function(e,i){
        var k=fid+"#"+i; if(done[k]) return;
        out.push({key:"exo|"+k, ref:{k:"exo",id:k}, lab:"Ex. "+e.num+(e.titre?" · "+e.titre:"")+" ("+(f.label||f.name)+")", sub:"maths", min:Math.max(10,Math.min(120,e.minutes||30)), dl:dl, whole:true, spread:"exo|"+dl, star:!!e.classique});
      });
    });
    return out;
  }
  function taskItems(s, t){
    var out=[];
    s.tasks.forEach(function(x){
      if(x.done || x.vac || x.time || x.memo || !x.sub || x.sub==="perso") return;
      var tot=x.dur||DEF[x.sub]||30, left=Math.round(tot*(1-(x.progress||0)/100)); if(left<5) return;
      var o={key:"task|"+x.id, ref:{k:"task",id:x.id}, lab:x.title, sub:x.sub, min:left, prio:x.prio||0, created:x.created||"", chunk:15, dm:x.action==="dm"};
      if(x.day){ o.day=x.day<t?t:x.day; o.late=x.day<t; o.cls=0; }
      else if(x.due){ var dl=iso(addDays(parseISO(x.due),-1)); if(dl<t){ dl=t; o.late=x.due<t; } o.dl=dl; o.cls=1; }
      else o.cls=3;
      out.push(o);
    });
    return out;
  }

  /* ---------- créneaux ---------- */
  function slots(t, nm){
    var out=[];
    for(var i=0;i<HORIZON;i++){
      var d=iso(addDays(parseISO(t),i)), wd=parseISO(d).getDay();
      dayEvents(d).forEach(function(ev){
        if(ev.kind!=="work") return;
        var s=toMin(ev.s), e=toMin(ev.e), state="future";
        if(d===t){ if(e<=nm) state="past"; else if(s<=nm) state="now"; }
        var cap=Math.max(0, Math.floor((e-s-fixedMin(ev))*(1-pauseRatio(ev))));
        out.push({d:d, wd:wd, ev:ev, id:d+"|"+ev.id, subs:ev.subs||[ev.sub], cap:cap, left:state==="future"?cap:0, state:state, items:[]});
      });
    }
    return out;
  }
  function fits(sl, it){
    if(sl.left<10 || sl.subs.indexOf(it.sub)<0) return false;
    if(it.day && sl.d!==it.day) return false;
    if(it.dl && sl.d>it.dl) return false;
    if(it.dm && [4,5,0].indexOf(sl.wd)<0) return false;
    return true;
  }
  function put(sl, it, m, res){
    var already=sl.items.filter(function(x){ return x.key===it.key; })[0];
    if(already) already.min+=m; else sl.items.push({key:it.key, ref:it.ref, lab:it.lab, sub:it.sub, min:m, late:it.late, star:it.star, partial:m<it.min||!!already});
    sl.left-=m; it.min-=m;
    (res.byRef[it.key]=res.byRef[it.key]||[]).push({d:sl.d, s:sl.ev.s, t:sl.ev.t, min:m});
  }
  function asap(list, it, res){
    for(var i=0;i<list.length && it.min>0;i++){
      var sl=list[i]; if(!fits(sl,it)) continue;
      var cap=it.dm? Math.min(sl.left, 120-(sl.items.filter(function(x){ return x.key===it.key; })[0]||{min:0}).min) : sl.left;
      if(it.whole){ if(cap>=it.min) put(sl,it,it.min,res); continue; }
      var m=Math.min(cap, it.min); if(m<Math.min(it.chunk||15, it.min)) continue;
      if(it.min-m>0 && it.min-m<(it.chunk||15) && m>it.chunk) m=it.min-(it.chunk||15); /* évite un reliquat minuscule */
      put(sl,it,m,res);
    }
  }
  /* répartition uniforme d'un groupe (même matière, même date butoir) */
  function spread(list, group, res){
    if(!group.length) return;
    var it0=group[0], el=list.filter(function(sl){ return fits(sl,it0); });
    var total=group.reduce(function(a,x){ return a+x.min; },0), room=el.reduce(function(a,sl){ return a+sl.left; },0);
    if(!el.length) return;
    var ratio=Math.min(1, total/room), gi=0;
    el.forEach(function(sl,si){
      var quota=Math.round(sl.left*ratio), last=si===el.length-1;
      while(gi<group.length && (quota>0||last) && sl.left>=10){
        var it=group[gi]; if(it.min<=0){ gi++; continue; }
        if(it.whole){
          if(it.min>sl.left) break;
          if(it.min>quota*1.5+10 && !last) break;
          quota-=it.min; put(sl,it,it.min,res); gi++;
        } else {
          var m=Math.min(sl.left, Math.max(quota, it.chunk), it.min); if(m<Math.min(it.chunk,it.min)) break;
          quota-=m; put(sl,it,m,res); if(it.min<=0) gi++;
        }
      }
    });
    /* ce qui reste : on tente encore au plus tôt avant la date butoir */
    group.forEach(function(it){ if(it.min>0) asap(list,it,res); });
  }

  function compute(dry){
    var s=Store.get(), t=iso(today()), nm=nowMin(), snap=snapGet();
    var res={slots:{}, byRef:{}, unplaced:[], dropped:[], at:new Date().toISOString()};
    var list=slots(t,nm);
    var items=taskItems(s,t).concat(exoItems(s,t)).concat(hggItems(s,t));
    var byKey={}; items.forEach(function(it){ byKey[it.key]=it; it.min0=it.min; });
    /* créneau en cours : figé d'après la dernière photo */
    list.forEach(function(sl){
      if(sl.state!=="now") return;
      var sn=snap[sl.id];
      if(sn && sn.items){ sl.items=sn.items.map(function(x){ var it=byKey[x.key]; if(it){ var m=Math.min(it.min,x.min); it.min-=m; (res.byRef[x.key]=res.byRef[x.key]||[]).push({d:sl.d,s:sl.ev.s,t:sl.ev.t,min:m}); } return x; }); sl.frozen=true; }
      else { sl.left=Math.max(0, Math.floor((toMin(sl.ev.e)-nm)*(1-pauseRatio(sl.ev)))); }
    });
    var fixed=items.filter(function(x){ return x.cls===0; }).sort(function(a,b){ return b.prio-a.prio; });
    var due=items.filter(function(x){ return x.cls===1; }).sort(function(a,b){ return a.dl.localeCompare(b.dl) || b.prio-a.prio; });
    var free=items.filter(function(x){ return x.cls===3; }).sort(function(a,b){ return b.prio-a.prio || a.created.localeCompare(b.created); });
    fixed.forEach(function(it){ asap(list,it,res); });
    due.forEach(function(it){ asap(list,it,res); });
    var groups={}; items.filter(function(x){ return x.spread; }).forEach(function(it){ (groups[it.spread]=groups[it.spread]||[]).push(it); });
    Object.keys(groups).sort(function(a,b){ return a.split("|")[1].localeCompare(b.split("|")[1]); }).forEach(function(g){ spread(list,groups[g],res); });
    free.forEach(function(it){ asap(list,it,res); });
    items.forEach(function(it){
      if(it.min<=0) return;
      var o={key:it.key, ref:it.ref, lab:it.lab, sub:it.sub, min:it.min, of:it.min0, dl:it.dl||it.day||null};
      if(it.cls===3 && !it.prio) res.dropped.push(o); else res.unplaced.push(o);
    });
    list.forEach(function(sl){ res.slots[sl.id]=sl.items; });
    /* photo des créneaux du jour (affichage des créneaux passés, gel du créneau en cours) */
    var ns={}; Object.keys(snap).forEach(function(k){ if(k.slice(0,10)>=iso(addDays(parseISO(t),-7))) ns[k]=snap[k]; });
    list.forEach(function(sl){ if(sl.d!==t) return; if(sl.state==="past" && ns[sl.id]) return; if(sl.state==="now" && sl.frozen) return; ns[sl.id]={items:sl.items}; });
    if(!dry) snapSet(ns);
    return res;
  }
  function sig(){
    var s=Store.get();
    return [iso(today()), Math.floor(nowMin()/5), JSON.stringify(s.tasks), JSON.stringify(s.mathsDone||{}), JSON.stringify(s.hgg||{}), Object.keys(s.mathsEx||{}).join(","), JSON.stringify(s.files||{}), typeof BJ!=="undefined"?BJ.data().at:""].join("§");
  }
  function get(){ var k=sig(); if(memo.k!==k){ memo.v=compute(); memo.k=k; } return memo.v; }
  function forSlot(dISO, ev){
    var id=dISO+"|"+ev.id, p=get();
    if(p.slots[id] && (p.slots[id].length || dISO>iso(today()))) return p.slots[id];
    var sn=snapGet()[id]; return sn? sn.items : (p.slots[id]||[]);
  }
  function whenOf(key){ var r=get().byRef[key]; return r&&r.length? r : null; }
  /* aperçu : où irait une nouvelle tâche, et combien d'éléments seraient repoussés hors délai ? */
  function preview(task){
    var base=compute(true), s=Store.get(); s.tasks.push(task);
    try{ var r=compute(true), k="task|"+task.id;
      return {at:r.byRef[k]||[], unplaced:r.unplaced.some(function(x){ return x.key===k; }), dropped:r.dropped.some(function(x){ return x.key===k; }),
        bumped:r.unplaced.filter(function(x){ return x.key!==k; }).length-base.unplaced.length, pushed:r.dropped.filter(function(x){ return x.key!==k; }).length-base.dropped.length}; }
    finally{ s.tasks.pop(); }
  }
  return {get:get, forSlot:forSlot, whenOf:whenOf, preview:preview, invalidate:function(){ memo.k=null; }};
})();
