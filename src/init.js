import * as yup from 'yup';

import i18next from 'i18next';
import axios from 'axios';
import watch, { renderInitContent } from './view.js';
import parse from './parser.js';
import resources from '../locales/index.js';
import generatorId from './generatorId.js';
import updatePosts from './updater.js';

// TODO bind updater to array of urls and make a single request
// TODO add change of language

const getYupSchema = (validatedLinks) => yup.string().required().url().notOneOf(validatedLinks);

const createProxy = (proxyBase, link) => {
  const href = new URL('/get', proxyBase);
  href.searchParams.append('disableCache', 'true');
  href.searchParams.append('url', link);
  return href;
};

export default () => {
  const defaultProxyBase = 'https://allorigins.hexlet.app';
  const defaultLanguage = 'ru';

  const generateId = generatorId();

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  yup.setLocale({
    mixed: {
      notOneOf: 'feedback.errors.duplicate',
    },
    string: {
      required: 'feedback.errors.empty_field',
      url: 'feedback.errors.invalid_url',
    },
  });

  const state = {
    lng: defaultLanguage,
    processState: 'initialized',
    rssForm: {
      processState: 'filling',
      link: null,
    },
    uiState: {
      readPostsId: [],
      feedback: null,
    },
    validatedLinks: [],
    data: {
      feeds: [],
      posts: [],
    },
  };

  const elements = {
    mainTitle: document.getElementById('main-title'),
    slogan: document.querySelector('main .lead'),
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    label: document.querySelector('.rss-form label'),
    submitBtn: document.querySelector('.rss-form button[type="submit"]'),
    sample: document.getElementById('sample'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  renderInitContent(elements, i18nextInstance);

  const watchedState = watch(state, elements, i18nextInstance);

  elements.input.addEventListener('change', (ev) => {
    watchedState.rssForm.link = ev.target.value;
  });

  elements.form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    watchedState.rssForm.processState = 'validating';
    const schema = getYupSchema(watchedState.validatedLinks);
    let proxyUrl;

    schema.validate(watchedState.rssForm.link)
      .then((link) => {
        watchedState.rssForm.processState = 'validated';
        watchedState.processState = 'loading';
        proxyUrl = createProxy(defaultProxyBase, link);
        return axios.get(proxyUrl);
      })
      .then((response) => response.data.contents)
      .then((content) => {
        const parsedContent = parse(content);
        const { currentFeed, currentPosts } = parsedContent;

        if (!currentFeed || !currentPosts) {
          throw new Error('Parser Error');
        }

        currentFeed.id = generateId();
        currentPosts.forEach((post) => {
          post.feedId = currentFeed.id; // eslint-disable-line no-param-reassign
          post.id = generateId(); // eslint-disable-line no-param-reassign
        });

        watchedState.data.feeds.push(currentFeed);
        watchedState.data.posts.push(...currentPosts);
        watchedState.validatedLinks.push(watchedState.rssForm.link);

        watchedState.processState = 'loaded';
        watchedState.uiState.feedback = 'feedback.success';
        watchedState.rssForm.processState = 'filling';
        return currentFeed.id;
      })
      .then((feedId) => {
        watchedState.processState = 'spying';
        return setTimeout(() => updatePosts(watchedState, proxyUrl, feedId, generateId), 5000);
      })
      .catch((e) => {
        switch (e.name) {
          case 'ValidationError': {
            const [errorCode] = e.errors;
            watchedState.rssForm.processState = 'invalidated';
            watchedState.uiState.feedback = errorCode;
            break;
          }

          case 'AxiosError':
            if (e.message === 'Network Error') {
              watchedState.processState = 'network_error';
              watchedState.uiState.feedback = 'feedback.errors.network';
            }
            break;

          case 'Error':
            if (e.message === 'Parser Error') {
              watchedState.processState = 'parser_error';
              watchedState.uiState.feedback = 'feedback.errors.parser';
            }
            break;

          default:
            throw new Error(`Unknown error ${e}`);
        }

        console.error(e.message);
      });
  });
};
