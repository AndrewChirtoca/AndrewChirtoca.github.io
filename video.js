(() => {
  const dialog = document.querySelector('#video-dialog');
  const title = document.querySelector('#video-title');
  const frame = document.querySelector('#video-frame');
  const source = document.querySelector('#video-source');
  const status = document.querySelector('#video-status');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  function embedUrl(link) {
    const url = new URL(link.href);
    if (url.protocol !== 'https:') return null;

    if (url.hostname === 'www.youtube.com' && url.pathname === '/watch') {
      const id = url.searchParams.get('v');
      if (id && /^[\w-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1`;
    }

    if (url.hostname === 'vimeo.com' && /^\/\d+\/?$/.test(url.pathname)) {
      const id = url.pathname.split('/')[1];
      return `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`;
    }

    if (url.hostname === 'www.linkedin.com') {
      const match = url.pathname.match(/^\/posts\/[\w%-]+-ugcPost-(\d+)-[\w-]+\/?$/);
      if (match) return `https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:${match[1]}`;
    }

    return null;
  }

  function localPlayer(file, label, poster, start) {
    const player = document.createElement('video');
    player.controls = true;
    player.autoplay = true;
    player.playsInline = true;
    player.setAttribute('aria-label', label);
    if (poster) player.poster = poster;
    if (Number.isFinite(start) && start > 0) {
      player.addEventListener('loadedmetadata', () => {
        if (start < player.duration) player.currentTime = start;
      }, { once: true });
    }
    player.addEventListener('error', () => {
      if (player.isConnected) status.textContent = 'This video could not play here. Try the original link below.';
    }, { once: true });
    player.src = file;
    return player;
  }

  function embeddedPlayer(src, label) {
    const player = document.createElement('iframe');
    player.title = label;
    player.src = src;
    player.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    player.allowFullscreen = true;
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    return player;
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-video]');
    if (!link || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const file = link.dataset.videoFile;
    // Provider embeds need a web referrer. Local videos also work from disk.
    const embed = !file && location.protocol !== 'file:' ? embedUrl(link) : null;
    if ((!file && !embed) || dialog.open) return;

    const label = link.dataset.title;
    const player = file
      ? localPlayer(file, label, link.querySelector('img')?.currentSrc, Number(link.dataset.videoStart))
      : embeddedPlayer(embed, label);
    title.textContent = label;
    status.textContent = '';
    source.href = link.href;
    dialog.classList.toggle('linkedin', Boolean(embed && new URL(embed).hostname === 'www.linkedin.com'));
    dialog.showModal();
    frame.replaceChildren(player);
    event.preventDefault();
  });

  function pauseVideoOnOpen(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    frame.querySelector('video')?.pause();
  }

  source.addEventListener('click', pauseVideoOnOpen);
  source.addEventListener('auxclick', pauseVideoOnOpen);

  dialog.addEventListener('close', () => {
    frame.querySelector('video')?.pause();
    frame.replaceChildren();
    dialog.classList.remove('linkedin');
  });
})();
