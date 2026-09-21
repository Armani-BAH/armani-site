
/* =========================================================================
   DATA SOURCE — data/products.json
   Generated from data/armani_styles.xlsx by scripts/build_products.py.
   Each product: id, gender, category, family, sub, name, styleCode,
   fabricCode, colorCode, productKey, season, images[].
   ========================================================================= */
let PRODUCTS = [];
let GENDERS = [];
let CATEGORIES = [];

async function loadProducts(){
  try {
    const response = await fetch("data/products.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    PRODUCTS = await response.json();
    GENDERS = [...new Set(PRODUCTS.map(p => p.gender))].sort();
    CATEGORIES = [...new Set(PRODUCTS.map(p => p.category))].sort();

    init();
  } catch (error) {
    console.error("Could not load products.json", error);
    const grid = document.querySelector("#productGrid");
    if (grid) grid.innerHTML = '<p style="padding:40px 0">The catalogue could not be loaded. Please refresh, or open the site through a web server (not directly from a file).</p>';
  }
}

/* ================================ STATE ================================ */
const state = {
  search: "",
  filters: { gender: new Set(), category: new Set(), sub: new Set() },
  selectedOnly: false,
  sort: "default",
  selected: new Set(JSON.parse(localStorage.getItem("ea_selection") || "[]")),
  buyer: JSON.parse(localStorage.getItem("ea_buyer") || "{}"),
  modalIndex: null,
  visibleCount: 60
};
const PAGE_SIZE = 60;

function persist(){ localStorage.setItem("ea_selection", JSON.stringify([...state.selected])); }

/* =============================== HELPERS ================================ */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function toast(msg){
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>t.classList.remove("show"), 2200);
}
function pendingSVG(){
  return `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`;
}
function anyFiltersActive(){
  return state.filters.gender.size || state.filters.category.size || state.filters.sub.size || state.search || state.selectedOnly;
}

/* ============================ GENDER + CATEGORY NAV ======================= */
function renderGenderNav(){
  const nav = $("#genderNav");
  nav.innerHTML = "";
  const all = document.createElement("button");
  all.className = "cat-btn" + (state.filters.gender.size===0 ? " active" : "");
  all.textContent = "All Genders";
  all.addEventListener("click", ()=>{ state.filters.gender.clear(); afterFilterChange(); });
  nav.appendChild(all);
  GENDERS.forEach(g=>{
    const b = document.createElement("button");
    b.className = "cat-btn" + (state.filters.gender.has(g) ? " active" : "");
    b.textContent = g;
    b.addEventListener("click", ()=>{
      state.filters.gender.clear();
      state.filters.gender.add(g);
      afterFilterChange();
    });
    nav.appendChild(b);
  });
}

function renderCategoryNav(){
  const nav = $("#categoryNav");
  nav.innerHTML = "";
  const all = document.createElement("button");
  all.className = "cat-btn" + (state.filters.category.size===0 ? " active" : "");
  all.textContent = "All Categories";
  all.addEventListener("click", ()=>{ state.filters.category.clear(); state.filters.sub.clear(); afterFilterChange(); });
  nav.appendChild(all);
  CATEGORIES.forEach(cat=>{
    const b = document.createElement("button");
    b.className = "cat-btn" + (state.filters.category.has(cat) ? " active" : "");
    b.textContent = cat;
    b.addEventListener("click", ()=>{
      state.filters.category.clear();
      state.filters.category.add(cat);
      state.filters.sub.clear();
      afterFilterChange();
    });
    nav.appendChild(b);
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
  GENDERS.forEach(g=>{
    const chip = document.createElement("button");
    chip.className = "chip" + (state.filters.gender.has(g) ? " active" : "");
    chip.textContent = g;
    chip.addEventListener("click", ()=>toggleFilter("gender", g));
    genBox.appendChild(chip);
  });

  const catBox = $("#filterCategory"); catBox.innerHTML = "";
  CATEGORIES.forEach(cat=>{
    const chip = document.createElement("button");
    chip.className = "chip" + (state.filters.category.has(cat) ? " active" : "");
    chip.textContent = cat;
    chip.addEventListener("click", ()=>toggleFilter("category", cat));
    catBox.appendChild(chip);
  });

  const relevantSubs = [...new Set(
    PRODUCTS.filter(p => state.filters.category.size===0 || state.filters.category.has(p.category))
            .map(p=>p.sub)
  )].sort();
  const subBox = $("#filterSub"); subBox.innerHTML = "";
  relevantSubs.forEach(sub=>{
    const chip = document.createElement("button");
    chip.className = "chip" + (state.filters.sub.has(sub) ? " active" : "");
    chip.textContent = sub;
    chip.addEventListener("click", ()=>toggleFilter("sub", sub));
    subBox.appendChild(chip);
  });

  updateFilterCountBadge();
}

function toggleFilter(group, value){
  const set = state.filters[group];
  set.has(value) ? set.delete(value) : set.add(value);
  if (group === "category") state.filters.sub.clear();
  state.visibleCount = PAGE_SIZE;
  renderGenderNav();
  renderCategoryNav();
  renderFilterPanel();
  render();
}

function updateFilterCountBadge(){
  const total = state.filters.gender.size + state.filters.category.size + state.filters.sub.size;
  const badge = $("#filterCountBadge");
  badge.textContent = total;
  badge.style.display = total > 0 ? "flex" : "none";
  $("#filterToggleBtn").classList.toggle("active", total > 0);
}

$("#clearFiltersBtn").addEventListener("click", ()=>{
  state.filters.gender.clear(); state.filters.category.clear(); state.filters.sub.clear();
  state.search = ""; $("#searchInput").value = "";
  state.selectedOnly = false; $("#selectedOnlyToggle").checked = false;
  afterFilterChange();
});

function toggleFilterPanel(){ $("#filterPanel").classList.toggle("open"); }
$("#filterToggleBtn").addEventListener("click", toggleFilterPanel);
$("#filterHeaderBtn").addEventListener("click", toggleFilterPanel);

/* ================================ FILTERING =============================== */
function getFilteredProducts(){
  let list = PRODUCTS.filter(p=>{
    if (state.filters.gender.size && !state.filters.gender.has(p.gender)) return false;
    if (state.filters.category.size && !state.filters.category.has(p.category)) return false;
    if (state.filters.sub.size && !state.filters.sub.has(p.sub)) return false;
    if (state.selectedOnly && !state.selected.has(p.id)) return false;
    if (state.search){
      const q = state.search.toLowerCase();
      const hay = [p.name, p.styleCode, p.fabricCode, p.colorCode, p.sub, p.category, p.gender].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  switch(state.sort){
    case "name": list.sort((a,b)=>a.name.localeCompare(b.name)); break;
    case "category": list.sort((a,b)=>a.category.localeCompare(b.category) || a.sub.localeCompare(b.sub)); break;
    case "style": list.sort((a,b)=>a.styleCode.localeCompare(b.styleCode)); break;
  }
  return list;
}

/* ============================ LANDING (browse by category) ================= */
function renderLanding(){
  const box = $("#landingGrid");
  box.innerHTML = "";
  CATEGORIES.forEach(cat=>{
    const count = PRODUCTS.filter(p=>p.category===cat).length;
    const tile = document.createElement("button");
    tile.className = "landing-tile";
    tile.innerHTML = `<div class="name">${titleCase(cat)}</div><div class="count">${count} product${count===1?"":"s"}</div>`;
    tile.addEventListener("click", ()=>{
      state.filters.category.clear();
      state.filters.category.add(cat);
      afterFilterChange();
    });
    box.appendChild(tile);
  });
}
function titleCase(s){
  return s.toLowerCase().split(" ").map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(" ");
}

/* ================================== GRID =================================== */
function heartSVG(selected){
  return `<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.8-4.9-10.3-9.4C-.2 7.6 1.6 4 5.3 4c2.1 0 3.6 1.1 4.7 2.7C11.1 5.1 12.6 4 14.7 4c3.7 0 5.5 3.6 3.6 7.1C20.8 15.6 12 20.5 12 20.5z"/></svg>`;
}

let currentFilteredList = [];
function render(){
  $("#landingView").style.display = "none";
  $("#productGrid").style.display = "grid";
  $("#loadMoreWrap").style.display = "none";

  currentFilteredList = getFilteredProducts();

  $("#resultCount").textContent = currentFilteredList.length;

  renderGrid();
}
function renderGrid(){
  const grid = $("#productGrid");
  grid.innerHTML = "";
  const list = currentFilteredList;

  if (!list.length){
    grid.innerHTML = `<div class="empty-state">
      <h3>No pieces match yet</h3>
      <p>Try widening your filters or clearing the search.</p>
    </div>`;
    $("#loadMoreWrap").style.display = "none";
    return;
  }

  const visible = list.slice(0, state.visibleCount);

  visible.forEach(p=>{
    const selected = state.selected.has(p.id);
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-media" data-open="${p.id}">
${p.images?.length ? `<img src="${p.images[0]}" alt="${p.name}" loading="lazy">` : `<div class="img-pending">${pendingSVG()}<span>Image pending</span></div>`}        <span class="gender-tag">${p.gender}</span>
        <button class="heart-btn ${selected ? 'selected' : ''}" data-select="${p.id}" aria-label="Select ${p.name}">${heartSVG(selected)}</button>
      </div>
      <div class="card-info">
        <div class="card-cat">${p.category} · ${p.sub}</div>
        <div class="card-name" data-open="${p.id}">${p.sub}</div>
        <div class="card-codes">
          <span>Style <b>${p.styleCode}</b></span>
          <span>Fabric <b>${p.fabricCode}</b></span>
          <span>Colour <b>${p.colorCode}</b></span>
        </div>
        <div class="card-bottom">
          <button class="card-select-btn ${selected ? 'selected' : ''}" data-select="${p.id}">${selected ? 'Selected' : 'Select'}</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  $$('[data-open]').forEach(el=>el.addEventListener("click", ()=>openModal(el.dataset.open)));
  $$('[data-select]').forEach(el=>el.addEventListener("click", (e)=>{
    e.stopPropagation();
    toggleSelect(el.dataset.select);
  }));

  const wrap = $("#loadMoreWrap");
  if (list.length > state.visibleCount){
    wrap.style.display = "flex";
    $("#loadMoreBtn").textContent = `Load more (${list.length - state.visibleCount} remaining)`;
  } else {
    wrap.style.display = "none";
  }
}
$("#loadMoreBtn").addEventListener("click", ()=>{
  state.visibleCount += PAGE_SIZE;
  renderGrid();
});

/* ============================== SELECTION LOGIC ============================= */
function toggleSelect(id){
  const wasSelected = state.selected.has(id);
  wasSelected ? state.selected.delete(id) : state.selected.add(id);
  persist();
  updateSelectionUI();
  const p = PRODUCTS.find(x=>x.id===id);
  toast(wasSelected ? `Removed ${p.name}` : `Added ${p.name} to your selection`);
}

function updateSelectionUI(){
  const count = state.selected.size;
  const badge = $("#selCountBadge");
  badge.textContent = count;
  badge.classList.toggle("zero", count===0);
  render();
  renderDrawer();
  if (state.modalIndex !== null) syncModalSelectButton();
}

/* ================================== MODAL =================================== */
let modalList = [];
function openModal(id){
  modalList = anyFiltersActive() ? currentFilteredList : PRODUCTS;
  const idx = modalList.findIndex(p=>p.id===id);
  state.modalIndex = idx >= 0 ? idx : 0;
  paintModal();
  $("#modalOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal(){
  $("#modalOverlay").classList.remove("open");
  document.body.style.overflow = "";
}
function paintModal(){
  const p = modalList[state.modalIndex];
  if (!p) return;
  const mediaBox = $("#modalMediaInner");
mediaBox.innerHTML = p.images?.length
  ? `
    <div class="product-gallery">
      <img id="galleryMainImage" src="${p.images[0]}" alt="${p.name}">
      <div class="gallery-thumbs">
        ${p.images.map((img, index) => `
          <img src="${img}" alt="${p.name} ${index + 1}" data-gallery-index="${index}">
        `).join("")}
      </div>
    </div>
  `
  : `<div class="img-pending">${pendingSVG()}<span>Image pending</span></div>`;  $("#modalCat").textContent = p.category;
  $("#modalName").textContent = p.name;
  $("#modalGender").textContent = p.gender;
  $("#modalStyle").textContent = p.styleCode;
  $("#modalFabric").textContent = p.fabricCode;
  $("#modalColor").textContent = p.colorCode;
  $("#modalSub").textContent = p.sub;
syncModalSelectButton();

  document.querySelectorAll(".gallery-thumbs img").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const index = Number(thumb.dataset.galleryIndex);
      const mainImage = document.querySelector("#galleryMainImage");

      if (mainImage && p.images[index]) {
        mainImage.src = p.images[index];
      }
    });
  });
}
function syncModalSelectButton(){
  const p = modalList[state.modalIndex];
  if (!p) return;
  const btn = $("#modalSelectBtn");
  const selected = state.selected.has(p.id);
  btn.textContent = selected ? "Selected — remove" : "Select this piece";
  btn.classList.toggle("selected", selected);
}
$("#modalCloseBtn").addEventListener("click", closeModal);
$("#modalOverlay").addEventListener("click", e=>{ if (e.target.id==="modalOverlay") closeModal(); });
$("#modalPrevBtn").addEventListener("click", ()=>{ state.modalIndex = (state.modalIndex - 1 + modalList.length) % modalList.length; paintModal(); });
$("#modalNextBtn").addEventListener("click", ()=>{ state.modalIndex = (state.modalIndex + 1) % modalList.length; paintModal(); });
$("#modalSelectBtn").addEventListener("click", ()=>{ toggleSelect(modalList[state.modalIndex].id); });
$("#modalDrawerBtn").addEventListener("click", ()=>{ closeModal(); openDrawer(); });
document.addEventListener("keydown", e=>{
  if (!$("#modalOverlay").classList.contains("open")) return;
  if (e.key === "Escape") closeModal();
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
$("#drawerClearBtn").addEventListener("click", ()=>{
  if (!state.selected.size) return;
  state.selected.clear();
  persist();
  updateSelectionUI();
  toast("Selection cleared");
});

function renderDrawer(){
  const list = PRODUCTS.filter(p=>state.selected.has(p.id));
  $("#drawerCount").textContent = `${list.length} product${list.length===1?"":"s"} selected`;
  const box = $("#drawerList");
  box.innerHTML = "";
  if (!list.length){
    box.innerHTML = `<div class="drawer-empty">Nothing selected yet.<br>Tap the heart on any piece to add it here.</div>`;
    return;
  }
  list.forEach(p=>{
    const row = document.createElement("div");
    row.className = "drawer-item";
    row.innerHTML = `
<div class="thumb">${p.images?.length ? `<img src="${p.images[0]}" alt="${p.name}">` : pendingSVG()}</div>      <div class="drawer-item-info">
        <div class="name">${p.name}</div>
        <div class="codes">${p.gender} · ${p.category} · ${p.sub}<br>Style ${p.styleCode} · Fabric ${p.fabricCode} · Colour ${p.colorCode}</div>
        <button class="drawer-remove" data-remove="${p.id}">Remove</button>
      </div>
    `;
    box.appendChild(row);
  });
  $$('[data-remove]').forEach(el=>el.addEventListener("click", ()=>toggleSelect(el.dataset.remove)));
}

/* ============================== BUYER FORM + SHARE ============================= */
$("#buyerName").value = state.buyer.name || "";
$("#buyerCompany").value = state.buyer.company || "";
$("#buyerEmail").value = state.buyer.email || "";
$("#buyerNotes").value = state.buyer.notes || "";

$("#buyerToggleBtn").addEventListener("click", ()=>{
  $("#buyerForm").classList.toggle("open");
});

["buyerName","buyerCompany","buyerEmail","buyerNotes"].forEach(id=>{
  $("#"+id).addEventListener("input", ()=>{
    state.buyer = {
      name: $("#buyerName").value, company: $("#buyerCompany").value,
      email: $("#buyerEmail").value, notes: $("#buyerNotes").value
    };
    localStorage.setItem("ea_buyer", JSON.stringify(state.buyer));
  });
});

function buildSelectionSummary(){
  const list = PRODUCTS.filter(p=>state.selected.has(p.id));
  let text = "EMPORIO ARMANI — Buyer Selection (FW26)\n";
  if (state.buyer.name || state.buyer.company){
    text += `\nBuyer: ${state.buyer.name || "—"}${state.buyer.company ? " · " + state.buyer.company : ""}`;
    if (state.buyer.email) text += `\nEmail: ${state.buyer.email}`;
  }
  if (state.buyer.notes) text += `\nNotes: ${state.buyer.notes}`;
  text += `\n\n${list.length} product${list.length===1?"":"s"} selected:\n`;
  list.forEach((p,i)=>{
    text += `\n${i+1}. ${p.name} (${p.gender} · ${p.category} · ${p.sub})\n   Style ${p.styleCode} · Fabric ${p.fabricCode} · Colour ${p.colorCode}`;
  });
  return { text, list };
}

$("#shareBtn").addEventListener("click", ()=>{
  if (!state.selected.size){
    toast("Select at least one product first");
    return;
  }

  const { text } = buildSelectionSummary();

  window.open(
    `https://wa.me/?text=${encodeURIComponent(text)}`,
    "_blank"
  );
});
/* ================================ SEARCH / SORT ================================ */
$("#searchInput").addEventListener("input", e=>{
  state.search = e.target.value.trim();
  state.visibleCount = PAGE_SIZE;
  render();
});
$("#sortSelect").addEventListener("change", e=>{
  state.sort = e.target.value;
  render();
});
$("#selectedOnlyToggle").addEventListener("change", e=>{
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
  updateSelectionUI();
}
loadProducts();