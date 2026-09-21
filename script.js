const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.desktop-nav');

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  nav.classList.toggle('is-open', !isOpen);
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();

const projectDeck = document.querySelector('.project-deck');
if (projectDeck) {
  const openSourceCard = [...projectDeck.querySelectorAll('.work-card')].find((card) => card.querySelector('h3')?.textContent.includes('OpenCV'));
  if (openSourceCard) projectDeck.append(openSourceCard);

  const projectCards = [...projectDeck.querySelectorAll('.work-card')];
  let activeProject = 0;
  let reveal = 0;
  projectCards.forEach((card, index) => {
    const indexLabel = card.querySelector('.work-index');
    if (indexLabel) indexLabel.textContent = `${String(index + 1).padStart(2, '0')} / ${String(projectCards.length).padStart(2, '0')}`;
  });

  const resizeDeck = () => {
    const activeCard = projectCards[activeProject];
    if (activeCard) projectDeck.style.height = `${activeCard.offsetHeight + 90}px`;
  };

  const updateStack = () => {
    const stackX = 72 + reveal * 80;
    const stackY = -20 - reveal * 12;
    projectCards.forEach((card, cardIndex) => {
      const depth = (cardIndex - activeProject + projectCards.length) % projectCards.length;
      const offsetFactor = depth === 0 ? 0 : 1 + 1.8 * (1 - Math.pow(.62, depth - 1));
      card.classList.toggle('is-active', depth === 0);
      card.style.setProperty('--stack-x', `${depth === 0 ? -reveal * 24 : offsetFactor * stackX}px`);
      card.style.setProperty('--stack-y', `${depth * stackY}px`);
      card.style.setProperty('--stack-scale', `${Math.max(.84, 1 - depth * .035)}`);
      card.style.setProperty('--stack-opacity', `${depth === 0 ? 1 - reveal * .28 : Math.max(.2, 1 - depth * .14)}`);
      card.style.setProperty('--stack-rotate', `${depth === 0 ? -reveal * 2 : depth * 4 + reveal * 2}deg`);
      card.style.setProperty('--stack-depth', String(projectCards.length - depth));
      card.setAttribute('aria-hidden', depth === 0 ? 'false' : 'true');
    });
  };

  const setActiveProject = (index) => {
    const nextProject = (index + projectCards.length) % projectCards.length;
    const previousCard = projectCards[activeProject];
    const didChange = nextProject !== activeProject;
    if (didChange) previousCard?.classList.add('is-exiting');
    activeProject = nextProject;
    reveal = 0;
    updateStack();
    resizeDeck();
    if (didChange) window.setTimeout(() => previousCard?.classList.remove('is-exiting'), 460);
  };

  projectDeck.addEventListener('pointermove', (event) => {
    const bounds = projectDeck.getBoundingClientRect();
    const position = (event.clientX - bounds.left) / bounds.width;
    const nextReveal = Math.max(0, Math.min(1, (position - .58) / .42));
    if (Math.abs(nextReveal - reveal) > .02) {
      reveal = nextReveal;
      updateStack();
    }
  });
  projectDeck.addEventListener('pointerleave', () => { reveal = 0; updateStack(); });
  projectDeck.addEventListener('click', (event) => {
    const bounds = projectDeck.getBoundingClientRect();
    const activeBounds = projectCards[activeProject].getBoundingClientRect();
    const clickX = event.clientX - bounds.left;
    const clickZoneStart = activeBounds.right - bounds.left - activeBounds.width * .42;
    if (clickX >= clickZoneStart) setActiveProject(activeProject + 1);
  });
  window.addEventListener('resize', resizeDeck);
  setActiveProject(0);
}
