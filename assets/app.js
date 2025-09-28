
/* Payment routing (edit here if links change) */
const PAYMENT = {
  puzzles: {
    paypal: "https://www.paypal.com/ncp/payment/4KCEYV3VHLVLG",
    cash: "",
    venmo: ""
  },
  art: {
    cash: "https://cash.app/$kittyslayer227",
    venmo: "https://venmo.com/u/Cheri"
  },
  crochet: {
    cash: "https://cash.app/$kittyslayer227",
    venmo: "https://venmo.com/u/Cheri"
  }
};

/* Galleries */
const GALLERIES = {
  products: [
    "blue_crab_puzzle.jpg",
    "fireflies_sweet_tea.jpg",
    "heron_red_bridge.jpg",
    "porch_egret_night.jpg",
    "roddy_raccoon_puzzle.jpg",
    "Sweet_tea_fair_city.jpg",
    "sweet_tea_laundry.jpg",
    "swing_scene.jpg",
  ],
  art: [
    "Bayou_sacunce.jpg",
    "Bayou_sacunce2.jpg",
    "egret_painting.jpg",
    "st_charles_jazz.jpg",
    "bayou_moon_ritual.jpg"
  ],
  crochet: [
    "ghost_plushie.jpg"
  ]
};

/* Individual appraised prices for originals */
const PRICE_MAP = {
  art: {
    "Bayou_sacunce.jpg": "$150",
    "Bayou_sacunce2.jpg": "$150",
    "egret_painting.jpg": "$160",
    "st_charles_jazz.jpg": "$190",
    "bayou_moon_ritual.jpg": "$150"
  },
  products: {},
  crochet: {}
};

function prettyTitle(filename){
  const base = filename.replace(/\.[^.]+$/,''); 
  return base.replace(/[_-]+/g,' ').replace(/\b\w/g, c => c.toUpperCase());
}

function resolvePrice(folder, file, defaultPrice){
  const map = PRICE_MAP[folder] || {};
  return map[file] || defaultPrice || "";
}

function renderButtons(section){
  const p = PAYMENT[section] || {};
  const btns = [];
  if (p.cash)  btns.push(`<button class="btn btn-cash" onclick="location.href='${p.cash}'">Cash App</button>`);
  if (p.venmo) btns.push(`<button class="btn btn-venmo" onclick="location.href='${p.venmo}'">Venmo</button>`);
  if (p.paypal) btns.push(`<button class="btn btn-paypal" onclick="location.href='${p.paypal}'">PayPal</button>`);
  return btns.join("\n");
}

function renderGallery({folder, mountId, section, defaultPrice}) {
  const list = GALLERIES[folder] || [];
  const mount = document.getElementById(mountId);
  if (!mount) return;
  const payBtns = renderButtons(section);
  mount.innerHTML = list.map(file => {
    const price = resolvePrice(folder, file, defaultPrice);
    return `
    <div class="product">
      <img src="assets/img/${folder}/${file}" alt="${prettyTitle(file)}" loading="lazy">
      <h3>${prettyTitle(file)}</h3>
      ${price ? `<p class="price">${price}</p>` : ``}
      <div class="btn-row">
        ${payBtns}
      </div>
    </div>`;
  }).join('');
}

// expose
window.WPS = { PAYMENT, GALLERIES, PRICE_MAP, renderGallery };
