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

export default (elements, i18nInstance) => (path, value) => {
  switch (path) {
    case 'rssForm.processState':
      handleProcessState(elements, value);
      break;

    case 'rssForm.feedback':
      renderFeedback(elements, value, i18nInstance);
      break;

    case 'data.feeds':
      // handling code
      break;

    case 'data.posts':
      // handling code
      break;

    case 'rssForm.link':
    case 'urls':
    case 'rssForm.valid':
      break;

    default:
      throw new Error(`Unwatched path ${path}`);
  }
};
