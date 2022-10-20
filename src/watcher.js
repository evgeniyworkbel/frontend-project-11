const handleProcessState = (elements, processState) => {
  const { form, input, submitBtn } = elements;
  switch (processState) {
    case 'filling':
      submitBtn.disabled = false;
      break;
    case 'validating':
      submitBtn.disabled = true;
      break;
    case 'validated':
      submitBtn.disabled = false;
      input.style.border = null;
      form.reset();
      input.focus();
      break;
    case 'loading':
      submitBtn.disabled = true;
      break;
    case 'loaded':
      submitBtn.disabled = false;
      break;
    case 'invalidated':
      submitBtn.disabled = false;
      input.style.border = 'thick solid red';
      break;
    case 'network_error':
      break;
    default:
      throw new Error(`Unknown process state ${processState}`);
  }
};

const renderFeedback = (elements, value, i18nInstance) => {
  const { feedback } = elements;

  feedback.textContent = i18nInstance.t(value);
  if (value === 'rssForm.feedback.success') {
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
  } else {
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
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
    default:
      break;
  }
};
