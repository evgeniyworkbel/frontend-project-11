import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import watch from './watcher.js';
import parse from './parser.js';
import resources from '../locales/index.js';

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
    rssForm: {
      processState: 'filling',
      valid: true,
      link: null,
      feedback: null,
    },
    urls: [],
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
  };

  const watchedState = onChange(state, watch(elements, i18nInstance));

  elements.input.addEventListener('change', (ev) => {
    watchedState.rssForm.link = ev.target.value;
  });

  elements.form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    watchedState.rssForm.processState = 'validating';
    const schema = getYupSchema(watchedState.urls);
    schema.validate(watchedState.rssForm.link)
      .then((link) => {
        const proxyLink = createProxy(defaultProxyBase, link);
        watchedState.rssForm.processState = 'loading';
        return axios.get(proxyLink);
      })
      .then((response) => {
        watchedState.urls.push(response.data.status.url);
        return response.data.contents;
      })
      .then((content) => {
        const parsedContent = parse(content);
        const { newFeed, newPosts } = parsedContent;

        if (!newFeed || !newPosts) {
          throw new Error('Parser Error');
        }

        // add id to newfeed, newposts

        watchedState.data.feeds.push(newFeed);
        watchedState.data.posts.push(...newPosts);

        watchedState.rssForm.processState = 'loaded';
        watchedState.rssForm.valid = true;
        watchedState.rssForm.feedback = i18nCodes.feedback.success;
      })
      .catch((e) => {
        watchedState.rssForm.valid = false;
        switch (e.name) {
          case 'ValidationError': {
            const [errorCode] = e.errors;
            watchedState.rssForm.processState = 'invalidated';
            watchedState.rssForm.feedback = errorCode;
            break;
          }

          case 'AxiosError':
            if (e.message === 'Network Error') {
              watchedState.rssForm.processState = 'network_error';
              watchedState.rssForm.feedback = i18nCodes.feedback.errors.network;
            }
            break;

          case 'Error':
            if (e.message === 'Parser Error') {
              watchedState.rssForm.processState = 'parser_error';
              watchedState.rssForm.feedback = i18nCodes.feedback.errors.parser;
            }
            break;

          default:
            throw new Error(`Unknown error ${e}`);
        }

        console.error(e);
      });
  });
};
