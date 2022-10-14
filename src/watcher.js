export default (elements) => (path, value) => {
  const { input, form } = elements;

  switch (path) {
    case 'rssForm.valid':
      if (value === true) {
        input.style.border = null;
        form.reset();
        input.focus();
      } else {
        input.style.border = 'thick solid red';
      }
      break;

    default:
      break;
  }
};
