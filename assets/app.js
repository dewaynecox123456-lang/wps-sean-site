/* assets/app.js  — Wonder Piece Studio
   Single-file renderer for products (puzzles), art, tips, and contacts.
   - Reads payout links from config.json per owner (Sean, Dewayne, etc.)
   - Renders PayPal / Cash App / Venmo buttons only if a link exists
   - Shows shipping note on art items (buyer pays shipping)
*/

async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return await res.json();
}

// Get payout link set for the item's owner, falling back safely
function getLinksForOwner(owner, cfg) {
  // normalize owner key (config uses lower-case keys like "sean", "dewayne")
  const key = String(owner || "").trim().toLowerCase();
  const artist = (cfg.artists && cfg.artists[key]) || null;
  const payouts = (artist && artist.payouts) || {};
  return {
    paypal: payouts.paypal || "",
    cashapp: payouts.cashapp || "",
    venmo: payouts.venmo || ""
  };
}

function renderCards(grid, items, cfg, opts = {}) {
  const { type = "puzzle" } = opts;

  for (const it of items) {
    const links = getLinksForOwner(it.owner || "", cfg);
    const shipNote = type === "art"
      ? `<span class="ship-note">Buyer pays shipping (art only)</span>`
      : "";

    // card shell
    const html = `
      <article class="card">
        <img src="${it.image}" alt="${it.title}" loading="lazy" />
        <div class="card-body">
          <h3 class="title">${it.title}</h3>
          <div class="meta">
            <span class="dims">${it.dimensions || ""}</span>
            ${shipNote}
          </div>
          <div class="price">$${Number(it.price).toFixed(2)}</div>
          <div class="btns"></div>
        </div>
      </article>
    `;
    grid.insertAdjacentHTML("beforeend", html);

    // attach buttons only if links exist
    const lastCard = grid.lastElementChild;
    const btnWrap = lastCard.querySelector(".btns");

    if (links.paypal) {
      btnWrap.insertAdjacentHTML(
        "beforeend",
        `<a class="pay-btn paypal" href="${links.paypal}" target="_blank" rel="noopener">Pay with PayPal</a>`
      );
    }
    if (links.cashapp) {
      btnWrap.insertAdjacentHTML(
        "beforeend",
        `<a class="pay-btn cash" href="${links.cashapp}" target="_blank" rel="noopener">Pay with Cash App</a>`
      );
    }
    if (links.venmo) {
      btnWrap.insertAdjacentHTML(
        "beforeend",
        `<a class="pay-btn venmo" href="${links.venmo}" target="_blank" rel="noopener">Pay with Venmo</a>`
      );
    }
  }
}

// Fill the tip panel buttons ($1 / $3 / $5 / $10) from config
function renderTips(tipWrap, cfg) {
  // choose who receives tips (you can change to "sean" or another)
  // if you want tips to go to the studio founder by default, pick that here:
  const tipReceiverKey = "dewayne"; // change to "sean" if desired
  const links = getLinksForOwner(tipReceiverKey, cfg);

  // choose amounts (keep in sync with your tip.html)
  const amounts = [1, 3, 5, 10];

  for (const amt of amounts) {
    const row = document.createElement("div");
    row.className = "tip-row";

    // Cash App quick-link (most supporters choose $1)
    if (links.cashapp) {
      row.insertAdjacentHTML(
        "beforeend",
        `<a class="pay-btn cash" href="${links.cashapp}" target="_blank" rel="noopener">$${amt} via Cash App</a>`
      );
    }
    // Optional: add PayPal / Venmo rows as well (uncomment if you want them visible)
    // if (links.paypal) {
    //   row.insertAdjacentHTML(
    //     "beforeend",
    //     `<a class="pay-btn paypal" href="${links.paypal}" target="_blank" rel="noopener">$${amt} via PayPal</a>`
    //   );
    // }
    // if (links.venmo) {
    //   row.insertAdjacentHTML(
    //     "beforeend",
    //     `<a class="pay-btn venmo" href="${links.venmo}" target="_blank" rel="noopener">$${amt} via Venmo</a>`
    //   );
    // }

    tipWrap.appendChild(row);
  }
}

// Fill contact cards from config.contacts
function renderContacts(container, cfg) {
  const contacts = cfg.contacts || {};
  const order = Object.keys(contacts); // founder, it, etc.

  for (const key of order) {
    const c = contacts[key];
    if (!c) continue;
    const role = c.role ? `<div class="meta">${c.role}</div>` : "";
    const email = c.email
      ? `<a class="email" href="mailto:${c.email}">${c.email}</a>`
      : "";

    container.insertAdjacentHTML(
      "beforeend",
      `<div class="card contact">
        <h4>${c.name || key}</h4>
        ${role}
        ${email}
      </div>`
    );
  }
}

// Tip button on index
function openTip() {
  window.location.href = "tip.html";
}

async function boot() {
  try {
    const cfg = await loadJSON("assets/config.json");

    // Puzzles page?
    const pgPuzzles = document.querySelector("#puzzle-grid");
    if (pgPuzzles) {
      const products = await loadJSON("assets/products.json");
      // products.items should be an array of { title, price, dimensions, image, owner, type }
      renderCards(pgPuzzles, products.items || [], cfg, { type: "puzzle" });
    }

    // Art page?
    const pgArt = document.querySelector("#art-grid");
    if (pgArt) {
      const art = await loadJSON("assets/art.json");
      // Optional: filter out Egret if you don’t want it shown
      const items = (art.items || []).filter(i =>
        String(i.title || "").toLowerCase() !== "egret painting"
      );
      renderCards(pgArt, items, cfg, { type: "art" });
    }

    // Tip page?
    const tipWrap = document.querySelector("#tips");
    if (tipWrap) {
      renderTips(tipWrap, cfg);
    }

    // Contacts block on index/footer/etc.
    const contactsEl = document.querySelector("#contacts");
    if (contactsEl) {
      renderContacts(contactsEl, cfg);
    }

    // Wire the “Tip the Studio” CTA on index if present
    const tipCta = document.querySelector(".tip-btn");
    if (tipCta) {
      tipCta.addEventListener("click", (e) => {
        e.preventDefault();
        openTip();
      });
    }
  } catch (err) {
    console.error(err);
  }
}

// start
document.addEventListener("DOMContentLoaded", boot);I’m 