// Contact forms: submit with fetch and show the result inline. Without JS the form still posts normally.
export function initContactForms() {
  const plan = new URLSearchParams(location.search).get('plan');
  document.querySelectorAll('[data-contact-form]').forEach((form) => {
    const err = form.querySelector('[data-form-error]');
    const btn = form.querySelector('[data-submit]');
    const label = form.querySelector('[data-submit-label]');
    form.querySelector('[data-form-ts]').value = String(Date.now());
    form.querySelector('[data-form-page]').value = location.pathname;
    const select = form.querySelector('[data-plan-select]');
    if (plan && select && [...select.options].some((o) => o.value === plan)) select.value = plan;

    form.addEventListener('invalid', () => form.classList.add('was-validated'), true);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.hidden = true;
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());
      data.channels = fd.getAll('channels');
      btn.setAttribute('aria-busy', 'true');
      label.textContent = 'Sending…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(out.error || 'Something went wrong.');
        form.querySelector('[data-form-fields]').hidden = true;
        const done = form.querySelector('[data-form-done]');
        form.querySelector('[data-form-ref]').textContent = out.id ? `Reference ${out.id}` : '';
        done.hidden = false;
        done.focus({ preventScroll: true });
        done.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (ex) {
        err.textContent = `${ex.message} You can also email hello@grydelo.com directly.`;
        err.hidden = false;
      } finally {
        btn.removeAttribute('aria-busy');
        label.textContent = 'Send brief';
      }
    });
  });
}
