#!/usr/bin/env bash
set -euo pipefail

echo "→ ensuring folders…"
mkdir -p assets assets/img assets/img/{products,art,crochet,certs} admin

write_if_missing () {
  local path="$1"; shift
  if [[ ! -f "$path" ]]; then
    mkdir -p "$(dirname "$path")"
    cat > "$path" <<'EOF'
'"$@"'
EOF
    echo "  + created $path"
  else
    echo "  = exists  $path (kept)"
  fi
}

# --- style.css
write_if_missing assets/style.css \
':root{--bg:#0e0f12;--panel:#1a1c22;--text:#e7e7ea;--muted:#a5a7ad;--green:#1e4d2b;--green-soft:#2a6a3b;--pill:9999px}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:system-ui,Inter,Segoe UI,Roboto,Ubuntu,sans-serif}
.nav{max-width:1200px;margin:0 auto;padding:12px 16px;display:flex;gap:16px;align-items:center;background:linear-gradient(180deg,var(--green),var(--green-soft))}
.nav .brand{font-weight:800;color:#fff}.nav a{color:#eef6ee}.nav .nav-links{margin-left:auto;display:flex;gap:12px}
.container{max-width:1200px;margin:24px auto;padding:0 16px}
.card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
.card{background:#15171d;border-radius:12px;overflow:hidden}
.thumb{height:220px;display:flex;align-items:center;justify-content:center;background:#0b0c10}
.thumb img{width:100%;height:100%;object-fit:cover}
.body{padding:12px}.title{font-weight:800}.meta{font-size:12px;color:#a5a7ad}.price{color:#9ff59f;font-weight:800;margin:8px 0}
.btns{display:flex;flex-direction:column;gap:8px;padding:12px}
.pay{display:block;text-align:center;border:none;border-radius:10px;padding:10px 12px;font-weight:800;cursor:pointer}
.pay.paypal{background:#0070e0;color:#fff}.pay.cashapp{background:#00c244;color:#001b05}
.site-footer{max-width:1200px;margin:32px auto 40px;padding:0 16px;color:#a5a7ad}
.badges{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.badge{background:#182018;border:1px solid:#294029;color:#cfe7cf;padding:6px 10px;border-radius:10px;font-size:12px}
.cert-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.cert{background:#15171d;border:1px solid #2b2d33;border-radius:12px;padding:10px;display:flex;justify-content:center}
.cert img{max-width:100%;height:90px;object-fit:contain}
.tip-fab{position:fixed;right:18px;bottom:18px;background:linear-gradient(90deg,#ff4d4d,#ff1a1a);color:#fff;border:none;border-radius:9999px;padding:12px 18px;font-weight:900;box-shadow:0 8px 26px rgba(255,50,50,.35);z-index:60;overflow:visible}
.tip-fab .firefly{position:absolute;width:8px;height:8px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,#fffba0 40%,rgba(255,255,255,0) 70%);filter:drop-shadow(0 0 6px #fff39a);animation:fly 5s linear forwards}
@keyframes fly{0%{transform:translate(0,0) scale(.5);opacity:0}20%{opacity:1}50%{transform:translate(var(--x),var(--y)) scale(1)}80%{opacity:1}100%{transform:translate(calc(var(--x)*1.5),calc(var(--y)*1.5)) scale(.5);opacity:0}}'

# --- app.js
write_if_missing assets/app.js \
'async function loadJSON(p){ const r=await fetch(p); return r.json(); }
function list(d){ return Array.isArray(d)?d:(d&&Array.isArray(d.items)?d.items:[]); }
function ownerLinks(cfg, who){
  const p=cfg.payments||{};
  if(who==="dewayne") return { paypal:p.dewayne?.tip_paypal||"", cashapp:p.dewayne?.tip_cashapp||"" };
  if(who==="sean")    return { paypal:p.sean?.paypal_default||"", cashapp:p.sean?.cashapp_default||"" };
  return { paypal:"", cashapp:"" };
}
function card(item, links){
  const el=document.createElement("article"); el.className="card";
  const t=document.createElement("div"); t.className="thumb"; const im=document.createElement("img");
  im.src=item.image||"assets/img/products/placeholder.svg"; im.alt=item.title||""; t.appendChild(im);
  const b=document.createElement("div"); b.className="body";
  b.innerHTML=`<div class="title">${item.title||""}</div>${item.dimensions?`<div class=meta>${item.dimensions}</div>`:""}${item.price!=null?`<div class=price>$${Number(item.price).toFixed(2)}</div>`:""}`;
  const btns=document.createElement("div"); btns.className="btns";
  if(item.paypal||links.paypal){ const a=document.createElement("a"); a.href=item.paypal||links.paypal; a.target="_blank"; a.rel="noopener"; a.className="pay pay paypal"; a.textContent="Pay with PayPal"; btns.appendChild(a); }
  if(item.cashapp||links.cashapp){ const a2=document.createElement("a"); a2.href=item.cashapp||links.cashapp; a2.target="_blank"; a2.rel="noopener"; a2.className="pay cashapp"; a2.textContent="Pay with Cash App"; btns.appendChild(a2); }
  el.append(t,b); if(btns.children.length) el.append(btns); return el;
}
(async()=>{
  const cfg = await loadJSON("assets/config.json");
  const pz=document.getElementById("puzzle-grid");  if(pz){ const data=await loadJSON("assets/products.json"); const l=ownerLinks(cfg,"sean");    list(data).forEach(i=>pz.appendChild(card(i,l))); }
  const ag=document.getElementById("art-grid");     if(ag){ const data=await loadJSON("assets/art.json");       const l=ownerLinks(cfg,"dewayne"); list(data).forEach(i=>ag.appendChild(card(i,l))); }
  const cg=document.getElementById("crochet-grid"); if(cg){ const data=await loadJSON("assets/crochet.json");   const l=ownerLinks(cfg,"sean");    list(data).forEach(i=>cg.appendChild(card(i,l))); }
  const grid=document.getElementById("cert-grid");
  if(grid){ const data=await loadJSON("assets/certs.json"); list(data).forEach(c=>{ const w=document.createElement("div"); w.className="cert"; const im=new Image(); im.src=c.image; im.alt=c.title||"cert"; if(c.link){ const a=document.createElement("a"); a.href=c.link; a.target="_blank"; a.rel="noopener"; a.appendChild(im); w.appendChild(a);} else { w.appendChild(im); } grid.appendChild(w); }); }
  (function(){ const btn=document.querySelector(".tip-fab"); if(!btn) return; const max=5; function spawn(){ if(btn.querySelectorAll(".firefly").length>=max) return; const f=document.createElement("span"); f.className="firefly"; const x=(Math.random()*80-40), y=-(20+Math.random()*80); f.style.setProperty("--x",x+"px"); f.style.setProperty("--y",y+"px"); f.style.animationDelay=(Math.random()*0.8)+"s"; btn.appendChild(f); setTimeout(()=>f.remove(),5200);} setInterval(spawn,900); for(let i=0;i<3;i++) setTimeout(spawn,i*250);})();
  const y=document.getElementById("cpyYear"); if(y) y.textContent=(new Date()).getFullYear();
})();'

# --- JSON data
write_if_missing assets/config.json \
'{
  "site_name":"Wonder Piece Studio",
  "version":"0.4.12",
  "payments":{
    "dewayne":{"tip_cashapp":"https://cash.app/$kittyslayer227","tip_venmo":"https://venmo.com/u/Cheri-Cox-10","tip_paypal":"https://www.paypal.com/paypalme/FewayneCox"},
    "sean":{"paypal_default":"https://www.paypal.com/ncp/payment/4KCEYV3VHLVLG","cashapp_default":"https://cash.app/$seanpwatkins"}
  },
  "tips":{"amounts":[1,3,5,10],"cash_tag":"kittyslayer227","paypal_me":"FewayneCox","venmo_user":"Cheri-Cox-10","note":"Wonder Piece Studio tip — thank you!"}
}'
write_if_missing assets/products.json \
'{"items":[{"title":"Blue Crab Puzzle","price":12.00,"dimensions":"8x10 print • 300 dpi","image":"assets/img/products/placeholder.svg"}]}'
write_if_missing assets/art.json \
'{"items":[{"title":"Bayou Sacunse","price":899.00,"dimensions":"16x20 • Acrylic on canvas","image":"assets/img/art/Bayou_sacunse.jpg"}]}'
write_if_missing assets/crochet.json \
'{"items":[{"title":"Ghost Plushie","price":18.00,"dimensions":"Handmade crochet • cotton yarn","image":"assets/img/crochet/ghost_plushie.jpg"}]}'
write_if_missing assets/certs.json \
'{"items":[
  {"title":"Microsoft Certified Professional (MCP)","image":"assets/img/certs/mcp-shield.png","link":""},
  {"title":"CompTIA A+ Certified","image":"assets/img/certs/aplus-shield.png","link":""},
  {"title":"Linux Certified","image":"assets/img/certs/linux-shield.png","link":""},
  {"title":"IBM BigFix Certified","image":"assets/img/certs/bigfix-shield.png","link":""}
]}'

# --- image placeholders (SVG + tiny PNGs)
if [[ ! -f assets/img/products/placeholder.svg ]]; then
  cat > assets/img/products/placeholder.svg <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="100%" height="100%" fill="#111"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="28">Puzzle image</text></svg>
SVG
  echo "  + created assets/img/products/placeholder.svg"
fi

# valid-but-minimal PNG files
tiny_png_hex="89504e470d0a1a0a"
make_png(){ printf "$tiny_png_hex" | xxd -r -p > "$1"; echo "  + created $1"; }
[[ ! -f assets/img/art/Bayou_sacunse.jpg ]]   && make_png assets/img/art/Bayou_sacunse.jpg
[[ ! -f assets/img/crochet/ghost_plushie.jpg ]] && make_png assets/img/crochet/ghost_plushie.jpg
for f in mcp-shield.png aplus-shield.png linux-shield.png bigfix-shield.png; do
  [[ ! -f "assets/img/certs/$f" ]] && make_png "assets/img/certs/$f"
done

echo "✅ Done. Tree:"
command -v tree >/dev/null && tree -L 3 assets || find assets -maxdepth 3 -type f | sort
