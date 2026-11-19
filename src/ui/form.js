/**
 * Contact form — no backend. Builds a WhatsApp click-to-chat link or a mailto: link
 * from the fields and hands off to the user's app. Nothing is stored or sent by this site.
 */
export function initForm({ site, contact, contactSection }) {
  const form = document.querySelector('[data-form]');
  if (!form) return;
  const errorEl = form.querySelector('[data-form-error]');

  const clean = (v, max) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, max);

  function validate(data) {
    const errors = [];
    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach((f) => f.removeAttribute('aria-invalid'));
    const fail = (name, msg) => {
      form.elements[name].setAttribute('aria-invalid', 'true');
      errors.push({ name, msg });
    };
    if (data.name.length < 2) fail('name', 'Please enter your name.');
    const digits = data.phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) fail('phone', 'Please enter a valid phone number.');
    if (data.message.length < 5) fail('message', 'Please describe the problem briefly.');
    return errors;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      name: clean(fd.get('name'), 80),
      phone: clean(fd.get('phone'), 16),
      service: clean(fd.get('service'), 60),
      location: clean(fd.get('location'), 120),
      message: clean(fd.get('message'), 1000),
    };
    const errors = validate(data);
    if (errors.length) {
      errorEl.textContent = errors.map((x) => x.msg).join(' ');
      form.elements[errors[0].name].focus();
      return;
    }
    errorEl.textContent = '';

    const lines = [
      `Hello ${site.name}, I'd like to schedule a site visit.`,
      '',
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Service: ${data.service}`,
      data.location ? `Location: ${data.location}` : null,
      '',
      data.message,
    ].filter((l) => typeof l === 'string');
    const text = lines.join('\n');

    if (e.submitter?.value === 'email') {
      const subject = `${contactSection.form.emailSubject} — ${data.name}`;
      window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    } else {
      const url = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`;
      // window.open with 'noopener' always returns null, so detach the opener manually.
      const win = window.open(url, '_blank');
      if (win) win.opener = null;
      else window.location.href = url;
    }
  });
}
