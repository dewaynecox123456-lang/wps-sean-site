async function loadJSON(p){const r=await fetch(p,{cache:'no-store'});if(!r.ok)throw new Error('Fail '+p);return r.json();}

(async()=>{
  const [cfg, products, art] = await Promise.all([
    loadJSON('assets/config.json'),
    loadJSON('assets/products.json'),
    loadJSON('assets/art.json')
  ]);

  const payBtns = (ownerId, accepts=[]) => {
    const a = cfg.artists?.[ownerId]?.payouts || {};
    const mk=(label,key)=> accepts.includes(key)&&a[key] ?
      `<a class="tip-btn ${key}" href="${a[key]}" target="_blank" rel="noopener">${label}</a>` : '';
    return mk('Pay with PayPal','paypal') + mk('Pay with Cash App','cashapp') + mk('Pay with Venmo','venmo');
  };

  const card = (it) => `
    <article class="tip-card">
      <div class="img-wrap"><img src="${it.image}" alt="${it.title}"></div>
      <h3>${it.title}</h3>
      <p class="small">${it.dimensions || it.frame || ''}${it.notes ? ' · ' + it.notes : ''}</p>
      ${it.price!=null ? `<p class="price">$${Number(it.price).toFixed(2)}</p>` : ''}
      <div class="tip-row">${payBtns(it.owner, it.accepts || [])}</div>
    </article>`;

  const pGrid=document.getElementById('puzzle-grid');
  if(pGrid && products.items) pGrid.innerHTML = products.items.map(card).join('');

  const aGrid=document.getElementById('art-grid');
  if(aGrid && art.items) aGrid.innerHTML = art.items.map(card).join('');
})();