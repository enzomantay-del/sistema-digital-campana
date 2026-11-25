(function () {
  const grid = document.getElementById("ofertas-publicas");
  const empty = document.getElementById("ofertas-publicas-empty");
  const loading = document.getElementById("offers-loading");
  const backgroundLoading = document.getElementById("offers-background-loading");
  const filtersWrap = document.getElementById("offer-filters");
  const loadMoreBtn = document.getElementById("offers-load-more");
  const searchInput = document.getElementById("offer-search");
  if (!grid || !empty) return;
  let allOffers = [];
  let activeRubro = "all";
  let searchTerm = "";
  const PAGE_SIZE = 20;
  const INITIAL_BATCH_SIZE = 15;
  const BACKGROUND_BATCH_SIZE = 100;
  let visibleCount = PAGE_SIZE;
  let hasMissingOptionalColumns = false;
  /** Evita el cartel vacío si el usuario filtra antes de que termine el primer fetch. */
  let offersInitialFetchDone = false;

  const client = window.getSupabaseClient && window.getSupabaseClient();
  const trackEvent = typeof window.trackEvent === "function" ? window.trackEvent : () => {};
  const OFFERS_SELECT_FULL =
    "id,owner_id,titulo,beneficio,precio_regular,precio_promocional,rubro,fecha_inicio,fecha_fin,created_at,imagen_url,imagen_urls,estado,comercio_nombre,comercio_ubicacion,comercio_telefono,comercio_whatsapp";
  const OFFERS_SELECT_FALLBACK =
    "id,owner_id,titulo,beneficio,rubro,fecha_inicio,fecha_fin,created_at,imagen_url,estado,comercio_nombre,comercio_ubicacion,comercio_telefono";
  const OFFERS_DETAIL_FIELDS = "id,descripcion";

  function setOffersLoading(isLoading) {
    if (loading) loading.classList.toggle("d-none", !isLoading);
    if (grid) grid.style.display = isLoading ? "none" : "";
    if (empty && isLoading) empty.classList.add("d-none");
  }

  function setBackgroundOffersLoading(isLoading) {
    if (!backgroundLoading) return;
    backgroundLoading.classList.toggle("d-none", !isLoading);
  }

  if (!client) {
    offersInitialFetchDone = true;
    empty.textContent = "Configura Supabase en js/supabase-config.js para ver ofertas publicadas.";
    empty.classList.remove("d-none");
    setOffersLoading(false);
  }

  function formatDate(dateText) {
    if (!dateText) return "-";
    const text = String(dateText).trim();
    const date = /^\d{4}-\d{2}-\d{2}$/.test(text)
      ? new Date(`${text}T12:00:00`)
      : new Date(text);
    if (Number.isNaN(date.getTime())) return dateText;
    return new Intl.DateTimeFormat("es-AR").format(date);
  }

  /** Solo dígitos para wa.me (internacional, sin espacios ni +). */
  function whatsappDigitsForWaMe(raw) {
    const digits = String(raw || "").replace(/\D/gu, "");
    if (!digits) return "";
    const d = digits.replace(/^0+/, "");
    if (d.length < 8 || d.length > 15) return "";
    return d;
  }

  /** Precio visible: agrega $ si hay cifras y aun no empieza con $. */
  function formatPriceLabel(raw) {
    const s = String(raw || "").trim();
    if (!s) return "";
    if (/^\$/u.test(s)) return s;
    if (/\d/u.test(s)) return `$${s}`;
    return s;
  }

  function isVigente(offer) {
    const today = new Date().toISOString().slice(0, 10);
    const ini = String(offer.fecha_inicio || "");
    const fin = String(offer.fecha_fin || "");
    if (!ini || !fin) return true;
    return ini <= today && fin >= today;
  }

  function rubroClass(rubro) {
    const key = String(rubro || "general").toLowerCase();
    if (key === "comercio" || key === "alojamiento" || key === "gastronomico") {
      return `offer-rubro-${key}`;
    }
    return "offer-rubro-general";
  }

  function normalizeRubro(rubro) {
    const key = String(rubro || "").toLowerCase();
    if (key === "gastronomico") return "Gastronomia";
    if (key === "alojamiento") return "Alojamiento";
    if (key === "comercio") return "Comercio";
    return "General";
  }

  function isMissingOptionalColumns(error) {
    const code = String(error?.code || "");
    const message = String(error?.message || "").toLowerCase();
    return (
      code === "42703" ||
      code === "PGRST204" ||
      message.includes("schema cache") ||
      message.includes("comercio_whatsapp")
    );
  }

  function getFilteredOffers() {
    const rubroFiltered = activeRubro === "all"
      ? allOffers
      : allOffers.filter((offer) => String(offer.rubro || "").toLowerCase() === activeRubro);
    if (!searchTerm) return rubroFiltered;
    return rubroFiltered.filter((offer) => {
      const haystack = [
        offer.comercio_nombre,
        offer.titulo,
        offer.descripcion,
        offer.beneficio,
        offer.comercio_ubicacion,
      ]
        .map((v) => String(v || "").toLowerCase())
        .join(" ");
      return haystack.includes(searchTerm);
    });
  }

  function isEndingToday(offer) {
    const today = new Date().toISOString().slice(0, 10);
    return String(offer?.fecha_fin || "") === today;
  }

  function isNewOffer(offer) {
    const createdRaw = String(offer?.created_at || "").trim();
    if (!createdRaw) return false;
    const createdAt = new Date(createdRaw);
    if (Number.isNaN(createdAt.getTime())) return false;
    const dayMs = 24 * 60 * 60 * 1000;
    return Date.now() - createdAt.getTime() <= dayMs;
  }

  function updateLoadMoreButton(totalCount, renderedCount) {
    if (!loadMoreBtn) return;
    if (totalCount > renderedCount) {
      loadMoreBtn.classList.remove("d-none");
      loadMoreBtn.textContent = `Ver más ofertas (${totalCount - renderedCount} restantes)`;
    } else {
      loadMoreBtn.classList.add("d-none");
    }
  }

  function renderCurrentPage() {
    const filtered = getFilteredOffers();
    const visible = filtered.slice(0, visibleCount);
    renderOffers(visible);
    updateLoadMoreButton(filtered.length, visible.length);
  }

  function getExampleOwnerIdSet() {
    const raw = window.EXAMPLE_OFFER_OWNER_IDS;
    if (!Array.isArray(raw) || !raw.length) return new Set();
    return new Set(raw.map((id) => String(id)));
  }

  const exampleOwnerIds = getExampleOwnerIdSet();

  function isExampleOffer(offer) {
    const oid = offer && offer.owner_id != null ? String(offer.owner_id) : "";
    return Boolean(oid && exampleOwnerIds.has(oid));
  }

  function extractOfferImageUrls(offer) {
    if (Array.isArray(offer.imagen_urls) && offer.imagen_urls.length) {
      return offer.imagen_urls.filter(Boolean).slice(0, 5);
    }
    return offer.imagen_url ? [offer.imagen_url] : [];
  }

  function nextPaint() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  }

  async function mergeDescriptionsForIds(ids) {
    const unique = [...new Set(ids.map((id) => String(id)))].filter(Boolean);
    if (!unique.length || !client) return;
    const CHUNK = 50;
    const map = {};
    for (let i = 0; i < unique.length; i += CHUNK) {
      const slice = unique.slice(i, i + CHUNK);
      const { data: rows, error } = await client
        .from("offers")
        .select(OFFERS_DETAIL_FIELDS)
        .in("id", slice)
        .eq("estado", "aprobada");
      if (error) {
        console.warn("[public-offers] descripciones parciales:", error.message || error);
        continue;
      }
      (Array.isArray(rows) ? rows : []).forEach((row) => {
        map[String(row.id)] = row.descripcion;
      });
    }
    for (let j = 0; j < allOffers.length; j += 1) {
      const o = allOffers[j];
      const d = map[String(o.id)];
      if (d !== undefined) o.descripcion = d;
    }
  }

  function renderOffers(offers) {
    if (!offers.length) {
      if (!offersInitialFetchDone) {
        if (empty) empty.classList.add("d-none");
        return;
      }
      grid.innerHTML = "";
      empty.classList.remove("d-none");
      return;
    }

    empty.classList.add("d-none");
    grid.innerHTML = offers
      .map((offer) => {
        const rubro = normalizeRubro(offer.rubro);
        const waDigits = whatsappDigitsForWaMe(offer.comercio_whatsapp);
        let cta = "";
        if (waDigits) {
          const msg = `Hola! Consulto sobre la oferta: ${offer.titulo || "una oferta"}${offer.comercio_nombre ? ` (${offer.comercio_nombre})` : ""}.`;
          const href = `https://wa.me/${waDigits}?text=${encodeURIComponent(msg)}`;
          cta = `<a class="btn btn-sm btn-offer-wa mt-2" href="${href}" target="_blank" rel="noopener noreferrer" data-offer-wa-click="1" data-offer-id="${offer.id}" data-offer-rubro="${offer.rubro || ""}">Consulte sobre esta oferta</a>`;
        }
        const imageList = extractOfferImageUrls(offer);
        const carouselId = `offer-carousel-${String(offer.id || "").replace(/[^a-zA-Z0-9_-]/g, "")}`;
        const extraImages = imageList.slice(1);
        const regularPrice = formatPriceLabel(offer.precio_regular);
        const promoPrice = formatPriceLabel(offer.precio_promocional);
        const priceBlock = regularPrice || promoPrice
          ? `
            <div class="offer-price-wrap">
              ${regularPrice ? `<span class="offer-price-regular">${regularPrice}</span>` : ""}
              ${promoPrice ? `<span class="offer-price-promo">${promoPrice}</span>` : ""}
            </div>
          `
          : "";
        const detailsId = `offer-more-${String(offer.id || "").replace(/[^a-zA-Z0-9_-]/g, "")}`;
        const photoCountBadge =
          extraImages.length > 0
            ? `<span class="offer-reel-photo-count" aria-hidden="true">📷 ${imageList.length}</span>`
            : "";
        const imagen = imageList[0]
          ? `<img src="${imageList[0]}" class="offer-reel-image" alt="Oferta ${offer.titulo || ""}" loading="lazy" decoding="async">`
          : `<div class="offer-image-fallback"><span>✨ Promo destacada</span></div>`;
        const galleryCarousel =
          extraImages.length > 1
            ? `
            <div id="${carouselId}" class="carousel slide offer-carousel offer-carousel-detail mt-3" data-bs-ride="false">
              <div class="carousel-inner">
                ${extraImages.map((img, idx) => `
                  <div class="carousel-item ${idx === 0 ? "active" : ""}">
                    <img src="${img}" class="d-block w-100 offer-reel-image" alt="Oferta ${offer.titulo || ""} (${idx + 2}/${imageList.length})" loading="lazy" decoding="async">
                  </div>
                `).join("")}
              </div>
              <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev" aria-label="Imagen anterior">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next" aria-label="Imagen siguiente">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
              </button>
            </div>
          `
            : extraImages.length === 1
              ? `<div class="mt-3"><img src="${extraImages[0]}" class="d-block w-100 offer-reel-image" alt="Oferta ${offer.titulo || ""}" loading="lazy" decoding="async"></div>`
              : "";
        const exampleBadge = isExampleOffer(offer)
          ? `<span class="offer-example-badge">📋 Oferta de ejemplo</span>`
          : "";
        const statusBadges = `
          <div class="offer-status-badges">
            ${isNewOffer(offer) ? '<span class="offer-status-badge is-new">🆕 Nueva</span>' : ""}
            ${isEndingToday(offer) ? '<span class="offer-status-badge is-ending">⏰ Finaliza hoy</span>' : ""}
          </div>
        `;
        const phoneLine = String(offer.comercio_telefono || "").trim()
          ? `<p class="offer-meta"><strong>📞 Teléfono:</strong> ${offer.comercio_telefono}</p>`
          : "";
        return `
          <div class="col">
            <article class="card offer-card offer-reel offer-reel-zoomable ${rubroClass(offer.rubro)} h-100" data-offer-id="${String(offer.id || "")}" title="Tocá la tarjeta para ver las fotos más grandes">
              <div class="offer-media">
                ${imagen}
                ${photoCountBadge}
                ${exampleBadge}
                ${statusBadges}
                <div class="offer-reel-overlay">
                  <span class="badge offer-rubro-badge mb-2">📂 ${rubro}</span>
                  <h3 class="offer-comercio mb-1">🏬 ${offer.comercio_nombre || "Comercio adherido"}</h3>
                  <p class="offer-benefit mb-2">💥 AHORA: ${offer.beneficio || "-"}</p>
                  <button class="btn btn-sm btn-light offer-more-btn" type="button" data-bs-toggle="collapse" data-bs-target="#${detailsId}" aria-expanded="false" aria-controls="${detailsId}">
                    Más info
                  </button>
                </div>
              </div>
              <div class="collapse" id="${detailsId}">
                <div class="card-body">
                  <p class="offer-titulo mb-2">${offer.titulo || "-"}</p>
                  <p class="text-secondary mb-2">${offer.descripcion || ""}</p>
                  ${galleryCarousel}
                  ${priceBlock}
                  <p class="offer-meta"><strong>📍 Ubicación:</strong> ${offer.comercio_ubicacion || "-"}</p>
                  ${phoneLine}
                  ${cta}
                  <p class="mb-1 small text-secondary">🗓 Vigencia: ${formatDate(offer.fecha_inicio)} al ${formatDate(offer.fecha_fin)}</p>
                  <p class="mb-0 small text-success"><strong>✅ Vigente para Jardín Sale Week</strong></p>
                </div>
              </div>
            </article>
          </div>
        `;
      })
      .join("");
  }

  function initFilters() {
    if (!filtersWrap) return;
    filtersWrap.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-rubro]");
      if (!btn) return;
      activeRubro = String(btn.getAttribute("data-rubro") || "all");
      visibleCount = PAGE_SIZE;
      trackEvent("offers_filter_click", { rubro: activeRubro });
      filtersWrap.querySelectorAll("button[data-rubro]").forEach((el) => {
        el.classList.toggle("is-active", el === btn);
      });
      renderCurrentPage();
    });
  }

  function initLoadMore() {
    if (!loadMoreBtn) return;
    loadMoreBtn.addEventListener("click", () => {
      visibleCount += PAGE_SIZE;
      const filtered = getFilteredOffers();
      trackEvent("offers_load_more_click", {
        rubro: activeRubro,
        total_filtered: filtered.length,
        visible_after_click: Math.min(visibleCount, filtered.length),
      });
      renderCurrentPage();
    });
  }

  function initSearch() {
    if (!searchInput) return;
    let timer = null;
    searchInput.addEventListener("input", () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        searchTerm = String(searchInput.value || "").trim().toLowerCase();
        visibleCount = PAGE_SIZE;
        trackEvent("offers_search_input", { search_length: searchTerm.length });
        renderCurrentPage();
      }, 180);
    });
  }

  function normalizeReportField(value) {
    return String(value || "").trim();
  }

  function isUuidLike(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      String(value || "").trim()
    );
  }

  function initReportModal() {
    const modalEl = document.getElementById("modal-reportar-infraccion");
    const mailLink = document.getElementById("modal-report-mailto");
    const contextEl = document.getElementById("modal-report-context");
    const missingEl = document.getElementById("modal-report-email-missing");
    const reportForm = document.getElementById("form-provider-report");
    const successEl = document.getElementById("report-form-success");
    const errorEl = document.getElementById("report-form-error");
    const submitBtn = document.getElementById("report-form-submit");
    if (!modalEl || !reportForm) return;

    function hideFormAlerts() {
      if (successEl) {
        successEl.classList.add("d-none");
        successEl.textContent = "";
      }
      if (errorEl) {
        errorEl.classList.add("d-none");
        errorEl.textContent = "";
      }
    }

    function setupMailtoFallback(id, comercio, titulo) {
      if (!mailLink) return;
      const email = String(window.PUBLIC_REPORT_ORG_EMAIL || "").trim();
      if (!email) {
        mailLink.classList.add("disabled", "pe-none");
        mailLink.setAttribute("href", "#");
        mailLink.setAttribute("aria-disabled", "true");
        if (missingEl) missingEl.classList.remove("d-none");
        return;
      }
      mailLink.classList.remove("disabled", "pe-none");
      mailLink.removeAttribute("aria-disabled");
      if (missingEl) missingEl.classList.add("d-none");

      const subject = `[Jardín Sale Week] Informe de incumplimiento${comercio ? ` · ${comercio}` : ""}`;
      const body = [
        "Tipo: Informe a la organización sobre posible incumplimiento de promoción (Jardín Sale Week).",
        "",
        id ? `ID de oferta (referencia en la web): ${id}` : "Comercio afectado: (completar)",
        comercio ? `Nombre de comercio publicado: ${comercio}` : "",
        titulo ? `Título de la promoción: ${titulo}` : "",
        "",
        "Descripción de lo ocurrido (fecha, lugar, detalle):",
        "",
        "",
        "Mis datos de contacto (nombre, teléfono o email):",
        "",
        "",
        "Declaro haber leído en el sitio que este canal no constituye denuncia judicial; que el informe es dirigido solo a la organización; y que, de constatarse el incumplimiento, puede derivar en suspensión del prestador para futuras ediciones de Jardín Sale Week, sin garantía de respuesta.",
      ].join("\n");

      mailLink.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    if (mailLink) {
      mailLink.addEventListener("click", (e) => {
        if (!String(window.PUBLIC_REPORT_ORG_EMAIL || "").trim()) {
          e.preventDefault();
        }
      });
    }

    modalEl.addEventListener("show.bs.modal", (ev) => {
      hideFormAlerts();
      const btn = ev.relatedTarget;
      const rawId = btn && btn.getAttribute("data-offer-id");
      const id =
        rawId != null && String(rawId).trim() !== "" ? String(rawId).trim() : "";
      const offer = id ? allOffers.find((o) => String(o.id) === id) : null;
      const comercio = offer ? String(offer.comercio_nombre || "").trim() : "";
      const titulo = offer ? String(offer.titulo || "").trim() : "";

      const offerIdInput = document.getElementById("report-offer-id");
      const comercioInput = document.getElementById("report-comercio-indicado");
      const tituloInput = document.getElementById("report-titulo-promocion");
      if (offerIdInput) offerIdInput.value = id;
      if (comercioInput) comercioInput.value = comercio;
      if (tituloInput) tituloInput.value = titulo;

      if (contextEl) {
        contextEl.textContent = id
          ? `Referencia: oferta #${id}${comercio ? ` · ${comercio}` : ""}${titulo ? ` · «${titulo}»` : ""}`
          : "Completá el formulario. Si no referís a una tarjeta en particular, indicá con claridad el comercio y la promoción.";
      }

      setupMailtoFallback(id, comercio, titulo);

      if (submitBtn) {
        submitBtn.disabled = !client;
        submitBtn.title = client ? "" : "Configurá Supabase en js/supabase-config.js para enviar desde la web.";
      }

      trackEvent("offer_report_modal_open", {
        offer_id: id || "",
        from_card: Boolean(id),
      });
    });

    modalEl.addEventListener("hidden.bs.modal", () => {
      hideFormAlerts();
      reportForm.reset();
      const offerIdInput = document.getElementById("report-offer-id");
      if (offerIdInput) offerIdInput.value = "";
    });

    reportForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideFormAlerts();
      if (!client) {
        if (errorEl) {
          errorEl.textContent =
            "No se puede enviar: falta la configuración de Supabase en este sitio. Usá el enlace de correo abajo o contactá a Turismo directamente.";
          errorEl.classList.remove("d-none");
        }
        return;
      }

      const fd = new FormData(reportForm);
      const rawOfferId = normalizeReportField(fd.get("offer_id"));
      const offerId = isUuidLike(rawOfferId) ? rawOfferId : null;
      const comercio_indicado = normalizeReportField(fd.get("comercio_indicado"));
      const titulo_promocion = normalizeReportField(fd.get("titulo_promocion")) || null;
      const nombre_informante = normalizeReportField(fd.get("nombre_informante"));
      const contacto_informante = normalizeReportField(fd.get("contacto_informante"));
      const detalle = normalizeReportField(fd.get("detalle"));
      const acepto = fd.get("acepto_terminos") === "1";

      if (!acepto) {
        if (errorEl) {
          errorEl.textContent = "Debés aceptar las condiciones del informe para continuar.";
          errorEl.classList.remove("d-none");
        }
        return;
      }

      const payload = {
        comercio_indicado,
        nombre_informante,
        contacto_informante,
        detalle,
        acepto_terminos: true,
      };
      if (titulo_promocion) payload.titulo_promocion = titulo_promocion;
      if (offerId) payload.offer_id = offerId;

      const insertBtn = submitBtn;
      if (insertBtn) insertBtn.disabled = true;

      const { error } = await client.from("provider_reports").insert(payload);

      if (insertBtn) insertBtn.disabled = false;

      if (error) {
        const msg = String(error.message || "");
        if (msg.includes("provider_reports") || msg.includes("does not exist") || error.code === "42P01") {
          if (errorEl) {
            errorEl.textContent =
              "El servidor aún no tiene la tabla de informes. Ejecutá el SQL de provider_reports (supabase-schema.sql) en Supabase.";
            errorEl.classList.remove("d-none");
          }
        } else if (errorEl) {
          errorEl.textContent = msg || "No se pudo enviar. Intentá de nuevo más tarde.";
          errorEl.classList.remove("d-none");
        }
        trackEvent("provider_report_submit_error", { code: String(error.code || "") });
        return;
      }

      if (successEl) {
        successEl.textContent =
          "Listo. Tu informe fue enviado a la organización. Gracias por el detalle.";
        successEl.classList.remove("d-none");
      }
      trackEvent("provider_report_submit_success", {
        offer_id: offerId || "",
        has_offer_link: Boolean(offerId),
      });
      reportForm.reset();
      const oid = document.getElementById("report-offer-id");
      if (oid) oid.value = "";
    });
  }

  async function loadOffers() {
    if (!client) return;
    setOffersLoading(true);
    setBackgroundOffersLoading(false);
    await nextPaint();
    // Solo estado aprobada. No filtramos por fechas en la consulta: si la vigencia
    // queda en el pasado (p. ej. edicion 2025 y hoy es otro anio) igual se listan
    // las ofertas aprobadas. El cartel "Vigente" indica si hoy entra en el rango.
    let { data, error } = await client
      .from("offers")
      .select(OFFERS_SELECT_FULL)
      .eq("estado", "aprobada")
      .order("created_at", { ascending: false })
      .range(0, INITIAL_BATCH_SIZE - 1);

    if (error && isMissingOptionalColumns(error)) {
      hasMissingOptionalColumns = true;
      const fallback = await client
        .from("offers")
        .select(OFFERS_SELECT_FALLBACK)
        .eq("estado", "aprobada")
        .order("created_at", { ascending: false })
        .range(0, INITIAL_BATCH_SIZE - 1);
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      offersInitialFetchDone = true;
      empty.textContent = "No se pudieron cargar ofertas. Verifica configuracion y RLS.";
      empty.classList.remove("d-none");
      setOffersLoading(false);
      return;
    }
    allOffers = data || [];
    await mergeDescriptionsForIds(allOffers.map((o) => o.id));
    offersInitialFetchDone = true;
    trackEvent("offers_loaded", { total_offers: allOffers.length });
    visibleCount = PAGE_SIZE;
    renderCurrentPage();
    setOffersLoading(false);

    if ((data || []).length < INITIAL_BATCH_SIZE) return;

    setBackgroundOffersLoading(true);
    const startOffset = (data || []).length;
    queueMicrotask(() => {
      (async () => {
        let offset = startOffset;
        for (;;) {
          let nextData = null;
          let nextError = null;

          if (hasMissingOptionalColumns) {
            const next = await client
              .from("offers")
              .select(OFFERS_SELECT_FALLBACK)
              .eq("estado", "aprobada")
              .order("created_at", { ascending: false })
              .range(offset, offset + BACKGROUND_BATCH_SIZE - 1);
            nextData = next.data;
            nextError = next.error;
          } else {
            const next = await client
              .from("offers")
              .select(OFFERS_SELECT_FULL)
              .eq("estado", "aprobada")
              .order("created_at", { ascending: false })
              .range(offset, offset + BACKGROUND_BATCH_SIZE - 1);
            nextData = next.data;
            nextError = next.error;
          }

          if (nextError) {
            console.warn("[public-offers] no se pudo completar carga en segundo plano:", nextError.message || nextError);
            break;
          }

          const chunk = Array.isArray(nextData) ? nextData : [];
          if (!chunk.length) break;

          allOffers = allOffers.concat(chunk);
          offset += chunk.length;
          await mergeDescriptionsForIds(chunk.map((o) => o.id));

          const filteredCount = getFilteredOffers().length;
          updateLoadMoreButton(filteredCount, Math.min(visibleCount, filteredCount));

          if (chunk.length < BACKGROUND_BATCH_SIZE) break;
        }
        setBackgroundOffersLoading(false);
      })();
    });
  }

  initFilters();
  initLoadMore();
  initSearch();
  initReportModal();
  if (client) {
    grid.addEventListener("click", (e) => {
      const link = e.target.closest("[data-offer-wa-click]");
      if (link) {
        trackEvent("offer_whatsapp_click", {
          offer_id: String(link.getAttribute("data-offer-id") || ""),
          rubro: String(link.getAttribute("data-offer-rubro") || ""),
        });
        return;
      }
      if (e.target.closest("a[href]")) return;
      if (e.target.closest("button")) return;
      const card = e.target.closest("article.offer-reel-zoomable[data-offer-id]");
      if (!card) return;
      const id = String(card.getAttribute("data-offer-id") || "");
      const offer = allOffers.find((o) => String(o.id) === id);
      if (!offer) return;
      const urls = extractOfferImageUrls(offer);
      if (!urls.length) return;
      const modalTitle = [offer.comercio_nombre, offer.titulo].filter(Boolean).join(" · ") || "Oferta";
      if (typeof window.openPublicMediaModal === "function") {
        window.openPublicMediaModal(modalTitle, urls);
      }
      trackEvent("offer_card_media_zoom", { offer_id: id });
    });
    loadOffers();
  }
})();
