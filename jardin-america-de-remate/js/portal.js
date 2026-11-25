(function () {
  const client = window.getSupabaseClient && window.getSupabaseClient();
  const trackEvent = typeof window.trackEvent === "function" ? window.trackEvent : () => {};
  const alertBox = document.getElementById("portal-alert");
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");
  const showRegisterLink = document.getElementById("show-register-link");
  const showLoginLink = document.getElementById("show-login-link");
  const portalOffersArea = document.getElementById("portal-offers-area");
  const resendConfirmationBtn = document.getElementById("resend-confirmation-btn");
  const resendConfirmationHint = document.getElementById("resend-confirmation-hint");
  const offerForm = document.getElementById("offer-form");
  const offersWrap = document.getElementById("my-offers");
  const offersEmpty = document.getElementById("my-offers-empty");
  const authForms = document.getElementById("auth-forms");
  const authSession = document.getElementById("auth-session");
  const authEmail = document.getElementById("auth-email");
  const logoutBtn = document.getElementById("logout-btn");
  const offerFormTitle = document.getElementById("offer-form-title");
  const offerSubmitBtn = document.getElementById("offer-submit-btn");
  const offerEditCancelBtn = document.getElementById("offer-edit-cancel");
  const offerDateFeedback = document.getElementById("offer-date-feedback");
  const OFFER_IMAGES_BUCKET = "offer-images";
  const OFFER_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
  const OFFER_IMAGE_MIN_WIDTH = 320;
  const OFFER_IMAGE_MIN_HEIGHT = 240;
  const OFFER_IMAGE_MIN_RATIO = 0.25;
  const OFFER_IMAGE_MAX_RATIO = 5;
  let editingOfferId = null;
  let myOffersById = new Map();
  let registerInFlight = false;
  let resendInFlight = false;
  let resendCooldownUntil = 0;
  let resendCooldownInterval = null;
  const commerceFields = {
    nombre: offerForm.querySelector('input[name="comercio_nombre"]'),
    ubicacion: offerForm.querySelector('input[name="comercio_ubicacion"]'),
  };
  const dateFields = {
    inicio: offerForm.querySelector('input[name="fecha_inicio"]'),
    fin: offerForm.querySelector('input[name="fecha_fin"]'),
  };

  function hasSupabasePlaceholderConfig() {
    return (
      String(window.SUPABASE_URL || "").includes("TU-PROYECTO") ||
      String(window.SUPABASE_ANON_KEY || "").includes("TU_ANON_PUBLIC_KEY")
    );
  }

  function showAlert(type, message) {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
    alertBox.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function formatSupabaseError(error, fallbackMessage) {
    const code = String(error?.code || "");
    const details = String(error?.details || "");
    const message = String(error?.message || "");

    if (code === "42P01" || message.includes("relation") && message.includes("offers")) {
      return "No existe la tabla de ofertas en Supabase. Ejecuta supabase-schema.sql en SQL Editor.";
    }

    if (code === "42501" || message.toLowerCase().includes("row-level security")) {
      return "No tenés permisos para guardar la oferta. Verificá RLS y que el usuario esté autenticado.";
    }

    if (details) {
      return `${fallbackMessage} ${details}`;
    }

    return message || fallbackMessage;
  }

  const MSG_EMAIL_CONFIRM_STEPS =
    "Abrí el correo que te enviamos al registrarte y tocá el botón o enlace que dice confirmar cuenta (a veces «Confirm your signup»). Solo leer el mail no activa la cuenta: tiene que abrirse el enlace en el navegador. Revisá spam y carpeta Promociones. Si no te llegó, usá «Reenviar confirmación» con el mismo email. Si ya tocaste el enlace y sigue igual, pedí a la organización que confirme tu cuenta desde el panel de administración.";

  function isEmailNotConfirmedError(error) {
    const message = String(error?.message || "").toLowerCase();
    const code = String(error?.code || "").toLowerCase();
    return (
      message.includes("email not confirmed") ||
      message.includes("email_not_confirmed") ||
      code === "email_not_confirmed"
    );
  }

  function formatAuthError(error, fallbackMessage) {
    const message = String(error?.message || "");
    const normalized = message.toLowerCase();

    if (normalized.includes("email rate limit exceeded")) {
      return "Se superó temporalmente el límite de envíos de email. Esperá unos minutos y volvé a intentar.";
    }

    if (normalized.includes("user already registered")) {
      return "Ese email ya está registrado. Ingresá con tu email y contraseña. Si no recordás la contraseña, pedí ayuda a la organización para restablecerla.";
    }

    if (isEmailNotConfirmedError(error)) {
      return `Tu cuenta todavía no está activada en el sistema. ${MSG_EMAIL_CONFIRM_STEPS}`;
    }

    if (normalized.includes("invalid login credentials")) {
      return "Email o contraseña incorrectos. Revisá mayúsculas, espacios y que sea el mismo email con el que te registraste. Si recién creaste la cuenta, antes de ingresar tenés que tocar el enlace del mail de confirmación (ver mensaje arriba si te aparece «no confirmada»).";
    }

    return message || fallbackMessage;
  }

  function isMissingOptionalColumns(error) {
    const code = String(error?.code || "");
    const message = String(error?.message || "").toLowerCase();
    return (
      code === "42703" ||
      code === "PGRST204" ||
      message.includes("schema cache") ||
      message.includes("imagen_urls") ||
      message.includes("precio_regular") ||
      message.includes("precio_promocional") ||
      message.includes("comercio_whatsapp")
    );
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("No se pudo leer el archivo de imagen."));
      reader.readAsDataURL(file);
    });
  }

  function getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const dims = { width: img.naturalWidth, height: img.naturalHeight };
        URL.revokeObjectURL(objectUrl);
        resolve(dims);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("No se pudo leer dimensiones de la imagen."));
      };
      img.src = objectUrl;
    });
  }

  async function uploadOfferImagesToStorage(userId, files) {
    const uploadedUrls = [];
    for (let idx = 0; idx < files.length; idx += 1) {
      const file = files[idx];
      const extFromName = String(file.name || "").split(".").pop();
      const ext = String(extFromName || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const random = Math.random().toString(36).slice(2, 9);
      const objectPath = `${userId}/${Date.now()}-${idx}-${random}.${ext}`;
      const { error: uploadError } = await client
        .storage
        .from(OFFER_IMAGES_BUCKET)
        .upload(objectPath, file, {
          cacheControl: "31536000",
          upsert: false,
          contentType: file.type || "application/octet-stream",
        });

      if (uploadError) {
        throw new Error(`No se pudo subir imagen a Storage (${uploadError.message || "error desconocido"}).`);
      }

      const { data: publicData } = client.storage.from(OFFER_IMAGES_BUCKET).getPublicUrl(objectPath);
      const publicUrl = String(publicData?.publicUrl || "").trim();
      if (!publicUrl) {
        throw new Error("La imagen se subio, pero no se pudo obtener URL publica.");
      }
      uploadedUrls.push(publicUrl);
    }
    return uploadedUrls;
  }

  function setAuthFormsDisabled(disabled) {
    [registerForm, loginForm].forEach((form) => {
      if (!form) return;
      form.querySelectorAll("input,button").forEach((el) => (el.disabled = disabled));
    });
  }

  function showLoginView() {
    if (loginForm) loginForm.classList.remove("d-none");
    if (registerForm) registerForm.classList.add("d-none");
  }

  function showRegisterView() {
    if (loginForm) loginForm.classList.add("d-none");
    if (registerForm) registerForm.classList.remove("d-none");
  }

  function updatePortalFlowSteps(hasSession) {
    const root = document.getElementById("portal-flow-steps");
    if (!root) return;
    const step1 = root.querySelector('[data-step="1"]');
    const step2 = root.querySelector('[data-step="2"]');
    if (step1) {
      step1.classList.toggle("is-active", !hasSession);
      step1.classList.toggle("is-done", Boolean(hasSession));
    }
    if (step2) {
      step2.classList.toggle("is-active", Boolean(hasSession));
    }
    root.classList.toggle("portal-flow-steps--logged-in", Boolean(hasSession));
  }

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function getLoginEmailValue() {
    if (!loginForm) return "";
    return normalizeText(loginForm.querySelector('input[name="email"]')?.value);
  }

  function updateResendCooldownUI() {
    if (!resendConfirmationBtn) return;
    const msLeft = Math.max(0, resendCooldownUntil - Date.now());
    const secLeft = Math.ceil(msLeft / 1000);
    const coolingDown = secLeft > 0;
    resendConfirmationBtn.disabled = resendInFlight || coolingDown;

    if (coolingDown) {
      resendConfirmationBtn.textContent = `⏳ Reintentar en ${secLeft}s`;
      if (resendConfirmationHint) {
        resendConfirmationHint.textContent = "Para evitar bloqueos de correo, espera a que termine la cuenta regresiva.";
      }
      return;
    }

      resendConfirmationBtn.textContent = "📨 Reenviar confirmación";
      if (resendConfirmationHint) {
        resendConfirmationHint.textContent =
          "Escribí tu email en «Ingresar» y tocá acá. Abrí el mail y tocá el enlace para activar la cuenta.";
      }
  }

  function startResendCooldown(seconds) {
    resendCooldownUntil = Date.now() + Math.max(0, seconds) * 1000;
    if (resendCooldownInterval) clearInterval(resendCooldownInterval);
    updateResendCooldownUI();
    resendCooldownInterval = setInterval(() => {
      const pending = resendCooldownUntil - Date.now();
      updateResendCooldownUI();
      if (pending <= 0) {
        clearInterval(resendCooldownInterval);
        resendCooldownInterval = null;
      }
    }, 1000);
  }

  function setOfferFormModeEdit(offer) {
    editingOfferId = String(offer.id || "");
    if (offerFormTitle) offerFormTitle.textContent = "✏️ Editar oferta";
    if (offerSubmitBtn) offerSubmitBtn.textContent = "💾 Guardar cambios";
    if (offerEditCancelBtn) offerEditCancelBtn.classList.remove("d-none");
  }

  function setOfferFormModeCreate() {
    editingOfferId = null;
    if (offerFormTitle) offerFormTitle.textContent = "✨ Nueva oferta";
    if (offerSubmitBtn) offerSubmitBtn.textContent = "✅ Guardar oferta (pendiente)";
    if (offerEditCancelBtn) offerEditCancelBtn.classList.add("d-none");
  }

  function startOfferEdit(offerId) {
    const offer = myOffersById.get(String(offerId || ""));
    if (!offer) {
      showAlert("warning", "No se encontró la oferta para editar.");
      return;
    }

    offerForm.querySelector('input[name="comercio_nombre"]').value = offer.comercio_nombre || "";
    offerForm.querySelector('input[name="comercio_ubicacion"]').value = offer.comercio_ubicacion || "";
    offerForm.querySelector('input[name="comercio_whatsapp"]').value = offer.comercio_whatsapp || "";
    offerForm.querySelector('input[name="titulo"]').value = offer.titulo || "";
    offerForm.querySelector('select[name="rubro"]').value = offer.rubro || "";
    offerForm.querySelector('textarea[name="descripcion"]').value = offer.descripcion || "";
    offerForm.querySelector('input[name="beneficio"]').value = offer.beneficio || "";
    offerForm.querySelector('input[name="precio_regular"]').value = offer.precio_regular || "";
    offerForm.querySelector('input[name="precio_promocional"]').value = offer.precio_promocional || "";
    offerForm.querySelector('input[name="fecha_inicio"]').value = offer.fecha_inicio || "";
    offerForm.querySelector('input[name="fecha_fin"]').value = offer.fecha_fin || "";
    offerForm.querySelector('input[name="imagen_files"]').value = "";
    setOfferFormModeEdit(offer);
    trackEvent("merchant_offer_edit_start", {
      offer_id: String(offer.id || ""),
      offer_status: String(offer.estado || ""),
    });
    validateOfferDates();
    offerForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function getEventDateStrings() {
    const year = new Date().getFullYear();
    const start = `${year}-05-22`;
    const end = `${year}-05-25`;
    return { start, end };
  }

  function applyEventDateLimits() {
    const { start, end } = getEventDateStrings();
    if (dateFields.inicio) {
      dateFields.inicio.min = start;
      dateFields.inicio.max = end;
      if (!dateFields.inicio.value) dateFields.inicio.value = start;
    }
    if (dateFields.fin) {
      dateFields.fin.min = start;
      dateFields.fin.max = end;
      if (!dateFields.fin.value) dateFields.fin.value = end;
    }
  }

  function validateOfferDates() {
    const start = normalizeText(dateFields.inicio?.value);
    const end = normalizeText(dateFields.fin?.value);
    const { start: eventStart, end: eventEnd } = getEventDateStrings();
    let message = "";
    let isValid = true;

    if (!start || !end) {
      message = "Selecciona fecha inicio y fecha fin.";
      isValid = false;
    } else if (end < start) {
      message = "La fecha fin no puede ser anterior a la fecha inicio.";
      isValid = false;
    } else if (start < eventStart || start > eventEnd || end < eventStart || end > eventEnd) {
      message = "La vigencia debe estar entre el 22 y el 25 de mayo.";
      isValid = false;
    }

    if (offerDateFeedback) {
      if (!start || !end) {
        offerDateFeedback.classList.add("d-none");
      } else if (!isValid) {
        offerDateFeedback.textContent = `⚠️ ${message}`;
        offerDateFeedback.className = "small mb-0 text-danger";
      } else {
        offerDateFeedback.textContent = "✅ Fechas válidas para Jardín Sale Week.";
        offerDateFeedback.className = "small mb-0 text-success";
      }
    }

    if (offerSubmitBtn) offerSubmitBtn.disabled = !isValid;
    return isValid;
  }

  function applyCommerceProfile(user) {
    const metadata = user?.user_metadata || {};
    const profile = {
      nombre: normalizeText(metadata.comercio_nombre),
      ubicacion: normalizeText(metadata.comercio_ubicacion),
    };

    if (commerceFields.nombre && !commerceFields.nombre.value) commerceFields.nombre.value = profile.nombre;
    if (commerceFields.ubicacion && !commerceFields.ubicacion.value) commerceFields.ubicacion.value = profile.ubicacion;
  }

  if (hasSupabasePlaceholderConfig()) {
    setAuthFormsDisabled(true);
    showAlert("warning", "Configura SUPABASE_URL y SUPABASE_ANON_KEY reales en js/supabase-config.js.");
    return;
  }

  if (!client) {
    showAlert("warning", "Configura Supabase en js/supabase-config.js para usar el portal.");
    return;
  }

  function offerCard(offer) {
    const images = Array.isArray(offer.imagen_urls) ? offer.imagen_urls.filter(Boolean) : [];
    const imageToShow = images[0] || offer.imagen_url || "";
    const regular = normalizeText(offer.precio_regular);
    const promo = normalizeText(offer.precio_promocional);
    const priceBlock = regular || promo
      ? `<p class="mb-1 small"><strong>Precios:</strong> ${regular ? `<span class="text-decoration-line-through text-secondary">${regular}</span>` : ""} ${promo ? `<span class="fw-bold text-danger ms-1">${promo}</span>` : ""}</p>`
      : "";
    return `
      <div class="col">
        <article class="card h-100 border-0 shadow-sm">
          ${imageToShow ? `<img src="${imageToShow}" class="card-img-top public-offer-img" alt="Imagen de oferta">` : ""}
          <div class="card-body">
            <span class="badge text-bg-light mb-2">${offer.rubro || "General"}</span>
            <h3 class="h6">${offer.titulo}</h3>
            <p class="small text-secondary">${offer.descripcion || ""}</p>
            <p class="mb-1"><strong>Beneficio:</strong> ${offer.beneficio || "-"}</p>
            ${priceBlock}
            <p class="mb-1 small"><strong>Comercio:</strong> ${offer.comercio_nombre || "-"}</p>
            <p class="mb-1 small"><strong>Ubicacion:</strong> ${offer.comercio_ubicacion || "-"}</p>
            <p class="mb-1 small"><strong>WhatsApp (consultas):</strong> ${normalizeText(offer.comercio_whatsapp) || "-"}</p>
            <p class="mb-1 small"><strong>Estado:</strong> ${offer.estado}</p>
            <p class="mb-2 small text-secondary">${offer.fecha_inicio} al ${offer.fecha_fin}</p>
            <button type="button" class="btn btn-sm btn-outline-primary" data-edit-offer-id="${offer.id}">Editar oferta</button>
          </div>
        </article>
      </div>
    `;
  }

  async function refreshSessionUI() {
    const { data } = await client.auth.getSession();
    const user = data.session?.user || null;

    if (user) {
      updatePortalFlowSteps(true);
      authForms.classList.add("d-none");
      authSession.classList.remove("d-none");
      if (portalOffersArea) portalOffersArea.classList.remove("d-none");
      authEmail.textContent = user.email || "";
      applyCommerceProfile(user);
      applyEventDateLimits();
      validateOfferDates();
      offerForm.querySelectorAll("input,textarea,select,button").forEach((el) => (el.disabled = false));
      showAlert("info", "Puedes cargar ofertas desde ahora. Elige la vigencia entre el 22 y el 25 de mayo.");
      await loadMyOffers(user.id);
    } else {
      updatePortalFlowSteps(false);
      authForms.classList.remove("d-none");
      authSession.classList.add("d-none");
      showLoginView();
      if (portalOffersArea) portalOffersArea.classList.add("d-none");
      offerForm.querySelectorAll("input,textarea,select,button").forEach((el) => (el.disabled = true));
      offersWrap.innerHTML = "";
      offersEmpty.style.display = "block";
      myOffersById = new Map();
      setOfferFormModeCreate();
      if (offerDateFeedback) offerDateFeedback.classList.add("d-none");
    }
  }

  async function loadMyOffers(userId) {
    let { data, error } = await client
      .from("offers")
      .select("id,titulo,descripcion,rubro,beneficio,precio_regular,precio_promocional,fecha_inicio,fecha_fin,estado,imagen_url,imagen_urls,comercio_nombre,comercio_ubicacion,comercio_telefono,comercio_whatsapp")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    if (error && isMissingOptionalColumns(error)) {
      const fallback = await client
        .from("offers")
        .select("id,titulo,descripcion,rubro,beneficio,fecha_inicio,fecha_fin,estado,imagen_url,comercio_nombre,comercio_ubicacion,comercio_telefono")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      showAlert("danger", formatSupabaseError(error, "No se pudieron cargar tus ofertas."));
      return;
    }

    if (!data || !data.length) {
      offersWrap.innerHTML = "";
      offersEmpty.style.display = "block";
      myOffersById = new Map();
      return;
    }

    myOffersById = new Map(data.map((offer) => [String(offer.id), offer]));
    offersEmpty.style.display = "none";
    offersWrap.innerHTML = data.map(offerCard).join("");
  }

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (registerInFlight) return;
    const formData = new FormData(registerForm);
    const acceptedRules = formData.get("accept_rules") === "1";
    if (!acceptedRules) {
      showAlert("warning", "Debes aceptar el reglamento de participación para crear la cuenta.");
      return;
    }
    const email = normalizeText(formData.get("email"));
    const password = normalizeText(formData.get("password"));
    const comercioNombre = normalizeText(formData.get("comercio_nombre"));
    const comercioUbicacion = normalizeText(formData.get("comercio_ubicacion"));
    const submitButton = registerForm.querySelector('button[type="submit"]');
    registerInFlight = true;
    if (submitButton) submitButton.disabled = true;

    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            comercio_nombre: comercioNombre,
            comercio_ubicacion: comercioUbicacion,
            acepta_reglamento: true,
            acepta_reglamento_en: new Date().toISOString(),
          },
        },
      });
      if (error) {
        showAlert("danger", formatAuthError(error, "No se pudo crear la cuenta."));
        return;
      }

      if (data?.session) {
        showAlert("success", "Cuenta creada e inicio de sesion realizado.");
        trackEvent("merchant_register_success", { method: "email_password" });
        showLoginView();
        await refreshSessionUI();
      } else {
        showAlert(
          "info",
          "Cuenta creada. Te enviamos un correo: abrilo y tocá el enlace de confirmación (a veces «Confirm your signup»). Sin ese clic el sistema no te deja ingresar. Revisá spam y Promociones. Después volvé acá e ingresá con tu email y contraseña. Si no te llegó, usá «Reenviar confirmación»."
        );
        trackEvent("merchant_register_pending_confirmation", { method: "email_password" });
        if (loginForm) {
          const loginEmailInput = loginForm.querySelector('input[name="email"]');
          if (loginEmailInput) loginEmailInput.value = email;
        }
        showLoginView();
      }

      registerForm.reset();
    } finally {
      registerInFlight = false;
      if (submitButton) submitButton.disabled = false;
    }
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      showAlert("danger", formatAuthError(error, "No se pudo iniciar sesión."));
      return;
    }
    showAlert("success", "Sesion iniciada correctamente.");
    trackEvent("merchant_login_success", { method: "email_password" });
    loginForm.reset();
    refreshSessionUI();
  });

  if (resendConfirmationBtn) {
    resendConfirmationBtn.addEventListener("click", async () => {
      if (resendInFlight) return;
      const email = getLoginEmailValue();
      if (!email) {
        showAlert("warning", "Escribe tu email en el formulario de ingreso para reenviar la confirmación.");
        return;
      }

      resendInFlight = true;
      updateResendCooldownUI();
      try {
        const { error } = await client.auth.resend({
          type: "signup",
          email,
        });
        if (error) {
          showAlert("danger", formatAuthError(error, "No se pudo reenviar el email de confirmación."));
          if (String(error.message || "").toLowerCase().includes("rate limit")) {
            startResendCooldown(90);
          }
          return;
        }

        showAlert(
          "info",
          "Te reenviamos el correo de confirmación. Abrilo y tocá el enlace del mensaje para activar la cuenta; después ingresá de nuevo con tu contraseña."
        );
        startResendCooldown(60);
      } finally {
        resendInFlight = false;
        updateResendCooldownUI();
      }
    });
  }

  logoutBtn.addEventListener("click", async () => {
    await client.auth.signOut();
    showAlert("info", "Sesion cerrada.");
    trackEvent("merchant_logout");
    showLoginView();
    refreshSessionUI();
  });

  if (showRegisterLink) {
    showRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      showRegisterView();
    });
  }

  if (showLoginLink) {
    showLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      showLoginView();
    });
  }

  function wireShowPasswordToggle(form, checkboxId, inputName) {
    if (!form) return;
    const cb = document.getElementById(checkboxId);
    const input = form.querySelector(`input[name="${inputName}"]`);
    if (!cb || !input) return;
    cb.addEventListener("change", () => {
      input.type = cb.checked ? "text" : "password";
    });
  }

  wireShowPasswordToggle(loginForm, "login-show-password", "password");
  wireShowPasswordToggle(registerForm, "register-show-password", "password");

  offersWrap.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-edit-offer-id]");
    if (!btn) return;
    const offerId = String(btn.getAttribute("data-edit-offer-id") || "");
    if (!offerId) return;
    startOfferEdit(offerId);
  });

  if (offerEditCancelBtn) {
    offerEditCancelBtn.addEventListener("click", () => {
      setOfferFormModeCreate();
      offerForm.reset();
      applyEventDateLimits();
      validateOfferDates();
    });
  }

  if (dateFields.inicio) dateFields.inicio.addEventListener("change", validateOfferDates);
  if (dateFields.fin) dateFields.fin.addEventListener("change", validateOfferDates);

  offerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { data: sessionData } = await client.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) {
      showAlert("warning", "Primero debés iniciar sesión.");
      return;
    }

    const formData = new FormData(offerForm);
    const imageFiles = formData.getAll("imagen_files").filter((item) => item instanceof File && item.size > 0);
    let imageDataUrls = [];

    if (imageFiles.length > 5) {
      showAlert("warning", "Puedes subir hasta 5 imagenes por oferta.");
      return;
    }

    const fileMeta = [];
    for (const imageFile of imageFiles) {
      if (imageFile.size > OFFER_IMAGE_MAX_BYTES) {
        showAlert("warning", "La imagen supera 8 MB. Sube una imagen mas liviana.");
        return;
      }
      try {
        const dims = await getImageDimensions(imageFile);
        if (dims.width < OFFER_IMAGE_MIN_WIDTH || dims.height < OFFER_IMAGE_MIN_HEIGHT) {
          showAlert(
            "warning",
            `La imagen es muy chica. Usa al menos ${OFFER_IMAGE_MIN_WIDTH}x${OFFER_IMAGE_MIN_HEIGHT} px para buena calidad.`
          );
          return;
        }
        const ratio = dims.width / Math.max(1, dims.height);
        if (ratio < OFFER_IMAGE_MIN_RATIO || ratio > OFFER_IMAGE_MAX_RATIO) {
          showAlert(
            "warning",
            `La imagen tiene una proporcion extrema. Permitido entre ${OFFER_IMAGE_MIN_RATIO}:1 y ${OFFER_IMAGE_MAX_RATIO}:1.`
          );
          return;
        }
        fileMeta.push({ file: imageFile, width: dims.width, height: dims.height });
      } catch (dimError) {
        showAlert("danger", dimError.message || "No se pudo validar la imagen.");
        return;
      }
    }

    let sortedImageFiles = imageFiles;
    const sortKey = typeof window.offerImageHeroSortKey === "function" ? window.offerImageHeroSortKey : null;
    if (fileMeta.length && sortKey) {
      fileMeta.sort((a, b) => sortKey(b.width, b.height) - sortKey(a.width, a.height));
      sortedImageFiles = fileMeta.map((m) => m.file);
    }

    if (sortedImageFiles.length) {
      try {
        imageDataUrls = await uploadOfferImagesToStorage(userId, sortedImageFiles);
      } catch (storageError) {
        // Fallback temporal para no bloquear publicación si falta configurar bucket/policies.
        showAlert("warning", "No se pudo usar Storage para imagenes. Se guardaran en formato alternativo temporalmente.");
        for (const imageFile of sortedImageFiles) {
          try {
            const dataUrl = await readFileAsDataUrl(imageFile);
            imageDataUrls.push(dataUrl);
          } catch (error) {
            showAlert("danger", error.message || "No se pudo procesar la imagen.");
            return;
          }
        }
      }
    }

    const payload = {
      owner_id: userId,
      comercio_nombre: normalizeText(formData.get("comercio_nombre")),
      comercio_ubicacion: normalizeText(formData.get("comercio_ubicacion")),
      comercio_whatsapp: normalizeText(formData.get("comercio_whatsapp")) || null,
      titulo: normalizeText(formData.get("titulo")),
      rubro: normalizeText(formData.get("rubro")),
      descripcion: normalizeText(formData.get("descripcion")),
      beneficio: normalizeText(formData.get("beneficio")),
      precio_regular: normalizeText(formData.get("precio_regular")) || null,
      precio_promocional: normalizeText(formData.get("precio_promocional")) || null,
      imagen_url: imageDataUrls[0] || null,
      imagen_urls: imageDataUrls.length ? imageDataUrls : null,
      fecha_inicio: normalizeText(formData.get("fecha_inicio")),
      fecha_fin: normalizeText(formData.get("fecha_fin")),
    };
    const isEditing = Boolean(editingOfferId);
    const existingOffer = isEditing ? myOffersById.get(String(editingOfferId)) : null;

    if (isEditing && !existingOffer) {
      showAlert("warning", "No se encontró la oferta a editar. Refresca e inténtalo de nuevo.");
      return;
    }

    if (isEditing) {
      payload.estado = existingOffer.estado || "pendiente";
      if (!imageDataUrls.length) {
        const existingImages = Array.isArray(existingOffer.imagen_urls) ? existingOffer.imagen_urls.filter(Boolean) : [];
        payload.imagen_url = existingOffer.imagen_url || null;
        payload.imagen_urls = existingImages.length ? existingImages : null;
      }
    } else {
      payload.estado = "pendiente";
    }

    const hasAtLeastOneImage = Boolean(
      payload.imagen_url || (Array.isArray(payload.imagen_urls) && payload.imagen_urls.length > 0)
    );
    if (!hasAtLeastOneImage) {
      showAlert("warning", "Debes subir al menos 1 imagen para guardar la oferta.");
      return;
    }

    if (payload.titulo.length < 4) {
      showAlert("warning", "El titulo debe tener al menos 4 caracteres.");
      return;
    }

    if (!payload.comercio_nombre || !payload.comercio_ubicacion) {
      showAlert("warning", "Completa nombre y ubicacion del comercio.");
      return;
    }

    if (!payload.fecha_inicio || !payload.fecha_fin) {
      showAlert("warning", "Selecciona fecha inicio y fecha fin.");
      return;
    }

    if (!validateOfferDates()) {
      showAlert("warning", "Revisa las fechas de vigencia antes de guardar.");
      return;
    }

    if (payload.fecha_fin < payload.fecha_inicio) {
      showAlert("warning", "La fecha fin no puede ser anterior a la fecha inicio.");
      return;
    }

    const { start: eventStart, end: eventEnd } = getEventDateStrings();
    if (payload.fecha_inicio < eventStart || payload.fecha_inicio > eventEnd || payload.fecha_fin < eventStart || payload.fecha_fin > eventEnd) {
      showAlert("warning", "La vigencia debe estar entre el 22 y el 25 de mayo.");
      return;
    }

    let error = null;
    if (isEditing) {
      const updated = await client.from("offers").update(payload).eq("id", editingOfferId).eq("owner_id", userId);
      error = updated.error;
      if (error && isMissingOptionalColumns(error)) {
        const legacyPayload = { ...payload };
        delete legacyPayload.imagen_urls;
        delete legacyPayload.precio_regular;
        delete legacyPayload.precio_promocional;
        delete legacyPayload.comercio_whatsapp;
        const fallback = await client.from("offers").update(legacyPayload).eq("id", editingOfferId).eq("owner_id", userId);
        error = fallback.error;
      }
    } else {
      const inserted = await client.from("offers").insert(payload);
      error = inserted.error;
      if (error && isMissingOptionalColumns(error)) {
        const legacyPayload = { ...payload };
        delete legacyPayload.imagen_urls;
        delete legacyPayload.precio_regular;
        delete legacyPayload.precio_promocional;
        delete legacyPayload.comercio_whatsapp;
        const fallback = await client.from("offers").insert(legacyPayload);
        error = fallback.error;
      }
    }
    if (error) {
      showAlert("danger", formatSupabaseError(error, "No se pudo guardar la oferta."));
      return;
    }

    showAlert("success", isEditing ? "Oferta actualizada correctamente." : "Oferta guardada en estado pendiente. Se publicara cuando admin la apruebe.");
    trackEvent(isEditing ? "merchant_offer_update_success" : "merchant_offer_create_success", {
      rubro: String(payload.rubro || ""),
      has_images: Array.isArray(payload.imagen_urls) && payload.imagen_urls.length > 0,
      has_whatsapp: Boolean(payload.comercio_whatsapp),
    });
    setOfferFormModeCreate();
    offerForm.reset();
    applyEventDateLimits();
    validateOfferDates();
    await loadMyOffers(userId);
  });

  client.auth.onAuthStateChange(() => {
    refreshSessionUI();
  });

  applyEventDateLimits();
  validateOfferDates();
  updateResendCooldownUI();
  refreshSessionUI();
})();
