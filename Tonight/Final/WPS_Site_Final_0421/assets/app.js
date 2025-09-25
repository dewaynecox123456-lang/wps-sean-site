
async function getJSON(p){const r=await fetch(p);if(!r.ok)throw new Error('fetch '+p);return r.json()}
function asList(d){return Array.isArray(d)?d:(d&&Array.isArray(d.items)?d.items:[])}
function money(n){return '$'+Number(n).toFixed(2)}
function ownerLinks(cfg,who){
  const p=cfg.payments||{};
  if(who==='dewayne') return {paypal:p.dewayne?.tip_paypal||'',cashapp:p.dewayne?.tip_cashapp||'',venmo:p.dewayne?.tip_venmo||''};
  if(who==='sean') return {paypal:p.sean?.paypal_default||'',cashapp:p.sean?.cashapp_default||'',venmo:''};
  return {paypal:'',cashapp:'',venmo:''};
}
function card(item,links){
  const el=document.createElement('article');el.className='card';
  const t=document.createElement('div');t.className='thumb';const im=new Image();im.src=item.image||'assets/img/products/placeholder.svg';im.alt=item.title||'';t.appendChild(im);
  const b=document.createElement('div');b.className='body';b.innerHTML=`<div class="title">${item.title||''}</div>${item.dimensions?`<div class=meta>${item.dimensions}</div>`:''}${item.price!=null?`<div class=price>${money(item.price)}</div>`:''}`;
  const btns=document.createElement('div');btns.className='btns';
  if(item.paypal||links.paypal){const a=document.createElement('a');a.href=item.paypal||links.paypal;a.target='_blank';a.rel='noopener';a.className='pay paypal';a.textContent='Pay with PayPal';btns.appendChild(a)}
  if(item.cashapp||links.cashapp){const a2=document.createElement('a');a2.href=item.cashapp||links.cashapp;a2.target='_blank';a2.rel='noopener';a2.className='pay cashapp';a2.textContent='Pay with Cash App';btns.appendChild(a2)}
  el.append(t,b);if(btns.children.length)el.append(btns);return el;
}
function fireflies(){const btn=document.querySelector('.tip-fab');if(!btn)return;const max=5;function spawn(){if(btn.querySelectorAll('.fly').length>=max)return;const f=document.createElement('span');f.className='fly';const x=(Math.random()*80-40),y=-(20+Math.random()*80);f.style.setProperty('--x',x+'px');f.style.setProperty('--y',y+'px');f.style.animationDelay=(Math.random()*0.8)+'s';btn.appendChild(f);setTimeout(()=>f.remove(),5200)}setInterval(spawn,900);for(let i=0;i<3;i++)setTimeout(spawn,i*250)}
(async()=>{
  const cfg = await getJSON('assets/config.json');
  const puzzles=document.getElementById('puzzle-grid'); if(puzzles){ const d=await getJSON('assets/products.json'); const l=ownerLinks(cfg,'sean'); asList(d).forEach(i=>puzzles.appendChild(card(i,l))); }
  const art=document.getElementById('art-grid'); if(art){ const d=await getJSON('assets/art.json'); const l=ownerLinks(cfg,'dewayne'); asList(d).forEach(i=>art.appendChild(card(i,l))); }
  const crochet=document.getElementById('crochet-grid'); if(crochet){ const d=await getJSON('assets/crochet.json'); const l=ownerLinks(cfg,'sean'); asList(d).forEach(i=>crochet.appendChild(card(i,l))); }
  const cert=document.getElementById('cert-grid'); if(cert){ const d=await getJSON('assets/certs.json'); asList(d).forEach(c=>{const w=document.createElement('div');w.className='cert';const im=new Image();im.src=c.image;im.alt=c.title||'cert';if(c.link){const a=document.createElement('a');a.href=c.link;a.target='_blank';a.rel='noopener';a.appendChild(im);w.appendChild(a)}else{w.appendChild(im)};cert.appendChild(w)});}
  const tipGrid=document.getElementById('tip-grid'); if(tipGrid){const a=cfg.tips?.amounts||[1,3,5,10];const tag=cfg.tips?.cash_tag||'';const pm=cfg.tips?.paypal_me||'';const vu=cfg.tips?.venmo_user||'';const note=document.createElement('div');note.className='tip-note';note.innerHTML='Most supporters choose <strong>$1</strong>';tipGrid.parentElement.querySelector('h1').after(note);a.forEach(x=>{const c=document.createElement('div');c.className='tip-card';c.innerHTML=`<h3>$${x}</h3><div class="tip-row"><a class="tip-btn cash" target="_blank" rel="noopener" href="https://cash.app/${tag}/${x}">Cash App ($${x})</a><a class="tip-btn paypal" target="_blank" rel="noopener" href="https://www.paypal.com/paypalme/${pm}/${x}">PayPal ($${x})</a><a class="tip-btn venmo" target="_blank" rel="noopener" href="https://venmo.com/u/${vu}">Venmo (enter $${x})</a></div>`;tipGrid.appendChild(c)})}
  fireflies(); const y=document.getElementById('cpyYear'); if(y) y.textContent=(new Date()).getFullYear();
})();
