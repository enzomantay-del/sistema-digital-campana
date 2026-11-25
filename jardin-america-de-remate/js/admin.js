(function () {
  const client = window.getSupabaseClient && window.getSupabaseClient();
  const alertBox = document.getElementById("admin-alert");
  const adminGate = document.getElementById("admin-gate");
  const adminWorkspace = document.getElementById("admin-workspace");
  const adminGateHelp = document.getElementById("admin-gate-help");
  const adminPanelForm = document.getElementById("admin-panel-form");
  const adminLogoutBtn = document.getElementById("admin-logout-btn");
  const filter = document.getElementById("estado-filter");
  const refreshBtn = document.getElementById("refresh-admin");
  const exportOffersBtn = document.getElementById("export-offers-csv");
  const offersWrap = document.getElementById("admin-offers");
  const offersEmpty = document.getElementById("admin-offers-empty");
  const eventForm = document.getElementById("event-form");
  const refreshEventsBtn = document.getElementById("refresh-events");
  const eventsWrap = document.getElementById("admin-events");
  const eventsEmpty = document.getElementById("admin-events-empty");
  const eventFormMode = document.getElementById("event-form-mode");
  const cancelEventEditBtn = document.getElementById("cancel-event-edit");
  const signupsBody = document.getElementById("circuit-signups-body");
  const signupsEmpty = document.getElementById("circuit-signups-empty");
  const refreshSignupsBtn = document.getElementById("refresh-signups");
  const exportSignupsBtn = document.getElementById("export-signups-csv");
  const signupCircuitFilter = document.getElementById("signup-circuit-filter");
  const signupDayFilter = document.getElementById("signup-day-filter");
  const providerReportsBody = document.getElementById("provider-reports-body");
  const providerReportsEmpty = document.getElementById("provider-reports-empty");
  const providerReportEstadoFilter = document.getElementById("provider-report-estado-filter");
  const refreshProviderReportsBtn = document.getElementById("refresh-provider-reports");
  const exportProviderReportsBtn = document.getElementById("export-provider-reports-csv");
  let editingEventId = null;
  let editingEventImageUrl = null;
  let cachedOffers = [];
  let cachedSignups = [];
  let cachedProviderReports = [];

  const PANEL_STORAGE_KEY = "jsw_admin_panel_unlocked";

  function panelSecretConfig() {
    return String(window.ADMIN_PANEL_SECRET || "").trim();
  }

  function adminEmailConfig() {
    return String(window.ADMIN_SUPABASE_EMAIL || "").trim();
  }

  function adminPasswordConfig() {
    return String(window.ADMIN_SUPABASE_PASSWORD || "").trim();
  }

  function isPanelUnlocked() {
    return sessionStorage.getItem(PANEL_STORAGE_KEY) === "1";
  }

  function setPanelUnlocked(value) {
    if (value) sessionStorage.setItem(PANEL_STORAGE_KEY, "1");
    else sessionStorage.removeItem(PANEL_STORAGE_KEY);
  }

  function showAlert(type, message) {
    if (!alertBox) return;
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
  }

  function clearAlert() {
    if (alertBox) {
      alertBox.classList.add("d-none");
      alertBox.textContent = "";
    }
  }

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function truncateText(str, max) {
    const t = String(str || "");
    if (t.length <= max) return t;
    return `${t.slice(0, max)}…`;
  }

  function labelProviderReportEstado(estado) {
    if (estado === "nueva") return "Nueva";
    if (estado === "vista") return "Vista";
    if (estado === "archivada") return "Archivada";
    return estado || "-";
  }

  function csvEscape(value) {
    const text = String(value == null ? "" : value);
    if (text.includes('"') || text.includes(",") || text.includes("\n")) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  function downloadCsv(filename, headers, rows) {
    const lines = [headers.map(csvEscape).join(",")].concat(rows.map((row) => row.map(csvEscape).join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("No se pudo leer el archivo de imagen."));
      reader.readAsDataURL(file);
    });
  }

  function labelCircuit(value) {
    if (value === "circuito_natural") return "Circuito natural";
    if (value === "circuito_cultural") return "Circuito cultural";
    return value || "-";
  }

  function labelDay(value) {
    if (value === "sabado_23_mayo") return "Sabado 23 de mayo";
    if (value === "domingo_24_mayo") return "Domingo 24 de mayo";
    return value || "-";
  }

  function isMissingOptionalColumns(error) {
    const code = String(error?.code || "");
    const message = String(error?.message || "").toLowerCase();
    return code === "42703" || code === "PGRST204" || message.includes("comercio_whatsapp");
  }

  if (!client) {
    showAlert("warning", "Configura Supabase en js/supabase-config.js para usar el panel admin.");
    return;
  }

  function setWorkspaceDisabled(disabled) {
    if (!adminWorkspace) return;
    adminWorkspace.querySelectorAll("input, select, textarea, button").forEach((el) => {
      el.disabled = disabled;
    });
  }

  function showLockedGate() {
    if (!adminGate || !adminWorkspace) return;
    adminGate.classList.remove("d-none");
    adminWorkspace.classList.add("d-none");
    if (adminLogoutBtn) adminLogoutBtn.classList.add("d-none");
  }

  function showAdminWorkspace() {
    if (!adminGate || !adminWorkspace) return;
    adminGate.classList.add("d-none");
    adminWorkspace.classList.remove("d-none");
    if (adminGateHelp) adminGateHelp.classList.add("d-none");
    if (adminLogoutBtn) adminLogoutBtn.classList.remove("d-none");
  }

  function showRoleHelp() {
    if (adminGateHelp) adminGateHelp.classList.remove("d-none");
  }

  function hideRoleHelp() {
    if (adminGateHelp) adminGateHelp.classList.add("d-none");
  }

  async function ensureSupabaseAdminSession() {
    const email = adminEmailConfig();
    const password = adminPasswordConfig();
    if (!email || !password) {
      showAlert("warning", "Completa ADMIN_SUPABASE_EMAIL y ADMIN_SUPABASE_PASSWORD en js/admin-access.js (usuario creado una vez en Supabase > Authentication > Add user).");
      return false;
    }

    const { data: sessionData } = await client.auth.getSession();
    const user = sessionData.session?.user;
    const role = user?.app_metadata?.role || "";

    if (user && role === "admin") return true;

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      showAlert("danger", error.message);
      return false;
    }

    const { data: after } = await client.auth.getSession();
    const roleAfter = after.session?.user?.app_metadata?.role || "";
    if (roleAfter !== "admin") {
      showRoleHelp();
      showAlert("danger", "La sesion no tiene rol admin. Ejecuta set-admin-app-role.sql en Supabase con tu email.");
      return false;
    }

    hideRoleHelp();
    return true;
  }

  async function refreshAdminUI() {
    clearAlert();

    if (!panelSecretConfig()) {
      showLockedGate();
      setWorkspaceDisabled(true);
      showAlert("warning", "Define ADMIN_PANEL_SECRET en js/admin-access.js (plantilla en js/admin-access.example.js).");
      return;
    }

    if (!isPanelUnlocked()) {
      showLockedGate();
      setWorkspaceDisabled(true);
      hideRoleHelp();
      return;
    }

    const ok = await ensureSupabaseAdminSession();
    if (!ok) {
      showLockedGate();
      setWorkspaceDisabled(true);
      return;
    }

    hideRoleHelp();
    showAdminWorkspace();
    setWorkspaceDisabled(false);
    await loadOffers();
    await loadEvents();
    await loadCircuitSignups();
    await loadProviderReports();
  }

  async function updateOfferStatus(id, estado) {
    const patch = { estado };
    if (estado === "aprobada") patch.approved_at = new Date().toISOString();
    const { error } = await client.from("offers").update(patch).eq("id", id);
    if (error) return showAlert("danger", error.message);
    showAlert("success", `Oferta marcada como ${estado}.`);
    await loadOffers();
  }

  function buildOfferCard(offer) {
    const images = Array.isArray(offer.imagen_urls) ? offer.imagen_urls.filter(Boolean) : [];
    const imageToShow = images[0] || offer.imagen_url || "";
    const regular = normalizeText(offer.precio_regular);
    const promo = normalizeText(offer.precio_promocional);
    const priceBlock = regular || promo
      ? `<p class="mb-1 small"><strong>Precios:</strong> ${regular ? `<span class="text-decoration-line-through text-secondary">${regular}</span>` : ""} ${promo ? `<span class="fw-bold text-danger ms-1">${promo}</span>` : ""}</p>`
      : "";
    const extraButtons = offer.estado === "pendiente"
      ? `<button data-id="${offer.id}" data-action="aprobada" class="btn btn-sm btn-success">Aprobar</button>
         <button data-id="${offer.id}" data-action="rechazada" class="btn btn-sm btn-danger">Rechazar</button>`
      : `<button data-id="${offer.id}" data-action="pendiente" class="btn btn-sm btn-warning">Volver a pendiente</button>
         <button data-id="${offer.id}" data-action="pausada" class="btn btn-sm btn-secondary">Pausar</button>`;

    const phoneLine = normalizeText(offer.comercio_telefono)
      ? `<p class="mb-1 small"><strong>Telefono:</strong> ${offer.comercio_telefono}</p>`
      : "";
    const waLine = normalizeText(offer.comercio_whatsapp)
      ? `<p class="mb-1 small"><strong>WhatsApp consultas:</strong> ${offer.comercio_whatsapp}</p>`
      : "";
    return `<div class="col"><article class="card h-100 border-0 shadow-sm">${imageToShow ? `<img src="${imageToShow}" class="card-img-top public-offer-img" alt="Imagen de oferta">` : ""}<div class="card-body"><span class="badge text-bg-light mb-2">${offer.rubro || "General"}</span><h3 class="h6">${offer.titulo}</h3><p class="small text-secondary">${offer.descripcion || ""}</p><p class="mb-1"><strong>Beneficio:</strong> ${offer.beneficio || "-"}</p>${priceBlock}<p class="mb-1 small"><strong>Comercio:</strong> ${offer.comercio_nombre || "-"}</p><p class="mb-1 small"><strong>Ubicacion:</strong> ${offer.comercio_ubicacion || "-"}</p>${phoneLine}${waLine}<p class="mb-2"><strong>Estado:</strong> ${offer.estado}</p><div class="d-flex flex-wrap gap-2">${extraButtons}</div></div></article></div>`;
  }

  async function loadOffers() {
    let { data, error } = await client.from("offers").select("id,titulo,descripcion,rubro,beneficio,precio_regular,precio_promocional,estado,imagen_url,imagen_urls,comercio_nombre,comercio_ubicacion,comercio_telefono,comercio_whatsapp").eq("estado", filter.value).order("created_at", { ascending: false });
    if (error && isMissingOptionalColumns(error)) {
      const fallback = await client.from("offers").select("id,titulo,descripcion,rubro,beneficio,estado,imagen_url,comercio_nombre,comercio_ubicacion,comercio_telefono").eq("estado", filter.value).order("created_at", { ascending: false });
      data = fallback.data;
      error = fallback.error;
    }
    if (error) return showAlert("danger", error.message);
    if (!data?.length) {
      cachedOffers = [];
      offersWrap.innerHTML = "";
      offersEmpty.style.display = "block";
      return;
    }
    cachedOffers = data.slice();
    offersEmpty.style.display = "none";
    offersWrap.innerHTML = data.map(buildOfferCard).join("");
  }

  function formatDateTime(dateText) {
    const date = new Date(dateText);
    if (Number.isNaN(date.getTime())) return dateText;
    return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(date);
  }

  function buildEventCard(eventItem) {
    return `<div class="col"><article class="card h-100 border-0 shadow-sm">${eventItem.imagen_url ? `<img src="${eventItem.imagen_url}" class="card-img-top public-offer-img" alt="Imagen de evento">` : ""}<div class="card-body"><span class="badge text-bg-light mb-2">${eventItem.categoria || "General"}</span><h3 class="h6">${eventItem.titulo}</h3><p class="small text-secondary">${eventItem.descripcion || ""}</p><p class="mb-2 small"><strong>Lugar:</strong> ${eventItem.ubicacion || "-"}</p><p class="mb-2"><strong>Estado:</strong> ${eventItem.estado}</p><div class="d-flex flex-wrap gap-2"><button data-event-edit="1" data-event-id="${eventItem.id}" data-event-titulo="${String(eventItem.titulo || "").replaceAll('"', "&quot;")}" data-event-categoria="${String(eventItem.categoria || "").replaceAll('"', "&quot;")}" data-event-descripcion="${String(eventItem.descripcion || "").replaceAll('"', "&quot;")}" data-event-ubicacion="${String(eventItem.ubicacion || "").replaceAll('"', "&quot;")}" data-event-estado="${String(eventItem.estado || "").replaceAll('"', "&quot;")}" data-event-imagen="${String(eventItem.imagen_url || "").replaceAll('"', "&quot;")}" class="btn btn-sm btn-outline-primary">Editar</button><button data-event-id="${eventItem.id}" data-event-action="publicado" class="btn btn-sm btn-success">Publicar</button><button data-event-id="${eventItem.id}" data-event-action="borrador" class="btn btn-sm btn-warning">Borrador</button><button data-event-id="${eventItem.id}" data-event-action="cancelado" class="btn btn-sm btn-secondary">Cancelar</button></div></div></article></div>`;
  }

  async function loadEvents() {
    const { data, error } = await client.from("events").select("id,titulo,descripcion,categoria,ubicacion,inicia_en,finaliza_en,imagen_url,estado").order("inicia_en", { ascending: true });
    if (error) return showAlert("danger", error.message);
    if (!data?.length) {
      eventsWrap.innerHTML = "";
      eventsEmpty.style.display = "block";
      return;
    }
    eventsEmpty.style.display = "none";
    eventsWrap.innerHTML = data.map(buildEventCard).join("");
  }

  async function loadProviderReports() {
    if (!providerReportsBody || !providerReportsEmpty) return;

    let query = client
      .from("provider_reports")
      .select(
        "id,offer_id,comercio_indicado,titulo_promocion,nombre_informante,contacto_informante,detalle,estado,created_at"
      )
      .order("created_at", { ascending: false });

    if (providerReportEstadoFilter && providerReportEstadoFilter.value !== "all") {
      query = query.eq("estado", providerReportEstadoFilter.value);
    }

    const { data, error } = await query;
    if (error) {
      cachedProviderReports = [];
      providerReportsBody.innerHTML = "";
      providerReportsEmpty.style.display = "block";
      const msg = String(error.message || "");
      const needsMigration =
        msg.includes("provider_reports") || msg.includes("schema cache") || msg.includes("Could not find the table");
      providerReportsEmpty.textContent = needsMigration
        ? "Ejecutá en Supabase el bloque SQL de la tabla provider_reports (archivo supabase-schema.sql) y volvé a actualizar."
        : msg;
      if (!needsMigration) showAlert("danger", msg);
      return;
    }

    if (!data?.length) {
      cachedProviderReports = [];
      providerReportsBody.innerHTML = "";
      providerReportsEmpty.style.display = "block";
      providerReportsEmpty.textContent = "No hay informes con este filtro.";
      return;
    }

    cachedProviderReports = data.slice();
    providerReportsEmpty.style.display = "none";
    providerReportsBody.innerHTML = data
      .map((row) => {
        const detalleFull = escapeHtml(row.detalle || "");
        const detalleShort = escapeHtml(truncateText(row.detalle, 140));
        const oid = row.offer_id ? String(row.offer_id) : "";
        const offerCell = oid
          ? `<code class="small" title="${escapeHtml(oid)}">${escapeHtml(oid.slice(0, 8))}…</code>`
          : "—";
        const actions =
          row.estado === "archivada"
            ? "—"
            : `<div class="d-flex flex-wrap gap-1">
            ${row.estado === "nueva" ? `<button type="button" class="btn btn-sm btn-outline-primary py-0" data-report-id="${row.id}" data-report-next="vista">Vista</button>` : ""}
            <button type="button" class="btn btn-sm btn-outline-secondary py-0" data-report-id="${row.id}" data-report-next="archivada">Archivar</button>
          </div>`;
        return `<tr>
        <td>${formatDateTime(row.created_at)}</td>
        <td><span class="badge text-bg-light">${escapeHtml(labelProviderReportEstado(row.estado))}</span></td>
        <td>${escapeHtml(row.comercio_indicado || "-")}</td>
        <td>${escapeHtml(row.titulo_promocion || "—")}</td>
        <td>${escapeHtml(row.nombre_informante || "-")}</td>
        <td>${escapeHtml(row.contacto_informante || "-")}</td>
        <td class="small text-break text-muted"><span title="${detalleFull}">${detalleShort}</span></td>
        <td>${offerCell}</td>
        <td>${actions}</td>
      </tr>`;
      })
      .join("");
  }

  async function updateProviderReportStatus(id, estado) {
    const { error } = await client.from("provider_reports").update({ estado }).eq("id", id);
    if (error) return showAlert("danger", error.message);
    showAlert("success", "Informe actualizado.");
    await loadProviderReports();
  }

  async function loadCircuitSignups() {
    if (!signupsBody || !signupsEmpty) return;

    let query = client
      .from("circuit_signups")
      .select("id,circuito,dia_actividad,nombre_completo,dni,fecha_nacimiento,contacto,procedencia,created_at")
      .order("created_at", { ascending: false });

    if (signupCircuitFilter && signupCircuitFilter.value !== "all") {
      query = query.eq("circuito", signupCircuitFilter.value);
    }

    if (signupDayFilter && signupDayFilter.value !== "all") {
      query = query.eq("dia_actividad", signupDayFilter.value);
    }

    const { data, error } = await query;
    if (error) return showAlert("danger", error.message);

    if (!data?.length) {
      cachedSignups = [];
      signupsBody.innerHTML = "";
      signupsEmpty.style.display = "block";
      return;
    }

    cachedSignups = data.slice();
    signupsEmpty.style.display = "none";
    signupsBody.innerHTML = data.map((row) => `
      <tr>
        <td>${formatDateTime(row.created_at)}</td>
        <td>${labelCircuit(row.circuito)}</td>
        <td>${labelDay(row.dia_actividad)}</td>
        <td>${row.nombre_completo || "-"}</td>
        <td>${row.dni || "-"}</td>
        <td>${row.fecha_nacimiento || "-"}</td>
        <td>${row.contacto || "-"}</td>
        <td>${row.procedencia || "-"}</td>
      </tr>
    `).join("");
  }

  async function updateEventStatus(id, estado) {
    const { error } = await client.from("events").update({ estado }).eq("id", id);
    if (error) return showAlert("danger", error.message);
    showAlert("success", `Evento marcado como ${estado}.`);
    await loadEvents();
  }

  function enterCreateMode() {
    editingEventId = null;
    editingEventImageUrl = null;
    if (eventForm) eventForm.reset();
    if (eventFormMode) eventFormMode.textContent = "Modo: crear evento nuevo";
    if (cancelEventEditBtn) cancelEventEditBtn.classList.add("d-none");
  }

  function enterEditMode(eventItem) {
    editingEventId = eventItem.id;
    editingEventImageUrl = eventItem.imagen_url || null;
    if (!eventForm) return;
    eventForm.titulo.value = eventItem.titulo || "";
    eventForm.categoria.value = eventItem.categoria || "";
    eventForm.descripcion.value = eventItem.descripcion || "";
    eventForm.ubicacion.value = eventItem.ubicacion || "";
    eventForm.estado.value = eventItem.estado || "borrador";
    if (eventFormMode) eventFormMode.textContent = `Modo: editando evento (${eventItem.titulo || eventItem.id})`;
    if (cancelEventEditBtn) cancelEventEditBtn.classList.remove("d-none");
    eventForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  offersWrap.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-id][data-action]");
    if (!btn) return;
    await updateOfferStatus(btn.dataset.id, btn.dataset.action);
  });

  eventsWrap.addEventListener("click", async (e) => {
    const editBtn = e.target.closest("button[data-event-edit]");
    if (editBtn) {
      const eventItem = {
        id: editBtn.dataset.eventId,
        titulo: editBtn.dataset.eventTitulo,
        categoria: editBtn.dataset.eventCategoria,
        descripcion: editBtn.dataset.eventDescripcion,
        ubicacion: editBtn.dataset.eventUbicacion,
        estado: editBtn.dataset.eventEstado,
        imagen_url: editBtn.dataset.eventImagen || null,
      };
      enterEditMode(eventItem);
      return;
    }

    const btn = e.target.closest("button[data-event-id][data-event-action]");
    if (!btn) return;
    await updateEventStatus(btn.dataset.eventId, btn.dataset.eventAction);
  });

  eventForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(eventForm);
    const now = new Date();
    const finish = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 365 * 5);
    const imageFile = formData.get("imagen_file");
    let imageDataUrl = null;

    if (imageFile instanceof File && imageFile.size > 0) {
      const maxImageBytes = 2 * 1024 * 1024;
      if (imageFile.size > maxImageBytes) {
        showAlert("warning", "La imagen supera 2 MB. Sube una imagen mas liviana.");
        return;
      }
      try {
        imageDataUrl = await readFileAsDataUrl(imageFile);
      } catch (fileError) {
        showAlert("danger", fileError.message || "No se pudo procesar la imagen.");
        return;
      }
    }

    const payload = {
      titulo: normalizeText(formData.get("titulo")),
      categoria: normalizeText(formData.get("categoria")),
      descripcion: normalizeText(formData.get("descripcion")),
      ubicacion: normalizeText(formData.get("ubicacion")),
      estado: normalizeText(formData.get("estado")),
    };
    if (payload.titulo.length < 4) return showAlert("warning", "El titulo del evento debe tener al menos 4 caracteres.");

    let error = null;
    if (editingEventId) {
      const updatePayload = {
        titulo: payload.titulo,
        categoria: payload.categoria,
        descripcion: payload.descripcion,
        ubicacion: payload.ubicacion,
        estado: payload.estado,
        imagen_url: imageDataUrl || editingEventImageUrl || null,
      };
      const result = await client.from("events").update(updatePayload).eq("id", editingEventId);
      error = result.error;
    } else {
      const insertPayload = {
        ...payload,
        inicia_en: now.toISOString(),
        finaliza_en: finish.toISOString(),
        imagen_url: imageDataUrl,
      };
      const result = await client.from("events").insert(insertPayload);
      error = result.error;
    }

    if (error) return showAlert("danger", error.message);
    showAlert("success", editingEventId ? "Evento actualizado correctamente." : "Evento guardado correctamente.");
    enterCreateMode();
    await loadEvents();
  });

  refreshBtn.addEventListener("click", loadOffers);
  filter.addEventListener("change", loadOffers);
  refreshEventsBtn.addEventListener("click", loadEvents);
  if (cancelEventEditBtn) cancelEventEditBtn.addEventListener("click", enterCreateMode);
  if (refreshSignupsBtn) refreshSignupsBtn.addEventListener("click", loadCircuitSignups);
  if (signupCircuitFilter) signupCircuitFilter.addEventListener("change", loadCircuitSignups);
  if (signupDayFilter) signupDayFilter.addEventListener("change", loadCircuitSignups);
  if (exportOffersBtn) {
    exportOffersBtn.addEventListener("click", () => {
      if (!cachedOffers.length) {
        showAlert("warning", "No hay ofertas para exportar con el filtro actual.");
        return;
      }
      const headers = ["id", "estado", "rubro", "titulo", "comercio_nombre", "comercio_ubicacion", "comercio_whatsapp", "beneficio", "precio_regular", "precio_promocional"];
      const rows = cachedOffers.map((offer) => [
        offer.id,
        offer.estado,
        offer.rubro,
        offer.titulo,
        offer.comercio_nombre,
        offer.comercio_ubicacion,
        offer.comercio_whatsapp,
        offer.beneficio,
        offer.precio_regular,
        offer.precio_promocional,
      ]);
      downloadCsv(`ofertas-${filter.value}-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    });
  }
  if (exportSignupsBtn) {
    exportSignupsBtn.addEventListener("click", () => {
      if (!cachedSignups.length) {
        showAlert("warning", "No hay inscriptos para exportar con el filtro actual.");
        return;
      }
      const headers = ["created_at", "circuito", "dia_actividad", "nombre_completo", "dni", "fecha_nacimiento", "contacto", "procedencia"];
      const rows = cachedSignups.map((row) => [
        row.created_at,
        row.circuito,
        row.dia_actividad,
        row.nombre_completo,
        row.dni,
        row.fecha_nacimiento,
        row.contacto,
        row.procedencia,
      ]);
      downloadCsv(`inscriptos-circuitos-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    });
  }

  if (providerReportsBody) {
    providerReportsBody.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-report-id][data-report-next]");
      if (!b) return;
      await updateProviderReportStatus(b.dataset.reportId, b.dataset.reportNext);
    });
  }
  if (refreshProviderReportsBtn) refreshProviderReportsBtn.addEventListener("click", loadProviderReports);
  if (providerReportEstadoFilter) providerReportEstadoFilter.addEventListener("change", loadProviderReports);
  if (exportProviderReportsBtn) {
    exportProviderReportsBtn.addEventListener("click", () => {
      if (!cachedProviderReports.length) {
        showAlert("warning", "No hay informes para exportar con el filtro actual.");
        return;
      }
      const headers = [
        "created_at",
        "estado",
        "comercio_indicado",
        "titulo_promocion",
        "nombre_informante",
        "contacto_informante",
        "detalle",
        "offer_id",
        "id",
      ];
      const rows = cachedProviderReports.map((row) => [
        row.created_at,
        row.estado,
        row.comercio_indicado,
        row.titulo_promocion,
        row.nombre_informante,
        row.contacto_informante,
        row.detalle,
        row.offer_id,
        row.id,
      ]);
      downloadCsv(`informes-prestadores-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    });
  }

  if (adminPanelForm) {
    adminPanelForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAlert();
      const expected = panelSecretConfig();
      if (!expected) {
        showAlert("warning", "Define ADMIN_PANEL_SECRET en js/admin-access.js.");
        return;
      }
      const fd = new FormData(adminPanelForm);
      const entered = normalizeText(fd.get("panel_secret"));
      if (entered !== expected) {
        showAlert("danger", "Clave incorrecta.");
        return;
      }
      setPanelUnlocked(true);
      adminPanelForm.reset();
      await refreshAdminUI();
    });
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", async () => {
      clearAlert();
      setPanelUnlocked(false);
      hideRoleHelp();
      await client.auth.signOut();
      await refreshAdminUI();
    });
  }

  client.auth.onAuthStateChange(() => {
    refreshAdminUI();
  });

  refreshAdminUI();
})();
