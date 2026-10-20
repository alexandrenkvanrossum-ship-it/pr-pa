/* ---------- DST de langues : moyenne pondérée (essai 50 %, RAC 30 %, thème 20 %) ---------- */
var LANG_W={Essay:0.5,"Essai":0.5,RAC:0.3,"Contraction":0.3,"Thème":0.2,"Version / Thème":0.2};
function langW(ep,t){ return (ep==="e-ang"||ep==="e-all")? (LANG_W[t]||0) : 0; }
/* note globale d'un DST à partir des exercices saisis : pondérée en langues (sur les exercices présents), moyenne simple ailleurs */
function dstGlobal(ep,parts){
  var ks=Object.keys(parts||{}).filter(function(k){ return parts[k]!=null; }); if(!ks.length) return null;
  var lw=ks.every(function(k){ return langW(ep,k); }), num=0, den=0;
  ks.forEach(function(k){ var w=lw?langW(ep,k):1; num+=parts[k]*w; den+=w; });
  return Math.round(num/den*100)/100;
}
/* une seule fois par note : anciens intitulés allemands, et note globale recalculée si elle était la moyenne simple */
function migrateLangNotes(){
  var s=st(); if(!s||!s.notes) return; var ch=false, ren={"Version / Thème":"Thème","Contraction":"RAC"};
  s.notes.forEach(function(n){
    if(n.w||(n.ep!=="e-ang"&&n.ep!=="e-all")) return;
    if(n.ep==="e-all"){ if(n.type&&ren[n.type]) n.type=ren[n.type]; if(n.parts){ var q={}, p={}; Object.keys(n.parts).forEach(function(k){ q[ren[k]||k]=n.parts[k]; }); ["Essay","RAC","Thème"].concat(Object.keys(q)).forEach(function(k){ if(q[k]!=null&&p[k]==null) p[k]=q[k]; }); n.parts=p; } }
    if(n.parts){ var ks=Object.keys(n.parts), mean=ks.reduce(function(a,k){ return a+n.parts[k]; },0)/ks.length;
      if(ks.length && Math.abs(Math.round(mean*10)/10-n.v)<0.051){ var g=dstGlobal(n.ep,n.parts); if(g!=null) n.v=g; } }
    n.w=1; ch=true;
  });
  if(ch) save();
}

/* ---------- Sélecteur de date : bouton + calendrier qui se déplie dans la fiche ---------- */
var DP_M=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
var DP_D=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
var DP_IC='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
function dpLabel(v){ if(!v) return "Choisir une date"; var d=parseISO(v); return DP_D[d.getDay()]+" "+d.getDate()+" "+DP_M[d.getMonth()]+(d.getFullYear()!==today().getFullYear()?" "+d.getFullYear():""); }
function dpRel(v){ if(!v) return ""; var n=diffDays(v,iso(today())); return n===0?"aujourd'hui":n===-1?"hier":n===1?"demain":n<0?"il y a "+(-n)+" jours":"dans "+n+" jours"; }
function enhanceDates(root){
  Array.prototype.forEach.call(root.querySelectorAll('input[type=date]'),function(inp){
    if(inp.dataset.dp) return; inp.dataset.dp="1";
    var box=document.createElement("div"); box.className="dp";
    inp.parentNode.insertBefore(box,inp); inp.type="hidden"; box.appendChild(inp);
    var btn=document.createElement("button"); btn.type="button"; btn.className="dp-btn"; btn.setAttribute("aria-haspopup","dialog"); box.insertBefore(btn,inp);
    var pan=document.createElement("div"); pan.className="dp-pan"; pan.setAttribute("role","dialog"); pan.setAttribute("aria-label","Calendrier"); box.appendChild(pan);
    var lab=inp.id&&root.querySelector('label[for="'+inp.id+'"]'); if(lab) lab.setAttribute("for",""), lab.addEventListener("click",function(){ btn.click(); });
    var view=parseISO(inp.value||iso(today())); view=new Date(view.getFullYear(),view.getMonth(),1);
    function paintBtn(){ btn.innerHTML=DP_IC+'<span class="dp-v">'+dpLabel(inp.value)+'</span>'+(inp.value?'<span class="dp-r">'+dpRel(inp.value)+'</span>':''); }
    function quick(){ var t=today(), q=[["Aujourd'hui",iso(t)],["Hier",iso(addDays(t,-1))]], back=(t.getDay()+1)%7||7; q.push(["Samedi dernier",iso(addDays(t,-back))]); q.push(["Il y a 1 semaine",iso(addDays(t,-7))]);
      return '<div class="dp-q">'+q.map(function(x){ return '<button type="button" class="'+(x[1]===inp.value?"on":"")+'" data-dv="'+x[1]+'">'+x[0]+'</button>'; }).join("")+'</div>'; }
    function grid(dir){
      var y=view.getFullYear(), m=view.getMonth(), first=(new Date(y,m,1).getDay()+6)%7, start=addDays(new Date(y,m,1),-first), t=iso(today()), h='';
      for(var i=0;i<42;i++){ var d=addDays(start,i), di=iso(d), out=d.getMonth()!==m, ds=typeof paleOn==="function"&&paleOn(di).length;
        if(i===35&&out) break;
        h+='<button type="button" class="dp-d'+(out?" out":"")+(di===t?" today":"")+(di===inp.value?" sel":"")+'" data-dv="'+di+'" aria-label="'+dpLabel(di)+'"'+(di===inp.value?' aria-pressed="true"':'')+'>'+d.getDate()+(ds?'<i title="DST"></i>':'')+'</button>'; }
      return '<div class="dp-g'+(dir?" in-"+dir:"")+'">'+h+'</div>';
    }
    function paint(dir){
      pan.innerHTML=quick()+'<div class="dp-h"><button type="button" class="dp-nav" data-dm="-1" aria-label="Mois précédent">‹</button><b>'+DP_M[view.getMonth()]+' '+view.getFullYear()+'</b><button type="button" class="dp-nav" data-dm="1" aria-label="Mois suivant">›</button></div><div class="dp-w">'+["L","M","M","J","V","S","D"].map(function(x){ return '<span>'+x+'</span>'; }).join("")+'</div>'+grid(dir)+'<div class="dp-leg"><i></i> jour de DST</div>';
    }
    function open(on){ box.classList.toggle("open",on); btn.setAttribute("aria-expanded",on?"true":"false"); if(on){ view=parseISO(inp.value||iso(today())); view=new Date(view.getFullYear(),view.getMonth(),1); paint(); } }
    function pick(v){ inp.value=v; paintBtn(); inp.dispatchEvent(new Event("change",{bubbles:true})); paint(); var sel=pan.querySelector(".dp-d.sel"); if(sel) sel.classList.add("pop"); setTimeout(function(){ open(false); },200); }
    function step(n){ view=new Date(view.getFullYear(),view.getMonth()+n,1); paint(n>0?"r":"l"); }
    btn.addEventListener("click",function(){ open(!box.classList.contains("open")); });
    pan.addEventListener("click",function(e){ var b=e.target.closest("button"); if(!b) return; e.preventDefault(); if(b.dataset.dv) pick(b.dataset.dv); else if(b.dataset.dm) step(+b.dataset.dm); });
    var tx=null; pan.addEventListener("touchstart",function(e){ tx=e.touches[0].clientX; },{passive:true});
    pan.addEventListener("touchend",function(e){ if(tx==null) return; var dx=e.changedTouches[0].clientX-tx; tx=null; if(Math.abs(dx)>45) step(dx<0?1:-1); },{passive:true});
    pan.addEventListener("keydown",function(e){ if(e.key==="Escape"){ open(false); btn.focus(); } });
    paintBtn();
  });
}
