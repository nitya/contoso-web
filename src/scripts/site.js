function initializeCarousels() {
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const section = carousel.closest(".collection-section");
    const track = carousel.querySelector("[data-carousel-track]");
    const controls = section?.querySelector("[data-carousel-controls]");
    const previous = section?.querySelector("[data-carousel-prev]");
    const next = section?.querySelector("[data-carousel-next]");

    if (!track || !controls || !previous || !next) return;

    const updateControls = () => {
      const hasOverflow = track.scrollWidth > track.clientWidth + 1;
      controls.hidden = !hasOverflow;
      previous.hidden = !hasOverflow || track.scrollLeft <= 2;
      next.hidden = !hasOverflow
        || track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    };

    previous.addEventListener("click", () => {
      track.scrollBy({ left: -track.clientWidth * 0.85, behavior: "smooth" });
    });
    next.addEventListener("click", () => {
      track.scrollBy({ left: track.clientWidth * 0.85, behavior: "smooth" });
    });
    track.addEventListener("scroll", updateControls, { passive: true });

    if ("ResizeObserver" in window) {
      new ResizeObserver(updateControls).observe(track);
    } else {
      window.addEventListener("resize", updateControls);
    }

    updateControls();
  });
}

function initializeProductFilters() {
  const grid = document.querySelector("[data-product-grid]");
  if (!grid) return;

  const cards = [...grid.querySelectorAll("[data-product-card]")];
  const buttons = [...document.querySelectorAll("[data-category-filter]")];
  const search = document.querySelector("[data-product-search]");
  const count = document.querySelector("[data-results-count]");
  const emptyState = document.querySelector("[data-empty-state]");
  const validCategories = new Set(buttons.map((button) => button.dataset.categoryFilter));
  const requestedCategory = new URLSearchParams(window.location.search).get("category");
  let activeCategory = validCategories.has(requestedCategory) ? requestedCategory : "all";

  const update = () => {
    const query = search?.value.trim().toLocaleLowerCase() ?? "";
    let visibleCount = 0;

    cards.forEach((card) => {
      const matchesCategory = activeCategory === "all" || card.dataset.category === activeCategory;
      const matchesSearch = !query || (card.dataset.search ?? "").includes(query);
      const visible = matchesCategory && matchesSearch;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    buttons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.categoryFilter === activeCategory),
      );
    });

    if (count) {
      count.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? "product" : "products"}`;
    }
    if (emptyState) emptyState.hidden = visibleCount > 0;
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.categoryFilter ?? "all";
      update();
    });
  });
  search?.addEventListener("input", update);
  update();
}

function initializeProductDetails() {
  const mainImage = document.querySelector("[data-gallery-main]");
  const thumbnails = [...document.querySelectorAll("[data-gallery-thumb]")];

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", () => {
      if (!mainImage || !thumbnail.dataset.image) return;
      mainImage.src = thumbnail.dataset.image;
      mainImage.alt = thumbnail.dataset.alt ?? "";
      thumbnails.forEach((item) => {
        const selected = item === thumbnail;
        item.setAttribute("aria-pressed", String(selected));
        item.classList.toggle("is-active", selected);
      });
    });
  });

  const quantity = document.querySelector("[data-quantity]");
  document.querySelectorAll("[data-quantity-step]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!quantity) return;
      const step = Number(button.dataset.quantityStep);
      const current = Number(quantity.value) || 1;
      quantity.value = String(Math.min(99, Math.max(1, current + step)));
    });
  });

  quantity?.addEventListener("change", () => {
    const value = Number(quantity.value);
    quantity.value = String(Number.isFinite(value) ? Math.min(99, Math.max(1, value)) : 1);
  });

  const addButton = document.querySelector("[data-add-to-cart]");
  const feedback = document.querySelector("[data-cart-feedback]");
  addButton?.addEventListener("click", () => {
    if (!quantity || !feedback) return;
    const amount = Number(quantity.value) || 1;
    feedback.textContent = `${amount} ${amount === 1 ? "item" : "items"} added to your bag.`;
  });
}

initializeCarousels();
initializeProductFilters();
initializeProductDetails();
