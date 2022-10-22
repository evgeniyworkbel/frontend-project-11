const handleProcessState = (elements, processState) => {
  const { form, input, submitBtn } = elements;
  switch (processState) {
    case 'filling':
      submitBtn.disabled = false;
      break;

    case 'validating':
      submitBtn.disabled = true;
      break;

    case 'loading':
      submitBtn.disabled = true;
      break;

    case 'loaded':
      submitBtn.disabled = false;
      input.style.border = null;
      form.reset();
      input.focus();
      break;

    case 'parser_error':
    case 'network_error':
    case 'invalidated':
      submitBtn.disabled = false;
      input.style.border = 'thick solid red';
      break;

    default:
      throw new Error(`Unknown process state "${processState}"`);
  }
};

const renderFeedback = (elements, value, i18nInstance) => {
  const { feedback } = elements;

  feedback.textContent = i18nInstance.t(value);

  switch (value) {
    case 'feedback.success':
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      break;

    case 'feedback.errors.duplicate':
    case 'feedback.errors.invalidUrl':
    case 'feedback.errors.network':
    case 'feedback.errors.parser':
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      break;

    default:
      console.log('Oops...');
      throw new Error(`Unknown feedback code "${value}"`);
  }
};

// think about function combination renderFeeds and renderPosts - they have a plenty of common code

const renderFeeds = (elements, value, i18nInstance) => {
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

  value.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;

    li.append(h3, p);
    ul.append(li);
  });

  div2.append(h2);
  div1.append(div2, ul);
  feeds.innerHTML = '';
  feeds.append(div1);
};

const renderPosts = (elements, value, i18nInstance) => {
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

  value.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const a = document.createElement('a');
    a.classList.add('fw-bold');
    a.setAttribute('href', post.link);
    a.setAttribute('target', 'blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.dataset.id = post.id;
    a.textContent = post.title;

    li.append(a);
    ul.append(li);
  });

  div2.append(h2);
  div1.append(div2, ul);
  posts.innerHTML = '';
  posts.append(div1);
};

export default (elements, i18nInstance) => (path, value) => {
  switch (path) {
    case 'rssForm.processState':
      handleProcessState(elements, value);
      break;

    case 'rssForm.feedback':
      renderFeedback(elements, value, i18nInstance);
      break;

    case 'data.feeds':
      renderFeeds(elements, value, i18nInstance);
      break;

    case 'data.posts':
      renderPosts(elements, value, i18nInstance);
      break;

    case 'lng':
      // add language change (in future)
      break;

    case 'rssForm.link':
    case 'urls':
    case 'rssForm.valid':
      break;

    default:
      throw new Error(`Unwatched path ${path}`);
  }
};
