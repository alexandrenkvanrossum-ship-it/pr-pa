/* BJcolle : lecture des données rangées par le robot (tables bj_colles, bj_events, bj_state).
   Copie locale pour le hors-ligne ; les données des camarades restent privées (visibles par toi seul). */
var BJ = (function(){
  var KEY="prepa.bj.v1", data={colles:[], events:[], state:null, at:null}, loading=false, listeners=[], chan=null;
  try{ var c=JSON.parse(localStorage.getItem(KEY)||"null"); if(c&&c.colles) data=c; }catch(e){}
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(data)); }catch(e){ try{ localStorage.setItem(KEY, JSON.stringify({colles:data.colles.map(function(c){ var x={}; for(var k in c) if(k!=="commentaire"&&k!=="champs") x[k]=c[k]; return x; }), events:data.events, state:data.state, at:data.at})); }catch(e2){} } }
  function emit(){ listeners.forEach(function(f){ try{ f(); }catch(e){} }); }
  function sb(){ return (typeof Sync!=="undefined" && Sync.client && Sync.user())? Sync.client() : null; }
  var COLS="id,scope,annee,discipline,date,debut,fin,duree,tirage,type,colleur,salle,eleve,moi,note,note_num,ordre,sujet,commentaire,detail_at,updated_at";
  function load(){
    var c=sb(); if(!c||loading) return Promise.resolve();
    loading=true;
    var all=[];
    function page(from){ return c.from("bj_colles").select(COLS).order("date",{ascending:false}).range(from,from+999).then(function(r){ if(r.error) throw r.error; all=all.concat(r.data); if(r.data.length===1000) return page(from+1000); }); }
    return Promise.all([
      page(0),
      c.from("bj_events").select("*").order("at",{ascending:false}).limit(60).then(function(r){ if(!r.error) data.events=r.data; }),
      c.from("bj_state").select("*").maybeSingle().then(function(r){ if(!r.error) data.state=r.data; })
    ]).then(function(){ data.colles=all; data.at=new Date().toISOString(); save(); loading=false; emit(); live(); })
      .catch(function(){ loading=false; emit(); });
  }
  function live(){
    var c=sb(); if(!c||chan) return;
    try{ chan=c.channel("bj").on("postgres_changes",{event:"*",schema:"public",table:"bj_state"},function(){ load(); }).subscribe(); }catch(e){}
  }
  function checkNow(){
    var c=sb(); if(!c||!c.functions) return Promise.reject(new Error("Connecte-toi d'abord (Plus → Compte)."));
    return c.functions.invoke("bjcolle",{body:{}}).then(function(r){ if(r.error) throw r.error; setTimeout(load,45000); setTimeout(load,100000); return r.data; });
  }
  function markRead(){
    var c=sb(); var ids=data.events.filter(function(e){ return !e.lu; }).map(function(e){ return e.id; });
    data.events.forEach(function(e){ e.lu=true; }); save(); emit();
    if(c&&ids.length) c.from("bj_events").update({lu:true}).in("id",ids).then(function(){});
  }

  /* ---------- lectures ---------- */
  var SUB={"Mathématiques":"maths","Histoire-Géographie":"hgg","Français-Philosophie":"csh","Anglais LV1":"ang","Anglais LV2":"ang","Allemand LV1":"all","Allemand LV2":"all"};
  var PREP={maths:30,hgg:30,csh:30,ang:20,all:20};
  function subOf(c){ return SUB[c.discipline]||"neutral"; }
  /* colle de Français-Philosophie sans heure de tirage ni préparation = entretien de personnalité */
  function isEntretien(c){ return !!c && (c.discipline==="Entretiens de personnalité" || (c.discipline==="Français-Philosophie" && !c.tirage)); }
  function label(c){ return isEntretien(c)? "Entretien de personnalité" : String(c.discipline||"").replace(/ LV\d$/,""); }
  function epOf(c){ if(isEntretien(c)) return "o-entretien"; return {maths:"o-maths",hgg:"o-hgg",csh:"o-csh",ang:"o-ang",all:"o-all"}[subOf(c)]||null; }
  /* une de mes colles à venir que le robot n'a plus vue lors de son dernier passage réussi a été retirée de BJcolle */
  function gone(c){ var ok=data.state&&data.state.last_ok; if(!ok||!c.updated_at||!(c.scope==="moi"||c.scope==="kore")) return false; if((c.date||"")<iso(today())) return false; return new Date(c.updated_at).getTime() < new Date(ok).getTime()-15*60000; }
  function mine(){ return data.colles.filter(function(c){ return c.moi && !gone(c); }); }
  function mineOn(dISO){ return data.colles.filter(function(c){ return c.moi && !gone(c) && c.date===dISO && (c.scope==="moi"||c.scope==="kore") && c.debut; }); }
  function upcoming(){ var t=iso(today()); return mine().filter(function(c){ return (c.scope==="moi"||c.scope==="kore") && c.date>=t; }).sort(function(a,b){ return (a.date+a.debut).localeCompare(b.date+b.debut); }); }
  /* colle aumônier (deux dans l'année) : commence à l'heure exacte, 45 min bloquées */
  function isAumonier(c){ return !!c && /aum[oô]nier/i.test(c.discipline||""); }
  /* tirage anticipé : préparation le midi du jour même (13h20-13h50 en HGG/CSH/maths, 13h30-13h50 en langues).
     Exception : le vendredi (pas de cours), on prépare normalement, 35 min avant le passage. */
  function isAnticipe(c){ return !!c && /anticip/i.test(c.tirage||""); }
  function isFri(c){ return !!c.date && parseISO(c.date).getDay()===5; }
  function prepMidi(c){ if(!isAnticipe(c)||isFri(c)) return null; var s=subOf(c); return {s:(s==="ang"||s==="all")?"13:30":"13:20", e:"13:50"}; }
  function block(c){ // créneau bloqué dans l'agenda : 10 min avant la préparation → fin du passage
    if(isAumonier(c)) return {s:c.debut, e:fromMin(Math.min(1439,toMin(c.debut)+45))};
    var s=subOf(c), end=toMin(c.fin||fromMin(toMin(c.debut)+(c.duree||20)))+((s==="hgg"||s==="csh")?5:0), start;
    if(isAnticipe(c)) start=toMin(c.debut)-(isFri(c)?35:10); // vendredi : préparation 35 min avant ; sinon déjà préparée le midi
    else { var prep=/^\d/.test(c.tirage||"")? toMin(c.debut)-toMin(c.tirage) : isEntretien(c)? 0 : (PREP[s]||20); start=toMin(c.debut)-prep-10; }
    return {s:fromMin(Math.max(0,start)), e:fromMin(Math.min(1439,end)), prep:prepMidi(c)};
  }
  function colleurKey(n){ return String(n||"").replace(/\s+[A-Z]$/,"").trim(); }
  function colleurs(){
    var m={};
    data.colles.forEach(function(c){ if(!c.colleur) return; c.colleur.split(/\s*\/\s*/).forEach(function(n){ var k=colleurKey(n); var o=m[k]||(m[k]={nom:k, disc:{}, notes:[], miennes:[], n:0, sujets:0, last:""}); o.n++; o.disc[c.discipline]=(o.disc[c.discipline]||0)+1; if(c.note_num!=null) o.notes.push(c.note_num); if(c.moi&&c.note_num!=null) o.miennes.push(c.note_num); if(c.sujet) o.sujets++; if((c.date||"")>o.last) o.last=c.date; }); });
    return Object.keys(m).map(function(k){ var o=m[k]; o.discipline=Object.keys(o.disc).sort(function(a,b){ return o.disc[b]-o.disc[a]; })[0]; o.moy=avgN(o.notes); o.moyMoi=avgN(o.miennes); o.sd=sdN(o.notes); return o; });
  }
  function colleur(nom){ return colleurs().filter(function(c){ return c.nom===nom; })[0]||null; }
  function collesDe(nom){ return data.colles.filter(function(c){ return c.colleur && c.colleur.split(/\s*\/\s*/).some(function(n){ return colleurKey(n)===nom; }); }); }
  function avgN(a){ return a.length? a.reduce(function(x,y){return x+y;},0)/a.length : null; }
  function sdN(a){ if(a.length<2) return null; var m=avgN(a); return Math.sqrt(a.reduce(function(x,y){ return x+(y-m)*(y-m); },0)/a.length); }
  function classAvg(disc,annee){ return avgN(data.colles.filter(function(c){ return c.discipline===disc && c.annee===annee && c.note_num!=null; }).map(function(c){ return c.note_num; })); }
  function unread(){ return data.events.filter(function(e){ return !e.lu; }).length; }
  function ready(){ return !!(data.state && data.state.last_ok); }

  return {data:function(){ return data; }, load:load, checkNow:checkNow, markRead:markRead, on:function(f){ listeners.push(f); },
    mine:mine, gone:gone, mineOn:mineOn, upcoming:upcoming, block:block, isAnticipe:isAnticipe, prepMidi:prepMidi, isAumonier:isAumonier, subOf:subOf, isEntretien:isEntretien, label:label, epOf:epOf, colleurs:colleurs, colleur:colleur, collesDe:collesDe, colleurKey:colleurKey, classAvg:classAvg, avg:avgN, unread:unread, ready:ready};
})();
