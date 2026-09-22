/* =========================================================================
   DATA SOURCE — data/products.json
   Generated from data/armani_styles.xlsx by scripts/build_products.py.
   Each product: id, gender, category, family, sub, name, styleCode,
   fabricCode, colorCode, productKey, season, images[].
   ========================================================================= */
let PRODUCTS = [];
let GENDERS = [];
let CATEGORIES = [];

/* Department order and wording shown to buyers (data values stay as in the Excel file). */
const GENDER_ORDER = ["WOMAN", "MAN", "GIRL", "BOY", "UNISEX", "UNISEX JUNIOR"];
const GENDER_LABELS = {
  "WOMAN": "Women", "MAN": "Men", "GIRL": "Girls", "BOY": "Boys",
  "UNISEX": "Unisex", "UNISEX JUNIOR": "Unisex junior"
};

/* ============================== TEXT HELPERS ============================== */
const sentenceCase = s => {
  const t = String(s).trim().toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};
const genderLabel = g => GENDER_LABELS[g] || sentenceCase(g);
const genderRank = g => {
  const i = GENDER_ORDER.indexOf(g);
  return i === -1 ? GENDER_ORDER.length : i;
};
const fmt = n => n.toLocaleString("en-US");
const piecesText = n => `${fmt(n)} ${n === 1 ? "piece" : "pieces"}`;
const esc = s => String(s).replace(/[&<>"']/g, c => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
));

async function loadProducts(){
  try {
    const response = await fetch("data/products.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    PRODUCTS = await response.json();
    GENDERS = [...new Set(PRODUCTS.map(p => p.gender))]
      .sort((a, b) => genderRank(a) - genderRank(b) || a.localeCompare(b));
    CATEGORIES = [...new Set(PRODUCTS.map(p => p.category))].sort();

    init();
  } catch (error) {
    console.error("Could not load products.json", error);
    const grid = document.querySelector("#productGrid");
    if (grid) grid.innerHTML = '<div class="empty-state"><h3>The catalogue could not be loaded</h3><p>Please refresh the page. If you opened the file directly from a folder, open it through a web server instead.</p></div>';
  }
}

/* ================================ STATE ================================ */
const PAGE_SIZE = 60;
const state = {
  search: "",
  filters: { gender: new Set(), category: new Set(), sub: new Set() },
  selectedOnly: false,
  sort: "default",
  selected: new Set(JSON.parse(localStorage.getItem("ea_selection") || "[]")),
  buyer: JSON.parse(localStorage.getItem("ea_buyer") || "{}"),
  modalIndex: null,
  visibleCount: PAGE_SIZE
};

function persist(){ localStorage.setItem("ea_selection", JSON.stringify([...state.selected])); }

/* =============================== HELPERS ================================ */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function toast(msg){
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2200);
}
function pendingSVG(){
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`;
}
function heartSVG(){
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6c-1.9-1.6-4.7-1.4-6.3.4L12 7.6l-2.5-2.6c-1.6-1.8-4.4-2-6.3-.4-2.1 1.8-2.2 5-.3 7L12 21l9.1-9.4c1.9-2 1.8-5.2-.3-7z"/></svg>`;
}
function anyFiltersActive(){
  return state.filters.gender.size || state.filters.category.size || state.filters.sub.size || state.search || state.selectedOnly;
}
function makeButton(className, label, active, onClick){
  const b = document.createElement("button");
  b.type = "button";
  b.className = className + (active ? " active" : "");
  if (active) b.setAttribute("aria-current", "true");
  b.textContent = label;
  b.addEventListener("click", onClick);
  return b;
}

/* ============================ GENDER + CATEGORY NAV ======================= */
function renderGenderNav(){
  const nav = $("#genderNav");
  nav.innerHTML = "";
  nav.appendChild(makeButton("cat-btn", "All", state.filters.gender.size === 0, () => {
    state.filters.gender.clear();
    afterFilterChange();
  }));
  GENDERS.forEach(g => {
    nav.appendChild(makeButton("cat-btn", genderLabel(g), state.filters.gender.has(g), () => {
      state.filters.gender.clear();
      state.filters.gender.add(g);
      afterFilterChange();
    }));
  });
}

function renderCategoryNav(){
  const nav = $("#categoryNav");
  nav.innerHTML = "";
  nav.appendChild(makeButton("cat-btn", "All categories", state.filters.category.size === 0, () => {
    state.filters.category.clear();
    state.filters.sub.clear();
    afterFilterChange();
  }));
  CATEGORIES.forEach(cat => {
    nav.appendChild(makeButton("cat-btn", sentenceCase(cat), state.filters.category.has(cat), () => {
      state.filters.category.clear();
      state.filters.category.add(cat);
      state.filters.sub.clear();
      afterFilterChange();
    }));
  });
}

function afterFilterChange(){
  state.visibleCount = PAGE_SIZE;
  renderGenderNav();
  renderCategoryNav();
  renderFilterPanel();
  render();
}

/* ============================== FILTER PANEL ============================= */
function renderFilterPanel(){
  const genBox = $("#filterGender"); genBox.innerHTML = "";
  GENDERS.forEach(g => {
    genBox.appendChild(makeButton("chip", genderLabel(g), state.filters.gender.has(g), () => toggleFilter("gender", g)));
  });

  const catBox = $("#filterCategory"); catBox.innerHTML = "";
  CATEGORIES.forEach(cat => {
    catBox.appendChild(makeButton("chip", sentenceCase(cat), state.filters.category.has(cat), () => toggleFilter("category", cat)));
  });

  const relevantSubs = [...new Set(
    PRODUCTS.filter(p => state.filters.category.size === 0 || state.filters.category.has(p.category))
            .map(p => p.sub)
  )].sort();
  const subBox = $("#filterSub"); subBox.innerHTML = "";
  relevantSubs.forEach(sub => {
    subBox.appendChild(makeButton("chip", sentenceCase(sub), state.filters.sub.has(sub), () => toggleFilter("sub", sub)));
  });

  updateFilterCountBadge();
}

function toggleFilter(group, value){
  const set = state.filters[group];
  set.has(value) ? set.delete(value) : set.add(value);
  if (group === "category") state.filters.sub.clear();
  afterFilterChange();
}

function updateFilterCountBadge(){
  const total = state.filters.gender.size + state.filters.category.size + state.filters.sub.size;
  const badge = $("#filterCountBadge");
  badge.textContent = total;
  badge.style.display = total > 0 ? "inline-flex" : "none";
  $("#filterToggleBtn").classList.toggle("active", total > 0);
}

function clearAllFilters(){
  state.filters.gender.clear(); state.filters.category.clear(); state.filters.sub.clear();
  state.search = ""; $("#searchInput").value = "";
  state.selectedOnly = false; $("#selectedOnlyToggle").checked = false;
  afterFilterChange();
}
$("#clearFiltersBtn").addEventListener("click", clearAllFilters);

function toggleFilterPanel(){
  const open = $("#filterPanel").classList.toggle("open");
  $("#filterToggleBtn").setAttribute("aria-expanded", String(open));
}
$("#filterToggleBtn").addEventListener("click", toggleFilterPanel);

/* ================================ FILTERING =============================== */
function getFilteredProducts(){
  let list = PRODUCTS.filter(p => {
    if (state.filters.gender.size && !state.filters.gender.has(p.gender)) return false;
    if (state.filters.category.size && !state.filters.category.has(p.category)) return false;
    if (state.filters.sub.size && !state.filters.sub.has(p.sub)) return false;
    if (state.selectedOnly && !state.selected.has(p.id)) return false;
    if (state.search){
      const q = state.search.toLowerCase();
      const hay = [p.name, p.styleCode, p.fabricCode, p.colorCode, p.sub, p.category, genderLabel(p.gender)].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  switch (state.sort){
    case "name": list.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "category": list.sort((a, b) => a.category.localeCompare(b.category) || a.sub.localeCompare(b.sub)); break;
    case "style": list.sort((a, b) => a.styleCode.localeCompare(b.styleCode)); break;
    default:
      /* Featured: pieces with photography first, otherwise the Excel order. */
      list.sort((a, b) => (b.images?.length > 0) - (a.images?.length > 0));
  }
  return list;
}

/* ================================== GRID =================================== */
let currentFilteredList = [];

function render(){
  currentFilteredList = getFilteredProducts();
  $("#resultCount").textContent = piecesText(currentFilteredList.length);
  renderGrid();
}

function cardHTML(p){
  const selected = state.selected.has(p.id);
  const name = esc(p.name);
  const media = p.images?.length
    ? `<img src="${esc(p.images[0])}" alt="${name}" loading="lazy">`
    : `<div class="img-pending">${pendingSVG()}<span>No photo yet</span></div>`;
  return `
    <article class="card${selected ? " is-selected" : ""}" data-id="${esc(p.id)}">
      <div class="card-media" data-open="${esc(p.id)}">
        ${media}
        <button type="button" class="heart-btn${selected ? " selected" : ""}" data-select="${esc(p.id)}"
                aria-pressed="${selected}" aria-label="Select ${name}">${heartSVG()}</button>
      </div>
      <div class="card-info">
        <button type="button" class="card-name" data-open="${esc(p.id)}">${name}</button>
        <div class="card-meta"><span>${esc(genderLabel(p.gender))}</span><span>${esc(sentenceCase(p.category))}</span></div>
        <dl class="card-codes">
          <div><dt>Style</dt><dd>${esc(p.styleCode)}</dd></div>
          <div><dt>Fabric</dt><dd>${esc(p.fabricCode)}</dd></div>
          <div><dt>Colour</dt><dd>${esc(p.colorCode)}</dd></div>
        </dl>
      </div>
    </article>`;
}

function renderGrid(){
  const grid = $("#productGrid");
  const list = currentFilteredList;

  if (!list.length){
    grid.innerHTML = `<div class="empty-state">
      <h3>No pieces match</h3>
      <p>Try widening your filters or clearing the search.</p>
      <button type="button" class="btn-secondary" data-clear style="display:inline-flex">Clear all filters</button>
    </div>`;
    $("#loadMoreWrap").style.display = "none";
    return;
  }

  grid.innerHTML = list.slice(0, state.visibleCount).map(cardHTML).join("");

  const wrap = $("#loadMoreWrap");
  const remaining = list.length - state.visibleCount;
  if (remaining > 0){
    wrap.style.display = "flex";
    $("#loadMoreBtn").textContent = `Show more (${fmt(remaining)} left)`;
  } else {
    wrap.style.display = "none";
  }
}

/* One listener for the whole grid (cards are rebuilt often). */
$("#productGrid").addEventListener("click", e => {
  if (e.target.closest("[data-clear]")) return clearAllFilters();
  const sel = e.target.closest("[data-select]");
  if (sel) return toggleSelect(sel.dataset.select);
  const open = e.target.closest("[data-open]");
  if (open) openModal(open.dataset.open);
});

$("#loadMoreBtn").addEventListener("click", () => {
  state.visibleCount += PAGE_SIZE;
  renderGrid();
});

/* ============================== SELECTION LOGIC ============================= */
function updateSelectionBadge(){
  const count = state.selected.size;
  const badge = $("#selCountBadge");
  badge.textContent = count;
  badge.classList.toggle("zero", count === 0);
}

function paintSelection(id){
  const on = state.selected.has(id);
  $$(`.heart-btn[data-select="${id}"]`).forEach(btn => {
    btn.classList.toggle("selected", on);
    btn.setAttribute("aria-pressed", String(on));
  });
  $$(`.card[data-id="${id}"]`).forEach(card => card.classList.toggle("is-selected", on));
}

function toggleSelect(id){
  const wasSelected = state.selected.has(id);
  wasSelected ? state.selected.delete(id) : state.selected.add(id);
  persist();
  updateSelectionBadge();
  renderDrawer();
  if (state.selectedOnly) render(); else paintSelection(id);
  if (state.modalIndex !== null) syncModalSelectButton();
  const p = PRODUCTS.find(x => x.id === id);
  toast(wasSelected ? `Removed ${p.name}` : `Added ${p.name} to your selection`);
}

/* ================================== MODAL =================================== */
let modalList = [];
let lastFocus = null;

function openModal(id){
  modalList = currentFilteredList;
  const idx = modalList.findIndex(p => p.id === id);
  state.modalIndex = idx >= 0 ? idx : 0;
  lastFocus = document.activeElement;
  paintModal();
  $("#modalOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
  $("#modalCloseBtn").focus();
}
function closeModal(){
  $("#modalOverlay").classList.remove("open");
  state.modalIndex = null;
  document.body.style.overflow = "";
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
function paintModal(){
  const p = modalList[state.modalIndex];
  if (!p) return;
  const name = esc(p.name);
  const hasImages = p.images?.length > 0;

  $("#modalMediaInner").innerHTML = hasImages
    ? `<div class="product-gallery">
         <img id="galleryMainImage" src="${esc(p.images[0])}" alt="${name}">
         ${p.images.length > 1 ? `<div class="gallery-thumbs">${p.images.map((img, i) => `
           <button type="button" class="thumb-btn${i === 0 ? " active" : ""}" data-gallery-index="${i}" aria-label="Show photo ${i + 1}">
             <img src="${esc(img)}" alt="">
           </button>`).join("")}</div>` : ""}
       </div>`
    : `<div class="img-pending">${pendingSVG()}<span>No photo yet</span></div>`;

  $("#modalCat").textContent = sentenceCase(p.category);
  $("#modalName").textContent = p.name;
  $("#modalGender").textContent = genderLabel(p.gender);
  $("#modalStyle").textContent = p.styleCode;
  $("#modalFabric").textContent = p.fabricCode;
  $("#modalColor").textContent = p.colorCode;
  $("#modalFamily").textContent = sentenceCase(p.family);
  $("#modalDesc").hidden = hasImages;
  syncModalSelectButton();
}
function syncModalSelectButton(){
  const p = modalList[state.modalIndex];
  if (!p) return;
  const btn = $("#modalSelectBtn");
  const selected = state.selected.has(p.id);
  btn.textContent = selected ? "Selected — remove" : "Select this piece";
  btn.classList.toggle("selected", selected);
}

$("#modalMediaInner").addEventListener("click", e => {
  const thumb = e.target.closest("[data-gallery-index]");
  if (!thumb) return;
  const p = modalList[state.modalIndex];
  const main = $("#galleryMainImage");
  if (main && p.images[thumb.dataset.galleryIndex]) main.src = p.images[thumb.dataset.galleryIndex];
  $$(".thumb-btn").forEach(b => b.classList.toggle("active", b === thumb));
});
$("#modalCloseBtn").addEventListener("click", closeModal);
$("#modalOverlay").addEventListener("click", e => { if (e.target.id === "modalOverlay") closeModal(); });
$("#modalPrevBtn").addEventListener("click", () => { state.modalIndex = (state.modalIndex - 1 + modalList.length) % modalList.length; paintModal(); });
$("#modalNextBtn").addEventListener("click", () => { state.modalIndex = (state.modalIndex + 1) % modalList.length; paintModal(); });
$("#modalSelectBtn").addEventListener("click", () => toggleSelect(modalList[state.modalIndex].id));
$("#modalDrawerBtn").addEventListener("click", () => { closeModal(); openDrawer(); });

document.addEventListener("keydown", e => {
  const modalOpen = $("#modalOverlay").classList.contains("open");
  if (e.key === "Escape"){
    if (modalOpen) closeModal();
    else if ($("#drawer").classList.contains("open")) closeDrawer();
    return;
  }
  if (!modalOpen) return;
  if (e.key === "ArrowLeft") $("#modalPrevBtn").click();
  if (e.key === "ArrowRight") $("#modalNextBtn").click();
});

/* ================================== DRAWER =================================== */
function openDrawer(){
  $("#drawer").classList.add("open");
  $("#drawerOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeDrawer(){
  $("#drawer").classList.remove("open");
  $("#drawerOverlay").classList.remove("open");
  document.body.style.overflow = "";
}
$("#openDrawerBtn").addEventListener("click", openDrawer);
$("#drawerCloseBtn").addEventListener("click", closeDrawer);
$("#drawerOverlay").addEventListener("click", closeDrawer);
$("#drawerClearBtn").addEventListener("click", () => {
  if (!state.selected.size) return;
  state.selected.clear();
  persist();
  updateSelectionBadge();
  renderDrawer();
  render();
  toast("Selection cleared");
});

function renderDrawer(){
  const list = PRODUCTS.filter(p => state.selected.has(p.id));
  $("#drawerCount").textContent = `${piecesText(list.length)} selected`;
  const box = $("#drawerList");
  if (!list.length){
    box.innerHTML = `<div class="drawer-empty">Nothing selected yet.<br>Tap the heart on any piece to add it here.</div>`;
    return;
  }
  box.innerHTML = list.map(p => `
    <div class="drawer-item">
      <div class="thumb">${p.images?.length ? `<img src="${esc(p.images[0])}" alt="${esc(p.name)}">` : pendingSVG()}</div>
      <div class="drawer-item-info">
        <div class="name">${esc(p.name)}</div>
        <div class="meta">${esc(genderLabel(p.gender))}, ${esc(sentenceCase(p.category))}</div>
        <div class="codes">Style ${esc(p.styleCode)}<br>Fabric ${esc(p.fabricCode)}<br>Colour ${esc(p.colorCode)}</div>
        <button type="button" class="drawer-remove" data-remove="${esc(p.id)}">Remove</button>
      </div>
    </div>`).join("");
}
$("#drawerList").addEventListener("click", e => {
  const btn = e.target.closest("[data-remove]");
  if (btn) toggleSelect(btn.dataset.remove);
});

/* ============================== BUYER FORM + SHARE ============================= */
$("#buyerName").value = state.buyer.name || "";
$("#buyerCompany").value = state.buyer.company || "";
$("#buyerEmail").value = state.buyer.email || "";
$("#buyerNotes").value = state.buyer.notes || "";

$("#buyerToggleBtn").addEventListener("click", () => {
  const open = $("#buyerForm").classList.toggle("open");
  $("#buyerToggleBtn").setAttribute("aria-expanded", String(open));
});

["buyerName", "buyerCompany", "buyerEmail", "buyerNotes"].forEach(id => {
  $("#" + id).addEventListener("input", () => {
    state.buyer = {
      name: $("#buyerName").value, company: $("#buyerCompany").value,
      email: $("#buyerEmail").value, notes: $("#buyerNotes").value
    };
    localStorage.setItem("ea_buyer", JSON.stringify(state.buyer));
  });
});

function buildSelectionSummary(){
  const list = PRODUCTS.filter(p => state.selected.has(p.id));
  let text = "EMPORIO ARMANI — Buyer Selection (FW26)\n";
  if (state.buyer.name || state.buyer.company){
    text += `\nBuyer: ${state.buyer.name || "—"}${state.buyer.company ? ", " + state.buyer.company : ""}`;
    if (state.buyer.email) text += `\nEmail: ${state.buyer.email}`;
  }
  if (state.buyer.notes) text += `\nNotes: ${state.buyer.notes}`;
  text += `\n\n${piecesText(list.length)} selected:\n`;
  list.forEach((p, i) => {
    text += `\n${i + 1}. ${p.name} (${genderLabel(p.gender)}, ${sentenceCase(p.category)})\n   Style ${p.styleCode}, Fabric ${p.fabricCode}, Colour ${p.colorCode}`;
  });
  return { text, list };
}

$("#shareBtn").addEventListener("click", () => {
  if (!state.selected.size){
    toast("Select at least one piece first");
    return;
  }
  const { text } = buildSelectionSummary();
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
});

/* ================================ SEARCH / SORT ================================ */
$("#searchInput").addEventListener("input", e => {
  state.search = e.target.value.trim();
  state.visibleCount = PAGE_SIZE;
  render();
});
$("#sortSelect").addEventListener("change", e => {
  state.sort = e.target.value;
  state.visibleCount = PAGE_SIZE;
  render();
});
$("#selectedOnlyToggle").addEventListener("change", e => {
  state.selectedOnly = e.target.checked;
  state.visibleCount = PAGE_SIZE;
  render();
});

/* =================================== INIT =================================== */
function init(){
  renderGenderNav();
  renderCategoryNav();
  renderFilterPanel();
  render();
  updateSelectionBadge();
  renderDrawer();
}
loadProducts();
