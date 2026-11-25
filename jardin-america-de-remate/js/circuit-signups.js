(function () {
  const form = document.getElementById("circuit-signup-form");
  const alertBox = document.getElementById("signup-alert");
  const signupWindowHint = document.getElementById("signup-window-hint");
  const prefillButtons = document.querySelectorAll(".js-prefill-circuit");
  if (!form || !alertBox) return;

  const client = window.getSupabaseClient && window.getSupabaseClient();
  if (!client) {
    alertBox.className = "alert alert-warning";
    alertBox.textContent = "Configura Supabase para habilitar la inscripcion a circuitos.";
    alertBox.classList.remove("d-none");
    return;
  }

  function showAlert(type, message) {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
    alertBox.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function normalize(value) {
    return String(value || "").trim();
  }

  function setupPrefillButtons() {
    prefillButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const circuito = button.getAttribute("data-circuito") || "";
        const dia = button.getAttribute("data-dia") || "";
        const circuitoSelect = form.querySelector('select[name="circuito"]');
        const diaSelect = form.querySelector('select[name="dia_actividad"]');
        if (circuitoSelect && circuito) circuitoSelect.value = circuito;
        if (diaSelect && dia) diaSelect.value = dia;
        updateSignupAvailability();
      });
    });
  }

  function getDepartureDate(circuito, diaActividad) {
    const dayMap = {
      sabado_23_mayo: { month: 4, day: 23 },
      domingo_24_mayo: { month: 4, day: 24 },
    };
    const timeMap = {
      circuito_natural: { hours: 10, minutes: 0 },
      circuito_cultural: { hours: 17, minutes: 0 },
    };
    const dayCfg = dayMap[diaActividad];
    const timeCfg = timeMap[circuito];
    if (!dayCfg || !timeCfg) return null;
    const now = new Date();
    return new Date(now.getFullYear(), dayCfg.month, dayCfg.day, timeCfg.hours, timeCfg.minutes, 0, 0);
  }

  function isSignupClosed(circuito, diaActividad) {
    const departure = getDepartureDate(circuito, diaActividad);
    if (!departure) return false;
    const closeDate = new Date(departure.getTime() - 2 * 60 * 60 * 1000);
    return new Date() >= closeDate;
  }

  function updateSignupAvailability() {
    const formData = new FormData(form);
    const circuito = normalize(formData.get("circuito"));
    const dia = normalize(formData.get("dia_actividad"));
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!circuito || !dia) {
      if (signupWindowHint) signupWindowHint.textContent = "La inscripcion cierra 2 horas antes de la salida de cada circuito.";
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    const departure = getDepartureDate(circuito, dia);
    const closed = isSignupClosed(circuito, dia);
    if (departure && signupWindowHint) {
      signupWindowHint.textContent = `Salida prevista: ${departure.toLocaleString("es-AR")}. Cierre de inscripcion: 2 horas antes.`;
    }
    if (submitBtn) submitBtn.disabled = closed;
    if (closed) {
      showAlert("warning", "La inscripcion para este circuito ya esta cerrada (2 horas antes de la salida).");
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = {
      circuito: normalize(formData.get("circuito")),
      dia_actividad: normalize(formData.get("dia_actividad")),
      nombre_completo: normalize(formData.get("nombre_completo")),
      dni: normalize(formData.get("dni")),
      fecha_nacimiento: normalize(formData.get("fecha_nacimiento")),
      contacto: normalize(formData.get("contacto")),
      procedencia: normalize(formData.get("procedencia")),
    };

    if (!payload.circuito || !payload.dia_actividad) {
      showAlert("warning", "Seleccioná circuito y día para completar la inscripción.");
      return;
    }

    if (isSignupClosed(payload.circuito, payload.dia_actividad)) {
      showAlert("warning", "La inscripcion para este circuito ya esta cerrada (2 horas antes de la salida).");
      updateSignupAvailability();
      return;
    }

    const { data, error } = await client.from("circuit_signups").insert(payload).select("id").single();
    if (error) {
      showAlert("danger", error.message || "No se pudo registrar la inscripcion.");
      return;
    }

    const code = String(data?.id || "").slice(0, 8).toUpperCase();
    showAlert("success", `Inscripcion registrada con exito. Codigo de referencia: ${code || "N/A"}.`);
    form.reset();
    updateSignupAvailability();
  });

  form.addEventListener("change", updateSignupAvailability);
  setupPrefillButtons();
  updateSignupAvailability();
})();
