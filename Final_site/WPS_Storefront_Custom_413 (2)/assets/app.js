async function loadJSON(p){ const r=await fetch(p); return r.json(); }
function list(d){ return Array.isArray(d)?d:(d&&Array.isArray(d.items)?d.items:[]); }
function ownerLinks(cfg, who){
  const p=cfg.payments||{};
  if(who==='dewayne') return { paypal: p.dewayne?.tip_paypal||'', cashapp:p.dewayne?.tip_cashapp||'' };
  if(who==='sean')    return { paypal: p.sean?.paypal_default||'', cashapp:p.sean?.cashapp_default||'' };
  return { paypal:'', cashapp:'' };
}
function card(item, links){
  const el=document.createElement('article'); el.className='card';
  const t=document.createElement('div'); t.className='thumb'; const im=document.createElement('img');
  im.src=item.image||'assets/img/products/placeholder.svg'; im.alt=item.title||''; t.appendChild(im);
  const b=document.createElement('div'); b.className='body';
  b.innerHTML=`<div class="title">${item.title||''}</div>${item.dimensions?`<div class=meta>${item.dimensions}</div>`:''}${item.price!=null?`<div class=price>$${Number(item.price).toFixed(2)}</div>`:''}`;
  const btns=document.createElement('div'); btns.className='btns';
  if(item.paypal||links.paypal){ const a=document.createElement('a'); a.href=item.paypal||links.paypal; a.target='_blank'; a.rel='noopener'; a.className='pay pay paypal'; a.textContent='Pay with PayPal'; btns.appendChild(a); }
  if(item.cashapp||links.cashapp){ const a2=document.createElement('a'); a2.href=item.cashapp||links.cashapp; a2.target='_blank'; a2.rel='noopener'; a2.className='pay cashapp'; a2.textContent='Pay with Cash App'; btns.appendChild(a2); }
  el.append(t,b); if(btns.children.length) el.append(btns); return el;
}
(async()=>{
  const cfg = await loadJSON('assets/config.json');
  const pz=document.getElementById('puzzle-grid');   if(pz){ const data=await loadJSON('assets/products.json'); const links=ownerLinks(cfg,'sean');    list(data).forEach(i=>pz.appendChild(card(i,links))); }
  const ag=document.getElementById('art-grid');      if(ag){ const data=await loadJSON('assets/art.json');       const links=ownerLinks(cfg,'dewayne'); list(data).forEach(i=>ag.appendChild(card(i,links))); }
  const cg=document.getElementById('crochet-grid');  if(cg){ const data=await loadJSON('assets/crochet.json');   const links=ownerLinks(cfg,'sean');    list(data).forEach(i=>cg.appendChild(card(i,links))); }
  const grid=document.getElementById('cert-grid');   if(grid){ const data=await loadJSON('assets/certs.json'); list(data).forEach(c=>{ const w=document.createElement('div'); w.className='cert'; const im=new Image(); im.src=c.image; im.alt=c.title||'cert'; if(c.link){ const a=document.createElement('a'); a.href=c.link; a.target='_blank'; a.rel='noopener'; a.appendChild(im); w.appendChild(a);} else { w.appendChild(im); } grid.appendChild(w); }); }
  (function(){ const btn=document.querySelector('.tip-fab'); if(!btn) return; const max=5; function spawn(){ if(btn.querySelectorAll('.firefly').length>=max) return; const f=document.createElement('span'); f.className='firefly'; const x=(Math.random()*80-40), y=-(20+Math.random()*80); f.style.setProperty('--x',x+'px'); f.style.setProperty('--y',y+'px'); f.style.animationDelay=(Math.random()*0.8)+'s'; btn.appendChild(f); setTimeout(()=>f.remove(),5200);} setInterval(spawn,900); for(let i=0;i<3;i++) setTimeout(spawn,i*250);})();
  const y=document.getElementById('cpyYear'); if(y) y.textContent=(new Date()).getFullYear();
})();