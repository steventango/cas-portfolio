const progress_bar = new mdc.linearProgress.MDCLinearProgress(document.getElementById('progress_bar'));
const search_bar = new mdc.textField.MDCTextField(document.getElementById('search_bar'));

const img = new Image();
img.src = '/images/header.jpg';
img.addEventListener('load', () => {
  document.getElementById('parallax_header_img').style.backgroundImage = `url('${img.src}')`;
  document.getElementById('parallax_header_img').classList.remove('blur');
});

function search(text, key) {
  const query = text.toLowerCase().split(' ');
  let data = [];
  if (key === 'title') {
    reflections.forEach((reflection) => {
      if (query.every(chunk => reflection.title.toLowerCase().split(' ').some(part => part.startsWith(chunk)))) {
        data.push(reflection);
      }
    });
  } else {
    data = reflections.filter(reflection => reflection.experience && reflection.experience.toLowerCase() === text);
  }
  if (data.length < 1) {
    data.push({
      title: key === 'title' ? 'No Search Results Found' : 'No Reflections Found For This Experience'
    });
  }
  location.hash = key === 'title' ? 'search' : 'experience' + '-' + escape(text);
  render(data, key === 'title' ? `Search results for "${text}"` : data[0].experience || 'Invalid Experience');
  window.scrollTo({
    top: document.documentElement.clientHeight,
    behavior: 'smooth'
  });
}

search_bar.input_.addEventListener('keyup', (event) => {
  if (event.key == 'Enter') {
    const query = search_bar.input_.value;
    search(query);
  }
});

const top_app_bar = new mdc.topAppBar.MDCTopAppBar(document.getElementById('top_app_bar'));
top_app_bar.navIcon_.addEventListener('click', () => {
  if (top_app_bar.foundation_.isCollapsed_) {
    top_app_bar.foundation_.adapter_.removeClass('mdc-top-app-bar--short-collapsed');
    top_app_bar.foundation_.isCollapsed_ = false;
  } else {
    top_app_bar.foundation_.adapter_.addClass('mdc-top-app-bar--short-collapsed');
    top_app_bar.foundation_.isCollapsed_ = true;
  }
});
const night_mode_toggle = document.getElementById('night_mode_toggle');
night_mode_toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  night_mode_toggle.textContent = night_mode_toggle.textContent == 'brightness_2' ? 'brightness_5' : 'brightness_2';
});

const tab_bar = new mdc.tabBar.MDCTabBar(document.getElementById('tab_bar'));

function handleScroll() {
  var y = window.scrollY;
  if (y == 0) {
    top_app_bar.foundation_.adapter_.removeClass('mdc-top-app-bar--short-collapsed');
    top_app_bar.navIcon_.parentNode.style.display = 'none';
  } else {
    top_app_bar.foundation_.adapter_.addClass('mdc-top-app-bar--short-collapsed');
    top_app_bar.navIcon_.parentNode.style.display = 'flex';
    var percent = (document.documentElement.scrollTop || document.body.scrollTop) / ((document.documentElement.scrollHeight || document.body.scrollHeight) - document.documentElement.clientHeight);
    progress_bar.foundation_.setProgress(percent);
  }
}

window.addEventListener('scroll', handleScroll);
handleScroll();

function formatTimestamp(timestamp) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(timestamp));
}

function getDateString(dates) {
  var string = "";
  if (dates.length < 3) {
    string = `${formatTimestamp(dates[0])}${dates[1] ? ' and ' + formatTimestamp(dates[1]) : ''}`;
  } else {
    var continuedDate = null;
    string = formatTimestamp(dates[0]);
    for (let i = 1; i < dates.length; i++) {
      if (dates[i] - 86400000 > dates[i - 1]) {
        if (continuedDate) {
          string += ` - ${formatTimestamp(continuedDate)}`;
          continuedDate = null;
        }
        string += `, ${formatTimestamp(dates[i])}`;
      } else {
        continuedDate = dates[i];
      }
    }
    if (continuedDate) {
      string += ` - ${formatTimestamp(continuedDate)}`;
    }
  }
  return string;
}

let reflections = [];

async function retrieve() {
  if (reflections.length) return reflections;
  const data = await fetch('./reflections.json');
  const json = await data.json();
  reflections = json;
  return json;
}

retrieve();


function render(data, title, paragraph) {
  const articles = data
    .map(reflection => {
      const article = document.createElement('article');
      article.classList.add('mdc-card');
      const h1 = document.createElement('h1');
      h1.textContent = reflection.title;
      article.appendChild(h1);
      if (reflection.dates) {
        if (reflection.dates.length > 0 && !isNaN(reflection.dates[0])) {
          const h2 = document.createElement('h2');

          let dateString = getDateString(reflection.dates);

          h2.textContent = `${dateString} | ${reflection.hours} ${reflection.hours > 1 ? 'hours' : 'hour'} | ${reflection.type}`;
          article.appendChild(h2);
        }
      }
      if (reflection.outcomes) {
        const h3 = document.createElement('h3');
        h3.appendChild(document.createTextNode('Outcomes: '));
        h3.classList.add('outcomes');
        reflection.outcomes.map((outcome, index) => {
          const a = document.createElement('a');
          a.textContent = ` ${outcome}`;
          a.href = `#outcome-${outcome}`;
          h3.appendChild(a);
          h3.appendChild(document.createTextNode(' '));
        });
        article.appendChild(h3);
      }
      if (reflection.content) {
        const div = document.createElement('div');
        div.innerHTML = reflection.content;
        article.appendChild(div);
        if (reflection.content.includes('null')) {
          console.error(reflection.title + ` [${formatTimestamp(reflection.dates[0])}]` + ' is missing content');
        }
      }
      return article;
    });
  const main = document.getElementById('main');
  const h1 = document.createElement('h1');
  h1.textContent = title.charAt(0).toUpperCase() + title.slice(1);
  main.appendChild(h1);
  const h2a = document.createElement('h2');
  h2a.textContent = `${data[0].title == 'No Search Results Found' ? 0 : data.length} ${title.startsWith('Search') ? (data.length != 1 || data[0].title == 'No Search Results Found' ? 'results' : 'result') : 'reflections'}`;
  main.appendChild(h2a);
  if (paragraph) {
    const p = document.createElement('p');
    p.textContent = paragraph;
    main.appendChild(p);
  }
  if (["creativity", "activity", "service", "timeline"].indexOf(title) > -1) {
    const card = document.createElement('article'); 
    card.classList.add('mdc-card');
    const h2b = document.createElement('h2');
    h2b.textContent = "Experiences";
    card.appendChild(h2b);
    const ul = document.createElement('ul');
    ul.classList.add('mdc-list');
    const experiences = [... new Set(data.map(reflection => reflection.experience))].filter(Boolean).sort();
    for (index in experiences) {
      const experience = experiences[index];
      const a = document.createElement('a');
      a.href = '#experience-' + escape(experience.toLowerCase());
      const li = document.createElement('li');
      li.classList.add('mdc-list-item');
      li.tabIndex = index;
      li.dataset.mdcAutoInit = 'MDCRipple';
      const span1 = document.createElement('span');
      span1.classList.add('mdc-list-item__text');
      span1.textContent = experience;
      li.appendChild(span1);
      a.appendChild(li);
      ul.appendChild(a);
    }
    card.appendChild(ul)
    main.appendChild(card);
    mdc.autoInit(ul);
  }

  for (article of articles) {
    main.appendChild(article);
  }
  window.scrollTo({
    top: document.documentElement.clientHeight,
    behavior: 'smooth'
  });
}

let currentHash = '';

async function display() {
  const hash = location.hash.replace('#', '');
  if (hash != currentHash) {
    currentHash = hash;
    main.style.maxWidth = '600px';
    //show loading
    const reflections = await retrieve();
    while (main.firstChild) {
      main.removeChild(main.firstChild);
    }
    switch (hash) {
      case 'creativity':
      case 'activity':
      case 'service':
        render(reflections.filter(reflection => reflection.type == hash), hash);
        break;
      case 'timeline':
        render(reflections, hash);
        break;
      case 'incomplete':
        render(reflections.filter(reflection => !reflection.content || reflection.content.includes('null') || reflection.outcomes.length < 1 || !reflection.experience), hash);
        break;
      case 'outcomes':
        main.style.maxWidth = '800px';
        fetch('./outcomes.html')
          .then(data => data.text())
          .then(html => main.innerHTML = html)
          .then(() => mdc.autoInit(main))
          .then(() => {
            window.scrollTo({
              top: document.documentElement.clientHeight,
              behavior: 'smooth'
            });
          });
        break;
      case 'outcome-1':
      case 'outcome-2':
      case 'outcome-3':
      case 'outcome-4':
      case 'outcome-5':
      case 'outcome-6':
      case 'outcome-7':
        const selected_outcome = Number(hash.slice(hash.length - 1));
        render(reflections.filter(reflection => reflection.outcomes.some(outcome => outcome == selected_outcome)), `Outcome ${selected_outcome}`);
        window.scrollTo({
          top: document.documentElement.clientHeight,
          behavior: 'smooth'
        });
        break;
      case 'project':
        render(reflections.filter(reflection => reflection.type == 'project'), `CAS Project`, 'My CAS Project is a collaborative effort between us six grad 2020 executives to plan bonding event activities for the grade twelves who are graduating in 2019. This project involves the CAS strands of Creativity and Service and occured over the span of a month and a half.');
        break;
      case 'about':
        fetch('./about.html')
          .then(data => data.text())
          .then(html => main.innerHTML = html)
          .then(() => {
            const hours = {
              creativity: 0,
              activity: 0,
              service: 0,
              project: 0
            };
            reflections.forEach((reflection) => hours[reflection.type] += reflection.hours);
            //transfer project hours to creativity
            hours.creativity += hours.project;
            delete hours.project;
            const total = hours.creativity + hours.activity + hours.service;
            for (key in hours) {
              document.querySelector(`#cas-hours-distribution a[href="#${key}"] .mdc-list-item__secondary-text`).textContent = `${hours[key]} hours | ${(hours[key] / total * 100).toFixed(2)}%`;
            }
          })
          .then(() => mdc.autoInit(main))
          .then(() => {
            window.scrollTo({
              top: document.documentElement.clientHeight,
              behavior: 'smooth'
            });
          });
        break;
      case '':
        document.getElementById('main').innerHTML = 'Welcome to my International Baccalaureate CAS Portfolio Website! Thank you for joining me on my journey to to document my progress and journey throughout my CAS Experiences. Please click a link in the <a onclick="top_app_bar.foundation_.adapter_.removeClass(\'mdc-top-app-bar--short-collapsed\'); top_app_bar.foundation_.isCollapsed_ = false;">menu</a> to see my reflections.<br><br><br><br><br><br><br><br>';
        window.scrollTo({
          top: document.documentElement.clientHeight,
          behavior: 'smooth'
        });
        break;
      default:
        if (hash.startsWith('search-')) {
          search(unescape(hash.replace('search-', '')), 'title');
        } else if (hash.startsWith('experience-')) {
          search(unescape(hash.replace('experience-', '')), 'experience');
        } else {
          window.location.replace("/404.html");
        }
        break;
    }
  }
  //hide loading
}

window.addEventListener('hashchange', display);

display();
