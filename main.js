/* Self-contained local preview: no analytics, remote requests, or form delivery. */
(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.header-nav');
  if (toggle && nav) {
    const close = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open navigation'); };
    toggle.addEventListener('click', () => {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { close(); toggle.focus(); } });
  }
  document.querySelectorAll('[data-review-carousel]').forEach(carousel => {
    const track = carousel.querySelector('.review-track');
    const previous = carousel.querySelector('[data-previous]');
    const next = carousel.querySelector('[data-next]');
    const counter = carousel.querySelector('[data-counter]');
    const cards = [...track.querySelectorAll('.review-card')];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    function measure() {
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const width = cards[0].getBoundingClientRect().width;
      const index = Math.round(track.scrollLeft / (width + gap));
      const visible = Math.max(1, Math.floor((track.clientWidth + gap + 2) / (width + gap)));
      return { index, visible, stride: width + gap };
    }
    function update() {
      const {index, visible} = measure();
      const end = Math.min(cards.length, index + visible);
      counter.textContent = `${index + 1}–${end} / ${cards.length}`;
      previous.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 3;
    }
    function move(direction) {
      const {index, visible, stride} = measure();
      track.scrollTo({left: Math.max(0, (index + direction * visible) * stride), behavior: reduced.matches ? 'instant' : 'smooth'});
    }
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', update, {passive: true});
    track.addEventListener('keydown', e => {
      if (e.target !== track) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1); }
      if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); track.scrollTo({left: e.key === 'Home' ? 0 : track.scrollWidth, behavior: reduced.matches ? 'instant' : 'smooth'}); }
    });
    window.addEventListener('resize', update);
    update();
  });
  document.querySelectorAll('[data-inquiry-form]').forEach(form => {
    const first = form.querySelector('[data-step="1"]');
    const second = form.querySelector('[data-step="2"]');
    const next = form.querySelector('[data-form-next]');
    const back = form.querySelector('[data-form-back]');
    const label = form.querySelector('[data-step-label]');
    const bars = form.querySelectorAll('.form-step-bar span');
    const status = form.querySelector('.form-status');
    second.disabled = true;
    next.addEventListener('click', () => {
      const invalid = [...first.querySelectorAll('input,select,textarea')].find(el => !el.checkValidity());
      if (invalid) { invalid.reportValidity(); return; }
      first.hidden = true; first.disabled = true;
      second.hidden = false; second.disabled = false;
      label.textContent = '02 / Your contact details'; bars[1].classList.add('active');
      second.querySelector('input').focus({preventScroll: true});
    });
    back.addEventListener('click', () => {
      second.hidden = true; second.disabled = true;
      first.hidden = false; first.disabled = false;
      label.textContent = '01 / Your event'; bars[1].classList.remove('active');
      first.querySelector('input,select').focus({preventScroll: true});
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!first.hidden) { next.click(); return; }
      if (!form.checkValidity()) { form.reportValidity(); return; }
      status.hidden = false;
      status.textContent = 'Preview complete. This is an offline design demonstration: no inquiry has been sent, and your information has not been saved.';
      status.focus({preventScroll: true});
      form.querySelector('[type="submit"]').textContent = 'Preview completed';
    });
    const unknown = form.querySelector('[data-date-undecided]');
    const date = form.querySelector('[type="date"]');
    if (unknown && date) unknown.addEventListener('change', () => { date.disabled = unknown.checked; date.required = !unknown.checked; });
  });
  const mobile = document.querySelector('.mobile-cta');
  const hero = document.querySelector('.hero');
  const inquiry = document.querySelector('#inquiry');
  if (mobile && hero && inquiry && 'IntersectionObserver' in window) {
    let heroVisible = true, inquiryVisible = false;
    const update = () => mobile.classList.toggle('visible', !heroVisible && !inquiryVisible);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.target === hero) heroVisible = entry.isIntersecting; if (entry.target === inquiry) inquiryVisible = entry.isIntersecting; }); update();
    }, {threshold: 0});
    observer.observe(hero); observer.observe(inquiry);
  }
})();
