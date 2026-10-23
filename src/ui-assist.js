/* ---------- Assistant (Gemini) qui peut modifier l'agenda et les tâches ----------
   Gemini reçoit l'agenda des 7 prochains jours (créneaux avec identifiants) et les tâches ouvertes,
   et termine sa réponse par un bloc <actions>[…]</actions> quand on lui demande un changement.
   L'app applique les actions aussitôt, les liste dans la conversation, avec un bouton « Annuler ». */
var chat=[];
var AS_SUBS={maths:"Maths",hgg:"HGG",csh:"CSH",ang:"Anglais",all:"Allemand",neutral:"Autre",perso:"Perso"};
function asDays(){ var t=today(), out=[]; for(var i=0;i<7;i++) out.push(iso(addDays(t,i)));
  if(S.view==="agenda"&&S.param&&/^\d{4}-\d{2}-\d{2}$/.test(S.param)&&out.indexOf(S.param)<0) out.push(S.param); return out; }
function asEvents(d){ return dayEvents(d).concat(timedTasks(d)).sort(function(a,b){ return toMin(a.s)-toMin(b.s); }); }
function asLocked(e){ return e.kind==="exam"||!!e.colle; }
function pageContext(){
  var t=iso(today()), parts=["Page ouverte : "+S.view+(S.param?" ("+(AS_SUBS[S.param]||S.param)+")":""),"Aujourd'hui : "+fmtLong(t)+" ("+t+"), il est "+fromMin(nowMin())+"."];
  parts.push("AGENDA (une ligne par créneau : [id] début-fin intitulé · matière ; « verrouillé » = colle ou DST, non modifiable) :");
  asDays().forEach(function(d){
    parts.push("# "+fmtLong(d)+" ("+d+")");
    asEvents(d).forEach(function(e){ parts.push("["+e.id.replace(/-[az]$/,"")+"] "+e.s+"-"+e.e+" "+e.t+" · "+(AS_SUBS[e.sub]||e.sub||"")+(asLocked(e)?" · verrouillé":"")); });
  });
  var tasks=st().tasks.filter(function(x){ return !x.done; }).slice(0,40).map(function(x){ return "["+x.id+"] "+x.title+" · "+(AS_SUBS[x.sub]||x.sub)+(x.due?" · pour le "+x.due:"")+(x.day?" · prévue le "+x.day+(x.time?" à "+x.time:""):"")+(x.dur?" · "+x.dur+" min":"")+(x.prio?" · priorité "+x.prio:""); });
  parts.push("TÂCHES OUVERTES :\n"+(tasks.join("\n")||"aucune"));
  var p=upcomingPales(3).map(function(x){ return x.date+" "+x.t; }); parts.push("Prochains DST : "+(p.join(" ; ")||"aucun"));
  parts.push(
"QUAND ALEXANDRE DEMANDE UNE MODIFICATION de l'agenda ou des tâches (remplacer, déplacer, raccourcir, supprimer, ajouter, cocher…), fais-la : " +
"réponds en une ou deux phrases ce que tu fais, puis termine OBLIGATOIREMENT par un bloc <actions>[…]</actions> contenant un tableau JSON valide. Opérations :\n" +
'{"op":"edit","date":"AAAA-MM-JJ","id":"…","t":"nouvel intitulé","s":"HH:MM","e":"HH:MM","sub":"maths|hgg|csh|ang|all|neutral"} (ne mets que les champs qui changent) ;\n' +
'{"op":"delete","date":"…","id":"…"} ;\n' +
'{"op":"add","date":"…","s":"HH:MM","e":"HH:MM","t":"intitulé","sub":"…"} ;\n' +
'{"op":"move","date":"…","id":"…","to":"AAAA-MM-JJ","s":"HH:MM","e":"HH:MM"} (vers un autre jour) ;\n' +
'{"op":"task_add","title":"…","sub":"maths|hgg|csh|ang|all|perso","due":"AAAA-MM-JJ ou null","day":"AAAA-MM-JJ ou null","time":"HH:MM ou null","dur":minutes,"prio":0-3} ;\n' +
'{"op":"task_edit","id":"…", champs à changer parmi title, sub, due, day, time, dur, prio} ; {"op":"task_done","id":"…"} ; {"op":"task_delete","id":"…"}.\n' +
'Ajoute "weekly":true à edit, delete ou add SEULEMENT si Alexandre dit « chaque semaine », « tous les lundis », « toujours »… ' +
"« Remplacer X par Y » = edit de l'intitulé (et de la matière si elle change) en gardant l'horaire. Utilise UNIQUEMENT les identifiants listés ci-dessus, recopiés exactement. " +
"Ne touche jamais un créneau verrouillé. Si la demande est ambiguë (plusieurs créneaux possibles, jour inconnu), pose une question courte au lieu d'agir, sans bloc. " +
"Pour une simple question, réponds normalement, sans bloc. N'écris jamais le JSON en dehors du bloc.");
  return parts.join("\n");
}

/* ---------- application des actions ---------- */
function asParse(txt){
  var m=String(txt||"").match(/<actions>\s*([\s\S]*?)\s*<\/actions>/i) || String(txt||"").match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
  if(!m) return {text:String(txt||"").trim(), acts:null};
  var raw=m[1].replace(/^```(?:json)?|```$/g,"").trim(), acts=null;
  try{ acts=JSON.parse(raw); if(!Array.isArray(acts)) acts=[acts]; }catch(e){ acts="bad"; }
  return {text:String(txt).replace(m[0],"").trim(), acts:acts};
}
function asHM(x){ return /^\d{1,2}:\d{2}$/.test(x||"")? fromMin(toMin(x)) : null; }
function asApply(acts){
  var before=JSON.stringify({a:st().agendaEdits||{},t:st().tasks}), done=[], fail=[];
  acts.forEach(function(a){ try{ var r=asOne(a); if(r) done.push(r); }catch(e){ fail.push(e.message); } });
  if(done.length){ save(); if(typeof Plan!=="undefined") Plan.invalidate(); }
  return {before:before, done:done, fail:fail};
}
function asFind(d,id){ var base=String(id||"").replace(/-[az]$/,""); return asEvents(d).find(function(e){ return e.id===base||e.id.replace(/-[az]$/,"")===base; }); }
function asTask(id){ var t=st().tasks.find(function(x){ return x.id===id; }); if(!t) throw new Error("tâche introuvable ("+id+")"); return t; }
function asOne(a){
  var op=a&&a.op, d=a.date, W=a.weekly?"w":"d";
  if(/^task_/.test(op)){
    if(op==="task_add"){ if(!a.title) throw new Error("tâche sans intitulé");
      var p=parseTask(String(a.title)), t=taskFrom(p); t.title=String(a.title).trim(); t.sub=AS_SUBS[a.sub]&&a.sub!=="neutral"?a.sub:(p.sub||"perso");
      ["due","day"].forEach(function(k){ if(a[k]&&/^\d{4}-\d{2}-\d{2}$/.test(a[k])) t[k]=a[k]; }); if(asHM(a.time)) t.time=asHM(a.time); if(+a.dur) t.dur=+a.dur; if(a.prio!=null) t.prio=+a.prio||0;
      st().tasks.push(t); return "Tâche ajoutée : « "+t.title+" »"+(t.due?" pour le "+fmtDay(t.due):"")+(t.day?" le "+fmtDay(t.day)+(t.time?" à "+hLabel(t.time):""):""); }
    var tk=asTask(a.id);
    if(op==="task_done"){ tk.done=true; tk.doneAt=new Date().toISOString(); return "Cochée : « "+tk.title+" »"; }
    if(op==="task_delete"){ st().tasks=st().tasks.filter(function(x){ return x!==tk; }); return "Tâche supprimée : « "+tk.title+" »"; }
    if(op==="task_edit"){ var ch=[];
      if(a.title){ tk.title=String(a.title); ch.push("intitulé"); } if(a.sub&&AS_SUBS[a.sub]){ tk.sub=a.sub; ch.push("matière"); }
      ["due","day"].forEach(function(k){ if(k in a){ tk[k]=a[k]&&/^\d{4}-\d{2}-\d{2}$/.test(a[k])?a[k]:null; ch.push(k==="due"?"échéance":"jour"); } });
      if("time" in a){ tk.time=asHM(a.time); ch.push("heure"); } if(+a.dur){ tk.dur=+a.dur; ch.push("durée"); } if(a.prio!=null){ tk.prio=+a.prio||0; ch.push("priorité"); }
      return "Tâche « "+tk.title+" » : "+(ch.join(", ")||"rien")+" modifié"; }
    throw new Error("opération inconnue ("+op+")");
  }
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d||"")) throw new Error("date manquante");
  var day=fmtDay(d)+(a.weekly?" (chaque "+WD_NAMES[parseISO(d).getDay()]+")":"");
  if(op==="add"){ var s=asHM(a.s), e=asHM(a.e); if(!s||!e||toMin(e)<=toMin(s)) throw new Error("horaire invalide pour « "+(a.t||"")+" »");
    var sub=AS_SUBS[a.sub]&&a.sub!=="perso"?a.sub:"neutral";
    slotLayer(W,d).add.push({id:uid("slot"),kind:sub==="neutral"?"fixed":"work",s:s,e:e,t:String(a.t||"Créneau").trim(),sub:sub});
    return "Ajouté "+day+" "+hLabel(s)+"–"+hLabel(e)+" : « "+(a.t||"Créneau")+" »"; }
  var ev=asFind(d,a.id); if(!ev) throw new Error("créneau introuvable le "+fmtDay(d));
  if(asLocked(ev)) throw new Error("« "+ev.t+" » est verrouillé (colle ou DST)");
  var base=ev.id.replace(/-[az]$/,""), own=slotOwner(d,base);
  if(ev.taskId){ var T=asTask(ev.taskId);
    if(op==="delete"){ T.time=null; return "Retirée de l'agenda : « "+T.title+" » (la tâche reste dans la to-do)"; }
    if(op==="edit"||op==="move"){ if(a.t) T.title=String(a.t); if(op==="move"&&a.to) T.day=a.to; var s1=asHM(a.s)||T.time, e1=asHM(a.e); if(s1) T.time=s1; if(e1) T.dur=Math.max(5,toMin(e1)-toMin(s1)); if(a.sub&&AS_SUBS[a.sub]) T.sub=a.sub;
      return "« "+T.title+" » → "+fmtDay(T.day||d)+" "+hLabel(T.time); }
  }
  if(op==="delete"){ if(own) st().agendaEdits[own.k].add=st().agendaEdits[own.k].add.filter(function(x){ return x.id!==base; }); else slotLayer(W,d).hide[base]=true;
    return "Supprimé "+day+" : « "+ev.t+" » ("+hLabel(ev.s)+"–"+hLabel(ev.e)+")"; }
  if(op==="edit"){ var v={}; if(a.t) v.t=String(a.t).trim(); var s2=asHM(a.s), e2=asHM(a.e); if(s2) v.s=s2; if(e2) v.e=e2; if(a.sub&&AS_SUBS[a.sub]&&a.sub!=="perso") v.sub=a.sub;
    var ns=v.s||ev.s, ne=v.e||ev.e; if(toMin(ne)<=toMin(ns)) throw new Error("la fin doit être après le début");
    if(own){ for(var k in v) own.x[k]=v[k]; if(v.sub) delete own.x.subs; }
    else { var L=slotLayer(W,d); L.mod[base]=Object.assign({},L.mod[base]||{},v); }
    return day+" : « "+ev.t+" » → « "+(v.t||ev.t)+" » "+hLabel(ns)+"–"+hLabel(ne); }
  if(op==="move"){ var to=a.to||d; if(!/^\d{4}-\d{2}-\d{2}$/.test(to)) throw new Error("jour d'arrivée invalide");
    var s3=asHM(a.s)||ev.s, e3=asHM(a.e)||fromMin(toMin(s3)+toMin(ev.e)-toMin(ev.s));
    if(to===d) return asOne({op:"edit",date:d,id:a.id,s:s3,e:e3});
    var cp={id:uid("slot"),kind:ev.kind==="fixed"?"fixed":"work",s:s3,e:e3,t:ev.t,sub:ev.sub||"neutral"};
    ["subs","crit","soir","light","trad","rac","plan","items","actu","bonus"].forEach(function(k){ if(ev[k]!=null) cp[k]=ev[k]; });
    if(own&&own.k===d) st().agendaEdits[d].add=st().agendaEdits[d].add.filter(function(x){ return x.id!==base; }); else slotLayer("d",d).hide[base]=true;
    slotLayer("d",to).add.push(cp);
    return "Déplacé : « "+ev.t+" » "+fmtDay(d)+" → "+fmtDay(to)+" "+hLabel(s3)+"–"+hLabel(e3); }
  throw new Error("opération inconnue ("+op+")");
}

/* ---------- feuille de conversation ---------- */
function geminiSheet(){
  var u=typeof Sync!=="undefined"&&Sync.user();
  var h='<div class="sheet-h"><div class="ttl"><div class="eyebrow" style="color:var(--blue)">Assistant · '+esc(S.view==="matiere"?subj(S.param).name:({home:"Accueil",agenda:"Agenda",todo:"To-Do",matieres:"Matières",echeances:"Échéances",notes:"Notes",methodo:"Méthodo",plus:"Plus"})[S.view]||"")+'</div><h2>Demander à Gemini</h2></div>'+(chat.length?'<button class="icon-btn" data-gclear aria-label="Nouvelle conversation" title="Nouvelle conversation">'+I.plus+'</button>':'')+'<button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><div class="sheet-b" id="chat-log">';
  if(!u) h+='<div class="gem-msg">Connecte-toi (bouton en haut à droite) pour utiliser l\'assistant.</div>';
  else if(!chat.length) h+='<div class="gem-msg small muted">Pose une question, ou demande-lui de modifier ton agenda ou tes tâches : « remplace l\'HGG de jeudi 17h par de l\'allemand », « décale le DM à dimanche 10h », « ajoute running samedi 9h-10h », « supprime l\'Anki de ce soir ». Les changements sont faits tout de suite, avec un bouton Annuler.</div>';
  chat.forEach(function(m,i){
    h+='<div class="msg '+(m.role==="user"?"u":"a")+'">'+fmtMsg(m.text);
    if(m.ap){ h+='<div class="as-ap'+(m.ap.undone?' undone':'')+'">'+m.ap.done.map(function(x){ return '<div class="as-ok">✓ '+esc(x)+'</div>'; }).join("")+m.ap.fail.map(function(x){ return '<div class="as-ko">✗ '+esc(x)+'</div>'; }).join("");
      if(m.ap.done.length) h+=m.ap.undone?'<div class="as-ko">Annulé.</div>':'<button class="btn sm" data-gundo="'+i+'">Annuler</button>';
      h+='</div>'; }
    h+='</div>'; });
  h+='</div><form class="quick" id="chat-form" style="margin:0 18px 18px"><input id="chat-in" autocomplete="off" placeholder="Question ou modification…" aria-label="Message"'+(u?'':' disabled')+'><button class="go" type="submit"'+(u?'':' disabled')+' aria-label="Envoyer">'+I.send+'</button></form>';
  openSheet(h);
  var log=document.getElementById("chat-log"); log.scrollTop=log.scrollHeight;
  var f=document.getElementById("chat-form"), inp=document.getElementById("chat-in");
  if(u && window.innerWidth>=600) inp.focus();
  var sheet=log.parentNode;
  sheet.addEventListener("click",function(ev){
    var b=ev.target.closest("[data-gundo],[data-gclear]"); if(!b) return;
    if(b.hasAttribute("data-gclear")){ chat=[]; geminiSheet(); return; }
    var m=chat[+b.getAttribute("data-gundo")]; if(!m||!m.ap||m.ap.undone) return;
    var o=JSON.parse(m.ap.before); st().agendaEdits=o.a; st().tasks=o.t; save(); if(typeof Plan!=="undefined") Plan.invalidate(); m.ap.undone=true; render(); geminiSheet(); toast("Modifications annulées.");
  });
  f.addEventListener("submit",function(ev){
    ev.preventDefault(); var q=inp.value.trim(); if(!q||!u) return;
    chat.push({role:"user",text:q}); chat.push({role:"assistant",text:"…",pending:true}); geminiSheet();
    var hist=chat.filter(function(m){ return !m.pending; }).map(function(m){ return {role:m.role,text:m.text+(m.ap&&m.ap.done.length?"\n[Fait"+(m.ap.undone?" puis annulé":"")+" : "+m.ap.done.join(" ; ")+"]":"")}; });
    Sync.invoke({mode:"chat",context:pageContext(),messages:hist}).then(function(r){
      chat.pop(); var P=asParse(r.text), msg={role:"assistant",text:P.text||(P.acts?"C'est fait.":"(pas de réponse)")};
      if(P.acts==="bad") msg.ap={done:[],fail:["Gemini a renvoyé des modifications illisibles : rien n'a été changé, reformule ta demande."]};
      else if(P.acts&&P.acts.length){ msg.ap=asApply(P.acts); if(msg.ap.done.length) render(); }
      chat.push(msg); if(document.getElementById("chat-log")) geminiSheet();
    },function(e){ chat.pop(); chat.push({role:"assistant",text:"Gemini n'a pas répondu ("+e.message+")."}); if(document.getElementById("chat-log")) geminiSheet(); });
  });
}
