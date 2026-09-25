/* =========================================================================
   Emporio Armani Bahrain — product selection
   data/products.json: id, gender, category, family, sub, name,
   styleCode, fabricCode, colorCode, productKey, season, images[]
   ========================================================================= */

let PRODUCTS = [];
let GENDERS  = [];
let CATEGORIES = [];

/* UNISEX is merged into MAN visually. These are the displayed departments. */
const GENDER_ORDER  = ["WOMAN","MAN","GIRL","BOY","UNISEX JUNIOR"];
const GENDER_LABELS = {
  "WOMAN":"Women","MAN":"Men","GIRL":"Girls",
  "BOY":"Boys","UNISEX JUNIOR":"Unisex junior"
};
/* Images you placed in assets/images/genders/ */
const GENDER_IMAGES = {
  "WOMAN":         "assets/images/genders/gender-woman.jpg",
  "MAN":           "assets/images/genders/gender-man.jpg",
  "GIRL":          "assets/images/genders/gender-girl.jpg",
  "BOY":           "assets/images/genders/gender-boy.jpg",
  "UNISEX JUNIOR": "assets/images/genders/gender-unisex-junior.jpg"
};
/* Raw gender values that belong to "MAN" on screen */
const MAN_GENDERS = new Set(["MAN","UNISEX"]);

/* ========================= HELPERS ========================= */
const sentenceCase = s => { const t = String(s).trim().toLowerCase(); return t.charAt(0).toUpperCase()+t.slice(1); };
const genderLabel  = g => GENDER_LABELS[g] || (MAN_GENDERS.has(g) ? "Men" : sentenceCase(g));
const genderRank   = g => { const i = GENDER_ORDER.indexOf(g); return i===-1 ? GENDER_ORDER.length : i; };
const fmt          = n => n.toLocaleString("en-US");
const piecesText   = n => `${fmt(n)} ${n===1?"piece":"pieces"}`;
const esc          = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* Map a raw gender to its display key (UNISEX → MAN) */
const displayGender = g => MAN_GENDERS.has(g) ? "MAN" : g;

/* First image URL for a set of products */
const firstImage = list => (list.find(p=>p.images?.length)?.images[0]) || null;

/* ========================= LOAD ========================= */
async function loadProducts(){
  try{
    const r = await fetch("data/products.json");
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    PRODUCTS = await r.json();

    /* Build display gender list — deduplicated and ordered */
    const seen = new Set();
    GENDERS = [];
    PRODUCTS.forEach(p=>{ const d=displayGender(p.gender); if(!seen.has(d)){seen.add(d);GENDERS.push(d);} });
    GENDERS.sort((a,b)=>genderRank(a)-genderRank(b));

    CATEGORIES = [...new Set(PRODUCTS.map(p=>p.category))].sort();

    buildGenderLanding();
    updateSelectionBadge();
    renderDrawer();
  }catch(e){
    console.error("Could not load products.json",e);
    document.getElementById("landingGender").innerHTML =
      '<p style="padding:60px 24px;text-align:center;color:#666">The catalogue could not be loaded. Please refresh.</p>';
  }
}

/* ========================= SCREEN ROUTING ========================= */
function showScreen(name){
  document.getElementById("landingGender").hidden   = name!=="gender";
  document.getElementById("landingCategory").hidden = name!=="category";
  document.getElementById("catalogueWrap").hidden   = name!=="catalogue";
}

/* ========================= GENDER LANDING ========================= */
function buildGenderLanding(){
  const grid = document.getElementById("genderCards");
  grid.innerHTML = "";
  GENDERS.forEach(g=>{
    /* count products that belong to this display gender */
    const count = PRODUCTS.filter(p=>displayGender(p.gender)===g).length;
    const img   = GENDER_IMAGES[g];
    const btn   = document.createElement("button");
    btn.type    = "button";
    btn.className = "landing-card";
    btn.innerHTML = `
      ${img?`<img class="landing-card-img" src="${esc(img)}" alt="" loading="lazy">`:""}
      <span class="landing-card-arrow"><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg></span>
      <span class="landing-card-body">
        <span class="landing-card-label">${esc(GENDER_LABELS[g])}</span>
      </span>`;
    btn.addEventListener("click",()=>showCategoryLanding(g));
    grid.appendChild(btn);
  });
  renderGenderNav(); /* build the header tabs too */
  showScreen("gender");
}

/* ========================= CATEGORY LANDING ========================= */
function showCategoryLanding(dGender){
  state.activeGender = dGender;
  document.getElementById("landingDeptLabel").textContent = GENDER_LABELS[dGender];

  /* categories available for this display gender */
  const relevantProducts = PRODUCTS.filter(p=>displayGender(p.gender)===dGender);
  const cats = [...new Set(relevantProducts.map(p=>p.category))].sort();

  const grid = document.getElementById("categoryCards");
  grid.innerHTML = "";
  cats.forEach(cat=>{
    const catProds = relevantProducts.filter(p=>p.category===cat);
    const count    = catProds.length;
    const imgUrl   = firstImage(catProds);
    const btn      = document.createElement("button");
    btn.type       = "button";
    btn.className  = "landing-card cat-card";
    btn.innerHTML  = `
      ${imgUrl?`<img class="landing-card-img" src="${esc(imgUrl)}" alt="" loading="lazy">`:""}
      <span class="landing-card-arrow"><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg></span>
      <span class="landing-card-body">
        <span class="landing-card-label">${esc(sentenceCase(cat))}</span>
      </span>`;
    btn.addEventListener("click",()=>enterCatalogue(dGender,cat));
    grid.appendChild(btn);
  });
  showScreen("category");
}

/* ========================= ENTER CATALOGUE ========================= */
function enterCatalogue(dGender, category){
  state.activeGender   = dGender;
  state.activeCategory = category;

  /* translate display gender back to raw genders for filtering */
  if(dGender){
    const rawGenders = dGender==="MAN" ? [...MAN_GENDERS] : [dGender];
    state.filters.gender = new Set(rawGenders);
  } else {
    state.filters.gender.clear();
  }
  state.filters.category = category ? new Set([category]) : new Set();
  state.filters.sub.clear();
  state.search = ""; document.getElementById("searchInput").value="";
  state.selectedOnly = false; document.getElementById("selectedOnlyToggle").checked=false;
  state.sort = "default"; document.getElementById("sortSelect").value="default";
  state.visibleCount = PAGE_SIZE;

  showScreen("catalogue");
  renderGenderNav();
  renderCategoryNav();
  renderFilterPanel();
  render();
  renderBreadcrumb();
  window.scrollTo(0,0);
}

/* ========================= GENDER NAV (header) ========================= */
function renderGenderNav(){
  const nav = document.getElementById("genderNav");
  nav.innerHTML = "";
  GENDERS.forEach(g=>{
    const active = state.activeGender===g;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "g-btn" + (active?" active":"");
    btn.textContent = GENDER_LABELS[g];
    btn.addEventListener("click",()=>{
      /* go straight to products for this gender, no category screen */
      enterCatalogue(g, null);
    });
    nav.appendChild(btn);
  });
}

/* ========================= BREADCRUMB ========================= */
function renderBreadcrumb(){
  const bc = document.getElementById("breadcrumb");
  bc.innerHTML="";
  if(state.activeGender){
    const btn = document.createElement("button");
    btn.type="button"; btn.className="breadcrumb-item";
    btn.textContent = GENDER_LABELS[state.activeGender]||state.activeGender;
    btn.addEventListener("click",()=>showCategoryLanding(state.activeGender));
    bc.appendChild(btn);
  }
  if(state.activeCategory){
    const sep=document.createElement("span"); sep.className="breadcrumb-sep"; sep.textContent="›"; bc.appendChild(sep);
    const cur=document.createElement("span"); cur.className="breadcrumb-current"; cur.textContent=sentenceCase(state.activeCategory); bc.appendChild(cur);
  }
  /* page title */
  const parts=[];
  if(state.activeGender) parts.push(GENDER_LABELS[state.activeGender]||state.activeGender);
  if(state.activeCategory) parts.push(sentenceCase(state.activeCategory));
  document.getElementById("pageTitle").textContent = parts.length ? parts.join(" · ") : "FW26 selection";
}

/* ========================= STATE ========================= */
const PAGE_SIZE = 60;
const state = {
  search:"",
  filters:{ gender:new Set(), category:new Set(), sub:new Set() },
  selectedOnly:false, sort:"default",
  selected: new Set(JSON.parse(localStorage.getItem("ea_selection")||"[]")),
  buyer:    JSON.parse(localStorage.getItem("ea_buyer")||"{}"),
  modalIndex:null, visibleCount:PAGE_SIZE,
  activeGender:null, activeCategory:null, expandedCategory:null
};
function persist(){ localStorage.setItem("ea_selection",JSON.stringify([...state.selected])); }

const $  = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function toast(msg){
  const t=$("#toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove("show"),2200);
}
function pendingSVG(){ return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`; }
function heartSVG(){ return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6c-1.9-1.6-4.7-1.4-6.3.4L12 7.6l-2.5-2.6c-1.6-1.8-4.4-2-6.3-.4-2.1 1.8-2.2 5-.3 7L12 21l9.1-9.4c1.9-2 1.8-5.2-.3-7z"/></svg>`; }

/* ========================= CATEGORY SIDEBAR ========================= */
function renderCategoryNav(){
  const nav = $("#categoryNav"); nav.innerHTML="";
  const relevantProds = state.filters.gender.size
    ? PRODUCTS.filter(p=>state.filters.gender.has(p.gender))
    : PRODUCTS;
  const relevantCats = [...new Set(relevantProds.map(p=>p.category))].sort();

  const allBtn = document.createElement("button");
  allBtn.type="button"; allBtn.className="cat-btn"+(state.filters.category.size===0?" active":"");
  allBtn.textContent="All categories";
  allBtn.addEventListener("click",()=>{
    state.filters.category.clear(); state.filters.sub.clear();
    state.activeCategory=null; state.visibleCount=PAGE_SIZE;
    renderCategoryNav(); renderFilterPanel(); render(); renderBreadcrumb();
  });
  nav.appendChild(allBtn);

  relevantCats.forEach(cat=>{
    const isCatActive = state.expandedCategory === cat;
    const btn=document.createElement("button");
    btn.type="button"; btn.className="cat-btn"+(isCatActive?" active":"");
    btn.textContent=sentenceCase(cat);
    btn.addEventListener("click",()=>{
      /* toggle open/close only — don't filter */
      if(state.expandedCategory===cat){
        state.expandedCategory=null;
      } else {
        state.expandedCategory=cat;
      }
      state.filters.sub.clear();
      renderCategoryNav();
    });
    nav.appendChild(btn);

    /* Sub-family dropdown — show when category is expanded */
    if(state.expandedCategory===cat){
      const subs = [...new Set(
        relevantProds.filter(p=>p.category===cat).map(p=>p.sub)
      )].sort();
      subs.forEach(sub=>{
        const subBtn=document.createElement("button");
        subBtn.type="button";
        subBtn.className="cat-btn sub-btn"+(state.filters.sub.has(sub)?" active":"");
        subBtn.textContent=sentenceCase(sub);
        subBtn.addEventListener("click",e=>{
          e.stopPropagation();
          /* single select — clicking another sub deselects the previous */
          if(state.filters.sub.has(sub)){
            state.filters.sub.clear();
          } else {
            state.filters.sub.clear();
            state.filters.sub.add(sub);
            state.filters.category.clear();
            state.filters.category.add(cat);
            state.activeCategory=cat;
          }
          state.visibleCount=PAGE_SIZE;
          renderCategoryNav(); renderFilterPanel(); render(); renderBreadcrumb();
        });
        nav.appendChild(subBtn);
      });
    }
  });
}

/* ========================= FILTER PANEL ========================= */
function renderFilterPanel(){
  const genBox=$("#filterGender"); genBox.innerHTML="";
  GENDERS.forEach(g=>{
    /* active when any of the raw genders for this display gender are in the filter */
    const active = g==="MAN"
      ? [...MAN_GENDERS].some(raw=>state.filters.gender.has(raw))
      : state.filters.gender.has(g);
    const b=document.createElement("button");
    b.type="button"; b.className="chip"+(active?" active":"");
    b.textContent=GENDER_LABELS[g];
    b.addEventListener("click",()=>toggleGenderFilter(g));
    genBox.appendChild(b);
  });

  const catBox=$("#filterCategory"); catBox.innerHTML="";
  CATEGORIES.forEach(cat=>{
    const b=document.createElement("button");
    b.type="button"; b.className="chip"+(state.filters.category.has(cat)?" active":"");
    b.textContent=sentenceCase(cat);
    b.addEventListener("click",()=>toggleFilter("category",cat));
    catBox.appendChild(b);
  });

  const relevantSubs=[...new Set(
    PRODUCTS.filter(p=>state.filters.category.size===0||state.filters.category.has(p.category)).map(p=>p.sub)
  )].sort();
  const subBox=$("#filterSub"); subBox.innerHTML="";
  relevantSubs.forEach(sub=>{
    const b=document.createElement("button");
    b.type="button"; b.className="chip"+(state.filters.sub.has(sub)?" active":"");
    b.textContent=sentenceCase(sub);
    b.addEventListener("click",()=>toggleFilter("sub",sub));
    subBox.appendChild(b);
  });
  updateFilterCountBadge();
}

function toggleGenderFilter(dGender){
  const rawGenders = dGender==="MAN" ? [...MAN_GENDERS] : [dGender];
  const alreadyOn  = rawGenders.every(raw=>state.filters.gender.has(raw));
  if(alreadyOn){ rawGenders.forEach(raw=>state.filters.gender.delete(raw)); state.activeGender=null; }
  else         { rawGenders.forEach(raw=>state.filters.gender.add(raw));    state.activeGender=dGender; }
  state.visibleCount=PAGE_SIZE;
  renderCategoryNav(); renderFilterPanel(); render(); renderBreadcrumb(); renderGenderNav();
}

function toggleFilter(group,value){
  const set=state.filters[group];
  set.has(value)?set.delete(value):set.add(value);
  if(group==="category"){ state.filters.sub.clear(); state.activeCategory=[...state.filters.category][0]||null; }
  state.visibleCount=PAGE_SIZE;
  renderCategoryNav(); renderFilterPanel(); render(); renderBreadcrumb();
}

function updateFilterCountBadge(){
  const total=state.filters.gender.size+state.filters.category.size+state.filters.sub.size;
  const badge=$("#filterCountBadge");
  badge.textContent=total; badge.style.display=total>0?"inline-flex":"none";
  $("#filterToggleBtn").classList.toggle("active",total>0);
}

function clearAllFilters(){
  state.filters.gender.clear(); state.filters.category.clear(); state.filters.sub.clear();
  state.search=""; $("#searchInput").value="";
  state.selectedOnly=false; $("#selectedOnlyToggle").checked=false;
  state.activeGender=null; state.activeCategory=null; state.visibleCount=PAGE_SIZE;
  renderGenderNav(); renderCategoryNav(); renderFilterPanel(); render(); renderBreadcrumb();
}
$("#clearFiltersBtn").addEventListener("click",clearAllFilters);
$("#filterToggleBtn").addEventListener("click",()=>{
  const open=$("#filterPanel").classList.toggle("open");
  $("#filterToggleBtn").setAttribute("aria-expanded",String(open));
});

/* ========================= FILTERING ========================= */
function getFilteredProducts(){
  let list=PRODUCTS.filter(p=>{
    if(state.filters.gender.size   && !state.filters.gender.has(p.gender))     return false;
    if(state.filters.category.size && !state.filters.category.has(p.category)) return false;
    if(state.filters.sub.size      && !state.filters.sub.has(p.sub))           return false;
    if(state.selectedOnly && !state.selected.has(p.id))                         return false;
    if(state.search){
      const q=state.search.toLowerCase();
      const hay=[p.name,p.styleCode,p.fabricCode,p.colorCode,p.sub,p.category,genderLabel(p.gender)].join(" ").toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });
  switch(state.sort){
    case "name":     list.sort((a,b)=>a.name.localeCompare(b.name)); break;
    case "category": list.sort((a,b)=>a.category.localeCompare(b.category)||a.sub.localeCompare(b.sub)); break;
    case "style":    list.sort((a,b)=>a.styleCode.localeCompare(b.styleCode)); break;
    default:         list.sort((a,b)=>(b.images?.length>0)-(a.images?.length>0));
  }
  return list;
}

/* ========================= GRID ========================= */
let currentFilteredList=[];

function render(){
  currentFilteredList=getFilteredProducts();
  $("#resultCount").textContent=piecesText(currentFilteredList.length);
  renderGrid();
}

function cardHTML(p){
  const selected=state.selected.has(p.id); const name=esc(p.name);
  const media=p.images?.length
    ?`<img src="${esc(p.images[0])}" alt="${name}" loading="lazy">`
    :`<div class="img-pending">${pendingSVG()}<span>No photo yet</span></div>`;
  return `
    <article class="card${selected?" is-selected":""}" data-id="${esc(p.id)}">
      <div class="card-media" data-open="${esc(p.id)}">
        ${media}
        <button type="button" class="heart-btn${selected?" selected":""}" data-select="${esc(p.id)}"
                aria-pressed="${selected}" aria-label="Select ${name}">${heartSVG()}</button>
      </div>
      <div class="card-info">
        <button type="button" class="card-name" data-open="${esc(p.id)}">${name}</button>
        <div class="card-meta">
          <span>${esc(genderLabel(p.gender))}</span>
          <span>${esc(sentenceCase(p.category))}</span>
        </div>
        <dl class="card-codes">
          <div><dt>Style</dt><dd>${esc(p.styleCode)}</dd></div>
          <div><dt>Fabric</dt><dd>${esc(p.fabricCode)}</dd></div>
          <div><dt>Colour</dt><dd>${esc(p.colorCode)}</dd></div>
        </dl>
      </div>
    </article>`;
}

function renderGrid(){
  const grid=$("#productGrid"); const list=currentFilteredList;
  if(!list.length){
    grid.innerHTML=`<div class="empty-state"><h3>No pieces match</h3><p>Try widening your filters or clearing the search.</p><button type="button" class="btn-secondary" data-clear style="display:inline-flex">Clear all filters</button></div>`;
    $("#loadMoreWrap").style.display="none"; return;
  }
  grid.innerHTML=list.slice(0,state.visibleCount).map(cardHTML).join("");
  const remaining=list.length-state.visibleCount;
  const wrap=$("#loadMoreWrap");
  if(remaining>0){ wrap.style.display="flex"; $("#loadMoreBtn").textContent=`Show more (${fmt(remaining)} left)`; }
  else wrap.style.display="none";
}

$("#productGrid").addEventListener("click",e=>{
  if(e.target.closest("[data-clear]")) return clearAllFilters();
  const sel=e.target.closest("[data-select]"); if(sel) return toggleSelect(sel.dataset.select);
  const open=e.target.closest("[data-open]"); if(open) openModal(open.dataset.open);
});
$("#loadMoreBtn").addEventListener("click",()=>{ state.visibleCount+=PAGE_SIZE; renderGrid(); });

/* ========================= SELECTION ========================= */
function updateSelectionBadge(){
  const count=state.selected.size; const badge=$("#selCountBadge");
  badge.textContent=count; badge.classList.toggle("zero",count===0);
}
function paintSelection(id){
  const on=state.selected.has(id);
  $$(`.heart-btn[data-select="${id}"]`).forEach(b=>{ b.classList.toggle("selected",on); b.setAttribute("aria-pressed",String(on)); });
  $$(`.card[data-id="${id}"]`).forEach(c=>c.classList.toggle("is-selected",on));
}
function toggleSelect(id){
  const was=state.selected.has(id); was?state.selected.delete(id):state.selected.add(id);
  persist(); updateSelectionBadge(); renderDrawer();
  if(state.selectedOnly) render(); else paintSelection(id);
  if(state.modalIndex!==null) syncModalSelectButton();
  const p=PRODUCTS.find(x=>x.id===id);
  toast(was?`Removed ${p.name}`:`Added ${p.name} to your selection`);
}

/* ========================= MODAL ========================= */
let modalList=[]; let lastFocus=null;

function openModal(id){
  modalList=currentFilteredList;
  const idx=modalList.findIndex(p=>p.id===id);
  state.modalIndex=idx>=0?idx:0; lastFocus=document.activeElement;
  paintModal(); $("#modalOverlay").classList.add("open"); document.body.style.overflow="hidden"; $("#modalCloseBtn").focus();
}
function closeModal(){
  $("#modalOverlay").classList.remove("open"); state.modalIndex=null;
  document.body.style.overflow=""; if(lastFocus&&lastFocus.focus) lastFocus.focus();
}
function paintModal(){
  const p=modalList[state.modalIndex]; if(!p) return;
  const name=esc(p.name); const hasImages=p.images?.length>0;
  $("#modalMediaInner").innerHTML=hasImages
    ?`<div class="product-gallery">
        <img id="galleryMainImage" src="${esc(p.images[0])}" alt="${name}">
        ${p.images.length>1?`<div class="gallery-thumbs">${p.images.map((img,i)=>`
          <button type="button" class="thumb-btn${i===0?" active":""}" data-gallery-index="${i}" aria-label="Show photo ${i+1}">
            <img src="${esc(img)}" alt="">
          </button>`).join("")}</div>`:""}
      </div>`
    :`<div class="img-pending">${pendingSVG()}<span>No photo yet</span></div>`;
  $("#modalCat").textContent=sentenceCase(p.category);
  $("#modalName").textContent=p.name;
  $("#modalGender").textContent=genderLabel(p.gender);
  $("#modalStyle").textContent=p.styleCode;
  $("#modalFabric").textContent=p.fabricCode;
  $("#modalColor").textContent=p.colorCode;
  $("#modalFamily").textContent=sentenceCase(p.family);
  $("#modalDesc").hidden=hasImages;
  syncModalSelectButton();
}
function syncModalSelectButton(){
  const p=modalList[state.modalIndex]; if(!p) return;
  const btn=$("#modalSelectBtn"); const selected=state.selected.has(p.id);
  btn.textContent=selected?"Selected — remove":"Select this piece";
  btn.classList.toggle("selected",selected);
}

$("#modalMediaInner").addEventListener("click",e=>{
  const thumb=e.target.closest("[data-gallery-index]"); if(!thumb) return;
  const p=modalList[state.modalIndex]; const main=$("#galleryMainImage");
  if(main&&p.images[thumb.dataset.galleryIndex]) main.src=p.images[thumb.dataset.galleryIndex];
  $$(".thumb-btn").forEach(b=>b.classList.toggle("active",b===thumb));
});
$("#modalCloseBtn").addEventListener("click",closeModal);
$("#modalOverlay").addEventListener("click",e=>{ if(e.target.id==="modalOverlay") closeModal(); });
$("#modalPrevBtn").addEventListener("click",()=>{ state.modalIndex=(state.modalIndex-1+modalList.length)%modalList.length; paintModal(); });
$("#modalNextBtn").addEventListener("click",()=>{ state.modalIndex=(state.modalIndex+1)%modalList.length; paintModal(); });
$("#modalSelectBtn").addEventListener("click",()=>toggleSelect(modalList[state.modalIndex].id));
$("#modalDrawerBtn").addEventListener("click",()=>{ closeModal(); openDrawer(); });

document.addEventListener("keydown",e=>{
  const mo=$("#modalOverlay").classList.contains("open");
  if(e.key==="Escape"){ if(mo) closeModal(); else if($("#drawer").classList.contains("open")) closeDrawer(); return; }
  if(!mo) return;
  if(e.key==="ArrowLeft")  $("#modalPrevBtn").click();
  if(e.key==="ArrowRight") $("#modalNextBtn").click();
});

/* ========================= DRAWER ========================= */
function openDrawer(){ $("#drawer").classList.add("open"); $("#drawerOverlay").classList.add("open"); document.body.style.overflow="hidden"; }
function closeDrawer(){ $("#drawer").classList.remove("open"); $("#drawerOverlay").classList.remove("open"); document.body.style.overflow=""; }
$("#openDrawerBtn").addEventListener("click",openDrawer);
$("#drawerCloseBtn").addEventListener("click",closeDrawer);
$("#drawerOverlay").addEventListener("click",closeDrawer);
$("#drawerClearBtn").addEventListener("click",()=>{
  if(!state.selected.size) return;
  state.selected.clear(); persist(); updateSelectionBadge(); renderDrawer(); render(); toast("Selection cleared");
});

function renderDrawer(){
  const list=PRODUCTS.filter(p=>state.selected.has(p.id));
  $("#drawerCount").textContent=`${piecesText(list.length)} selected`;
  const box=$("#drawerList");
  if(!list.length){ box.innerHTML=`<div class="drawer-empty">Nothing selected yet.<br>Tap the heart on any piece to add it here.</div>`; return; }
  box.innerHTML=list.map(p=>`
    <div class="drawer-item">
      <div class="thumb">${p.images?.length?`<img src="${esc(p.images[0])}" alt="${esc(p.name)}">`:pendingSVG()}</div>
      <div class="drawer-item-info">
        <div class="name">${esc(p.name)}</div>
        <div class="meta">${esc(genderLabel(p.gender))}, ${esc(sentenceCase(p.category))}</div>
        <div class="codes">Style ${esc(p.styleCode)}<br>Fabric ${esc(p.fabricCode)}<br>Colour ${esc(p.colorCode)}</div>
        <button type="button" class="drawer-remove" data-remove="${esc(p.id)}">Remove</button>
      </div>
    </div>`).join("");
}
$("#drawerList").addEventListener("click",e=>{ const b=e.target.closest("[data-remove]"); if(b) toggleSelect(b.dataset.remove); });

/* ========================= BUYER FORM + SHARE ========================= */
$("#buyerName").value=state.buyer.name||"";
$("#buyerCompany").value=state.buyer.company||"";
$("#buyerEmail").value=state.buyer.email||"";
$("#buyerNotes").value=state.buyer.notes||"";
$("#buyerToggleBtn").addEventListener("click",()=>{
  const open=$("#buyerForm").classList.toggle("open");
  $("#buyerToggleBtn").setAttribute("aria-expanded",String(open));
});
["buyerName","buyerCompany","buyerEmail","buyerNotes"].forEach(id=>{
  $("#"+id).addEventListener("input",()=>{
    state.buyer={name:$("#buyerName").value,company:$("#buyerCompany").value,email:$("#buyerEmail").value,notes:$("#buyerNotes").value};
    localStorage.setItem("ea_buyer",JSON.stringify(state.buyer));
  });
});

$("#shareBtn").addEventListener("click",()=>{
  if(!state.selected.size){ toast("Select at least one piece first"); return; }
  const list=PRODUCTS.filter(p=>state.selected.has(p.id));
  let text="EMPORIO ARMANI — Buyer Selection (FW26)\n";
  if(state.buyer.name||state.buyer.company){ text+=`\nBuyer: ${state.buyer.name||"—"}${state.buyer.company?", "+state.buyer.company:""}`; if(state.buyer.email) text+=`\nEmail: ${state.buyer.email}`; }
  if(state.buyer.notes) text+=`\nNotes: ${state.buyer.notes}`;
  text+=`\n\n${piecesText(list.length)} selected:\n`;
  list.forEach((p,i)=>{ text+=`\n${i+1}. ${p.name} (${genderLabel(p.gender)}, ${sentenceCase(p.category)})\n   Style ${p.styleCode}, Fabric ${p.fabricCode}, Colour ${p.colorCode}`; });
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,"_blank","noopener");
});

/* ========================= SEARCH / SORT ========================= */
$("#searchInput").addEventListener("input",e=>{ state.search=e.target.value.trim(); state.visibleCount=PAGE_SIZE; render(); });
$("#sortSelect").addEventListener("change",e=>{ state.sort=e.target.value; state.visibleCount=PAGE_SIZE; render(); });
$("#selectedOnlyToggle").addEventListener("change",e=>{ state.selectedOnly=e.target.checked; state.visibleCount=PAGE_SIZE; render(); });

/* ========================= NAV BUTTONS ========================= */
$("#brandHomeBtn").addEventListener("click",()=>showScreen("gender"));
$("#backToGender").addEventListener("click",()=>showScreen("gender"));
$("#skipToAll").addEventListener("click",()=>enterCatalogue(null,null));
$("#skipToGender").addEventListener("click",()=>enterCatalogue(state.activeGender,null));
/* ====================== MOBILE BOTTOM SHEET ====================== */
function openSheet(){
  renderSheet();
  $("#sheetOverlay").classList.add("open");
  $("#bottomSheet").classList.add("open");
  document.body.style.overflow="hidden";
}
function closeSheet(){
  $("#sheetOverlay").classList.remove("open");
  $("#bottomSheet").classList.remove("open");
  document.body.style.overflow="";
}
$("#mobileFilterBtn").addEventListener("click", openSheet);
$("#sheetCloseBtn").addEventListener("click", closeSheet);
$("#sheetOverlay").addEventListener("click", closeSheet);

function renderSheet(){
  /* Sort */
  $$("#sheetSort .sheet-opt").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.sort===state.sort);
    btn.onclick=()=>{
      state.sort=btn.dataset.sort;
      $$("#sheetSort .sheet-opt").forEach(b=>b.classList.toggle("active",b===btn));
      $("#sortSelect").value=state.sort;
      state.visibleCount=PAGE_SIZE; render();
    };
  });

  /* Selected only */
  $("#sheetSelectedOnly").checked=state.selectedOnly;
  $("#sheetSelectedOnly").onchange=e=>{
    state.selectedOnly=e.target.checked;
    $("#selectedOnlyToggle").checked=state.selectedOnly;
    state.visibleCount=PAGE_SIZE; render();
  };

  /* Departments */
  const gBox=$("#sheetGender"); gBox.innerHTML="";
  GENDERS.forEach(g=>{
    const active=state.activeGender===g;
    const btn=document.createElement("button");
    btn.type="button"; btn.className="sheet-opt"+(active?" active":"");
    btn.textContent=GENDER_LABELS[g];
    btn.addEventListener("click",()=>{
      enterCatalogue(g,null); closeSheet();
    });
    gBox.appendChild(btn);
  });

  updateMobileFilterBadge();
}

function updateMobileFilterBadge(){
  const total=state.filters.gender.size+state.filters.category.size+state.filters.sub.size;
  const badge=$("#mobileFilterBadge");
  badge.textContent=total; badge.style.display=total>0?"inline-flex":"none";
}

/* ========================= INIT ========================= */
loadProducts();
