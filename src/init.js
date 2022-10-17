import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import watcher from './watcher.js';
import resources from '../locales/index.js';

const getYupSchema = (items) => yup.string().url().notOneOf(items); // items - feeds from state

export default () => {
  const defaultLanguage = 'ru';

  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  yup.setLocale({
    mixed: {
      notOneOf: 'rssForm.feedback.duplicate',
    },
    string: {
      url: 'rssForm.feedback.invalidUrl',
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
    /*
    uiState: {
      rssForm: {},
    },
    */ // does it need?
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

    const schema = getYupSchema(state.urls);
    schema.validate(watchedState.rssForm.link)
      .then((link) => {
        watchedState.rssForm.processState = 'validated';
        watchedState.rssForm.valid = true; // does it need?
        watchedState.rssForm.feedback = 'rssForm.feedback.success';
        watchedState.urls.push(link);
      })
      .catch((e) => {
        watchedState.rssForm.processState = 'invalidated';
        watchedState.rssForm.valid = false; // does it need?
        watchedState.rssForm.feedback = e.errors;
      });
  });
};
