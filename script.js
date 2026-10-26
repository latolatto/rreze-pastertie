(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = $('#menuToggle');
  const nav = $('#navigation');
  const packageMenu = $('#navPackages');
  function closeMenu(returnFocus = false) {
    nav.classList.remove('open');
    packageMenu.open = false;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Hap menynë');
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Mbyll menynë' : 'Hap menynë');
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (packageMenu.open) { packageMenu.open = false; packageMenu.querySelector('summary').focus(); }
    else if (nav.classList.contains('open')) closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.nav-packages')) packageMenu.open = false;
    if (!event.target.closest('.site-header')) closeMenu();
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  // Entrance animations settle by themselves; no persistent banner controls.
  const hero = $('#krye');
  if (window.matchMedia('(pointer:fine)').matches) {
    let pointerFrame = 0;
    hero.addEventListener('pointermove', event => {
      if (reduced.matches || pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        const bounds = hero.getBoundingClientRect();
        hero.style.setProperty('--pointer-x', (event.clientX - bounds.left) + 'px');
        hero.style.setProperty('--pointer-y', (event.clientY - bounds.top) + 'px');
        pointerFrame = 0;
      });
    }, { passive: true });
  }

  const content = window.RREZE_CONTENT || { reviews: [], videos: [], mediaIsReference: true };
  $$('[data-reference-label]').forEach(label => { label.hidden = !content.mediaIsReference; });
  if (content.comparison) {
    $('#beforeImage').src = content.comparison.before;
    $('#afterImage').src = content.comparison.after;
  }
  const comparison = $('#comparisonRange');
  const stage = $('#comparisonStage');
  const registration = content.comparison?.registration;
  if (registration) {
    const { crop, homography: h } = registration;
    const shifted = [
      h[0] - crop.x * h[6], h[1] - crop.x * h[7], h[2] - crop.x * h[8],
      h[3] - crop.y * h[6], h[4] - crop.y * h[7], h[5] - crop.y * h[8],
      h[6], h[7], h[8],
    ];
    // CSS renders the original photographs through a projective camera match.
    // No retouching, synthesized texture, or alteration of stains is applied.
    const matrix = [shifted[0], shifted[3], 0, shifted[6], shifted[1], shifted[4], 0, shifted[7], 0, 0, 1, 0, shifted[2], shifted[5], 0, shifted[8]];
    stage.classList.add('registered');
    stage.style.setProperty('--comparison-width', crop.width + 'px');
    stage.style.setProperty('--comparison-height', crop.height + 'px');
    $('#beforeImage').style.width = registration.before.width + 'px';
    $('#beforeImage').style.height = registration.before.height + 'px';
    $('#beforeImage').style.transform = 'matrix3d(' + matrix.join(',') + ')';
    $('#afterImage').style.width = registration.after.width + 'px';
    $('#afterImage').style.height = registration.after.height + 'px';
    $('#afterImage').style.transform = 'translate(' + -crop.x + 'px,' + -crop.y + 'px)';
    function fitComparison() {
      stage.style.setProperty('--comparison-scale', Math.max(stage.clientWidth / crop.width, stage.clientHeight / crop.height));
    }
    if ('ResizeObserver' in window) new ResizeObserver(fitComparison).observe(stage);
    else window.addEventListener('resize', fitComparison);
    fitComparison();
  }
  function updateComparison() {
    const value = Number(comparison.value);
    stage.style.setProperty('--split', value + '%');
    comparison.setAttribute('aria-valuetext', (100 - value) + '% e pamjes pas pastrimit');
  }
  comparison.addEventListener('input', updateComparison);
  updateComparison();

  const videoGrid = $('#videoGrid');
  const playIcon = '<svg viewBox="0 0 18 22" aria-hidden="true"><path d="M2 2 16 11 2 20Z" fill="currentColor"/></svg>';
  const pauseIcon = '<svg viewBox="0 0 18 22" aria-hidden="true"><path d="M5 3v16M13 3v16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  (content.videos || []).forEach((item, index) => {
    const figure = document.createElement('figure');
    figure.className = 'video-card';
    const frame = document.createElement('div');
    frame.className = 'video-frame';
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = false;
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.src = item.src;
    video.setAttribute('aria-label', item.title);
    const label = document.createElement('span');
    label.className = 'video-label';
    label.textContent = 'NË LËVIZJE / ' + String(index + 1).padStart(2, '0');
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'video-play';
    play.setAttribute('aria-label', 'Ndalo videon: ' + item.title);
    play.innerHTML = '<span>' + pauseIcon + '</span>';
    play.addEventListener('click', async () => {
      if (!video.paused) { video.pause(); return; }
      try { await video.play(); } catch { showVideoError(); }
    });
    function updatePlaybackControl() {
      frame.classList.toggle('playing', !video.paused);
      play.setAttribute('aria-label', (video.paused ? 'Luaj videon: ' : 'Ndalo videon: ') + item.title);
      play.innerHTML = '<span>' + (video.paused ? playIcon : pauseIcon) + '</span>';
    }
    video.addEventListener('play', () => {
      updatePlaybackControl();
    });
    video.addEventListener('pause', updatePlaybackControl);
    function showVideoError() {
      if (frame.querySelector('.video-error')) return;
      const error = document.createElement('a');
      error.className = 'video-error';
      error.href = 'https://www.instagram.com/rreze_pastertie/';
      error.target = '_blank'; error.rel = 'noopener';
      error.textContent = 'Shihni videot në Instagram ↗';
      frame.append(error);
    }
    video.addEventListener('error', showVideoError);
    frame.append(video, label, play);
    const caption = document.createElement('figcaption');
    const captionText = document.createElement('div');
    const title = document.createElement('h3'); title.textContent = item.title;
    const subtitle = document.createElement('p'); subtitle.textContent = item.subtitle || '';
    captionText.append(title, subtitle);
    const number = document.createElement('span'); number.textContent = String(index + 1).padStart(2, '0');
    caption.append(captionText, number);
    figure.append(frame, caption); videoGrid.append(figure);
    // Muted inline playback is compatible with mobile autoplay policies.
    // Keep a manual play fallback if the browser enables a power-saving block.
    video.play().catch(updatePlaybackControl);
  });

  const reviews = (content.reviews || []).filter(item => typeof item.name === 'string' && typeof item.text === 'string' && item.name.trim() && item.text.trim());
  $('#reviewsEmpty').hidden = reviews.length > 0;
  reviews.forEach((item, index) => {
    const figure = document.createElement('figure');
    figure.className = 'review-card';
    const mark = document.createElement('span'); mark.className = 'review-quote'; mark.textContent = '“'; mark.setAttribute('aria-hidden', 'true');
    figure.append(mark);
    if (Number.isInteger(item.rating) && item.rating >= 1 && item.rating <= 5) {
      const stars = document.createElement('span'); stars.className = 'review-stars';
      stars.textContent = '★'.repeat(item.rating); stars.setAttribute('aria-label', item.rating + ' nga 5 yje');
      figure.append(stars);
    }
    const quote = document.createElement('blockquote'); quote.textContent = item.text;
    const caption = document.createElement('figcaption');
    const avatar = document.createElement('span'); avatar.className = 'review-avatar'; avatar.setAttribute('aria-hidden', 'true'); avatar.textContent = String(index + 1).padStart(2, '0');
    const captionText = document.createElement('div');
    const name = document.createElement('strong'); name.textContent = item.name;
    const detail = document.createElement('p'); detail.textContent = [item.service, item.source].filter(Boolean).join(' · ');
    captionText.append(name, detail); caption.append(avatar, captionText);
    figure.append(quote, caption); $('#reviewsGrid').append(figure);
  });

  // Progressive enhancement: all content is visible without JavaScript.
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => {
      $('#mobileDock').classList.toggle('visible', !entries[0].isIntersecting);
    }, { threshold: 0 });
    heroObserver.observe($('#krye'));
    if (!reduced.matches) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.remove('waiting'); observer.unobserve(entry.target); } });
      }, { threshold: 0.08 });
      $$('.reveal').forEach(el => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('waiting'); observer.observe(el); } });
      // Long pages remain available even if observation is interrupted.
      window.setTimeout(() => $$('.reveal.waiting').forEach(el => el.classList.remove('waiting')), 12000);
    }
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) $$('.site-nav a').forEach(link => {
          const active = link.hash === '#' + entry.target.id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -60% 0px' });
    $$('.site-nav a').forEach(link => { const target = document.querySelector(link.hash); if (target) sectionObserver.observe(target); });
  }

  const form = $('#offerForm');
  const serviceField = $('#service');
  const result = $('#formResult');
  const status = $('#formStatus');
  $$('[data-service]').forEach(link => link.addEventListener('click', () => {
    serviceField.value = link.dataset.service;
    serviceField.dispatchEvent(new Event('change', { bubbles: true }));
    result.hidden = true;
    closeMenu();
  }));

  function phoneValid(value) {
    const digits = value.replace(/\D/g, '');
    return /^\+?[\d\s().-]+$/.test(value) && digits.length >= 7 && digits.length <= 15;
  }
  const rules = {
    name: value => value.length >= 2,
    phone: phoneValid,
    service: value => [...serviceField.options].some(option => option.value === value && value),
    area: value => value.length >= 2,
  };
  function checkField(name) {
    const field = form.elements.namedItem(name);
    const valid = rules[name](field.value.trim());
    field.closest('.field').classList.toggle('has-error', !valid);
    field.setAttribute('aria-invalid', String(!valid));
    return valid;
  }
  Object.keys(rules).forEach(name => {
    const field = form.elements.namedItem(name);
    ['input', 'change'].forEach(event => field.addEventListener(event, () => {
      if (field.getAttribute('aria-invalid') === 'true') checkField(name);
      status.textContent = '';
    }));
  });
  form.addEventListener('input', () => { result.hidden = true; });
  form.addEventListener('change', () => { result.hidden = true; });
  function buildMessage() {
    const value = name => form.elements.namedItem(name).value.trim();
    const lines = [
      'Përshëndetje Rreze Pastërtie! Dëshiroj të rezervoj një pastrim dhe të di çmimin.', '',
      'Emri: ' + value('name'), 'Telefoni: ' + value('phone'),
      'Shërbimi: ' + value('service'), 'Qyteti / zona / adresa: ' + value('area'),
    ];
    if (value('size')) lines.push('Sipërfaqja: ' + value('size') + ' m²');
    if (value('date')) { const parts = value('date').split('-'); lines.push('Data e preferuar: ' + parts.reverse().join('.')); }
    if (value('notes')) lines.push('Shënime: ' + value('notes'));
    lines.push('', 'Mund t’ju dërgoj foto ose video të ambientit në WhatsApp. Faleminderit!');
    return lines.join('\n');
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    let firstInvalid;
    Object.keys(rules).forEach(name => { if (!checkField(name) && !firstInvalid) firstInvalid = form.elements.namedItem(name); });
    if (firstInvalid) {
      result.hidden = true;
      status.textContent = 'Ju lutem kontrolloni fushat e shënuara.';
      firstInvalid.focus();
      return;
    }
    status.textContent = '';
    const message = buildMessage();
    $('#messagePreview').textContent = message;
    $('#whatsappLink').href = 'https://wa.me/355684744488?text=' + encodeURIComponent(message);
    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'nearest' });
  });
  $('#copyMessage').addEventListener('click', async () => {
    const button = $('#copyMessage');
    try {
      await navigator.clipboard.writeText($('#messagePreview').textContent);
      button.textContent = 'U kopjua';
    } catch {
      const range = document.createRange();
      range.selectNodeContents($('#messagePreview'));
      const selection = window.getSelection();
      selection.removeAllRanges(); selection.addRange(range);
      button.textContent = 'Përzgjidhni Kopjo';
    }
    window.setTimeout(() => { button.textContent = 'Kopjo mesazhin'; }, 3000);
  });
  $('#year').textContent = new Date().getFullYear();
})();
