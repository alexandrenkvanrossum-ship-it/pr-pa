/* ---------- Texte enrichi (ressentis de colle et de DST) : gras, italique, souligné, surligné, listes ----------
   Le HTML saisi est nettoyé : seules les balises de mise en forme sont gardées. r.h = HTML, r.t = texte brut (recherche, aperçus, Gemini). */
var RICH_OK={B:"b",STRONG:"b",I:"i",EM:"i",U:"u",MARK:"mark",BR:"br",DIV:"div",P:"div",UL:"ul",OL:"ol",LI:"li"};
function richClean(html){
  var box=document.createElement("div"); box.innerHTML=html||"";
  (function walk(n){
    Array.prototype.slice.call(n.childNodes).forEach(function(c){
      if(c.nodeType===3) return;
      if(c.nodeType!==1){ c.remove(); return; }
      walk(c);
      var st=(c.getAttribute&&c.getAttribute("style"))||"", tag=RICH_OK[c.tagName], wrap=[];
      if(/font-weight\s*:\s*(bold|[6-9]00)/i.test(st)) wrap.push("b");
      if(/font-style\s*:\s*italic/i.test(st)) wrap.push("i");
      if(/text-decoration[^;]*underline/i.test(st)) wrap.push("u");
      if(/background(-color)?\s*:\s*(?!transparent|rgba\(0, 0, 0, 0\)|initial|inherit)[^;]+/i.test(st) && c.tagName!=="MARK") wrap.push("mark");
      var out;
      if(tag){ out=document.createElement(tag); while(c.firstChild) out.appendChild(c.firstChild); }
      else { out=document.createDocumentFragment(); while(c.firstChild) out.appendChild(c.firstChild); }
      wrap.forEach(function(w){ var e=document.createElement(w); e.appendChild(out); out=e; });
      c.parentNode.replaceChild(out,c);
    });
  })(box);
  return box.innerHTML.replace(/(<br>\s*)+$/,"").replace(/^(\s|&nbsp;|<br>)+|(\s|&nbsp;)+$/g,"");
}
function richText(html){ var d=document.createElement("div"); d.innerHTML=String(html||"").replace(/<br\s*\/?>/gi,"\n").replace(/<\/(div|li|p)>/gi,"\n"); return (d.textContent||"").replace(/\n{3,}/g,"\n\n").trim(); }
/* anciens ressentis en texte brut : **gras**, *_italique_* et retours à la ligne */
function richFromText(t){ return esc(t||"").replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/(^|[\s(])_(.+?)_(?=[\s).,!?:;]|$)/g,"$1<i>$2</i>").replace(/\n/g,"<br>"); }
function richOf(r){ return r? (r.h? richClean(r.h) : richFromText(r.t)) : ""; }
/* dans l'éditeur, le surlignage est un fond coloré (pour que « Effacer la mise en forme » l'enlève) */
function richForEdit(html){ return String(html||"").replace(/<mark>/g,'<span style="background-color: rgb(255, 229, 143);">').replace(/<\/mark>/g,"</span>"); }
var RICH_BTNS=[["bold","<b>G</b>","Gras (Ctrl/Cmd+B)"],["italic","<i>I</i>","Italique (Ctrl/Cmd+I)"],["underline","<u>S</u>","Souligné (Ctrl/Cmd+U)"],["mark",'<span class="rte-hl">Surligner</span>',"Surligner"],["insertUnorderedList","• Liste","Liste à puces"],["removeFormat","Effacer","Effacer la mise en forme"]];
function richEditor(id,html,ph){
  return '<div class="rte-wrap"><div class="rte-bar" role="toolbar" aria-label="Mise en forme">'+RICH_BTNS.map(function(b){ return '<button type="button" class="rte-b" data-rte="'+b[0]+'" data-for="'+id+'" title="'+b[2]+'" aria-label="'+b[2]+'">'+b[1]+'</button>'; }).join("")+
    '</div><div class="field rte" id="'+id+'" contenteditable="true" role="textbox" aria-multiline="true" data-ph="'+esc(ph||"")+'">'+richForEdit(html||"")+'</div></div>';
}
function richVal(id){ var el=document.getElementById(id); if(!el) return {h:"",t:""}; var h=richClean(el.innerHTML); return {h:h, t:richText(h)}; }
(function(){
  function sel(el){ var s=window.getSelection(); return s && s.rangeCount && el.contains(s.getRangeAt(0).commonAncestorContainer); }
  function hiliteOn(){ var s=window.getSelection(); if(!s||!s.rangeCount) return false; var n=s.anchorNode; while(n && n.nodeType===3) n=n.parentNode;
    while(n && !(n.classList&&n.classList.contains("rte"))){ var bg=n.style&&n.style.backgroundColor; if(n.tagName==="MARK"||(bg&&bg!=="transparent")) return true; n=n.parentNode; } return false; }
  document.addEventListener("mousedown",function(e){ if(e.target.closest && e.target.closest(".rte-b")) e.preventDefault(); });
  document.addEventListener("click",function(e){
    var b=e.target.closest && e.target.closest(".rte-b"); if(!b) return; e.preventDefault();
    var ed=document.getElementById(b.getAttribute("data-for")); if(!ed) return; if(!sel(ed)) ed.focus();
    var c=b.getAttribute("data-rte");
    try{
      if(c==="mark"){ document.execCommand("styleWithCSS",false,true); document.execCommand("hiliteColor",false,hiliteOn()?"transparent":"rgb(255, 229, 143)"); document.execCommand("styleWithCSS",false,false); }
      else { document.execCommand("styleWithCSS",false,false); document.execCommand(c,false,null); }
    }catch(x){}
    ed.dispatchEvent(new Event("input",{bubbles:true}));
  });
  /* coller : texte seul, sans la mise en forme de la source */
  document.addEventListener("paste",function(e){ var ed=e.target.closest && e.target.closest(".rte"); if(!ed) return; e.preventDefault(); var t=(e.clipboardData||window.clipboardData).getData("text/plain"); document.execCommand("insertText",false,t); });
  /* état des boutons (gras actif, etc.) */
  document.addEventListener("selectionchange",function(){
    var a=document.activeElement; if(!a||!a.classList||!a.classList.contains("rte")) return;
    var bar=a.parentNode.querySelector(".rte-bar"); if(!bar) return;
    ["bold","italic","underline","insertUnorderedList"].forEach(function(c){ var x=bar.querySelector('[data-rte="'+c+'"]'); if(x) try{ x.classList.toggle("on",document.queryCommandState(c)); }catch(err){} });
    var m=bar.querySelector('[data-rte="mark"]'); if(m) m.classList.toggle("on",hiliteOn());
  });
})();
