import onChange from 'on-change';

// TODO combine renderFeeds and renderPosts

const renderInitContent = (elements, i18nInstance) => {
  const {
    mainTitle,
    slogan,
    label,
    submitBtn,
    sample,
  } = elements;

  mainTitle.textContent = i18nInstance.t('main_title');
  slogan.textContent = i18nInstance.t('slogan');
  label.textContent = i18nInstance.t('rssForm.label');
  submitBtn.textContent = i18nInstance.t('rssForm.submit');
  sample.textContent = i18nInstance.t('sample');
};

const handleProcessState = (elements, processState) => {
  const { form, input, submitBtn } = elements;
  switch (processState) {
    case 'loading':
      submitBtn.disabled = true;
      break;

    case 'loaded':
      form.reset();
      input.focus();
      break;

    case 'initialized':
    case 'spying':
      break;

    case 'parser_error':
    case 'network_error':
      submitBtn.disabled = false;
      break;

    default:
      throw new Error(`Unknown process state "${processState}"`);
  }
};

const handleFormProcessState = (elements, formProcessState) => {
  const { input, submitBtn } = elements;
  switch (formProcessState) {
    case 'filling':
      submitBtn.disabled = false;
      break;

    case 'validating':
      submitBtn.disabled = true;
      break;

    case 'validated':
      submitBtn.disabled = false;
      input.classList.remove('is-invalid');
      break;

    case 'invalidated':
      submitBtn.disabled = false;
      input.classList.add('is-invalid');
      break;

    default:
      throw new Error(`Unknown form process state "${formProcessState}"`);
  }
};

const renderFeedback = (elements, value, i18nInstance) => {
  const { feedback } = elements;

  feedback.textContent = i18nInstance.t(value);

  switch (value) {
    case 'feedback.success':
      feedback.classList.replace('text-danger', 'text-success');
      break;

    case 'feedback.errors.empty_field':
    case 'feedback.errors.duplicate':
    case 'feedback.errors.invalid_url':
    case 'feedback.errors.network':
    case 'feedback.errors.parser':
      feedback.classList.replace('text-success', 'text-danger');
      break;

    default:
      throw new Error(`Unknown feedback code "${value}"`);
  }
};

const renderFeeds = (elements, values, i18nInstance) => {
  const { feeds } = elements;
  const div1 = document.createElement('div');
  div1.classList.add('card', 'border-0');

  const div2 = document.createElement('div');
  div2.classList.add('card-body');

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nInstance.t('feeds');

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  values.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;

    li.append(h3, p);
    ul.prepend(li);
  });

  div2.append(h2);
  div1.append(div2, ul);
  feeds.innerHTML = '';
  feeds.append(div1);
};

const renderPosts = (elements, values, i18nInstance, watchedState) => {
  const { posts } = elements;

  const div1 = document.createElement('div');
  div1.classList.add('card', 'border-0');

  const div2 = document.createElement('div');
  div2.classList.add('card-body');

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nInstance.t('posts');

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  values.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    li.addEventListener('click', (ev) => {
      const { id } = ev.target.dataset;
      watchedState.uiState.readPostsId.push(id);
    });

    const a = document.createElement('a');
    a.classList.add('fw-bold');

    a.setAttribute('href', post.link);
    a.setAttribute('target', 'blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.dataset.id = post.id;
    a.textContent = post.title;

    const btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    btn.dataset.id = post.id;
    btn.dataset.bsToggle = 'modal';
    btn.dataset.bsTarget = '#modal';
    btn.textContent = i18nInstance.t('modal.view');

    btn.addEventListener('click', (ev) => {
      const { bsTarget } = ev.target.dataset;
      const modal = document.querySelector(bsTarget);
      const modalTitle = modal.querySelector('.modal-title');
      const modalBody = modal.querySelector('.modal-body');
      const modalFullArticleBtn = document.querySelector('.modal-footer a.full-article');
      const modalCloseBtn = document.querySelector('.modal-footer button');

      modalTitle.textContent = post.title;
      modalBody.textContent = post.description;
      modalFullArticleBtn.setAttribute('href', post.link);
      modalFullArticleBtn.textContent = i18nInstance.t('modal.full_article');
      modalCloseBtn.textContent = i18nInstance.t('modal.close');
    });

    li.append(a, btn);
    ul.prepend(li);
  });

  div2.append(h2);
  div1.append(div2, ul);
  posts.innerHTML = '';
  posts.append(div1);
};

const setLinkBrightness = (readPostsId) => {
  const anchors = document.querySelectorAll('.posts ul .list-group-item a');
  const readPostsIdColl = new Set(readPostsId);

  anchors.forEach((a) => {
    if (readPostsIdColl.has(a.dataset.id)) {
      a.classList.replace('fw-bold', 'fw-normal');
      a.classList.add('link-secondary');
    }
  });
};

export { renderInitContent };

export default (state, elements, i18nInstance) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'processState':
        handleProcessState(elements, value);
        break;

      case 'rssForm.processState':
        handleFormProcessState(elements, value);
        break;

      case 'uiState.feedback':
        renderFeedback(elements, value, i18nInstance);
        break;

      case 'uiState.readPostsId':
        setLinkBrightness(value);
        break;

      case 'data.feeds':
        renderFeeds(elements, value, i18nInstance);
        break;

      case 'data.posts':
        renderPosts(elements, value, i18nInstance, watchedState);
        setLinkBrightness(watchedState.uiState.readPostsId);
        break;

      case 'lng':
        break;

      case 'rssForm.link':
      case 'validatedLinks':
        break;

      default:
        throw new Error(`Unwatched path ${path}`);
    }
  });

  return watchedState;
};
