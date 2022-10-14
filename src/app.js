import * as yup from 'yup';
import onChange from 'on-change';
import watcher from './watcher.js';

const getYupSchema = (items) => yup.string().url().notOneOf(items); // items - feeds from state

export default () => {
  const state = {
    process: {
      state: '',
      errors: [],
    },

    rssForm: {
      valid: true,
      // state: '',
      link: null,
      errors: [],
    },
    urls: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    submitBtn: document.querySelector('.rss-form button[type="submit"]'),
  };

  const watchedState = onChange(state, watcher(elements));

  elements.input.addEventListener('change', (ev) => {
    watchedState.rssForm.link = ev.target.value;
  });

  elements.form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const schema = getYupSchema(state.urls);

    schema.validate(watchedState.rssForm.link)
      .then((link) => {
        watchedState.rssForm.valid = true;
        watchedState.rssForm.errors = [];
        watchedState.urls.push(link);
      })
      .catch((e) => {
        watchedState.rssForm.valid = false;
        watchedState.rssForm.errors = e;
      });
  });
};
