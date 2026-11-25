(function () {
  const grid = document.getElementById("eventos-publicos");
  const empty = document.getElementById("eventos-publicos-empty");
  const loading = document.getElementById("events-loading");
  if (!grid || !empty) return;

  const client = window.getSupabaseClient && window.getSupabaseClient();
  /** No mostrar el cartel de “sin eventos” hasta tener respuesta del servidor. */
  let eventsInitialFetchDone = false;
  const EVENTS_EMPTY_MESSAGE =
    "Aún no hay eventos publicados. Volvé a consultar en breve.";
  const EVENTS_LOADING_MESSAGE = "Cargando eventos...";
  const FALLBACK_EVENT_IMAGE = "evento-vegetacion.png";
  function setEventsLoading(isLoading) {
    if (loading) loading.classList.toggle("d-none", !isLoading);
    if (grid) grid.style.display = isLoading ? "none" : "";
    if (!empty) return;
    if (isLoading) {
      empty.textContent = EVENTS_LOADING_MESSAGE;
      empty.classList.remove("d-none");
    }
  }

  if (!client) {
    empty.textContent = "Configura Supabase en js/supabase-config.js para ver eventos publicados.";
    empty.classList.remove("d-none");
    setEventsLoading(false);
    if (grid) grid.style.display = "none";
    return;
  }

  setEventsLoading(true);

  let cachedPublicEvents = [];

  function categoryLabel(value) {
    const key = String(value || "").toLowerCase();
    if (key === "turistico") return "🌿 Turistico";
    if (key === "cultural") return "🏛 Cultural";
    if (key === "gastronomico") return "🍽 Gastronomico";
    return value ? `🎉 ${value}` : "🎉 General";
  }

  function categoryClass(value) {
    const key = String(value || "").toLowerCase();
    if (key === "turistico" || key === "cultural" || key === "gastronomico") return `event-cat-${key}`;
    return "event-cat-general";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDescription(description) {
    const text = String(description || "").trim();
    if (!text) return "<p class=\"mb-0 text-secondary\">Sin descripcion.</p>";
    const parts = text
      .split("•")
      .map((chunk) => chunk.trim())
      .filter(Boolean);

    if (parts.length <= 1) {
      // Respeta saltos de línea cargados en admin.
      const html = escapeHtml(text).replace(/\r?\n/g, "<br>");
      return `<p class="mb-0 text-secondary">${html}</p>`;
    }

    return `<ul class="event-list mb-0">${parts.map((item) => `<li>${escapeHtml(item).replace(/\r?\n/g, "<br>")}</li>`).join("")}</ul>`;
  }

  function eventSummary(description) {
    const raw = String(description || "").trim();
    if (!raw) return "Sin descripción.";
    const firstChunk = raw
      .replace(/\r/g, "")
      .split("\n")
      .map((part) => part.trim())
      .find(Boolean) || raw;
    const cleaned = firstChunk.replace(/^•\s*/u, "");
    if (cleaned.length <= 140) return cleaned;
    return `${cleaned.slice(0, 137)}...`;
  }

  function renderEvents(events) {
    if (!events.length) {
      if (!eventsInitialFetchDone) {
        if (empty) {
          empty.textContent = EVENTS_LOADING_MESSAGE;
          empty.classList.remove("d-none");
        }
        return;
      }
      grid.innerHTML = "";
      if (empty) {
        empty.textContent = EVENTS_EMPTY_MESSAGE;
        empty.classList.remove("d-none");
      }
      cachedPublicEvents = [];
      return;
    }

    if (empty) {
      empty.textContent = EVENTS_EMPTY_MESSAGE;
      empty.classList.add("d-none");
    }
    cachedPublicEvents = events;
    grid.innerHTML = events
      .map((eventItem) => {
        const category = categoryLabel(eventItem.categoria);
        const catClass = categoryClass(eventItem.categoria);
        const imageUrl = String(eventItem.imagen_url || "").trim() || FALLBACK_EVENT_IMAGE;
        const summary = escapeHtml(eventSummary(eventItem.descripcion));
        const safeTitle = escapeHtml(eventItem.titulo || "Evento");
        const cardId = String(eventItem.id || "").replace(/[^a-zA-Z0-9_-]/g, "");
        const detailsId = `event-more-${cardId}`;
        const hero = `<img src="${imageUrl}" class="event-reel-image ${catClass}" alt="Evento ${safeTitle}" loading="lazy" decoding="async">`;
        return `
        <div class="col">
          <article class="card event-card event-reel event-reel-zoomable h-100 border-0 shadow-sm ${catClass}" data-event-id="${cardId}" title="Tocá la tarjeta para ver la imagen más grande">
            <div class="event-reel-media">
              ${hero}
              <div class="event-reel-overlay">
                <span class="badge event-cat-badge mb-2">${category}</span>
                <h3 class="event-title mb-1">${eventItem.titulo}</h3>
                <p class="event-reel-summary mb-2">${summary}</p>
                <button class="btn btn-sm btn-light event-more-btn" type="button" data-bs-toggle="collapse" data-bs-target="#${detailsId}" aria-expanded="false" aria-controls="${detailsId}">
                  Más info
                </button>
              </div>
            </div>
            <div class="collapse" id="${detailsId}">
              <div class="card-body event-card-body">
                <div class="event-description mb-3">${formatDescription(eventItem.descripcion)}</div>
                <p class="event-meta mb-0"><strong>📍 Lugar:</strong> ${eventItem.ubicacion || "-"}</p>
              </div>
            </div>
          </article>
        </div>
      `;
      })
      .join("");
  }

  async function loadEvents() {
    setEventsLoading(true);
    const nowIso = new Date().toISOString();
    const { data, error } = await client
      .from("events")
      .select("id,titulo,descripcion,categoria,ubicacion,inicia_en,finaliza_en,imagen_url,estado")
      .eq("estado", "publicado")
      .gte("finaliza_en", nowIso)
      .order("inicia_en", { ascending: true });

    if (error) {
      eventsInitialFetchDone = true;
      empty.textContent = "No se pudieron cargar eventos. Verifica configuracion y RLS.";
      empty.classList.remove("d-none");
      setEventsLoading(false);
      return;
    }

    eventsInitialFetchDone = true;
    renderEvents(data || []);
    setEventsLoading(false);
  }

  if (client && grid) {
    grid.addEventListener("click", (e) => {
      if (e.target.closest("a[href]")) return;
      if (e.target.closest("button")) return;
      const card = e.target.closest("article.event-reel-zoomable[data-event-id]");
      if (!card) return;
      const id = String(card.getAttribute("data-event-id") || "");
      const ev = cachedPublicEvents.find((x) => String(x.id) === id);
      if (!ev) return;
      const imageUrl = String(ev.imagen_url || "").trim() || FALLBACK_EVENT_IMAGE;
      if (typeof window.openPublicMediaModal === "function") {
        window.openPublicMediaModal(ev.titulo || "Evento", [imageUrl]);
      }
      if (typeof window.trackEvent === "function") {
        window.trackEvent("event_card_media_zoom", { event_id: id });
      }
    });
  }

  loadEvents();
})();
