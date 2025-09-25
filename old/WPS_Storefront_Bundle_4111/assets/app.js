async function loadJSON(path){ const res = await fetch(path); return res.json(); }
function normalizeList(d){ if(Array.isArray(d)) return d; if(d && Array.isArray(d.items)) return d.items; return []; }
function ownerLinks(config, owner){
  const p = (config && config.payments) || {};
  if(owner === 'dewayne') return { paypal_default: p.dewayne?.tip_paypal || '', cashapp_default: p.dewayne?.tip_cashapp || '' };
  if(owner === 'sean')    return { paypal_default: p.sean?.paypal_default || '', cashapp_default: p.sean?.cashapp_default || '' };
  return { paypal_default: '', cashapp_default: '' };
}
function makeCard(item, links){
  const el=document.createElement('article'); el.className='card';
  const thumb=document.createElement('div'); thumb.className='thumb';
  const img=document.createElement('img'); img.alt=item.title||'image'; img.loading='lazy'; img.src=item.image||'assets/img/products/placeholder.svg'; thumb.appendChild(img);
  const body=document.createElement('div'); body.className='body';
  const dims=item.dimensions?`<div class='meta'>${item.dimensions}</div>`:'';
  const price=(item.price!=null)?`<div class='price'>$${Number(item.price).toFixed(2)}</div>`:'';
  body.innerHTML=`<div class='title'>${item.title||'Untitled'}</div>${dims}${price}`;
  const btns=document.createElement('div'); btns.className='btns';
  const payPalLink = item.paypal || links.paypal_default;
  const cashLink   = item.cashapp || links.cashapp_default;
  if(payPalLink){ const a=document.createElement('a'); a.href=payPalLink; a.target='_blank'; a.rel='noopener'; a.className='pay pay paypal'; a.textContent='Pay with PayPal'; btns.appendChild(a); }
  if(cashLink){ const a2=document.createElement('a'); a2.href=cashLink; a2.target='_blank'; a2.rel='noopener'; a2.className='pay cashapp'; a2.textContent='Pay with Cash App'; btns.appendChild(a2); }
  el.append(thumb, body); if(btns.children.length) el.append(btns); return el;
}
(async()=>{
  const cfg = await loadJSON('assets/config.json');
  const build = document.getElementById('buildVersion'); if(build) build.textContent = 'Build ' + (cfg.version||'0.0.0');

  // Puzzles -> Sean
  const pGrid = document.getElementById('puzzle-grid'); 
  if(pGrid){ const products = normalizeList(await loadJSON('assets/products.json')); 
    const links = ownerLinks(cfg,'sean'); products.forEach(p=>pGrid.appendChild(makeCard(p,links))); }

  // Art -> Dewayne
  const aGrid = document.getElementById('art-grid'); 
  if(aGrid){ const art = normalizeList(await loadJSON('assets/art.json')); 
    const links = ownerLinks(cfg,'dewayne'); art.forEach(p=>aGrid.appendChild(makeCard(p,links))); }

  // Crochet -> Sean
  const cGrid = document.getElementById('crochet-grid'); 
  if(cGrid){ const crochet = normalizeList(await loadJSON('assets/crochet.json')); 
    const links = ownerLinks(cfg,'sean'); crochet.forEach(p=>cGrid.appendChild(makeCard(p,links))); }

  // TikTok embeds
  const ttFeed=document.getElementById('tiktok-feed'); const ttProfile=document.getElementById('ttProfile');
  if(ttFeed){ const tt=await loadJSON('assets/tiktok.json'); if(tt?.profile_url&&ttProfile){ ttProfile.href=tt.profile_url; ttProfile.textContent=tt.profile_url; }
    normalizeList(tt).map(v=>v.url).filter(Boolean).forEach(u=>{ const q=document.createElement('blockquote'); q.className='tiktok-embed'; q.setAttribute('cite',u); q.style.maxWidth='605px'; q.style.minWidth='325px'; const a=document.createElement('a'); a.href=u; q.appendChild(a); ttFeed.appendChild(q); }); }

  // Certifications strip
  const grid=document.getElementById('cert-grid'); 
  if(grid){ const data=normalizeList(await loadJSON('assets/certs.json')); data.forEach(c=>{ const wrap=document.createElement('div'); wrap.className='cert'; const im=document.createElement('img'); im.alt=c.title||'cert'; im.src=c.image; if(c.link){ const a=document.createElement('a'); a.href=c.link; a.target='_blank'; a.rel='noopener'; a.appendChild(im); wrap.appendChild(a); } else { wrap.appendChild(im); } grid.appendChild(wrap); }); }

  // --- GLOBAL Fireflies around Tip button ---
  (function(){
    const btn = document.querySelector('.tip-fab');
    if(!btn) return;
    const maxFlies = 5;
    function spawnFly(){
      const live = btn.querySelectorAll('.firefly').length;
      if(live >= maxFlies) return;
      const f = document.createElement('span');
      f.className = 'firefly';
      const x = (Math.random()*80 - 40);
      const y = -(20 + Math.random()*80);
      f.style.setProperty('--x', x.toFixed(1)+'px');
      f.style.setProperty('--y', y.toFixed(1)+'px');
      f.style.animationDelay = (Math.random()*0.8).toFixed(2)+'s';
      btn.appendChild(f);
      setTimeout(()=>{ f.remove(); }, 5200);
    }
    setInterval(spawnFly, 900);
    for(let i=0;i<3;i++) setTimeout(spawnFly, i*250);
  })();
})();