
function render(pn) {
    page = Math.min(Math.max(1, pn), totalPages);
    const start = (page - 1) * PAGE_SIZE;
    grid.innerHTML = products.slice(start, start + PAGE_SIZE).map(card).join('');
    pageInfo.textContent = Page ${page} / ${totalPages};
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;
    const u = new URL(location.href); u.searchParams.set('page', page); history.replaceState(null, '', u);
  }

  prevBtn.onclick = () => render(page - 1);
  nextBtn.onclick = () => render(page + 1);
  render(page);
})();