const timeline = document.querySelector('.timeline');
const projectsGrid = document.querySelector('.projects-grid');
const _timelineItems = [];
const _projectCards = [];

function formatMonth(value, lang) {
  if (!value) return translations[lang]['exp.present'];
  const [year, month] = value.split('-').map(Number);
  return `${translations[lang]['exp.months'][month - 1]} ${year}`;
}

function renderExperience(lang) {
  if (!timeline || typeof experience === 'undefined') return;

  if (_timelineItems.length === 0) {
    experience.forEach(job => {
      const item = el('div', 'timeline-item');
      const refs = {
        date: el('p', 'entry-date'),
        role: el('h3', 'entry-title'),
        org: el('p', 'entry-org'),
        location: el('p', 'timeline-location'),
        desc: el('div', 'entry-desc'),
      };
      refs.org.textContent = job.company;
      item.append(refs.date, refs.role, refs.org, refs.location, refs.desc);
      timeline.append(item);
      _timelineItems.push({ job, refs });
    });
  }

  _timelineItems.forEach(({ job, refs }) => {
    refs.date.textContent = `${formatMonth(job.start, lang)} — ${formatMonth(job.end, lang)}`;
    refs.role.textContent = job.role?.[lang] ?? translations[lang]['exp.job.title'];
    refs.location.textContent = job.location[lang];
    refs.desc.replaceChildren(...job.desc[lang].map(text => {
      const p = el('p');
      p.textContent = text;
      return p;
    }));
  });
}

function projectLink(href, className, i18nKey) {
  const a = el('a', `project-link ${className}`);
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.dataset.i18n = i18nKey;
  return a;
}

function renderProjects(lang) {
  if (!projectsGrid || typeof projects === 'undefined') return;

  if (_projectCards.length === 0) {
    projects.forEach(project => {
      const card = el('div', 'project-card');
      if (project.maintenance) {
        card.classList.add('warning-tape');
        card.dataset.tapeI18n = 'tape.maintenance';
      }

      const thumb = el('div', 'project-thumb');
      const img = el('img');
      Object.assign(img, { src: `assets/img/projects/${project.slug}.webp`, width: 1280, height: 720, loading: 'lazy', decoding: 'async' });
      img.dataset.title = project.name;
      const placeholder = el('span', 'placeholder');
      placeholder.dataset.i18n = 'project.placeholder';
      thumb.append(img, placeholder);

      const body = el('div', 'project-body');
      const title = el('h3', 'entry-title');
      title.textContent = project.name;
      if (project.updated) {
        const badge = el('span', 'badge badge-accent');
        badge.dataset.i18n = 'badge.updated';
        title.append(' ', badge);
      }
      const desc = el('p', 'entry-desc');
      const links = el('div', 'project-links');
      links.append(
        projectLink(`https://richard-tavares.github.io/${project.slug}`, 'project-link-demo', 'project.demo'),
        projectLink(`https://github.com/richard-tavares/${project.slug}`, 'project-link-repo', 'project.code'),
      );
      body.append(title, desc, links);

      card.append(thumb, body);
      projectsGrid.append(card);
      _projectCards.push({ project, img, desc });
    });
  }

  _projectCards.forEach(({ project, img, desc }) => {
    img.alt = project.alt[lang];
    desc.textContent = project.desc[lang];
  });
}
