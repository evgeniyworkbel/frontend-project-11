import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import watcher from './watcher.js';
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

  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  yup.setLocale({
    mixed: {
      notOneOf: 'rssForm.feedback.errors.duplicate',
    },
    string: {
      url: 'rssForm.feedback.errors.invalidUrl',
    },
  });

  const state = {
    lng: defaultLanguage,
    rssForm: {
      processState: 'filling',
      valid: true,
      link: null,
      feedback: [],
    },
    urls: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    submitBtn: document.querySelector('.rss-form button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
  };

  const watchedState = onChange(state, watcher(elements, i18nInstance));

  elements.input.addEventListener('change', (ev) => {
    watchedState.rssForm.link = ev.target.value;
  });

  elements.form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    watchedState.rssForm.processState = 'validating';

    const schema = getYupSchema(watchedState.urls);
    schema.validate(watchedState.rssForm.link)
      .then((link) => {
        watchedState.rssForm.processState = 'validated';
        watchedState.rssForm.valid = true;
        return link;
      })
      .then((link) => {
        const proxyLink = createProxy(defaultProxyBase, link);
        watchedState.rssForm.processState = 'loading';
        axios.get(proxyLink)
          .then((response) => {
            watchedState.rssForm.processState = 'loaded';
            watchedState.rssForm.feedback = 'rssForm.feedback.success';
            watchedState.urls.push(link);
            console.log(response.data.contents);
          })
          .catch((e) => {
            watchedState.rssForm.processState = 'network_error';
            watchedState.rssForm.feedback = i18nInstance.t('rssForm.feedback.errors.network');
            console.error(e);
          });
      })
      .catch((e) => {
        watchedState.rssForm.processState = 'invalidated';
        watchedState.rssForm.valid = false;
        watchedState.rssForm.feedback = e.errors;
        console.error(e);
      });
  });
};
