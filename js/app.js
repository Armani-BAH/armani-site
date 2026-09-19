/* ============================================================
   Armani wishlist — app logic
   Products are loaded from data/products.json (built from your
   Excel sheet via scripts/excel_to_json.py)
   ============================================================ */

/* line-icon fallback per category, used only when a product has no image link */
const ICONS = {
  "Dress":'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.3"><path d="M9 3l-1.5 4L4 9.5l2 2.5-1 9h14l-1-9 2-2.5L16.5 7 15 3c-1 1.2-4 1.2-5 0z"/></svg>',
  "Jacket":'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.3"><path d="M9 4L4 7l1 4-1 10h14L17 11l1-4-5-3-1.5 2h-3z"/></svg>',
  "Suit":'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.3"><path d="M9 4L4 7l1.5 4L4 20h16l-1.5-9L20 7l-5-3-1.2 3-3.5-3z"/></svg>',
  "Shirt":'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.3"><path d="M8 4L3 7l2 3 2-1v11h10V9l2 1 2-3-5-3-2 2h-4z"/></svg>',
  "Coat":'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.3"><path d="M8 3L3 6l1.5 4L3 21h6l1-8 2 8h6l-1.5-11L18 6l-5-3-1 2-4-2z"/></svg>',
  "Knitwear":'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.3"><path d="M8 4L3 7l1.5 3.5L6 9v12h12V9l1.5 1.5L21 7l-5-3-1 2h-4l-1-2z"/></svg>',
  "Bag":'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.3"><path d="M7 9V6a5 5 0 0110 0v3M4 9h16l-1 12H5L4 9z"/></svg>',
  "Shoes":'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.3"><path d="M3 18c0-2 1-3 3-4l4-2.5c1-.6 1.5-1.5 1.5-2.5V7l3 1c2 .7 3 1.7 5 2.5 2 .8 2.5 1.8 2.5 3v4.5H3z"/></svg>',
  "Accessories":'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.3"><rect x="3" y="8" width="18" height="10" rx="1"/><path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
};
const FALLBACK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.3"><circle cx="12" cy="12" r="9"/></svg>';

/* ---------- WhatsApp advisor number — set this to the real business number ---------- */
const ADVISOR_WHATSAPP_NUMBER = "97300000000"; // country code + number, no + or spaces

let PRODUCTS = [];
const state = {gender:"All", category:"All", wishlist: new Set()};

/* ---------- load product data ----------
   Reads your Excel sheet directly in the browser — no conversion step needed.
   To update your catalog: edit your sheet and save it over data/catalog.xlsx,
   keeping the same column headers (Gender, Category, Product Description,
   Style Code, Fabric Code, Color Code, Image Link), then refresh the page. */
async function loadProducts(){
  const res = await fetch("data/catalog.xlsx");
  if(!res.ok) throw new Error("Could not load data/catalog.xlsx");
  const buffer = await res.arrayBuffer();
  const workbook = XLSX.read(buffer, {type:"array"});
  const sheet = workbook.Sheets[workbook.SheetNames[0]]; // first sheet in the file
  const rows = XLSX.utils.sheet_to_json(sheet, {defval:""});

  PRODUCTS = rows
    .filter(r => r["Style Code"])
    .map(r => ({
      id: String(r["Style Code"]).trim(),
      gender: String(r["Gender"] || "").trim(),
      category: String(r["Category"] || "").trim(),
      description: String(r["Product Description"] || "").trim(),
      style: String(r["Style Code"]).trim(),
      fabricCode: String(r["Fabric Code"] || "").trim(),
      color: String(r["Color Code"] || "").trim(),
      imageLink: String(r["Image Link"] || "").trim(),
    }));
}

/* ---------- persistence: wishlist saved per-visitor in this browser only ---------- */
function loadWishlist(){
  try{
    const raw = localStorage.getItem("armani_wishlist_v1");
    if(raw) JSON.parse(raw).forEach(id => state.wishlist.add(id));
  }catch(e){ /* storage unavailable — wishlist just won't persist across visits */ }
}
function saveWishlist(){
  try{
    localStorage.setItem("armani_wishlist_v1", JSON.stringify([...state.wishlist]));
  }catch(e){}
}

/* ---------- filters ---------- */
function buildFilters(){
  const genders = ["All", ...new Set(PRODUCTS.map(p=>p.gender))];
  const categories = ["All", ...new Set(PRODUCTS.map(p=>p.category))];
  const gWrap = document.getElementById("genderFilters");
  genders.forEach(g=>{
    const b = document.createElement("button");
    b.className = "filter-option" + (g==="All" ? " active" : "");
    b.textContent = g;
    b.onclick = ()=>{state.gender=g; refreshFilterUI(); render();};
    gWrap.appendChild(b);
  });
  const cWrap = document.getElementById("categoryFilters");
  categories.forEach(c=>{
    const b = document.createElement("button");
    b.className = "filter-option" + (c==="All" ? " active" : "");
    b.textContent = c;
    b.onclick = ()=>{state.category=c; refreshFilterUI(); render();};
    cWrap.appendChild(b);
  });
}
function refreshFilterUI(){
  document.querySelectorAll("#genderFilters .filter-option").forEach(b=>{
    b.classList.toggle("active", b.textContent===state.gender);
  });
  document.querySelectorAll("#categoryFilters .filter-option").forEach(b=>{
    b.classList.toggle("active", b.textContent===state.category);
  });
}

/* ---------- grid ---------- */
function filteredProducts(){
  return PRODUCTS.filter(p=>
    (state.gender==="All" || p.gender===state.gender) &&
    (state.category==="All" || p.category===state.category)
  );
}

function visualHTML(p){
  if(p.imageLink){
    // real photo from your sheet — data-category lets us swap in the line icon
    // via JS (see wireImageFallbacks) if the link is broken, without fragile inline JS
    return `<img src="${p.imageLink}" alt="${p.description}" loading="lazy" data-category="${p.category}">`;
  }
  return ICONS[p.category] || FALLBACK_ICON;
}

/* replaces any broken product photo with its category line-icon.
   Call this after inserting new .card-visual / .mini-visual HTML into the page. */
function wireImageFallbacks(container){
  container.querySelectorAll("img[data-category]").forEach(img=>{
    img.addEventListener("error", ()=>{
      const wrapper = document.createElement("span");
      wrapper.innerHTML = ICONS[img.dataset.category] || FALLBACK_ICON;
      img.replaceWith(wrapper.firstElementChild);
    }, {once:true});
  });
}

function render(){
  const list = filteredProducts();
  const grid = document.getElementById("grid");
  const empty = document.getElementById("emptyState");
  document.getElementById("resultsCount").textContent = `${list.length} piece${list.length===1?"":"s"}`;
  document.getElementById("activeFilterLabel").textContent =
    (state.gender==="All" && state.category==="All") ? "" : `${state.gender} · ${state.category}`;

  grid.innerHTML = "";
  empty.style.display = list.length ? "none" : "block";

  list.forEach(p=>{
    const card = document.createElement("div");
    card.className = "card";
    const fav = state.wishlist.has(p.id);
    card.innerHTML = `
      <div class="card-visual">
        ${visualHTML(p)}
        <button class="fav-btn ${fav?"active":""}" data-id="${p.id}" aria-label="Toggle wishlist">
          <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.1 2.3 4.5 5.9 4c2-.3 3.9.7 6.1 3 2.2-2.3 4.1-3.3 6.1-3 3.6.5 5.5 4.1 3.9 7.7C19.5 16.4 12 21 12 21z"/></svg>
        </button>
        ${p.colorHex ? `<span class="swatch" style="background:${p.colorHex}" title="${p.color}"></span>` : ""}
      </div>
      <div class="card-body">
        <div class="card-cat">${p.gender} · ${p.category}</div>
        <div class="card-name">${p.description}</div>
        <div class="card-code">${p.style} — ${p.color}</div>
      </div>
    `;
    card.querySelector(".fav-btn").onclick = ()=>toggleWish(p.id);
    grid.appendChild(card);
  });
  wireImageFallbacks(grid);
}

function toggleWish(id){
  if(state.wishlist.has(id)) state.wishlist.delete(id);
  else state.wishlist.add(id);
  saveWishlist();
  render();
  renderDrawer();
}

/* ---------- drawer ---------- */
function renderDrawer(){
  const items = PRODUCTS.filter(p=>state.wishlist.has(p.id));
  document.getElementById("wishCount").textContent = items.length;
  const list = document.getElementById("drawerList");
  const sendBtn = document.getElementById("sendWhatsapp");
  const sendLabel = document.getElementById("sendLabel");

  if(!items.length){
    list.innerHTML = `<div class="drawer-empty">Nothing saved yet. Tap the heart on any piece to add it here.</div>`;
    sendBtn.disabled = true;
    sendLabel.textContent = "Save some pieces first";
    return;
  }
  sendBtn.disabled = false;
  sendLabel.textContent = `Send ${items.length} piece${items.length===1?"":"s"} on WhatsApp`;

  list.innerHTML = "";
  items.forEach(p=>{
    const row = document.createElement("div");
    row.className = "drawer-item";
    row.innerHTML = `
      <div class="mini-visual">${visualHTML(p)}</div>
      <div class="drawer-item-info">
        <div class="name">${p.description}</div>
        <div class="meta">${p.style} · ${p.color}</div>
      </div>
      <button class="remove-btn" data-id="${p.id}">Remove</button>
    `;
    row.querySelector(".remove-btn").onclick = ()=>toggleWish(p.id);
    list.appendChild(row);
  });
  wireImageFallbacks(list);
}

/* ---------- WhatsApp share ----------
   wa.me links open a pre-filled chat — no API or backend required. */
function buildWhatsappMessage(){
  const items = PRODUCTS.filter(p=>state.wishlist.has(p.id));
  let msg = `Hello, I'd like to check price and size availability for:\n\n`;
  items.forEach((p,i)=>{
    msg += `${i+1}. ${p.description} — ${p.style} (${p.color}, ${p.gender})\n`;
  });
  msg += `\nSent from the Armani website.`;
  return msg;
}
document.getElementById("sendWhatsapp").onclick = ()=>{
  if(!state.wishlist.size) return;
  const text = encodeURIComponent(buildWhatsappMessage());
  window.open(`https://wa.me/${ADVISOR_WHATSAPP_NUMBER}?text=${text}`, "_blank");
};

/* ---------- drawer open/close ---------- */
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
function openDrawer(){drawer.classList.add("open"); overlay.classList.add("open");}
function closeDrawerFn(){drawer.classList.remove("open"); overlay.classList.remove("open");}
document.getElementById("openDrawer").onclick = openDrawer;
document.getElementById("closeDrawer").onclick = closeDrawerFn;
overlay.onclick = closeDrawerFn;

/* ---------- init ---------- */
(async function init(){
  loadWishlist();
  try{
    await loadProducts();
  }catch(err){
    document.getElementById("grid").innerHTML =
      `<p style="color:#A33B2B;">Could not load data/catalog.xlsx — make sure the file exists with that exact name, and that you're running this through a local server (see README), not by double-clicking index.html.</p>`;
    console.error(err);
    return;
  }
  buildFilters();
  render();
  renderDrawer();
})();
