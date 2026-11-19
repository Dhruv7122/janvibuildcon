/**
 * ALL editable site content lives here.
 * Edit text, numbers, links and image paths below — no component code changes needed.
 * Image paths are relative to the /public folder (e.g. "images/projects/p1-after.svg").
 * After editing, run `npm run dev` to preview or `npm run build` to rebuild.
 */

export const site = {
  name: 'Janvi Buildcon',
  shortName: 'Janvi',
  tagline: 'Sealed. Strong. Built to Last.',
  description:
    'Janvi Buildcon — waterproofing, thermal leak detection, epoxy flooring, tile epoxy grouting, PU & epoxy injection grouting and structural crack repair contractor in Surat, Gujarat.',
  established: 2015,
  // Final public URL of the site (used for SEO tags, sitemap and robots.txt). Keep the trailing slash.
  url: 'https://your-username.github.io/janvi-buildcon/',
  ogImage: 'og-image.jpg',
  locale: 'en_IN',
  themeColor: '#070B12',
};

export const contact = {
  // Used for tel: links and SEO (international format).
  phone: '+919313438168',
  phoneDisplay: '+91 93134 38168',
  // WhatsApp number with country code, digits only.
  whatsapp: '919313438168',
  whatsappGreeting: 'Hello Janvi Buildcon, I\'\d like to schedule a site visit.',
  email: 'janvibuildcon7@gmail.com',
  city: 'Surat',
  region: 'Gujarat',
  country: 'IN',
  addressLine: 'Surat, Gujarat, India',
  areaServed: ['Surat', 'Bardoli', 'Navsari', 'Bharuch', 'Ankleshwar', 'Vapi', 'Valsad'],
  hours: 'Mon – Sun, 9:00 AM – 9:00 PM',
  // mapUrl: 'https://maps.google.com/?q=Janvi+Buildcon+Surat',
};

export const social = [
  { label: 'Instagram', url: 'https://instagram.com/' },
  { label: 'Facebook', url: 'https://facebook.com/' },
  // { label: 'Google Maps', url: 'https://maps.google.com/?q=Janvi+Buildcon+Surat' },
];

export const nav = [
  { id: 'hero', label: 'The Surface' },
  { id: 'leak', label: 'Leak Detection' },
  { id: 'waterproofing', label: 'Waterproofing' },
  { id: 'crack', label: 'Crack Repair' },
  { id: 'grouting', label: 'Injection Grouting' },
  { id: 'epoxy', label: 'Epoxy Work', hidden: true },
  { id: 'tile', label: 'Tile Epoxy Filling' },
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'Process' },
  { id: 'contact', label: 'Contact' },
];

export const hero = {
  seq: 'SEQ 001 — THE SURFACE',
  eyebrow: 'Waterproofing & Structural Repair · Surat',
  lead:
    'We find where water gets in, seal it for good and give tired concrete a second life — terraces, basements, tanks, floors and facades.',
  primaryCta: 'Schedule an Inspection',
  secondaryCta: 'View Work',
  scrollLabel: 'Scroll',
};

/**
 * Services, in page order. `id` must stay the same (it links each text panel to its 3D scene),
 * and the order must match the 3D scene sequence.
 */
export const services = [
  {
    id: 'leak',
    seq: 'SEQ 002 — LEAK DETECTION',
    number: '02',
    title: 'Find It Without Breaking It',
    summary:
      'A thermal imaging camera shows hidden moisture behind tiles, plaster and slabs as cold spots. We pinpoint where the water is coming from before anything is broken — no guesswork, no unnecessary demolition.',
    benefits: [
      'Infrared thermal scan of walls, floors and ceilings',
      'Moisture-meter confirmation at every suspect spot',
      'Written report with thermal images and repair advice',
    ],
    areasLabel: 'Typical areas',
    areas: ['Bathrooms', 'Kitchens', 'Ceilings', 'Concealed pipelines', 'Terraces', 'Basements'],
    price: {
      amount: 2500,
      currency: 'INR',
      display: '₹2,500',
      unit: 'per visit',
      note: 'Thermal scan + moisture mapping + report',
    },
    scale: { cold: 'Wet / cold', warm: 'Dry / warm' },
    marker: 'Moisture source · −6.2 °C',
  },
  {
    id: 'waterproofing',
    seq: 'SEQ 003 — WATERPROOFING',
    number: '03',
    title: 'Water Meets Its Match',
    summary:
      'Multi-layer waterproofing systems engineered for Surat monsoons. Primer, membrane and protective screed work together so water stops at the membrane — every time.',
    benefits: [
      'Polymer, PU and crystalline membranes matched to your surface',
      'Leak-tested before handover, with written warranty',
      'No-demolition treatments available for occupied buildings',
    ],
    areasLabel: 'Typical areas',
    areas: ['Terrace', 'Basement', 'Bathroom', 'Water tank', 'Podium', 'External wall'],
    layers: ['Concrete slab', 'Primer coat', 'Waterproof membrane', 'Protective screed', 'Finish tile'],
  },
  {
    id: 'crack',
    seq: 'SEQ 004 — CRACK FILLING',
    number: '04',
    title: 'Every Crack, Closed',
    summary:
      'From hairline plaster cracks to structural fractures — we diagnose the cause, route and clean the crack, then fill it with the right sealant or structural mortar so it stays closed.',
    benefits: [
      'Hairline, shrinkage and structural crack treatment',
      'Polymer-modified mortars & elastomeric sealants',
      'Surface blended back to a smooth, paint-ready finish',
    ],
    areasLabel: 'Typical areas',
    areas: ['Walls', 'Slabs', 'Beams', 'Columns', 'Parapets', 'Facades'],
  },
  {
    id: 'grouting',
    seq: 'SEQ 005 — INJECTION GROUTING',
    number: '05',
    title: 'Pressure Where It Matters',
    summary:
      'Packers are drilled along the leak path and resin is pumped in under controlled pressure. PU foams chase active water; epoxy rebonds the concrete for structural strength.',
    benefits: [
      'PU injection stops active leaks — even under water pressure',
      'Epoxy injection restores structural integrity of cracked members',
      'Minimal drilling, no breaking, fast return to service',
    ],
    areasLabel: 'Typical areas',
    areas: ['Basement walls', 'Lift pits', 'Retaining walls', 'Construction joints', 'Water tanks'],
    legend: { pu: 'PU resin — active leaks', epoxy: 'Epoxy resin — structural bond' },
    states: { before: 'Before: leaking', after: 'After: sealed' },
  },
  {
    id: 'epoxy',
    hidden: true, // Temporarily hidden — remove this line (and in `nav`) to show the section again.
    seq: 'SEQ 006 — EPOXY WORK',
    number: '06',
    title: 'A Floor That Mirrors',
    summary:
      'Seamless epoxy floors, coatings and mortars for factories, warehouses, parking, showrooms and homes — hard-wearing, chemical-resistant, easy to clean and glossy enough to mirror the room.',
    benefits: [
      'Self-levelling epoxy flooring & roll-coat systems',
      'Epoxy mortar for heavy-duty repairs and anchoring',
      'Anti-skid, food-grade and ESD options available',
    ],
    areasLabel: 'Typical areas',
    areas: ['Factories', 'Warehouses', 'Parking', 'Showrooms', 'Kitchens', 'Labs'],
    swatchLabel: 'Try a finish',
    swatches: [
      { name: 'Concrete grey', color: '#8A9099' },
      { name: 'Amber', color: '#FFB703' },
      { name: 'Ocean blue', color: '#2E7BF1' },
      { name: 'Factory green', color: '#2F9E6A' },
    ],
  },
  {
    id: 'tile',
    seq: 'SEQ 006 — TILE EPOXY FILLING',
    number: '06',
    title: 'Joints That Stay Clean',
    summary:
      'Old cement grout cracks, stains and lets water seep under your tiles. We rake out the joints and refill them with stain-proof, waterproof epoxy grout, colour-matched to your tiles.',
    benefits: [
      'Stops seepage through tile joints in bathrooms and terraces',
      'Stain-proof, anti-fungal and easy to clean',
      'Colour-matched and glitter grout for floors, walls and counters',
    ],
    areasLabel: 'Typical areas',
    areas: ['Bathrooms', 'Kitchens', 'Floors', 'Wall tiles', 'Swimming pools', 'Terraces'],
  },
];

export const projectsSection = {
  seq: 'SEQ 007 — PROJECTS',
  number: '07',
  title: 'Selected Work',
  intro: 'A few recent jobs across Surat and South Gujarat. Click any project to compare before and after.',
  dragHint: 'Drag the handle to compare',
};

/**
 * Projects. Replace images in /public/images/projects/ (keep the same names, or edit paths here).
 * Recommended: 1600×1000 JPG/WebP, under 250 KB each.
 */
export const projects = [
  {
    title: 'Terrace Waterproofing',
    location: 'Vesu, Surat',
    service: 'Waterproofing',
    year: 2025,
    area: '2,400 sq. ft.',
    before: 'images/projects/terracewaterproofing-before.jpeg',
    after: 'images/projects/terracewaterproofing-after.jpeg',
    alt: 'Residential terrace waterproofing',
  },
  {
    title: 'Basement Leak Seal',
    location: 'Adajan, Surat',
    service: 'Injection Grouting',
    year: 2026,
    area: 'Pillars of basement',
    before: 'images/projects/injection-grouting-before.jpeg',
    after: 'images/projects/injection-grouting-after.jpeg',
    alt: 'Basement wall PU injection grouting',
  },
  {
    title: 'Tile Epoxy Filling',
    location: 'Vesu, Surat',
    service: 'Epoxy Filling',
    year: 2026,
    area: '700 ft.',
    before: 'images/projects/tile-epoxy-before.jpeg',
    after: 'images/projects/tile-epoxy-after.jpeg',
    alt: 'Tile epoxy joint filling',
  },
  {
    title: 'Facade Crack Repair',
    location: 'Piplod, Surat',
    service: 'Crack Filling',
    year: 2026,
    area: 'Over head Tank',
    before: 'images/projects/crackfilling-before.jpeg',
    after: 'images/projects/crackfilling-after.jpeg',
    alt: 'Apartment facade structural crack repair',
  },
  // {
  //   title: 'Overhead Tank Lining',
  //   location: 'Katargam, Surat',
  //   service: 'Waterproofing',
  //   year: 2023,
  //   area: '50,000 L',
  //   before: 'images/projects/p5-before.svg',
  //   after: 'images/projects/p5-after.svg',
  //   alt: 'Water tank waterproof lining',
  // },
  {
    title: 'Tile Epoxy Filling',
    location: 'Pal, Surat',
    service: 'Epoxy Filling',
    year: 2025,
    area: '1000 ft.',
    before: 'images/projects/tile-epoxy-2-before.jpeg',
    after: 'images/projects/tile-epoxy-2-after.jpeg',
    alt: 'Podium parking epoxy coating',
  },
];

export const featuredCompare = {
  title: 'See the difference',
  caption: 'Terrace in Vesu — before treatment vs. after a 3-coat PU membrane system.',
  before: 'images/projects/terracewaterproofing-before.jpeg',
  after: 'images/projects/terracewaterproofing-after.jpeg',
  beforeLabel: 'Before',
  afterLabel: 'After',
};

export const processSection = {
  seq: 'SEQ 08 — PROCESS',
  number: '08',
  title: 'How We Work',
  steps: [
    {
      title: 'Inspection',
      text: 'on-site visit. Moisture meter, tap test and thermal checks to map every leak and crack.',
      icon: 'inspect',
    },
    {
      title: 'Diagnosis',
      text: 'We identify the root cause and give you a clear written proposal — system, quantities, timeline and price.',
      icon: 'diagnose',
    },
    {
      title: 'Treatment',
      text: 'Trained crew, branded materials and supervised application, with flood or spray testing before handover.',
      icon: 'treat',
    },
    {
      title: 'Warranty',
      text: 'Written warranty on workmanship and materials, plus a follow-up check after the first monsoon.',
      icon: 'warranty',
    },
  ],
};

export const stats = [
  { value: 500, suffix: '+', label: 'Projects completed' },
  { value: 1000000, suffix: '+', label: 'Sq. ft. covered' },
  { value: 11, suffix: '+', label: 'Years of experience' },
  { value: 450, suffix: '+', label: 'Happy clients' },
];

export const testimonialsSection = {
  title: 'Clients Say',
};

export const testimonials = [
  {
    quote:
      'Our terrace leaked every monsoon for five years. Janvi Buildcon fixed it in a week and the last two monsoons have been completely dry.',
    name: 'Daxa Patel',
    role: 'Homeowner, Vesu',
  },
  {
    quote:
      'The PU injection in our basement stopped water that two other contractors could not. Clean work, no breaking of walls.',
    name: 'Meera Shah',
    role: 'Society Secretary, Adajan',
  },
  {
    quote:
      'Our terrace is now completely waterproof, with no more leakage or dampness. The work was completed on time with excellent quality and a professional approach.',
    name: 'Imran Qureshi',
    role: 'Plant Manager, Sachin GIDC',
  },
  {
    quote:
      'Honest diagnosis, fair price and a proper written warranty. Exactly what you want from a repair contractor.',
    name: 'Abbas Hakim',
    role: 'Architect, Surat',
  },
];

export const contactSection = {
  seq: 'SEQ 009— CONTACT',
  number: '09',
  title: 'Seal the Deal',
  intro: 'Tell us what is leaking or cracking. We will visit, inspect and quote.',
  callCta: 'Call now',
  whatsappCta: 'WhatsApp',
  emailCta: 'Email us',
  // mapCta: 'Open in Maps',
  form: {
    title: 'Request a inspection',
    nameLabel: 'Your name',
    phoneLabel: 'Phone',
    serviceLabel: 'Service needed',
    locationLabel: 'Site location',
    messageLabel: 'Describe the problem',
    sendWhatsapp: 'Send via WhatsApp',
    sendEmail: 'Send via Email',
    note: 'No data is stored on this website — your message opens directly in WhatsApp or your email app.',
    emailSubject: 'Inspection request from website',
  },
};

export const footer = {
  marquee: ['Waterproofing', 'Leak Detection', 'Epoxy', 'Tile Epoxy', 'Injection Grouting', 'Crack Filling'],
  copyright: 'All rights reserved.',
  credit: 'Sealed. Strong. Built to Last.',
};

export const preloader = {
  label: 'Page preloader',
  seq: 'seq 001',
};

export default {
  site,
  contact,
  social,
  nav: nav.filter((n) => !n.hidden),
  hero,
  services: services.filter((s) => !s.hidden),
  projectsSection,
  projects,
  featuredCompare,
  processSection,
  stats,
  testimonialsSection,
  testimonials,
  contactSection,
  footer,
  preloader,
};
