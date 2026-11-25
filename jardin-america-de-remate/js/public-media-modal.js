(function () {
  const modalEl = document.getElementById("modal-public-media");
  const titleEl = document.getElementById("modal-public-media-title");
  const bodyEl = document.getElementById("modal-public-media-body");
  if (!modalEl || !titleEl || !bodyEl || typeof bootstrap === "undefined") {
    window.openPublicMediaModal = function () {};
    return;
  }

  function escapeAttr(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/'/g, "&#39;");
  }

  let modalInstance = null;
  function getModal() {
    if (!modalInstance) modalInstance = new bootstrap.Modal(modalEl);
    return modalInstance;
  }

  /**
   * @param {string} title
   * @param {string[]} imageUrls
   */
  window.openPublicMediaModal = function (title, imageUrls) {
    const urls = (Array.isArray(imageUrls) ? imageUrls : []).map((u) => String(u || "").trim()).filter(Boolean);
    titleEl.textContent = title || "Imágenes";

    if (!urls.length) {
      bodyEl.innerHTML = '<p class="text-secondary text-center small mb-0">No hay imagen para mostrar.</p>';
      getModal().show();
      return;
    }

    if (urls.length === 1) {
      bodyEl.innerHTML = `
        <div class="public-media-modal-frame">
          <img src="${escapeAttr(urls[0])}" alt="" class="img-fluid rounded public-media-modal-img" decoding="async">
        </div>`;
      getModal().show();
      return;
    }

    const id = `modal-media-carousel-${Date.now()}`;
    bodyEl.innerHTML = `
      <div id="${id}" class="carousel slide public-media-carousel" data-bs-ride="false">
        <div class="carousel-inner">
          ${urls
            .map(
              (url, idx) => `
            <div class="carousel-item ${idx === 0 ? "active" : ""}">
              <div class="public-media-modal-frame">
                <img src="${escapeAttr(url)}" class="d-block img-fluid rounded public-media-modal-img mx-auto" alt="" decoding="async">
              </div>
            </div>`
            )
            .join("")}
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#${id}" data-bs-slide="prev" aria-label="Imagen anterior">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#${id}" data-bs-slide="next" aria-label="Imagen siguiente">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
        </button>
      </div>
      <p class="small text-muted text-center mt-2 mb-0">${urls.length} fotos · usá las flechas</p>`;
    const carouselEl = bodyEl.querySelector(".carousel");
    if (carouselEl && bootstrap.Carousel) {
      bootstrap.Carousel.getOrCreateInstance(carouselEl, { interval: false, ride: false });
    }
    getModal().show();
  };
})();
