WPS Drop-in Pack v2
====================
Files to copy into your repo root (they create/replace these paths):

- assets/config.json
- assets/products.json
- assets/art.json
- assets/app.js
- admin/config.yml
- contact.html

After copying:
  git add assets/config.json assets/products.json assets/art.json assets/app.js admin/config.yml contact.html
  git commit -m "Drop-in v2: payouts by owner + contact page"
  git push origin main

Make sure index.html has:
  <div id="puzzle-grid" class="card-grid"></div>
  <div id="art-grid" class="card-grid"></div>
  <script src="assets/app.js"></script>

Netlify forms: contact.html is pre-wired with data-netlify="true". Enable Forms in Netlify to receive submissions.
