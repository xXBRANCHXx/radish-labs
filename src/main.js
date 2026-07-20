document.documentElement.classList.add('js');

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
      result.link.href = `/start/?goal=${key}`;
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
