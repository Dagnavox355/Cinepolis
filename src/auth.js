import { createAuthClient } from '@neondatabase/auth';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;
const client = authUrl ? createAuthClient(authUrl) : null;
const backdrop = document.querySelector('#authBackdrop');
const accountButton = document.querySelector('#accountButton');
const closeButton = document.querySelector('#authClose');
const form = document.querySelector('#authForm');
const options = document.querySelector('#authOptions');
const status = document.querySelector('#authStatus');
const nameField = document.querySelector('#nameField');
const passwordField = document.querySelector('#passwordField');
const codeField = document.querySelector('#codeField');
const submit = document.querySelector('#authSubmit');
const back = document.querySelector('#authBack');
const exitConfirm = document.querySelector('#authExitConfirm');
const continueButton = document.querySelector('#authContinue');
const abandonButton = document.querySelector('#authAbandon');
let mode = 'sign-in';
let signedInUser = null;
let loginStage = 'email';
let returnView = null;
const isStandalone = document.body.dataset.page === 'account';

if (backdrop && closeButton && form && options && status) {
  // Validate email ourselves so the browser's generic "invalid" popup does not
  // hide the actual account guidance; Neon still performs the authoritative check.
  form.noValidate = true;
  const showStatus = (message, kind = '') => {
    status.textContent = message;
    status.className = `auth-status ${kind}`.trim();
  };
  const updateTitle = (title, intro) => {
    document.querySelector('#authTitle').textContent = title;
    document.querySelector('#authIntro').textContent = intro;
  };
  const resetFlow = () => {
    document.querySelector('.auth-panel').classList.remove('confirming');
    form.reset();
    mode = 'sign-in';
    loginStage = 'email';
    returnView = null;
    options.hidden = false;
    form.hidden = true;
    exitConfirm.hidden = true;
    nameField.hidden = true;
    passwordField.hidden = false;
    codeField.hidden = true;
    updateTitle('Inicia sesión o crea una cuenta en', '¿Ya tienes una cuenta digital en este sitio?');
    showStatus('');
  };
  const closeDialog = () => {
    if (isStandalone) {
      window.location.assign('/');
      return;
    }
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    accountButton?.focus();
  };
  const openDialog = () => {
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    resetFlow();
    if (signedInUser) {
      options.hidden = true;
      updateTitle(`Hola, ${signedInUser.name || 'cinéfilo'}`, signedInUser.email || 'Tu sesión está activa.');
      showStatus('Sesión iniciada.');
    } else closeButton.focus();
  };
  const setMode = (nextMode) => {
    mode = nextMode === 'link' ? 'sign-in' : nextMode;
    options.hidden = true;
    form.hidden = false;
    exitConfirm.hidden = true;
    nameField.hidden = mode !== 'sign-up';
    nameField.querySelector('input').required = mode === 'sign-up';
    passwordField.hidden = mode !== 'sign-up';
    passwordField.querySelector('input').required = mode === 'sign-up';
    codeField.hidden = true;
    loginStage = 'email';
    submit.textContent = mode === 'sign-up' ? 'Crear cuenta' : 'Enviar código';
    updateTitle(mode === 'sign-up' ? 'Crea tu cuenta' : 'Inicia sesión', mode === 'sign-up'
      ? 'Registra una cuenta para este sitio independiente.'
      : 'Ingresa tu correo y recibirás un código para iniciar sesión.');
    showStatus('');
    form.elements.email.focus();
  };
  const requestExitConfirmation = () => {
    if (options.hidden && !exitConfirm.hidden) return;
    if (isStandalone) {
      returnView = options.hidden ? (form.hidden ? 'options' : 'form') : 'options';
      options.hidden = true;
      form.hidden = true;
      exitConfirm.hidden = false;
      document.querySelector('.auth-panel').classList.add('confirming');
      showStatus('');
      return;
    }
    if (options.hidden && !form.hidden) {
      returnView = 'form';
      form.hidden = true;
      exitConfirm.hidden = false;
      document.querySelector('.auth-panel').classList.add('confirming');
      showStatus('');
    } else closeDialog();
  };

  accountButton?.addEventListener('click', openDialog);
  closeButton.addEventListener('click', requestExitConfirmation);
  document.querySelector('.auth-home')?.addEventListener('click', (event) => {
    if (isStandalone) { event.preventDefault(); requestExitConfirmation(); }
  });
  back?.addEventListener('click', () => { resetFlow(); });
  continueButton?.addEventListener('click', () => {
    exitConfirm.hidden = true;
    document.querySelector('.auth-panel').classList.remove('confirming');
    if (returnView === 'form') form.hidden = false;
    if (returnView === 'options') options.hidden = false;
    returnView = null;
  });
  abandonButton?.addEventListener('click', () => isStandalone ? closeDialog() : resetFlow());
  backdrop.addEventListener('click', (event) => { if (event.target === backdrop) requestExitConfirmation(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && backdrop.classList.contains('open')) requestExitConfirmation();
  });
  options.querySelectorAll('[data-account-mode]').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.accountMode)));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!client) { showStatus('El acceso no está configurado todavía.'); return; }
    const data = new FormData(form);
    const email = String(data.get('email')).trim();
    form.elements.email.value = email;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      showStatus('Escribe un correo válido, por ejemplo nombre@dominio.com.', 'error');
      form.elements.email.focus();
      return;
    }
    submit.disabled = true;
    try {
      if (mode === 'sign-in' && loginStage === 'email') {
        if (!client.emailOtp?.sendVerificationOtp) throw new Error('El acceso por código no está disponible en la configuración de Neon Auth.');
        showStatus('Enviando código…');
        const result = await client.emailOtp.sendVerificationOtp({ email, type: 'sign-in' });
        if (result.error) throw new Error(result.error.message || 'No se pudo enviar el código.');
        loginStage = 'code';
        codeField.hidden = false;
        codeField.querySelector('input').required = true;
        codeField.querySelector('input').focus();
        submit.textContent = 'Continuar';
        updateTitle('Revisa tu correo', `Ingresa el código que enviamos a ${email}.`);
        showStatus('Si la cuenta es válida, recibirás un código de acceso.', 'success');
      } else if (mode === 'sign-in') {
        const result = await client.signIn.emailOtp({ email, otp: String(data.get('code')).trim() });
        if (result.error) throw new Error(result.error.message || 'El código no es válido o ya venció.');
        signedInUser = result.data?.user || null;
        if (!signedInUser) throw new Error('No se pudo confirmar la sesión. Intenta de nuevo.');
        accountButton?.setAttribute('aria-label', `Cuenta: ${signedInUser.name || signedInUser.email}`);
        updateTitle(`Hola, ${signedInUser.name || 'cinéfilo'}`, signedInUser.email || 'Tu sesión está activa.');
        form.hidden = true;
        showStatus('Sesión iniciada correctamente.', 'success');
      } else {
        const result = await client.signUp.email({
          email,
          password: String(data.get('password')),
          name: String(data.get('name')).trim(),
        });
        if (result.error) throw new Error(result.error.message || 'No se pudo crear la cuenta.');
        signedInUser = result.data?.user || null;
        if (signedInUser) accountButton?.setAttribute('aria-label', `Cuenta: ${signedInUser.name || signedInUser.email}`);
        form.hidden = true;
        showStatus(signedInUser ? 'Cuenta creada correctamente.' : 'Revisa tu correo para verificar la cuenta.', 'success');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (/invalid email/i.test(message)) {
        showStatus('Escribe un correo válido, por ejemplo nombre@dominio.com.', 'error');
      } else if (/user already exists|already registered|email.*already/i.test(message)) {
        showStatus('Ese correo ya tiene una cuenta. Regresa y elige “Inicia sesión” para recuperar el acceso.', 'error');
      } else if (/password.*(short|length|weak)|invalid.*password/i.test(message)) {
        showStatus('La contraseña debe tener al menos 8 caracteres.', 'error');
      } else {
        showStatus(message || 'No se pudo completar la solicitud. Inténtalo de nuevo.', 'error');
      }
    } finally {
      submit.disabled = false;
    }
  });

  if (client) {
    client.getSession().then(({ data, error }) => {
      if (!error) {
        signedInUser = data?.user || data?.session?.user || null;
        if (signedInUser) accountButton?.setAttribute('aria-label', `Cuenta: ${signedInUser.name || signedInUser.email}`);
      }
    }).catch(() => {});
  }
}
