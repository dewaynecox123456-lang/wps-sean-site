async function loadJSON(path){ const res = await fetch(path); if(!res.ok) throw new Error('Failed '+path); return res.json(); }
function normalizeList(d){ if(Array.isArray(d)) return d; if(d && Array.isArray(d.items)) return d.items; return []; }
function getSean(config){ return (config && config.payments && config.payments.sean) ? config.payments.sean : {}; }
function makeCard(item, config){
  const el = document.createElement('article'); el.className='card';
  const img = document.createElement('img'); img.alt=item.title||'image'; img.loading='lazy'; img.src=item.image||'assets/img/products/placeholder.svg';
  const thumb = document.createElement('div'); thumb.className='thumb'; thumb.appendChild(img);
  const body = document.createElement('div'); body.className='body';
  const dims = item.dimensions ? `<div class='meta'>${item.dimensions}</div>` : '';
  const price = (item.price!=null) ? `<div class='price'>$${Number(item.price).toFixed(2)}</div>` : '';
  body.innerHTML = `<div class='title'>${item.title||'Untitled'}</div>${dims}${price}`;
  const btns = document.createElement('div'); btns.className='btns';
  const payPalLink = item.paypal || getSean(config).paypal_default;
  const cashLink = item.cashapp || getSean(config).cashapp_default;
  if (payPalLink){ const p1 = document.createElement('a'); p1.href=payPalLink; p1.target='_blank'; p1.rel='noopener'; p1.className='pay pay paypal'; p1.textContent='Pay with PayPal'; btns.append(p1); }
  if (cashLink){ const p2 = document.createElement('a'); p2.href=cashLink; p2.target='_blank'; p2.rel='noopener'; p2.className='pay cashapp'; p2.textContent='Pay with Cash App'; btns.append(p2); }
  el.append(thumb, body); if(btns.children.length) el.append(btns); return el;
}
(async()=>{
  try{
    const config = await loadJSON('assets/config.json');
    const build = document.getElementById('buildVersion'); if(build) build.textContent = 'Build ' + (config.version||'0.0.0');
    // Puzzles
    const pGrid = document.getElementById('puzzle-grid'); if(pGrid){ const products = await loadJSON('assets/products.json'); normalizeList(products).forEach(p=>pGrid.appendChild(makeCard(p, config))); }
    // Art
    const aGrid = document.getElementById('art-grid'); if(aGrid){ const art = await loadJSON('assets/art.json'); normalizeList(art).forEach(p=>aGrid.appendChild(makeCard(p, config))); }
    // Crochet
    const cGrid = document.getElementById('crochet-grid'); if(cGrid){ const crochet = await loadJSON('assets/crochet.json'); normalizeList(crochet).forEach(p=>cGrid.appendChild(makeCard(p, config))); }
    // TikTok
    const ttFeed = document.getElementById('tiktok-feed'); const ttProfile = document.getElementById('ttProfile');
    if(ttFeed){ const tt = await loadJSON('assets/tiktok.json'); if(tt?.profile_url && ttProfile){ ttProfile.href = tt.profile_url; } const urls = normalizeList(tt).map(v=>v.url).filter(Boolean); urls.forEach(u=>{ const q=document.createElement('blockquote'); q.className='tiktok-embed'; q.setAttribute('cite', u); q.style.maxWidth='605px'; q.style.minWidth='325px'; const a=document.createElement('a'); a.href=u; q.appendChild(a); ttFeed.appendChild(q); }); }
    // Certifications
    const grid = document.getElementById('cert-grid'); if(grid){ const data = await loadJSON('assets/certs.json'); const items = normalizeList(data); items.forEach(c => { const wrap = document.createElement('div'); wrap.className='cert'; const im = document.createElement('img'); im.alt = c.title || 'cert'; im.src = c.image; if (c.link && /^https?:/i.test(c.link)){ const a = document.createElement('a'); a.href=c.link; a.target='_blank'; a.rel='noopener'; a.appendChild(im); wrap.appendChild(a);} else { wrap.appendChild(im);} grid.appendChild(wrap); }); }
  }catch(e){ console.error(e); }
})();