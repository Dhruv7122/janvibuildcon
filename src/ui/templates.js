/**
 * Pure HTML-string templates rendered from content.js.
 * Used at build time (vite.config.js) so the full content ships in index.html
 * for SEO and no-JS visitors — no runtime DOM templating needed.
 */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

const pad = (n) => String(n).padStart(2, '0');

export const waLink = (contact, text) =>
  `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text ?? contact.whatsappGreeting)}`;

const ICONS = {
  inspect:
    '<circle cx="26" cy="26" r="15" pathLength="1"/><path d="M37 37 L52 52" pathLength="1"/><path d="M19 26 h14 M26 19 v14" pathLength="1"/>',
  diagnose:
    '<rect x="12" y="10" width="40" height="46" rx="2" pathLength="1"/><path d="M20 42 L28 32 L35 37 L45 22" pathLength="1"/><path d="M24 10 v-4 h16 v4" pathLength="1"/>',
  treat:
    '<path d="M32 8 C24 20 16 28 16 38 a16 16 0 0 0 32 0 C48 28 40 20 32 8 Z" pathLength="1"/><path d="M24 40 a8 8 0 0 0 8 8" pathLength="1"/>',
  warranty:
    '<path d="M32 6 L52 14 V30 C52 44 43 53 32 58 C21 53 12 44 12 30 V14 Z" pathLength="1"/><path d="M22 32 L29 39 L43 25" pathLength="1"/>',
};

const label = (num, seq) =>
  `<p class="label mono"><span class="label__num">${esc(num)}</span><span class="label__rule" aria-hidden="true"></span><span>${esc(seq)}</span></p>`;

const beforeAfter = ({ before, after, alt, beforeLabel = 'Before', afterLabel = 'After', id = '' }) => `
<div class="ba" data-ba${id ? ` id="${esc(id)}"` : ''} style="--pos:50%">
  <img class="ba__img" src="${esc(before)}" alt="${esc(beforeLabel)}: ${esc(alt)}" loading="lazy" decoding="async" width="1600" height="1000" draggable="false">
  <div class="ba__after">
    <img class="ba__img" src="${esc(after)}" alt="${esc(afterLabel)}: ${esc(alt)}" loading="lazy" decoding="async" width="1600" height="1000" draggable="false">
  </div>
  <span class="ba__label ba__label--before mono" aria-hidden="true">${esc(beforeLabel)}</span>
  <span class="ba__label ba__label--after mono" aria-hidden="true">${esc(afterLabel)}</span>
  <div class="ba__handle" role="slider" tabindex="0" aria-label="Before and after comparison" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-valuetext="50% revealed">
    <span class="ba__knob" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 6 L3 12 L9 18 M15 6 L21 12 L15 18" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></span>
  </div>
</div>`;

export function renderHeader(c) {
  return `
<a class="skip-link" href="#main">Skip to content</a>
<header class="header" data-header>
  <a class="logo" href="#hero" aria-label="${esc(c.site.name)} — back to top" data-cursor>
    <svg class="logo__mark" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><rect x="1" y="1" width="30" height="30" fill="none" stroke="currentColor"/><path d="M8 22 C8 26 14 26 14 22 V8 M18 8 V24 H22 C27 24 27 16 22 16 H18 M18 16 H21 C25 16 25 8 21 8 H18" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
    <span class="logo__text">${esc(c.site.name)}</span>
  </a>
  <div class="indicator mono" aria-live="polite">
    <span class="indicator__num" data-indicator-num>01</span><span class="indicator__sep">/</span><span>${pad(c.nav.length)}</span>
    <span class="indicator__label" data-indicator-label>${esc(c.nav[0].label)}</span>
  </div>
  <div class="header__actions">
    <button class="theme-btn" type="button" aria-pressed="false" aria-label="Switch to light theme" data-theme-btn data-magnetic>
      <svg class="theme-btn__sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>
      <svg class="theme-btn__moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>
    </button>
    <button class="menu-btn mono" type="button" aria-expanded="false" aria-controls="menu" data-menu-btn data-magnetic>
      <span class="menu-btn__text" data-menu-text>Menu</span>
      <span class="menu-btn__icon" aria-hidden="true"><i></i><i></i></span>
    </button>
  </div>
</header>
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Site menu" hidden data-menu>
  <div class="menu__bg" aria-hidden="true"></div>
  <nav class="menu__nav" aria-label="Primary">
    <ol class="menu__list">
      ${c.nav
        .map(
          (n, i) => `<li class="menu__item"><a class="menu__link" href="#${esc(n.id)}" data-menu-link><span class="menu__num mono">${pad(i + 1)}</span><span class="menu__text">${esc(n.label)}</span></a></li>`
        )
        .join('')}
    </ol>
  </nav>
  <div class="menu__aside mono">
    <a href="tel:${esc(c.contact.phone)}">${esc(c.contact.phoneDisplay)}</a>
    <a href="mailto:${esc(c.contact.email)}">${esc(c.contact.email)}</a>
    <span>${esc(c.contact.addressLine)}</span>
  </div>
</div>`;
}

export function renderHero(c) {
  const words = c.site.name.split(' ');
  return `
<section class="section hero" id="hero" data-section aria-labelledby="hero-title">
  <div class="container hero__inner">
    ${label('01', c.hero.seq)}
    <p class="hero__eyebrow mono" data-hero-fade>${esc(c.hero.eyebrow)}</p>
    <h1 class="hero__title" id="hero-title" data-hero-title>${words.map((w) => `<span class="hero__word">${esc(w)}</span>`).join(' ')}</h1>
    <p class="hero__tagline" data-hero-fade>${esc(c.site.tagline)}</p>
    <p class="hero__lead" data-hero-fade>${esc(c.hero.lead)}</p>
    <div class="hero__ctas" data-hero-fade>
      <a class="btn btn--primary" href="#contact" data-magnetic><span>${esc(c.hero.primaryCta)}</span></a>
      <a class="btn btn--ghost" href="#projects" data-magnetic><span>${esc(c.hero.secondaryCta)}</span></a>
    </div>
  </div>
  <div class="hero__meta mono" data-hero-fade aria-hidden="true">
    <span>21.1702° N / 72.8311° E</span>
    <span>EST. ${esc(c.site.established)}</span>
  </div>
  <a class="scroll-indicator mono" href="#${esc(c.services[0]?.id ?? 'projects')}" data-hero-fade aria-label="Scroll to services">
    <span>${esc(c.hero.scrollLabel)}</span><span class="scroll-indicator__line" aria-hidden="true"></span>
  </a>
</section>`;
}

function serviceExtras(s) {
  if (s.price) {
    return `
    <div class="price-badge">
      <p class="price-badge__row"><span class="price-badge__amount">${esc(s.price.display)}</span><span class="price-badge__unit mono">${esc(s.price.unit)}</span></p>
      <p class="price-badge__note mono">${esc(s.price.note)}</p>
    </div>
    ${
      s.scale
        ? `<div class="thermal-scale mono" aria-hidden="true"><span>${esc(s.scale.cold)}</span><i></i><span>${esc(s.scale.warm)}</span></div>`
        : ''
    }`;
  }
  if (s.id === 'grouting') {
    return `
    <div class="legend mono" aria-label="Resin legend">
      <span class="legend__item"><i class="legend__dot legend__dot--pu" aria-hidden="true"></i>${esc(s.legend.pu)}</span>
      <span class="legend__item"><i class="legend__dot legend__dot--epoxy" aria-hidden="true"></i>${esc(s.legend.epoxy)}</span>
    </div>
    <div class="state-toggle mono" role="status" aria-live="polite" data-grout-state>
      <span class="state-toggle__opt is-active" data-state="before">${esc(s.states.before)}</span>
      <span class="state-toggle__opt" data-state="after">${esc(s.states.after)}</span>
      <span class="state-toggle__thumb" aria-hidden="true"></span>
    </div>`;
  }
  if (s.id === 'epoxy') {
    return `
    <div class="swatches webgl-only">
      <p class="mono swatches__label" id="swatch-label">${esc(s.swatchLabel)}</p>
      <div class="swatches__row" role="radiogroup" aria-labelledby="swatch-label">
        ${s.swatches
          .map(
            (w, i) => `<button type="button" class="swatch${i === 0 ? ' is-active' : ''}" role="radio" aria-checked="${i === 0}" aria-label="${esc(w.name)}" data-swatch="${esc(w.color)}" style="--swatch:${esc(w.color)}" data-magnetic></button>`
          )
          .join('')}
      </div>
    </div>`;
  }
  return '';
}

export function renderService(s, i) {
  // First service sits on the right so waterproofing → tile keep their original left/right layout.
  const side = i % 2 === 0 ? 'right' : 'left';
  return `
<section class="section scene scene--${side}" id="${esc(s.id)}" data-section data-scene="${esc(s.id)}" aria-labelledby="${esc(s.id)}-title">
  <div class="scene__sticky">
    <div class="container scene__grid">
      <article class="panel">
        <span class="panel__corner panel__corner--tl" aria-hidden="true"></span>
        <span class="panel__corner panel__corner--br" aria-hidden="true"></span>
        ${label(s.number, s.seq)}
        <h2 class="panel__title" id="${esc(s.id)}-title" data-split>${esc(s.title)}</h2>
        <p class="panel__summary" data-reveal>${esc(s.summary)}</p>
        <ul class="panel__benefits" data-reveal-list>
          ${s.benefits.map((b, j) => `<li><span class="mono" aria-hidden="true">${pad(j + 1)}</span>${esc(b)}</li>`).join('')}
        </ul>
        <p class="panel__areas" data-reveal><span class="mono">${esc(s.areasLabel)}:</span> ${s.areas.map(esc).join(', ')}</p>
        ${serviceExtras(s)}
      </article>
    </div>
    <div class="scene__hud mono" aria-hidden="true">
      <span>${esc(s.number)}</span><span class="scene__bar"><i data-scene-bar></i></span><span>${esc(s.seq.split('— ')[1] || '')}</span>
    </div>
  </div>
  ${
    s.layers
      ? `<div class="layer-labels" aria-hidden="true" data-layer-labels>${s.layers
          .map((l, j) => `<div class="layer-label"><span class="layer-label__line"></span><span class="mono">L${pad(j + 1)}</span><span>${esc(l)}</span></div>`)
          .join('')}</div>`
      : ''
  }
  ${
    s.marker
      ? `<div class="leak-marker" aria-hidden="true" data-leak-marker><span class="leak-marker__ring"></span><span class="leak-marker__label mono">${esc(s.marker)}</span></div>`
      : ''
  }
</section>`;
}

export function renderProjects(c) {
  const p = c.projectsSection;
  return `
<section class="section projects" id="projects" data-section data-opaque aria-labelledby="projects-title">
  <div class="projects__pin" data-projects-pin>
    <div class="container projects__head">
      ${label(p.number, p.seq)}
      <h2 class="section-title" id="projects-title" data-split>${esc(p.title)}</h2>
      <p class="projects__intro" data-reveal>${esc(p.intro)}</p>
    </div>
    <div class="projects__viewport">
      <ul class="projects__track" data-projects-track>
        ${c.projects
          .map(
            (pr, i) => `
        <li class="card" data-card>
          <button type="button" class="card__media" data-project="${i}" aria-label="Open ${esc(pr.title)} — before and after" data-cursor="view">
            <img class="card__img" src="${esc(pr.before)}" alt="${esc(pr.alt)} — before" loading="lazy" decoding="async" width="1600" height="1000">
            <img class="card__img card__img--after" src="${esc(pr.after)}" alt="" loading="lazy" decoding="async" width="1600" height="1000">
            <span class="card__tag mono" aria-hidden="true">Before → After</span>
          </button>
          <div class="card__body">
            <p class="card__meta mono">${pad(i + 1)} · ${esc(pr.service)} · ${esc(pr.year)}</p>
            <h3 class="card__title">${esc(pr.title)}</h3>
            <p class="card__loc">${esc(pr.location)} <span aria-hidden="true">—</span> ${esc(pr.area)}</p>
          </div>
        </li>`
          )
          .join('')}
      </ul>
    </div>
    <div class="container projects__foot mono" aria-hidden="true">
      <span class="projects__progress"><i data-projects-progress></i></span>
      <span>${pad(c.projects.length)} projects</span>
    </div>
  </div>
</section>`;
}

export function renderAbout(c) {
  const ps = c.processSection;
  const f = c.featuredCompare;
  return `
<section class="section about" id="about" data-section data-opaque aria-labelledby="about-title">
  <div class="container">
    <div class="compare-feature">
      <div class="compare-feature__text">
        <h2 class="section-title section-title--sm" data-split>${esc(f.title)}</h2>
        <p data-reveal>${esc(f.caption)}</p>
      </div>
      ${beforeAfter({ before: f.before, after: f.after, alt: f.caption, beforeLabel: f.beforeLabel, afterLabel: f.afterLabel })}
    </div>

    ${label(ps.number, ps.seq)}
    <h2 class="section-title" id="about-title" data-split>${esc(ps.title)}</h2>
    <ol class="process" data-process>
      ${ps.steps
        .map(
          (s, i) => `
      <li class="step">
        <svg class="step__icon" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">${ICONS[s.icon] || ICONS.inspect}</svg>
        <p class="step__num mono">${pad(i + 1)}</p>
        <h3 class="step__title">${esc(s.title)}</h3>
        <p class="step__text">${esc(s.text)}</p>
      </li>`
        )
        .join('')}
    </ol>

    <ul class="stats" data-stats>
      ${c.stats
        .map(
          (s) => `
      <li class="stat">
        <span class="stat__value"><span data-count="${Number(s.value)}">${Number(s.value).toLocaleString('en-IN')}</span>${esc(s.suffix)}</span>
        <span class="stat__label mono">${esc(s.label)}</span>
      </li>`
        )
        .join('')}
    </ul>

    <div class="testimonials" data-carousel>
      <div class="testimonials__head">
        <h2 class="section-title section-title--sm" data-split>${esc(c.testimonialsSection.title)}</h2>
        <div class="testimonials__nav">
          <button type="button" class="round-btn" data-carousel-prev aria-label="Previous testimonial" data-magnetic>&larr;</button>
          <button type="button" class="round-btn" data-carousel-next aria-label="Next testimonial" data-magnetic>&rarr;</button>
        </div>
      </div>
      <div class="testimonials__viewport" aria-roledescription="carousel" aria-label="Client testimonials" tabindex="0" data-carousel-viewport>
        <ul class="testimonials__track" data-carousel-track>
          ${c.testimonials
            .map(
              (t, i) => `
          <li class="quote" aria-roledescription="slide" aria-label="${i + 1} of ${c.testimonials.length}">
            <blockquote><p>“${esc(t.quote)}”</p></blockquote>
            <p class="quote__by"><strong>${esc(t.name)}</strong><span class="mono">${esc(t.role)}</span></p>
          </li>`
            )
            .join('')}
        </ul>
      </div>
    </div>
  </div>
</section>`;
}

export function renderContact(c) {
  const cs = c.contactSection;
  const f = cs.form;
  const tel = `tel:${c.contact.phone}`;
  const mail = `mailto:${c.contact.email}`;
  return `
<section class="section contact" id="contact" data-section aria-labelledby="contact-title">
  <div class="container contact__grid">
    <div class="contact__info">
      ${label(cs.number, cs.seq)}
      <h2 class="contact__title" id="contact-title" data-split>${esc(cs.title)}</h2>
      <p class="contact__intro" data-reveal>${esc(cs.intro)}</p>
      <div class="contact__ctas" data-reveal>
        <a class="btn btn--primary" href="${esc(tel)}" data-magnetic><span>${esc(cs.callCta)} · ${esc(c.contact.phoneDisplay)}</span></a>
        <a class="btn btn--ghost" href="${esc(waLink(c.contact))}" target="_blank" rel="noopener" data-magnetic><span>${esc(cs.whatsappCta)}</span></a>
        <a class="btn btn--ghost" href="${esc(mail)}" data-magnetic><span>${esc(cs.emailCta)}</span></a>
      </div>
      <dl class="contact__list mono" data-reveal>
        <div><dt>Phone</dt><dd><a href="${esc(tel)}">${esc(c.contact.phoneDisplay)}</a></dd></div>
        <div><dt>Email</dt><dd><a href="${esc(mail)}">${esc(c.contact.email)}</a></dd></div>
        <div><dt>City</dt><dd>${esc(c.contact.addressLine)}</dd></div>
        <div><dt>Hours</dt><dd>${esc(c.contact.hours)}</dd></div>
      </dl>
    </div>
    <form class="form" data-form novalidate aria-labelledby="form-title">
      <h3 class="form__title" id="form-title">${esc(f.title)}</h3>
      <div class="field">
        <label for="f-name">${esc(f.nameLabel)}</label>
        <input id="f-name" name="name" type="text" autocomplete="name" required maxlength="80">
      </div>
      <div class="field">
        <label for="f-phone">${esc(f.phoneLabel)}</label>
        <input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="16">
      </div>
      <div class="field">
        <label for="f-service">${esc(f.serviceLabel)}</label>
        <select id="f-service" name="service" required>
          ${c.services.map((s) => `<option>${esc(s.seq.split('— ')[1] ? titleCase(s.seq.split('— ')[1]) : s.title)}</option>`).join('')}
          <option>Other / Not sure</option>
        </select>
      </div>
      <div class="field">
        <label for="f-location">${esc(f.locationLabel)}</label>
        <input id="f-location" name="location" type="text" autocomplete="address-level2" maxlength="120">
      </div>
      <div class="field field--full">
        <label for="f-message">${esc(f.messageLabel)}</label>
        <textarea id="f-message" name="message" rows="4" required maxlength="1000"></textarea>
      </div>
      <p class="form__error" role="alert" data-form-error></p>
      <div class="form__actions">
        <button type="submit" class="btn btn--primary" value="whatsapp" data-magnetic><span>${esc(f.sendWhatsapp)}</span></button>
        <button type="submit" class="btn btn--ghost" value="email" data-magnetic><span>${esc(f.sendEmail)}</span></button>
      </div>
      <p class="form__note mono">${esc(f.note)}</p>
    </form>
  </div>
</section>`;
}

const titleCase = (s) => s.toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());

export function renderFooter(c) {
  const items = c.footer.marquee.map((m) => `<span>${esc(m.toUpperCase())}</span><span class="marquee__dot" aria-hidden="true">•</span>`).join('');
  return `
<footer class="footer">
  <div class="marquee" aria-hidden="true"><div class="marquee__track">${items}${items}${items}${items}</div></div>
  <p class="visually-hidden">${c.footer.marquee.map(esc).join(', ')}</p>
  <div class="container footer__row mono">
    <p>© <span data-year>${new Date().getFullYear()}</span> ${esc(c.site.name)}. ${esc(c.footer.copyright)}</p>
    <ul class="footer__social">
      ${c.social.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('')}
    </ul>
    <a href="#hero" class="footer__top" data-cursor>Back to top ↑</a>
  </div>
</footer>`;
}

export function renderLightbox() {
  return `
<dialog class="lightbox" aria-labelledby="lightbox-title" data-lightbox>
  <div class="lightbox__inner">
    <div class="lightbox__head">
      <div>
        <p class="mono lightbox__meta" data-lightbox-meta></p>
        <h2 class="lightbox__title" id="lightbox-title" data-lightbox-title></h2>
      </div>
      <button type="button" class="round-btn" data-lightbox-close aria-label="Close project">✕</button>
    </div>
    ${beforeAfter({ before: '', after: '', alt: '', id: 'lightbox-ba' })}
    <div class="lightbox__foot mono">
      <button type="button" class="round-btn" data-lightbox-prev aria-label="Previous project">&larr;</button>
      <span data-lightbox-count></span>
      <button type="button" class="round-btn" data-lightbox-next aria-label="Next project">&rarr;</button>
    </div>
  </div>
</dialog>`;
}

export function renderPreloader(c) {
  return `
<div class="preloader" data-preloader role="progressbar" aria-label="Loading" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
  <div class="preloader__top mono">
    <span class="preloader__dot" aria-hidden="true"></span>
    <span>${esc(c.preloader.label)} ${esc(c.preloader.seq)} — est.${esc(c.site.established)}</span>
  </div>
  <div class="preloader__count mono" aria-hidden="true"><span data-preloader-count>000</span><span>%</span></div>
  <div class="preloader__bar" aria-hidden="true"><i data-preloader-bar></i></div>
  <p class="preloader__name mono" aria-hidden="true">${esc(c.site.name)}</p>
</div>`;
}

/** Full body markup for <div id="app">. */
export function renderBody(c) {
  return [
    renderHeader(c),
    '<main id="main">',
    renderHero(c),
    c.services.map((s, i) => renderService(s, i)).join(''),
    renderProjects(c),
    renderAbout(c),
    renderContact(c),
    '</main>',
    renderFooter(c),
    renderLightbox(c),
  ].join('\n');
}

/** <head> SEO tags + LocalBusiness JSON-LD. */
export function renderHead(c) {
  const url = c.site.url;
  const og = new URL(c.site.ogImage, url).href;
  const title = `${c.site.name} — Waterproofing, Epoxy, Injection Grouting & Crack Repair in ${c.contact.city}`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${url}#business`,
    name: c.site.name,
    slogan: c.site.tagline,
    description: c.site.description,
    url,
    image: og,
    telephone: c.contact.phone,
    email: c.contact.email,
    foundingDate: String(c.site.established),
    address: {
      '@type': 'PostalAddress',
      addressLocality: c.contact.city,
      addressRegion: c.contact.region,
      addressCountry: c.contact.country,
    },
    areaServed: c.contact.areaServed.map((a) => ({ '@type': 'City', name: a })),
    sameAs: c.social.map((s) => s.url),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: c.services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: titleCase(s.seq.split('— ')[1] || s.title), description: s.summary },
        ...(s.price
          ? {
              price: String(s.price.amount),
              priceCurrency: s.price.currency,
              priceSpecification: { '@type': 'UnitPriceSpecification', price: String(s.price.amount), priceCurrency: s.price.currency, unitText: s.price.unit },
            }
          : {}),
      })),
    },
  };
  // Escape "<" so content can never close the script tag.
  const json = JSON.stringify(ld).replace(/</g, '\\u003c');
  return `
<title>${esc(title)}</title>
<meta name="description" content="${esc(c.site.description)}">
<meta name="theme-color" content="${esc(c.site.themeColor)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(c.site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(c.site.description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(og)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${esc(c.site.locale)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(c.site.description)}">
<meta name="twitter:image" content="${esc(og)}">
<script type="application/ld+json">${json}</script>`;
}
