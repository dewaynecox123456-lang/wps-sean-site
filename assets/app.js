async function loadJSON(p){const r=await fetch(p);if(!r.ok)throw new Error(p+" "+r.status);return r.json()}
function payLinksFor(owner, cfg){const a=cfg.artists[owner]||{};const p=a.payouts||{};return{paypal:p.paypal||"#",cashapp:p.cashapp||"#",venmo:p.venmo||"#"}}
function renderCards(grid, items, cfg){
  for(const it of items){
    const links=payLinksFor(it.owner||'sean',cfg);
    const ship=(it.type==='art')?'<span class="ship-note">Buyer pays shipping (art only)</span>':'';
    grid.insertAdjacentHTML('beforeend', `
    <article class="card">
      <img src="${it.image}" alt="${it.title}">
      <div class="card-body">
        <h3>${it.title}</h3>
        <div class="meta">${it.dimensions||''}</div>
        ${it.price!=null?`<div class="price">$${Number(it.price).toFixed(2)}</div>`:''}
        ${ship}
        <a class="pay-btn paypal" href="${links.paypal}" target="_blank" rel="noopener">Pay with PayPal</a>
        <a class="pay-btn cash" href="${links.cashapp}" target="_blank" rel="noopener">Pay with Cash App</a>
        <a class="pay-btn venmo" href="${links.venmo}" target="_blank" rel="noopener">Pay with Venmo</a>
      </div>
    </article>`);
  }
}
async function boot(){
  const cfg=await loadJSON('assets/config.json');
  const pg=document.querySelector('#puzzle-grid'); if(pg){const d=await loadJSON('assets/products.json'); renderCards(pg,d.items||[],cfg);}
  const ag=document.querySelector('#art-grid'); if(ag){const d=await loadJSON('assets/art.json'); renderCards(ag,d.items||[],cfg);}
  const tipRow=document.querySelector('#tip-buttons');
  if(tipRow){document.querySelector('#tip-note').textContent=(cfg.tips&&cfg.tips.note)||'Thank you!';
    const amounts=(cfg.tips&&cfg.tips.amounts)||[1,3,5,10]; const links=(cfg.artists&&cfg.artists.dewayne&&cfg.artists.dewayne.payouts)||{};
    for(const a of amounts){tipRow.insertAdjacentHTML('beforeend', `<a class="pay-btn cash" href="${links.cashapp||'#'}" target="_blank" rel="noopener">$${a} via Cash App</a>`);}
  }
  const contacts=document.querySelector('#contacts');
  if(contacts){const c=cfg.contacts||{};
    const mk=k=>c[k]?`<article class="card"><div class="card-body"><h3>${c[k].name}</h3><div class="meta">${c[k].role||''}</div><a class="pay-btn venmo" href="mailto:${c[k].email}">Email</a></div></article>`:'';
    contacts.innerHTML=`<div class="card-grid">${mk('founder')}${mk('it')}</div>`;
  }
  window.openTip=()=>location.href='tip.html';
}
boot().catch(e=>console.error(e));
