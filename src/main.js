document.documentElement.classList.add('js');

const isFilePreview = window.location.protocol === 'file:';
const fileRoot = document.documentElement.dataset.fileRoot || '.';

function resolveSiteHref(value) {
  if (!isFilePreview || !value.startsWith('/')) return value;
  const match = value.match(/^([^?#]*)(.*)$/);
  let path = match?.[1] || '/';
  const suffix = match?.[2] || '';
  if (path === '/') path = '/index.html';
  else if (path.endsWith('/')) path += 'index.html';
  return `${fileRoot}${path}${suffix}`;
}

if (isFilePreview) {
  document.querySelectorAll('a[href^="/"]').forEach((link) => {
    link.setAttribute('href', resolveSiteHref(link.getAttribute('href')));
  });
  document.querySelectorAll('img[src^="/"]').forEach((image) => {
    image.setAttribute('src', `${fileRoot}/public${image.getAttribute('src')}`);
  });
  document.querySelectorAll('link[href^="/"]').forEach((link) => {
    link.setAttribute('href', `${fileRoot}/public${link.getAttribute('href')}`);
  });
}

const currentYear = new Date().getFullYear();
document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = String(currentYear);
});

const navToggle = document.querySelector('[data-nav-toggle]');
const navigation = document.querySelector('[data-nav]');

function closeNavigation() {
  if (!navToggle || !navigation) return;
  navToggle.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
  document.body.classList.remove('nav-open');
  const label = navToggle.querySelector('.nav-toggle-label');
  if (label) label.textContent = 'Menu';
}

if (navToggle && navigation) {
  navToggle.addEventListener('click', () => {
    const opening = navToggle.getAttribute('aria-expanded') !== 'true';
    navToggle.setAttribute('aria-expanded', String(opening));
    navigation.classList.toggle('is-open', opening);
    document.body.classList.toggle('nav-open', opening);
    const label = navToggle.querySelector('.nav-toggle-label');
    if (label) label.textContent = opening ? 'Close' : 'Menu';
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeNavigation();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNavigation();
      navToggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 800) closeNavigation();
  });
}

const revealItems = [...document.querySelectorAll('.reveal')];
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = [...(entry.target.parentElement?.children || [])].filter((item) => item.classList?.contains('reveal'));
        const index = Math.max(0, siblings.indexOf(entry.target));
        entry.target.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  revealItems.forEach((item) => {
    const bounds = item.getBoundingClientRect();
    if (bounds.top < window.innerHeight * .98 && bounds.bottom > 0) {
      item.classList.add('is-visible', 'is-initial');
    } else {
      observer.observe(item);
    }
  });
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const scrollMarqueeTrack = document.querySelector('[data-scroll-marquee-track]');
if (scrollMarqueeTrack && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let marqueeFrame = 0;
  const updateScrollMarquee = () => {
    marqueeFrame = 0;
    const loopWidth = scrollMarqueeTrack.scrollWidth / 3;
    if (!loopWidth) return;
    const offset = (window.scrollY * .48) % loopWidth;
    scrollMarqueeTrack.style.transform = `translate3d(${-offset}px, 0, 0)`;
  };
  const requestMarqueeUpdate = () => {
    if (!marqueeFrame) marqueeFrame = window.requestAnimationFrame(updateScrollMarquee);
  };
  window.addEventListener('scroll', requestMarqueeUpdate, { passive: true });
  window.addEventListener('resize', requestMarqueeUpdate);
  updateScrollMarquee();
}

const finderData = {
  launch: {
    number: '01',
    title: 'Launch system',
    copy: 'A focused website that explains the offer, earns trust, captures the right information, and gives the team a clean way to publish.',
    shape: 'Custom marketing site',
    move: 'Message and conversion map'
  },
  admin: {
    number: '02',
    title: 'Operations tool',
    copy: 'A purpose-built workspace that turns a repeated manual process into one clear flow, with ownership, status, and exceptions visible.',
    shape: 'Internal web application',
    move: 'Current-state workflow map'
  },
  tools: {
    number: '03',
    title: 'Connected workflow',
    copy: 'A reliable layer between the tools you already use, moving the right information and prompting the right action without more copy-paste.',
    shape: 'Integration and automation',
    move: 'Systems and handoff audit'
  },
  product: {
    number: '04',
    title: 'First useful release',
    copy: 'A deliberately scoped product that solves one valuable job end to end, so it can reach real users and improve from evidence.',
    shape: 'Product MVP',
    move: 'Outcome and release framing'
  }
};

const finder = document.querySelector('[data-finder]');
if (finder) {
  const options = [...finder.querySelectorAll('[data-finder-option]')];
  const result = {
    number: finder.querySelector('[data-finder-number]'),
    title: finder.querySelector('[data-finder-title]'),
    copy: finder.querySelector('[data-finder-copy]'),
    shape: finder.querySelector('[data-finder-shape]'),
    move: finder.querySelector('[data-finder-move]'),
    link: finder.querySelector('[data-finder-link]')
  };

  options.forEach((option) => {
    option.addEventListener('click', () => {
      const key = option.dataset.finderOption;
      const data = finderData[key];
      if (!data) return;

      options.forEach((item) => {
        const active = item === option;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });

      Object.entries(result).forEach(([field, node]) => {
        if (!node || field === 'link') return;
        node.animate(
          [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 280, easing: 'ease-out' }
        );
        node.textContent = data[field];
      });
      result.link.href = resolveSiteHref(`/start/?goal=${key}`);
    });
  });
}

const accordion = document.querySelector('[data-accordion]');
if (accordion) {
  accordion.addEventListener('toggle', (event) => {
    const opened = event.target;
    if (!(opened instanceof HTMLDetailsElement) || !opened.open) return;
    accordion.querySelectorAll('details').forEach((detail) => {
      if (detail !== opened) detail.open = false;
    });
  }, true);
}

const briefForm = document.querySelector('[data-brief-form]');
const briefResult = document.querySelector('[data-brief-result]');

if (briefForm && briefResult) {
  const steps = [...briefForm.querySelectorAll('[data-step]')];
  const progressLabel = document.querySelector('[data-progress-label]');
  const progressBar = document.querySelector('[data-progress-bar]');
  const output = briefResult.querySelector('[data-brief-output]');
  const copyButton = briefResult.querySelector('[data-copy-brief]');
  const copyLabel = briefResult.querySelector('[data-copy-label]');
  const downloadButton = briefResult.querySelector('[data-download-brief]');
  const emailLink = briefResult.querySelector('[data-email-brief]');
  const editButton = briefResult.querySelector('[data-edit-brief]');
  let currentStep = 0;
  let generatedBrief = '';

  const goalMap = {
    launch: 'Launch or rebuild a public website',
    admin: 'Replace a manual internal workflow',
    tools: 'Connect tools and automate handoffs',
    product: 'Shape and ship a new digital product'
  };

  const requestedGoal = new URLSearchParams(window.location.search).get('goal');
  if (requestedGoal && goalMap[requestedGoal]) {
    const goalInput = briefForm.querySelector(`input[name="goal"][value="${goalMap[requestedGoal]}"]`);
    if (goalInput) goalInput.checked = true;
  }

  function setStep(index, focus = true) {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => {
      step.hidden = stepIndex !== currentStep;
    });
    if (progressLabel) progressLabel.textContent = `${String(currentStep + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
    if (progressBar) progressBar.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
    if (focus) {
      steps[currentStep].querySelector('input, select, textarea, button')?.focus({ preventScroll: true });
      steps[currentStep].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function stepIsValid(step) {
    const requiredFields = [...step.querySelectorAll('[required]')];
    for (const field of requiredFields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        field.focus();
        return false;
      }
    }
    return true;
  }

  briefForm.addEventListener('click', (event) => {
    const next = event.target.closest('[data-next]');
    const back = event.target.closest('[data-back]');
    if (next) {
      if (stepIsValid(steps[currentStep])) setStep(currentStep + 1);
    }
    if (back) setStep(currentStep - 1);
  });

  briefForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!stepIsValid(steps[currentStep])) return;

    const data = new FormData(briefForm);
    const pressures = data.getAll('pressure');
    const createdAt = new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date());
    generatedBrief = [
      'RADISH LABS / PROJECT BRIEF',
      '============================',
      `Created: ${createdAt}`,
      '',
      'CONTACT',
      `Name: ${data.get('name')}`,
      `Company / project: ${data.get('company')}`,
      `Email: ${data.get('email')}`,
      '',
      'THE JOB',
      String(data.get('goal')),
      '',
      'WHY NOW',
      ...(pressures.length ? pressures.map((item) => `- ${item}`) : ['- No specific pressure selected']),
      '',
      'EDGES',
      `Timing: ${data.get('timing')}`,
      `Investment shape: ${data.get('budget')}`,
      '',
      'CURRENT REALITY',
      String(data.get('context')).trim(),
      '',
      'FIRST WORKING QUESTION',
      'What is the smallest useful release that changes this situation end to end?',
      '',
      'Generated locally at Radish Labs. Nothing in this brief was transmitted.'
    ].join('\n');

    output.textContent = generatedBrief;
    emailLink.href = `mailto:?subject=${encodeURIComponent(`Project brief — ${data.get('company')}`)}&body=${encodeURIComponent(generatedBrief)}`;
    briefForm.hidden = true;
    briefResult.hidden = false;
    briefResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  editButton?.addEventListener('click', () => {
    briefResult.hidden = true;
    briefForm.hidden = false;
    setStep(currentStep, false);
    briefForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  copyButton?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(generatedBrief);
      if (copyLabel) copyLabel.textContent = 'copied';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(output);
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges();
      if (copyLabel) copyLabel.textContent = 'copied';
    }
    window.setTimeout(() => {
      if (copyLabel) copyLabel.textContent = 'to clipboard';
    }, 1800);
  });

  downloadButton?.addEventListener('click', () => {
    const company = String(new FormData(briefForm).get('company') || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const url = URL.createObjectURL(new Blob([generatedBrief], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `radish-labs-brief-${company || 'project'}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  });

  setStep(0, false);
}

const northlineDemo = document.querySelector('[data-northline-demo]');
if (northlineDemo) {
  const form = northlineDemo.querySelector('[data-northline-form]');
  const stage = northlineDemo.querySelector('[data-northline-stage]');
  const spec = northlineDemo.querySelector('[data-northline-spec]');
  const specOutput = northlineDemo.querySelector('[data-spec-output]');
  const specReference = northlineDemo.querySelector('[data-spec-reference]');
  const copyLabel = northlineDemo.querySelector('[data-spec-copy-label]');
  const sizeData = {
    compact: { area: 28, base: 52000, weeks: 10, width: '6.8 M', depth: '4.1 M', mainArea: 15 },
    standard: { area: 42, base: 68000, weeks: 12, width: '8.4 M', depth: '5.0 M', mainArea: 24 },
    extended: { area: 58, base: 92000, weeks: 15, width: '10.6 M', depth: '5.5 M', mainArea: 34 }
  };
  const useData = {
    studio: { price: 0, letter: 'S', label: 'OPEN STUDIO' },
    retail: { price: 8500, letter: 'R', label: 'RETAIL FLOOR' },
    workshop: { price: 11000, letter: 'W', label: 'WORKSHOP' }
  };
  const moduleData = {
    kitchen: { price: 14800, weeks: .5, letter: 'K', label: 'Kitchen module' },
    washroom: { price: 18600, weeks: 1.5, letter: 'W', label: 'Washroom module' },
    storage: { price: 6200, weeks: 0, letter: 'S', label: 'Storage wall' },
    solar: { price: 11400, weeks: 2, letter: 'P', label: 'Solar pack' }
  };
  const finishData = {
    essential: { price: 0, letter: 'E', energy: '5.8 / 10', label: 'Essential' },
    plus: { price: 7000, letter: 'P', energy: '7.2 / 10', label: 'Plus' },
    performance: { price: 17000, letter: 'X', energy: '9.1 / 10', label: 'Performance' }
  };
  let latestConfiguration = null;

  function formatMoney(value) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }

  function readNorthlineConfiguration() {
    const data = new FormData(form);
    const sizeKey = data.get('size');
    const useKey = data.get('use');
    const finishKey = data.get('finish');
    const modules = data.getAll('module');
    const size = sizeData[sizeKey];
    const use = useData[useKey];
    const finish = finishData[finishKey];
    const modulePrice = modules.reduce((total, key) => total + moduleData[key].price, 0);
    const moduleWeeks = modules.reduce((total, key) => total + moduleData[key].weeks, 0);
    const price = size.base + use.price + finish.price + modulePrice;
    const weekStart = Math.ceil(size.weeks + moduleWeeks);
    const codeModules = modules.map((key) => moduleData[key].letter).join('') || 'N';
    const code = `NL–${size.area}${use.letter}–${codeModules}–${finish.letter}`;
    const constrained = sizeKey === 'compact' && modules.includes('kitchen') && modules.includes('washroom') && modules.includes('storage');
    return { sizeKey, useKey, finishKey, modules, size, use, finish, price, weekStart, code, constrained };
  }

  function updateNorthline() {
    const config = readNorthlineConfiguration();
    latestConfiguration = config;
    stage.dataset.size = config.sizeKey;
    stage.dataset.use = config.useKey;
    northlineDemo.querySelector('[data-northline-code]').textContent = config.code;
    northlineDemo.querySelector('[data-plan-width]').textContent = config.size.width;
    northlineDemo.querySelector('[data-plan-depth]').textContent = config.size.depth;
    northlineDemo.querySelector('[data-main-label]').textContent = config.use.label;
    northlineDemo.querySelector('[data-main-area]').textContent = `${config.size.mainArea} M²`;
    northlineDemo.querySelector('[data-northline-price]').textContent = formatMoney(config.price);
    northlineDemo.querySelector('[data-quote-area]').textContent = `${config.size.area} m²`;
    northlineDemo.querySelector('[data-quote-weeks]').textContent = `${config.weekStart}–${config.weekStart + 2} weeks`;
    northlineDemo.querySelector('[data-quote-energy]').textContent = config.finish.energy;
    northlineDemo.querySelector('[data-quote-count]').textContent = `${3 + config.modules.length} decisions`;
    northlineDemo.querySelectorAll('[data-module-zone]').forEach((zone) => {
      zone.hidden = !config.modules.includes(zone.dataset.moduleZone);
    });
    const constraintMessage = northlineDemo.querySelector('[data-constraint-message]');
    const constraintStatus = northlineDemo.querySelector('[data-constraint-status]');
    if (config.constrained) {
      constraintMessage.textContent = 'Compact footprint cannot retain full circulation with kitchen, washroom, and storage selected.';
      constraintStatus.textContent = 'REVIEW / 2 CONFLICTS';
      constraintStatus.style.color = 'var(--red)';
    } else {
      constraintMessage.textContent = `${config.modules.length || 'No'} service modules fit the ${config.size.area} m² footprint. Primary circulation remains accessible.`;
      constraintStatus.textContent = 'PASS / 12 RULES';
      constraintStatus.style.color = '';
    }
    spec.hidden = true;
  }

  form.addEventListener('change', updateNorthline);
  northlineDemo.querySelectorAll('[data-plan-view]').forEach((button) => {
    button.addEventListener('click', () => {
      northlineDemo.querySelectorAll('[data-plan-view]').forEach((item) => item.classList.toggle('is-active', item === button));
      stage.dataset.view = button.dataset.planView;
    });
  });

  northlineDemo.querySelector('[data-generate-spec]').addEventListener('click', () => {
    const config = latestConfiguration || readNorthlineConfiguration();
    const moduleList = config.modules.length ? config.modules.map((key) => `- ${moduleData[key].label}`).join('\n') : '- No service modules selected';
    const reference = `SPEC / ${config.code}`;
    specReference.textContent = reference;
    specOutput.textContent = [
      'NORTHLINE / PRELIMINARY BUILD SPECIFICATION',
      '===========================================',
      `Configuration: ${config.code}`,
      `Footprint: ${config.size.area} m² (${config.size.width} × ${config.size.depth})`,
      `Primary use: ${config.use.label}`,
      `Finish system: ${config.finish.label}`,
      '',
      'SERVICE MODULES',
      moduleList,
      '',
      'COMMERCIAL MODEL / ILLUSTRATIVE',
      `Estimated build: ${formatMoney(config.price)} ex tax`,
      `Estimated window: ${config.weekStart}–${config.weekStart + 2} weeks`,
      `Energy target: ${config.finish.energy}`,
      '',
      'CONSTRAINT RESULT',
      config.constrained ? 'REVIEW REQUIRED — circulation conflicts detected.' : 'PASS — 12 configuration rules satisfied.',
      '',
      'Concept data only. Not a commercial quotation.'
    ].join('\n');
    spec.hidden = false;
  });

  northlineDemo.querySelector('[data-close-spec]').addEventListener('click', () => {
    spec.hidden = true;
  });

  northlineDemo.querySelector('[data-copy-spec]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(specOutput.textContent);
      copyLabel.textContent = 'copied';
    } catch {
      copyLabel.textContent = 'select text above';
    }
    window.setTimeout(() => { copyLabel.textContent = 'to clipboard'; }, 1600);
  });

  updateNorthline();
}

const atlasDemo = document.querySelector('[data-atlas-demo]');
if (atlasDemo) {
  const missions = {
    'cold-chain': { id: 'FS–2047', title: 'Cold-chain sensor fault', location: 'Docklands Distribution / Bay 04', priority: 'critical', priorityLabel: 'CRITICAL', team: 'Team 07 / I. Malik', skill: 'Refrigeration L3', states: ['Dispatched', 'En route', 'On site', 'Resolved'], state: 0, sla: '00:46', eta: '18 MIN', distance: '6.4 KM / LIGHT TRAFFIC' },
    lift: { id: 'FS–2039', title: 'Lift safety inspection', location: 'North Quarter / Tower 12', priority: 'high', priorityLabel: 'HIGH', team: 'Team 03 / E. Chen', skill: 'Vertical transport L2', states: ['Assigned', 'En route', 'Inspecting', 'Certified'], state: 0, sla: '01:18', eta: '31 MIN', distance: '11.8 KM / MODERATE TRAFFIC' },
    power: { id: 'FS–2034', title: 'Power relay replacement', location: 'East Market / Substation E2', priority: 'high', priorityLabel: 'HIGH', team: 'Team 11 / R. Okafor', skill: 'Electrical L3', states: ['Parts ready', 'En route', 'Isolated', 'Restored'], state: 0, sla: '01:42', eta: '42 MIN', distance: '17.3 KM / MODERATE TRAFFIC' },
    access: { id: 'FS–2028', title: 'Access control recalibration', location: 'Civic South / Hall C', priority: 'normal', priorityLabel: 'NORMAL', team: 'Team 02 / S. Patel', skill: 'Security systems L2', states: ['Scheduled', 'En route', 'Calibrating', 'Verified'], state: 0, sla: '03:12', eta: '26 MIN', distance: '9.1 KM / LIGHT TRAFFIC' },
    water: { id: 'FS–2021', title: 'Pressure loss investigation', location: 'West Foundry / Line 08', priority: 'critical', priorityLabel: 'CRITICAL', team: 'Team 09 / J. Reyes', skill: 'Hydraulics L3', states: ['Escalated', 'En route', 'Testing', 'Stabilized'], state: 0, sla: '00:58', eta: '24 MIN', distance: '8.7 KM / HEAVY TRAFFIC' }
  };
  let selectedMission = 'cold-chain';
  let optimized = false;

  function prependAtlasEvent(message) {
    const time = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
    const event = document.createElement('p');
    event.innerHTML = `<time>${time}</time> ${message}`;
    const feed = atlasDemo.querySelector('[data-atlas-events]');
    feed.prepend(event);
    while (feed.children.length > 6) feed.lastElementChild.remove();
  }

  function renderAtlasMission(key) {
    const mission = missions[key];
    selectedMission = key;
    atlasDemo.querySelectorAll('[data-mission]').forEach((button) => button.classList.toggle('is-selected', button.dataset.mission === key));
    atlasDemo.querySelectorAll('[data-route]').forEach((route) => { route.toggleAttribute('hidden', route.dataset.route !== key); });
    atlasDemo.querySelector('[data-atlas-id]').textContent = mission.id;
    atlasDemo.querySelector('[data-atlas-title]').textContent = mission.title;
    atlasDemo.querySelector('[data-atlas-location]').textContent = mission.location;
    atlasDemo.querySelector('[data-atlas-team]').textContent = mission.team;
    atlasDemo.querySelector('[data-atlas-skill]').textContent = mission.skill;
    atlasDemo.querySelector('[data-atlas-status]').textContent = mission.states[mission.state];
    atlasDemo.querySelector('[data-atlas-sla-time]').textContent = mission.sla;
    atlasDemo.querySelector('[data-atlas-eta]').textContent = mission.eta;
    atlasDemo.querySelector('[data-atlas-distance]').textContent = mission.distance;
    const priority = atlasDemo.querySelector('[data-atlas-priority]');
    priority.textContent = mission.priorityLabel;
    priority.className = `mission-priority ${mission.priority}`;
    atlasDemo.querySelectorAll('[data-atlas-check]').forEach((check) => { check.checked = mission.state > 1; });
    const advance = atlasDemo.querySelector('[data-atlas-advance]');
    advance.disabled = mission.state === mission.states.length - 1;
    advance.firstChild.textContent = mission.state === mission.states.length - 1 ? 'Mission complete ' : 'Advance mission ';
  }

  atlasDemo.querySelector('[data-atlas-list]').addEventListener('click', (event) => {
    const mission = event.target.closest('[data-mission]');
    if (mission) renderAtlasMission(mission.dataset.mission);
  });

  atlasDemo.querySelector('[data-atlas-filter]').addEventListener('click', (event) => {
    const button = event.currentTarget;
    const active = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(active));
    atlasDemo.querySelectorAll('[data-mission]').forEach((mission) => {
      mission.hidden = active && mission.dataset.priority !== 'critical';
    });
  });

  atlasDemo.querySelector('[data-atlas-advance]').addEventListener('click', () => {
    const mission = missions[selectedMission];
    if (mission.state >= mission.states.length - 1) return;
    mission.state += 1;
    prependAtlasEvent(`${mission.id} advanced to ${mission.states[mission.state].toLowerCase()}.`);
    renderAtlasMission(selectedMission);
  });

  atlasDemo.querySelector('[data-atlas-optimize]').addEventListener('click', (event) => {
    if (optimized) return;
    optimized = true;
    event.currentTarget.firstChild.textContent = 'Board optimized ';
    atlasDemo.querySelector('[data-atlas-risk]').textContent = '01';
    atlasDemo.querySelector('[data-atlas-risk-copy]').textContent = '2 SLA conflicts recovered';
    atlasDemo.querySelector('[data-atlas-capacity]').textContent = '84%';
    atlasDemo.querySelector('[data-atlas-sla]').textContent = '96.1%';
    atlasDemo.querySelector('[data-atlas-optimization]').textContent = '2 teams reassigned / 19 min recovered';
    missions['cold-chain'].eta = '12 MIN';
    missions['cold-chain'].distance = '5.8 KM / PRIORITY CORRIDOR';
    missions.water.eta = '19 MIN';
    prependAtlasEvent('Board optimization recovered two critical SLA windows.');
    renderAtlasMission(selectedMission);
  });

  renderAtlasMission(selectedMission);
}

const relayDemo = document.querySelector('[data-relay-demo]');
if (relayDemo) {
  const scenarios = {
    onboarding: {
      name: 'CLIENT ONBOARDING', version: 'VERSION 3.8 / 5 ACTIVE RULES', duration: '2.8 S', manual: '7 actions', exceptions: '0',
      stages: [
        ['Contract signed', 'Listen for a verified signature event.', 'Signature webhook', 'Signer + value valid', 'Accepted', 'Verified contract event received'],
        ['Validate terms', 'Check owner, value, dates, and service rules.', '$84,000 / 12 months', 'Required terms complete', '12 rules passed', 'Commercial terms validated'],
        ['Route approval', 'Apply threshold and exception policy.', '$84,000 total value', 'Director review above $75k', 'Approval recorded', 'Director approval attached'],
        ['Build workspace', 'Provision project, tasks, files, and access.', 'Service plan / Growth', 'Template v6.2', '6 tasks created', 'Delivery workspace provisioned'],
        ['Coordinate launch', 'Send tailored client and team updates.', 'Owner + client contacts', 'Channel policy / launch', '3 notifications sent', 'Client and delivery team coordinated']
      ]
    },
    change: {
      name: 'HIGH-VALUE CHANGE REQUEST', version: 'VERSION 2.4 / 7 ACTIVE RULES', duration: '3.1 S', manual: '9 actions', exceptions: '1',
      stages: [
        ['Change submitted', 'Capture scope, impact, and requested date.', 'CR–1904 / portal', 'Required evidence attached', 'Accepted', 'Change request normalized'],
        ['Estimate impact', 'Calculate cost, timeline, and dependency exposure.', '+$18,600 / +9 days', 'Margin floor + capacity', 'Impact model complete', 'Commercial and delivery impact calculated'],
        ['Route approval', 'Send the exception to the accountable owner.', 'Margin below target', 'Finance + delivery review', 'Approval required', 'Human review created with full context'],
        ['Revise plan', 'Version scope, milestones, and commercial record.', 'Approved change set', 'Plan version policy', 'Version 14 created', 'Project and billing plans revised'],
        ['Coordinate parties', 'Issue precise updates to everyone affected.', '5 affected stakeholders', 'Audience + disclosure rules', 'Updates queued', 'Stakeholder-specific updates prepared']
      ]
    },
    payment: {
      name: 'PAYMENT EXCEPTION', version: 'VERSION 5.1 / 8 ACTIVE RULES', duration: '2.5 S', manual: '6 actions', exceptions: '1',
      stages: [
        ['Exception received', 'Listen for a failed or disputed payment.', 'Invoice INV–4821', 'Provider event verified', 'Accepted', 'Payment exception received'],
        ['Classify failure', 'Separate retryable, disputed, and invalid states.', 'Code 51 / retryable', 'Provider + account rules', 'Retry path selected', 'Failure classified without manual review'],
        ['Protect account', 'Apply the least disruptive safe action.', '$12,400 outstanding', 'Grace period under $15k', 'Access retained', 'Account protected within policy'],
        ['Create recovery', 'Schedule retry and assign exception ownership.', 'Retry in 48 hours', 'Recovery playbook 03', 'Plan created', 'Recovery task and retry scheduled'],
        ['Notify precisely', 'Send only the information each party needs.', 'Client + finance owner', 'Sensitive-data policy', '2 notices queued', 'Controlled notifications prepared']
      ]
    }
  };
  let relayToken = 0;
  let relayRunning = false;

  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  const relayStages = [...relayDemo.querySelectorAll('[data-relay-stage]')];
  const relayConnectors = [...relayDemo.querySelectorAll('.flow-connector')];

  function addRelayLog(message, type = 'EVENT') {
    const log = relayDemo.querySelector('[data-relay-log]');
    const empty = log.querySelector('.log-empty');
    if (empty) empty.remove();
    const item = document.createElement('p');
    const time = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
    item.innerHTML = `<span>${time} / ${type}</span>${message}`;
    log.prepend(item);
  }

  function renderRelayScenario() {
    const key = relayDemo.querySelector('[data-relay-scenario]').value;
    const scenario = scenarios[key];
    relayDemo.querySelector('[data-relay-flow-name]').textContent = scenario.name;
    relayDemo.querySelector('[data-relay-version]').textContent = scenario.version;
    relayStages.forEach((stage, index) => {
      const data = scenario.stages[index];
      stage.querySelector('[data-relay-stage-title]').textContent = data[0];
      stage.querySelector('[data-relay-stage-copy]').textContent = data[1];
    });
    resetRelay(true);
  }

  function resetRelay(clearLog = true) {
    relayToken += 1;
    relayRunning = false;
    relayStages.forEach((stage, index) => {
      stage.classList.remove('is-running', 'is-complete', 'is-paused');
      stage.querySelector('[data-relay-stage-state]').textContent = index === 0 ? 'READY' : 'WAITING';
    });
    relayConnectors.forEach((connector) => connector.classList.remove('is-complete'));
    relayDemo.querySelector('[data-relay-run]').disabled = false;
    relayDemo.querySelector('[data-relay-run]').firstChild.textContent = 'Run workflow ';
    relayDemo.querySelector('[data-relay-run-status]').textContent = 'IDLE';
    relayDemo.querySelector('[data-relay-inspector-title]').textContent = 'Ready to run';
    relayDemo.querySelector('[data-relay-inspector-copy]').textContent = 'Select a scenario and run the workflow to inspect each decision as it happens.';
    relayDemo.querySelector('[data-relay-input]').textContent = '—';
    relayDemo.querySelector('[data-relay-rule-output]').textContent = '—';
    relayDemo.querySelector('[data-relay-result]').textContent = '—';
    relayDemo.querySelector('[data-relay-outcome]').hidden = true;
    if (clearLog) relayDemo.querySelector('[data-relay-log]').innerHTML = '<p class="log-empty">Run the workflow to produce an explainable event trace.</p>';
  }

  async function runRelay() {
    if (relayRunning) return;
    resetRelay(true);
    relayRunning = true;
    const token = relayToken;
    const key = relayDemo.querySelector('[data-relay-scenario]').value;
    const scenario = scenarios[key];
    const approvalEnabled = relayDemo.querySelector('[data-relay-rule="approval"]').checked;
    const notificationEnabled = relayDemo.querySelector('[data-relay-rule="notify"]').checked;
    const auditEnabled = relayDemo.querySelector('[data-relay-rule="audit"]').checked;
    const runButton = relayDemo.querySelector('[data-relay-run]');
    runButton.disabled = true;
    runButton.firstChild.textContent = 'Workflow running ';
    relayDemo.querySelector('[data-relay-run-status]').textContent = 'RUNNING';
    addRelayLog(`${scenario.name.toLowerCase()} run started.`, 'START');

    for (let index = 0; index < relayStages.length; index += 1) {
      if (token !== relayToken) return;
      const stage = relayStages[index];
      const data = scenario.stages[index];
      stage.classList.add('is-running');
      stage.querySelector('[data-relay-stage-state]').textContent = 'RUNNING';
      relayDemo.querySelector('[data-relay-inspector-title]').textContent = data[0];
      relayDemo.querySelector('[data-relay-inspector-copy]').textContent = data[5];
      relayDemo.querySelector('[data-relay-input]').textContent = data[2];
      relayDemo.querySelector('[data-relay-rule-output]').textContent = data[3];
      relayDemo.querySelector('[data-relay-result]').textContent = 'Evaluating…';
      addRelayLog(data[5]);
      await wait(420);

      if (index === 2 && approvalEnabled) {
        stage.classList.remove('is-running');
        stage.classList.add('is-paused');
        stage.querySelector('[data-relay-stage-state]').textContent = 'HUMAN CHECK';
        relayDemo.querySelector('[data-relay-result]').textContent = 'Approval captured';
        addRelayLog('Accountable owner approval simulated and attached.', 'APPROVAL');
        await wait(520);
        stage.classList.remove('is-paused');
      } else if (index === 4 && !notificationEnabled) {
        relayDemo.querySelector('[data-relay-result]').textContent = 'External notice skipped';
        addRelayLog('Client notification disabled by current safeguard settings.', 'SKIP');
      } else {
        relayDemo.querySelector('[data-relay-result]').textContent = data[4];
      }

      stage.classList.remove('is-running');
      stage.classList.add('is-complete');
      stage.querySelector('[data-relay-stage-state]').textContent = 'COMPLETE';
      if (relayConnectors[index]) relayConnectors[index].classList.add('is-complete');
      await wait(180);
    }

    if (token !== relayToken) return;
    relayRunning = false;
    relayDemo.querySelector('[data-relay-run-status]').textContent = 'COMPLETE';
    runButton.disabled = false;
    runButton.firstChild.textContent = 'Run again ';
    const outcome = relayDemo.querySelector('[data-relay-outcome]');
    relayDemo.querySelector('[data-relay-duration]').textContent = scenario.duration;
    relayDemo.querySelector('[data-relay-manual]').textContent = scenario.manual;
    relayDemo.querySelector('[data-relay-exceptions]').textContent = scenario.exceptions;
    relayDemo.querySelector('[data-relay-outcome-copy]').textContent = `5 stages completed. ${auditEnabled ? 'Full audit written.' : 'Audit disabled for this sandbox run.'}`;
    outcome.hidden = false;
    addRelayLog('Workflow completed without an unhandled exception.', 'COMPLETE');
  }

  relayDemo.querySelector('[data-relay-scenario]').addEventListener('change', renderRelayScenario);
  relayDemo.querySelector('[data-relay-run]').addEventListener('click', runRelay);
  relayDemo.querySelector('[data-relay-reset]').addEventListener('click', () => resetRelay(true));
  renderRelayScenario();
}
