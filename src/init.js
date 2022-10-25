import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import watch from './watcher.js';
import parse from './parser.js';
import resources from '../locales/index.js';
import generatorId from './generatorId.js';
import updatePosts from './updater.js';

const getYupSchema = (items) => yup.string().url().notOneOf(items); // items - feeds from state

const createProxy = (proxyBase, link) => {
  const url = new URL('/get', proxyBase);
  const href = url;
  href.searchParams.append('disableCache', 'true');
  href.searchParams.append('url', link);
  return href;
};

export default () => {
  const defaultProxyBase = 'https://allorigins.hexlet.app';
  const generateId = generatorId();
  const defaultLanguage = 'ru';
  const i18nCodes = {
    feedback: {
      success: 'feedback.success',
      errors: {
        invalidUrl: 'feedback.errors.invalidUrl',
        duplicate: 'feedback.errors.duplicate',
        network: 'feedback.errors.network',
        parser: 'feedback.errors.parser',
      },
    },
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  yup.setLocale({
    mixed: {
      notOneOf: i18nCodes.feedback.errors.duplicate,
    },
    string: {
      url: i18nCodes.feedback.errors.invalidUrl,
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
      feedback: null,
    },
    validatedLinks: [],
    data: {
      feeds: [],
      posts: [],
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    submitBtn: document.querySelector('.rss-form button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const watchedState = onChange(state, watch(elements, i18nInstance));

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

        watchedState.rssForm.processState = 'validated';
        watchedState.processState = 'loaded';
        watchedState.uiState.feedback = i18nCodes.feedback.success;
        watchedState.validatedLinks.push(watchedState.rssForm.link);
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
              watchedState.uiState.feedback = i18nCodes.feedback.errors.network;
            }
            break;

          case 'Error':
            if (e.message === 'Parser Error') {
              watchedState.processState = 'parser_error';
              watchedState.uiState.feedback = i18nCodes.feedback.errors.parser;
            }
            break;

          default:
            throw new Error(`Unknown error ${e}`);
        }

        console.error(e.message);
      });
  });
};
