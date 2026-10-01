(function(){
'use strict';
var WEEKS=(window.PC_WEEKS||[]).slice().sort(function(a,b){return a.week-b.week});
var LESSONS=[];WEEKS.forEach(function(w){w.lessons.forEach(function(l){l._week=w;LESSONS.push(l)})});
LESSONS.sort(function(a,b){return a.day-b.day});
var N=LESSONS.length;
var KEY='plain-charisma:v1';
var LEVEL={strong:'Evidence: strong',moderate:'Evidence: moderate',mixed:'Evidence: mixed',weak:'Evidence: weak',practitioner:'Practitioner craft, untested',debunked:'Debunked'};

var $=function(id){return document.getElementById(id)};
var stage=$('stage'),counter=$('counter'),ticks=$('ticks'),contents=$('contents'),contentsBtn=$('contentsBtn'),prevBtn=$('prevBtn'),nextBtn=$('nextBtn'),hint=$('hint');

/* state */
var mem=null;
function load(){
  try{var s=localStorage.getItem(KEY);if(s)return JSON.parse(s)}catch(e){}
  return mem||{current:1,done:{},scroll:{},hintSeen:false};
}
var state=load();
if(!state.done)state.done={};if(!state.scroll)state.scroll={};
function save(){
  mem=state;
  try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
}
function clamp(n){n=parseInt(n,10);if(isNaN(n))return 1;return Math.max(1,Math.min(N,n))}

var cur=clamp(state.current);
var m=/^#day-(\d+)$/.exec(location.hash||'');
var fromHash=false;
if(m){cur=clamp(m[1]);fromHash=true}

/* helpers */
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function md(s){return esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>')}
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}

function buildPage(day){
  var L=LESSONS[day-1];
  var p=el('article','page');p.dataset.day=day;
  p.appendChild(el('div','daylabel','Week '+L._week.week+': '+esc(L._week.title)+'. Day '+day));
  var h=el('h1',null,md(L.title));h.tabIndex=-1;p.appendChild(h);
  var lv=L.evidence.level;
  p.appendChild(el('div','tag '+lv,esc(LEVEL[lv]||lv)));
  p.appendChild(el('p','evnote',md(L.evidence.note)));
  if(L.myth){
    var mb=el('div','myth');
    mb.appendChild(el('p',null,'<span class="k">The myth.</span> '+md(L.myth.claim)));
    mb.appendChild(el('p',null,'<span class="k">The verdict.</span> '+md(L.myth.verdict)));
    p.appendChild(mb);
  }
  L.body.forEach(function(t){p.appendChild(el('p','b',md(t)))});
  p.appendChild(el('h2',null,'Tactical application'));
  var ul=el('ul','tactics');L.tactics.forEach(function(t){ul.appendChild(el('li',null,md(t)))});p.appendChild(ul);
  var ch=el('section','challenge');
  ch.innerHTML='<div><h2>Today’s challenge</h2><p>'+md(L.challenge)+'</p></div>';
  p.appendChild(ch);
  var mk=el('button',null,'');mk.id='markBtn';mk.type='button';p.appendChild(mk);
  paintMark(mk,day);
  mk.addEventListener('click',function(){toggleDone(day)});
  var d=el('details');d.appendChild(el('summary',null,'Sources'));
  var ol=el('ol');L.sources.forEach(function(s){ol.appendChild(el('li',null,esc(s)))});d.appendChild(ol);p.appendChild(d);
  p.addEventListener('scroll',function(){state.scroll[day]=p.scrollTop;saveSoon()},{passive:true});
  return p;
}
var st=null;function saveSoon(){clearTimeout(st);st=setTimeout(save,300)}
function paintMark(btn,day){
  var done=!!state.done[day];
  btn.className=done?'done':'';
  btn.textContent=done?'✓ Day '+day+' complete':'Mark day '+day+' complete';
  btn.setAttribute('aria-pressed',done?'true':'false');
}
function toggleDone(day){
  if(state.done[day])delete state.done[day];else state.done[day]=true;
  save();
  var mk=stage.querySelector('.page[data-day="'+day+'"] #markBtn');if(mk)paintMark(mk,day);
  paintTicks();paintContents();
}

/* header */
function paintTicks(){
  ticks.innerHTML='';
  LESSONS.forEach(function(L,i){
    var d=i+1,t=document.createElement('i');
    if(state.done[d])t.className+=' done';
    if(d===cur)t.className+=' cur';
    if(i>0&&L._week!==LESSONS[i-1]._week)t.className+=' wk';
    ticks.appendChild(t);
  });
  var c=Object.keys(state.done).length;
  counter.textContent='Day '+cur+' of '+N;
  counter.setAttribute('aria-label','Day '+cur+' of '+N+', '+c+' complete');
}

/* contents */
function buildContents(){
  contents.innerHTML='';
  WEEKS.forEach(function(w){
    contents.appendChild(el('h3',null,'Week '+w.week+': '+esc(w.title)));
    var ul=el('ul');
    w.lessons.slice().sort(function(a,b){return a.day-b.day}).forEach(function(L){
      var li=el('li'),b=el('button');b.type='button';b.dataset.day=L.day;
      b.innerHTML='<span class="n">'+L.day+'</span><span class="t">'+md(L.title)+'</span><span class="c"></span>';
      b.addEventListener('click',function(){closeContents();goTo(L.day,L.day>cur?1:-1)});
      li.appendChild(b);ul.appendChild(li);
    });
    contents.appendChild(ul);
  });
  var lg=el('div','legend');
  lg.innerHTML='<p><strong>How to read the evidence tags</strong></p>'+
   '<p>Solid border: moderate or strong. Dashed: mixed. Dotted: weak, or practitioner craft that hasn’t been trial-tested. Double border: debunked. The label always says it in words.</p>'+
   '<p>✓ marks a completed day.</p>';
  contents.appendChild(lg);
  paintContents();
}
function paintContents(){
  contents.querySelectorAll('button[data-day]').forEach(function(b){
    var d=+b.dataset.day;
    b.className=d===cur?'cur':'';
    b.querySelector('.c').textContent=state.done[d]?'✓':'';
    if(d===cur)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');
  });
}
function openContents(){
  contents.hidden=false;contentsBtn.setAttribute('aria-expanded','true');contentsBtn.textContent='Close';
  var c=contents.querySelector('button.cur');if(c)c.scrollIntoView({block:'center'});
}
function closeContents(){
  contents.hidden=true;contentsBtn.setAttribute('aria-expanded','false');contentsBtn.textContent='Contents';
}
contentsBtn.addEventListener('click',function(){contents.hidden?openContents():closeContents()});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&!contents.hidden){closeContents();contentsBtn.focus();return}
  if(!contents.hidden)return;
  if(e.key==='ArrowRight')step(1);else if(e.key==='ArrowLeft')step(-1);
});

/* navigation + transition */
var page=null,busy=false,queued=null;
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function step(dir){goTo((queued?queued.n:cur)+dir,dir)}
function goTo(n,dir){
  n=clamp(n);
  if(busy){queued={n:n,dir:dir};return}
  if(n===cur)return;
  busy=true;
  var old=page;cur=n;state.current=n;save();
  try{history.replaceState(null,'','#day-'+n)}catch(e){}
  var np=buildPage(n);
  paintTicks();paintContents();updateButtons();
  np.scrollTop=0;
  var done=function(){
    if(old&&old.parentNode)old.parentNode.removeChild(old);
    np.style.zIndex='';np.style.transform='';np.style.opacity='';
    page=np;busy=false;
    var h=np.querySelector('h1');if(h)h.focus({preventScroll:true});
    if(queued){var q=queued;queued=null;goTo(q.n,q.dir)}
  };
  if(!old||reduce||!np.animate){stage.appendChild(np);if(old)old.remove();page=np;busy=false;var h2=np.querySelector('h1');if(h2)h2.focus({preventScroll:true});return}
  var dur=520,opt={duration:dur,easing:'cubic-bezier(.4,.1,.2,1)',fill:'forwards'};
  if(dir>0){
    stage.appendChild(np);old.style.zIndex=2;np.style.zIndex=1;
    old.animate([{transform:'rotateY(0deg)',opacity:1},{transform:'rotateY(-90deg)',opacity:.2}],opt).onfinish=done;
  }else{
    stage.appendChild(np);np.style.zIndex=2;old.style.zIndex=1;
    np.animate([{transform:'rotateY(-90deg)',opacity:.2},{transform:'rotateY(0deg)',opacity:1}],opt).onfinish=done;
  }
}
function updateButtons(){prevBtn.disabled=cur<=1;nextBtn.disabled=cur>=N}
prevBtn.addEventListener('click',function(){step(-1)});
nextBtn.addEventListener('click',function(){step(1)});

/* tap zones + swipe on the stage */
var sx=0,sy=0,st0=0,tracking=false;
function ignoreTarget(t){return t.closest&&t.closest('button,summary,a,details[open] ol')}
stage.addEventListener('pointerdown',function(e){
  if(e.pointerType==='mouse'&&e.button!==0)return;
  tracking=true;sx=e.clientX;sy=e.clientY;st0=Date.now();
});
stage.addEventListener('pointercancel',function(){tracking=false});
stage.addEventListener('pointerup',function(e){
  if(!tracking)return;tracking=false;
  var dx=e.clientX-sx,dy=e.clientY-sy;
  if(Math.abs(dx)>56&&Math.abs(dx)>1.6*Math.abs(dy)){step(dx<0?1:-1);return}
  if(Math.abs(dx)<10&&Math.abs(dy)<10&&Date.now()-st0<500){
    if(ignoreTarget(e.target))return;
    var sel=window.getSelection&&String(window.getSelection());if(sel)return;
    var r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width;
    if(x<.35)step(-1);else if(x>.65)step(1);
  }
});

/* hint */
function showHint(){if(!state.hintSeen){hint.hidden=false}}
$('hintClose').addEventListener('click',function(){hint.hidden=true;state.hintSeen=true;save()});

/* init */
buildContents();
page=buildPage(cur);stage.appendChild(page);
paintTicks();updateButtons();
try{history.replaceState(null,'','#day-'+cur)}catch(e){}
if(!fromHash&&state.scroll[cur]){requestAnimationFrame(function(){page.scrollTop=state.scroll[cur]})}
showHint();
window.addEventListener('pagehide',save);
document.addEventListener('visibilitychange',function(){if(document.hidden)save()});

/* service worker */
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
  window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})});
}
})();
