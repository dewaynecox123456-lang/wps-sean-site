
async function loadJSON(p){ const r=await fetch(p); return r.json(); }
function list(d){ return Array.isArray(d)?d:(d&&Array.isArray(d.items)?d.items:[]); }
function ownerLinks(cfg, who){
  const p=cfg.payments||{};
  if(who==='dewayne') return { paypal: p.dewayne?.tip_paypal||'', cashapp:p.dewayne?.tip_cashapp||'' };
  if(who==='sean')    return { paypal: p.sean?.paypal_default||'', cashapp:p.sean?.cashapp_default||'' };
  return { paypal:'', cashapp:'' };
}
function bestImagePath(path){
  if(!path) return path;
  const dot = path.lastIndexOf('.');
  if(dot>0){ const t = path.slice(0,dot)+"-thumb"+path.slice(dot); return t; }
  return path;
}
function card(item, links){
  const el=document.createElement('article'); el.className='card';
  const t=document.createElement('div'); t.className='thumb';
  const im=document.createElement('img'); 
  im.src=bestImagePath(item.image)||'assets/img/products/placeholder.svg'; im.alt=item.title||''; 
  im.loading='lazy'; im.decoding='async';
  im.addEventListener('click', ()=> openLightbox(item.image||im.src));
  t.appendChild(im);
  const b=document.createElement('div'); b.className='body';
  b.innerHTML=`<div class="title">${item.title||''}</div>${item.dimensions?`<div class=meta>${item.dimensions}</div>`:''}${item.price!=null?`<div class=price>$${Number(item.price).toFixed(2)}</div>`:''}`;
  const btns=document.createElement('div'); btns.className='btns';
  if(item.paypal||links.paypal){ const a=document.createElement('a'); a.href=item.paypal||links.paypal; a.target='_blank'; a.rel='noopener'; a.className='pay pay paypal'; a.textContent='Pay with PayPal'; btns.appendChild(a); }
  if(item.cashapp||links.cashapp){ const a2=document.createElement('a'); a2.href=item.cashapp||links.cashapp; a2.target='_blank'; a2.rel='noopener'; a2.className='pay cashapp'; a2.textContent='Pay with Cash App'; btns.appendChild(a2); }
  el.append(t,b); if(btns.children.length) el.append(btns); return el;
}
function fireflies(){
  const btn=document.querySelector('.tip-fab'); if(!btn) return; const max=5;
  function spawn(){ if(btn.querySelectorAll('.firefly').length>=max) return; const f=document.createElement('span'); f.className='firefly'; const x=(Math.random()*80-40), y=-(20+Math.random()*80); f.style.setProperty('--x',x+'px'); f.style.setProperty('--y',y+'px'); f.style.animationDelay=(Math.random()*0.8)+'s'; btn.appendChild(f); setTimeout(()=>f.remove(),5200);}
  setInterval(spawn,900); for(let i=0;i<3;i++) setTimeout(spawn, i*250);
}
function scenic(){
  fetch("assets/img/bg/lake-night.jpg", { method: "HEAD" })
    .then(r => { if (r.ok) document.body.classList.add("has-scene"); });
}
function openLightbox(src){
  let lb=document.querySelector('.lb'); if(!lb){ lb=document.createElement('div'); lb.className='lb'; lb.addEventListener('click', ()=>lb.classList.remove('open')); document.body.appendChild(lb); }
  lb.innerHTML = `<img src="${src}" alt="preview">`; lb.classList.add('open');
}

/* ===== Pagination ===== */
function makePager(target, data, pageSize, renderItem){
  let page = 1;
  const total = data.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const grid = document.getElementById(target);
  if(!grid) return;
  const pager = document.createElement('div'); pager.className='pager';
  const prev = document.createElement('button'); prev.textContent='← Prev';
  const info = document.createElement('span'); info.className='page-info';
  const next = document.createElement('button'); next.textContent='Next →';
  pager.append(prev, info, next);
  grid.after(pager);

  function draw(){
    grid.innerHTML='';
    const start = (page-1)*pageSize;
    const slice = data.slice(start, start + pageSize);
    slice.forEach(item => grid.appendChild(renderItem(item)));
    info.textContent = `Page ${page} of ${pages} — ${total} item${total===1?'':'s'}`;
    prev.disabled = page<=1; next.disabled = page>=pages;
  }
  prev.onclick = ()=>{ if(page>1){ page--; draw(); window.scrollTo({top:0, behavior:'smooth'});} };
  next.onclick = ()=>{ if(page<pages){ page++; draw(); window.scrollTo({top:0, behavior:'smooth'});} };
  draw();
}

(async()=>{
  const cfg = await loadJSON('assets/config.json');
  const grids = [
    { id:'puzzle-grid', json:'assets/products.json', who:'sean' },
    { id:'art-grid',    json:'assets/art.json',      who:'dewayne' },
    { id:'crochet-grid',json:'assets/crochet.json',  who:'sean' },
  ];
  for(const g of grids){
    const el = document.getElementById(g.id);
    if(!el) continue;
    const data = list(await loadJSON(g.json));
    const links = ownerLinks(cfg, g.who);
    makePager(g.id, data, 12, (i)=>card(i, links));
  }
  const grid=document.getElementById('cert-grid'); 
  if(grid){ const data= list(await loadJSON('assets/certs.json')); data.forEach(c=>{ const w=document.createElement('div'); w.className='cert'; const im=new Image(); im.src=c.image; im.alt=c.title||'cert'; if(c.link){ const a=document.createElement('a'); a.href=c.link; a.target='_blank'; a.rel='noopener'; a.appendChild(im); w.appendChild(a);} else { w.appendChild(im); } grid.appendChild(w); }); }
  fireflies(); scenic();
  const y=document.getElementById('cpyYear'); if(y) y.textContent=(new Date()).getFullYear();
})();