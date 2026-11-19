(() => {
  document.querySelectorAll('.case-close').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => {
      const details = button.closest('details');
      const summary = details.querySelector('summary');
      details.open = false;
      summary.focus({ preventScroll: true });
      summary.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  });

  // Shared links can point into a collapsed study; reveal the target before scrolling.
  function revealHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    let parent = target.closest('details');
    while (parent) {
      parent.open = true;
      parent = parent.parentElement.closest('details');
    }
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }
  window.addEventListener('hashchange', revealHash);
  if (location.hash) revealHash();
})();
