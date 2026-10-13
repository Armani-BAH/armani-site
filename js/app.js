/* =========================================================================
   Emporio Armani Bahrain — product selection
   data/products.json: id, gender, category, family, sub, name,
   styleCode, fabricCode, colorCode, productKey, season, images[]
   ========================================================================= */

translateStaticPage();   /* English or Arabic — see js/i18n.js */

/* ========================= BOUTIQUE SETTINGS =========================
   Put the boutique's WhatsApp number here: country code + number, digits only
   (e.g. "97317123456"). While it is empty, the "Chat with us" button and the
   "Send to the boutique" option stay hidden and sharing stays open.          */
const STORE = {
  name:     "Emporio Armani · Marassi Mall",
  whatsapp: "97317564991",
  phone:    "+973 1756 4991",
  address:  "Marassi Galleria Mall, Diyar Al Muharraq, Bahrain",
  maps:     "https://www.google.com/maps/search/?api=1&query=Emporio+Armani+Marassi+Galleria+Mall+Bahrain",
  /* opening hours, Bahrain time. "24:00" = midnight */
  hours: {
    Sunday:["10:00","22:00"], Monday:["10:00","22:00"], Tuesday:["10:00","22:00"], Wednesday:["10:00","22:00"],
    Thursday:["10:00","24:00"], Friday:["10:00","24:00"], Saturday:["10:00","22:00"]
  }
};
const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const showTime = t => t==="24:00" ? "00:00" : t;

/* "Open now · until 22:00" / "Closed · opens at 10:00", always in Bahrain time */
function storeStatus(){
  const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Bahrain",weekday:"long",hour:"2-digit",minute:"2-digit",hourCycle:"h23"})
    .formatToParts(new Date()).reduce((o,x)=>(o[x.type]=x.value,o),{});
  const day=parts.weekday, now=`${parts.hour}:${parts.minute}`;
  const [open,close]=STORE.hours[day];
  if(now>=open && now<close) return {open:true, day, text:t("Open now · until {time}",{time:showTime(close)})};
  if(now<open) return {open:false, day, text:t("Closed · opens today at {time}",{time:open})};
  const next=STORE.hours[DAYS[(DAYS.indexOf(day)+1)%7]][0];
  return {open:false, day, text:t("Closed · opens tomorrow at {time}",{time:next})};
}
function renderStoreInfo(){
  const st=storeStatus(); const wa=STORE.whatsapp?`https://wa.me/${STORE.whatsapp}`:"";
  const tel="tel:"+STORE.phone.replace(/\s/g,"");
  $("#storeInfo").innerHTML=`
    <div class="store-col">
      <h2>${esc(t(STORE.name))}</h2>
      <p>${esc(t(STORE.address))}</p>
      <p class="store-status ${st.open?"is-open":""}">${esc(st.text)}</p>
      <div class="store-links">
        <a href="${STORE.maps}" target="_blank" rel="noopener">${t("Get directions")}</a>
        <a href="${tel}" dir="ltr">${esc(STORE.phone)}</a>
        ${wa?`<a href="${wa}" target="_blank" rel="noopener">${t("WhatsApp")}</a>`:""}
      </div>
    </div>
    <dl class="store-hours">${DAYS.slice(1).concat(DAYS[0]).map(d=>`
      <div class="${d===st.day?"today":""}"><dt>${trDay(d)}</dt><dd dir="ltr">${STORE.hours[d][0]} – ${showTime(STORE.hours[d][1])}</dd></div>`).join("")}
    </dl>`;
  $("#landingStore").innerHTML=`
    <span class="store-status ${st.open?"is-open":""}">${esc(st.text)}</span>
    <a href="${STORE.maps}" target="_blank" rel="noopener">${t("Get directions")}</a>
    <a href="${tel}">${t("Call")}</a>
    ${wa?`<a href="${wa}" target="_blank" rel="noopener">${t("WhatsApp")}</a>`:""}`;
}

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
/* Which part of each landing photo to keep in view when it is cropped */
const GENDER_FOCUS = { "WOMAN": "22% 20%" };
/* Raw gender values that belong to "MAN" on screen */
const MAN_GENDERS = new Set(["MAN","UNISEX"]);

/* ========================= HELPERS ========================= */
const sentenceCase = s => { const t = String(s).trim().toLowerCase(); return t.charAt(0).toUpperCase()+t.slice(1); };
if(IS_AR) for(const k in GENDER_LABELS) GENDER_LABELS[k]=AR_GENDERS[k]||GENDER_LABELS[k];
const genderLabel  = g => GENDER_LABELS[g] || (MAN_GENDERS.has(g) ? GENDER_LABELS.MAN : sentenceCase(g));
const catLabel     = c => trCategory(c) || sentenceCase(c);
const subLabel     = s => trType(s)     || sentenceCase(s);
const famLabel     = f => trFamily(f)   || sentenceCase(f);
const genderRank   = g => { const i = GENDER_ORDER.indexOf(g); return i===-1 ? GENDER_ORDER.length : i; };
const fmt          = n => n.toLocaleString("en-US");
const piecesText   = n => IS_AR ? arCount(n,"قطعة واحدة","قطعتان","قطع","قطعة") : `${fmt(n)} ${n===1?"piece":"pieces"}`;
const coloursText  = n => IS_AR ? arCount(n,"لون واحد","لونان","ألوان","لوناً") : `${fmt(n)} colours`;
const esc          = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---- Links: every screen has its own web address (after the #) ----
   #/                         home (departments)
   #/men                      categories for Men
   #/men/shoes?type=sneaker   products (several values allowed, comma-separated)
   #/all/all                  every product
   ...?p=STYLE-FABRIC-COLOUR  same page with that product open
   #/selection/KEY,KEY,...    a selection someone shared                    */
const G_SLUG = {"WOMAN":"women","MAN":"men","GIRL":"girls","BOY":"boys","UNISEX JUNIOR":"unisex-junior"};
const slug = s => String(s).toLowerCase().trim().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
const gSlug = g => G_SLUG[g] || slug(g);
const pKey = p => `${p.styleCode}-${p.fabricCode}-${p.colorCode}`;
let KEY_INDEX = new Map();   /* pKey -> product */
let ID_INDEX  = new Map();   /* id   -> product */
const SITE_URL = () => location.origin + location.pathname;

/* Map a raw gender to its display key (UNISEX → MAN) */
const displayGender = g => MAN_GENDERS.has(g) ? "MAN" : g;

/* Armani CDN images come at 1536px. Ask the CDN for a smaller copy where a
   small picture is enough (grid, drawer, landing) so pages load much faster. */
const sized = (url, w) => String(url)
  .replace(/w_\d+/, `w_${w}`)
  .replace("q_auto:best", "q_auto");
const IMG_CARD = 640, IMG_THUMB = 160, IMG_LANDING = 720, IMG_ZOOM = 2048;

/* First image URL for a set of products */
const firstImage = list => (list.find(p=>p.images?.length)?.images[0]) || null;

/* ========================= LOAD ========================= */
async function loadProducts(){
  try{
    const r = await fetch("data/products.json");
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    PRODUCTS = await r.json();
    PRODUCTS.forEach(p=>{ p.nameEn=p.name; if(IS_AR) p.name=trType(p.sub)||p.name; });

    /* Build display gender list — deduplicated and ordered */
    const seen = new Set();
    GENDERS = [];
    PRODUCTS.forEach(p=>{ const d=displayGender(p.gender); if(!seen.has(d)){seen.add(d);GENDERS.push(d);} });
    GENDERS.sort((a,b)=>genderRank(a)-genderRank(b));

    CATEGORIES = [...new Set(PRODUCTS.map(p=>p.category))].sort();
    KEY_INDEX  = new Map(PRODUCTS.map(p=>[pKey(p),p]));
    ID_INDEX   = new Map(PRODUCTS.map(p=>[p.id,p]));

    /* drop ids that no longer exist in the catalogue */
    state.selected = new Set([...state.selected].filter(id=>ID_INDEX.has(id))); persist();
    try{ localStorage.removeItem("ea_page_state"); }catch(e){}

    ROUTING = true; buildGenderLanding(); ROUTING = false;
    updateSelectionBadge();
    renderDrawer();
    route();                       /* open whatever the address says */
    window.addEventListener("popstate", route);

  }catch(e){
    console.error("Could not load products.json",e);
    document.getElementById("landingGender").innerHTML =
      '<p style="padding:60px 24px;text-align:center;color:#666">'+t("The catalogue could not be loaded. Please refresh.")+'</p>';
  }
}

/* ========================= SCREEN ROUTING ========================= */
function showScreen(name){
  document.getElementById("landingGender").hidden   = name!=="gender";
  document.getElementById("landingCategory").hidden = name!=="category";
  document.getElementById("catalogueWrap").hidden   = name!=="catalogue";
  if(name!=="catalogue") syncUrl();
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
      ${img?`<img class="landing-card-img" src="${esc(img)}" alt=""${GENDER_FOCUS[g]?` style="object-position:${GENDER_FOCUS[g]}"`:""}>`:""}
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
      ${imgUrl?`<img class="landing-card-img" src="${esc(sized(imgUrl,IMG_LANDING))}" alt="" loading="lazy" decoding="async">`:""}
      <span class="landing-card-arrow"><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg></span>
      <span class="landing-card-body">
        <span class="landing-card-label">${esc(catLabel(cat))}</span>
      </span>`;
    btn.addEventListener("click",()=>enterCatalogue(dGender,cat));
    grid.appendChild(btn);
  });
  showScreen("category");
}

/* ========================= ENTER CATALOGUE ========================= */
function enterCatalogue(dGender, category){
  state.shared         = null;
  state.activeGender   = dGender;
  state.activeCategory = category;
  state.expandedCategory = category || null;

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
  renderSubNav(category || null);
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
    const cur=document.createElement("span"); cur.className="breadcrumb-current"; cur.textContent=catLabel(state.activeCategory); bc.appendChild(cur);
  }
  /* page title */
  const parts=[];
  if(state.activeGender) parts.push(GENDER_LABELS[state.activeGender]||state.activeGender);
  if(state.activeCategory) parts.push(catLabel(state.activeCategory));
  document.getElementById("pageTitle").textContent =
    state.shared ? t("Shared selection") : (parts.length ? parts.join(" · ") : t("FW26 selection"));
}

/* ========================= STATE ========================= */
const PAGE_SIZE = 60;
const state = {
  search:"",
  filters:{ gender:new Set(), category:new Set(), sub:new Set() },
  selectedOnly:false, sort:"default",
  selected: new Set(JSON.parse(localStorage.getItem("ea_selection")||"[]")),
  buyer:    JSON.parse(localStorage.getItem("ea_buyer")||"{}"),
  notes:    JSON.parse(localStorage.getItem("ea_notes")||"{}"),   /* id -> client's note on that piece */
  modalIndex:null, modalPushed:false, visibleCount:PAGE_SIZE, shared:null,
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
function renderSubNav(cat){

  const subNav=$("#subNav");

  if(!cat){
    subNav.style.display="none";
    subNav.innerHTML="";
    return;
  }

  const relevantProds = state.activeGender
    ? PRODUCTS.filter(p => displayGender(p.gender) === state.activeGender)
    : PRODUCTS;

  const subs = [...new Set(
    relevantProds
      .filter(p => p.category === cat)
      .map(p => p.sub)
      .filter(Boolean)
  )].sort();

  subNav.innerHTML="";

  subs.forEach(sub=>{

    const btn=document.createElement("button");

    btn.type="button";
    btn.className="sub-btn"+(
      state.filters.sub.has(sub) ? " active" : ""
    );

    btn.textContent=subLabel(sub);

    btn.addEventListener("click",()=>{

      state.filters.category.clear();
      state.filters.category.add(cat);

      state.filters.sub.clear();
      state.filters.sub.add(sub);

      state.activeCategory=cat;
      state.expandedCategory=cat;
      state.visibleCount=PAGE_SIZE;

      renderSubNav(cat);
      renderCategoryNav();
      renderFilterPanel();
      render();
      renderBreadcrumb();

    });

    subNav.appendChild(btn);

  });

  subNav.style.display = subs.length ? "flex" : "none";

}

function renderCategoryNav(){
  const navMobile = $("#categoryNavMobile");
  if(navMobile) navMobile.innerHTML="";
  const nav = $("#categoryNav"); nav.innerHTML="";
  
  const relevantProds = state.filters.gender.size
  ? PRODUCTS.filter(p => state.filters.gender.has(p.gender))
  : PRODUCTS;

const relevantCats = [...new Set(
  relevantProds.map(p => p.category)
)].sort();

  const allBtn = document.createElement("button");
  allBtn.type="button"; allBtn.className="cat-btn"+(state.filters.category.size===0?" active":"");
  allBtn.textContent=t("All categories");
  allBtn.addEventListener("click",()=>{
    state.filters.category.clear(); state.filters.sub.clear();
    state.expandedCategory=null; state.activeCategory=null; state.visibleCount=PAGE_SIZE;
    renderSubNav(null); renderCategoryNav(); renderFilterPanel(); render(); renderBreadcrumb();
  });
  nav.appendChild(allBtn);
  if(navMobile){
    const allBtnM=document.createElement("button");
    allBtnM.type="button"; allBtnM.className="cat-btn"+(state.filters.category.size===0?" active":"");
    allBtnM.textContent=t("All categories");
    allBtnM.addEventListener("click",()=>{
      state.filters.category.clear(); state.filters.sub.clear();
      state.expandedCategory=null; state.activeCategory=null; state.visibleCount=PAGE_SIZE;
      renderSubNav(null); renderCategoryNav(); renderFilterPanel(); render(); renderBreadcrumb();
    });
    navMobile.appendChild(allBtnM);
  }

  relevantCats.forEach(cat=>{
    const isCatActive = state.expandedCategory === cat;
    const btn=document.createElement("button");
    btn.type="button"; 
    btn.className="cat-btn"+(isCatActive?" active":"");
    btn.textContent=catLabel(cat);

     btn.addEventListener("click",()=>{
      
   if(state.expandedCategory===cat){
    state.expandedCategory=null;
    state.filters.category.clear();
    state.filters.sub.clear();
    state.activeCategory=null;

    renderSubNav(null);
  } else {
    state.expandedCategory=cat;

    /* Show this category immediately */
    state.filters.category.clear();
    state.filters.category.add(cat);
    state.filters.sub.clear();
    state.activeCategory=cat;

    /* Open the subcategories */
    renderSubNav(cat);
  }

  state.visibleCount=PAGE_SIZE;

  renderCategoryNav();
  renderFilterPanel();
  render();
  renderBreadcrumb();
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
        subBtn.textContent=subLabel(sub);
        subBtn.addEventListener("click",e=>{
          e.stopPropagation();
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

  /* Mirror to mobile nav */
  if(navMobile){
    relevantCats.forEach(cat=>{
      const isCatActive = state.expandedCategory === cat;
      const mBtn=document.createElement("button");
      mBtn.type="button"; mBtn.className="cat-btn"+(isCatActive?" active":"");
      mBtn.textContent=catLabel(cat);
      mBtn.addEventListener("click",()=>{
  if(state.expandedCategory===cat){
    state.expandedCategory=null;
    state.filters.category.clear();
    state.filters.sub.clear();
    state.activeCategory=null;

    renderSubNav(null);
  } else {
    state.expandedCategory=cat;

    /* Show this category immediately */
    state.filters.category.clear();
    state.filters.category.add(cat);
    state.filters.sub.clear();
    state.activeCategory=cat;

    /* Open the subcategories */
    renderSubNav(cat);
  }

  state.visibleCount=PAGE_SIZE;

  renderCategoryNav();
  renderFilterPanel();
  render();
  renderBreadcrumb();
});
      navMobile.appendChild(mBtn);
    });
  }
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
    b.textContent=catLabel(cat);
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
    b.textContent=subLabel(sub);
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
    if(state.shared && !state.shared.has(p.id))                                 return false;
    if(state.search){
      const q=state.search.toLowerCase();
      const hay=[p.name,p.nameEn,p.styleCode,p.fabricCode,p.colorCode,p.sub,p.category,genderLabel(p.gender)].join(" ").toLowerCase();
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
/* Colours of the same style (same department + style code) share one card.
   The card shows one colour at a time; the small swatches switch it. */
let currentFilteredList=[];
let currentGroups=[];               /* [[variant, variant…], …] in display order */
let groupByKey=new Map();           /* group key -> variants (filtered) */
const pick=new Map();               /* group key -> id of the colour on show */
const gKey = p => displayGender(p.gender)+"|"+p.styleCode;

function groupList(list){
  const m=new Map();
  list.forEach(p=>{ const k=gKey(p); if(!m.has(k)) m.set(k,[]); m.get(k).push(p); });
  return m;
}
/* which colour a card / the product window is showing */
function shownVariant(group){
  const id=pick.get(gKey(group[0]));
  return group.find(p=>p.id===id) || group.find(p=>p.images?.length) || group[0];
}

function render(){
  currentFilteredList=getFilteredProducts();
  groupByKey=groupList(currentFilteredList);
  currentGroups=[...groupByKey.values()];
  const colours=currentFilteredList.length, styles=currentGroups.length;
  $("#resultCount").textContent = piecesText(styles) + (colours>styles ? ` · ${coloursText(colours)}` : "");
  renderGrid();
  renderSharedBanner();
  syncUrl();
}

const MAX_SWATCHES = 5;
function swatchesHTML(group, shown, cls){
  if(group.length<2) return "";
  const extra=group.length-MAX_SWATCHES;
  const list = cls==="modal" ? group : group.slice(0, extra>0 ? MAX_SWATCHES-1 : MAX_SWATCHES);
  const more = cls==="modal" ? 0 : group.length-list.length;
  return `<div class="swatches swatches-${cls}" role="group" aria-label="${t("Colours")}">${list.map(v=>{
    const on=v.id===shown.id, mine=state.selected.has(v.id);
    const face=v.images?.length
      ?`<span class="sw-face"><img src="${esc(sized(v.images[0],IMG_THUMB))}" alt="" loading="lazy"></span>`
      :`<span class="sw-face sw-code">${esc(v.colorCode.slice(0,5))}</span>`;
    return `<button type="button" class="swatch${on?" on":""}${mine?" mine":""}" data-pick="${esc(v.id)}"
      aria-pressed="${on}" aria-label="${t("Colour {code}",{code:esc(v.colorCode)})}${mine?t(" (in your selection)"):""}" title="${t("Colour {code}",{code:esc(v.colorCode)})}">${face}</button>`;
  }).join("")}${more>0?`<button type="button" class="swatch-more" data-open="${esc(shown.id)}">+${more}</button>`:""}</div>`;
}

function cardHTML(group){
  const p=shownVariant(group);
  const selected=state.selected.has(p.id); const name=esc(p.name);
  const media=p.images?.length
    ?`<img src="${esc(sized(p.images[0],IMG_CARD))}" alt="${name}" loading="lazy" decoding="async">`
    :`<div class="img-pending">${pendingSVG()}<span>${t("No photo yet")}</span></div>`;
  return `
    <article class="card${selected?" is-selected":""}" data-id="${esc(p.id)}" data-group="${esc(gKey(p))}">
      <div class="card-media" data-open="${esc(p.id)}"${p.images?.length>1?` data-alt="${esc(sized(p.images[1],IMG_CARD))}"`:""}>
        ${media}
        <button type="button" class="heart-btn${selected?" selected":""}" data-select="${esc(p.id)}"
                aria-pressed="${selected}" aria-label="${t("Select {name}",{name})}">${heartSVG()}</button>
      </div>
      <div class="card-info">
        <button type="button" class="card-name" data-open="${esc(p.id)}">${name}</button>
        <div class="card-meta">
          <span>${esc(genderLabel(p.gender))}</span>
          <span>${esc(catLabel(p.category))}</span>
          ${group.length>1?`<span>${coloursText(group.length)}</span>`:""}
        </div>
        ${swatchesHTML(group,p,"card")}
        <dl class="card-codes">
          <div><dt>${t("Style")}</dt><dd>${esc(p.styleCode)}</dd></div>
          <div><dt>${t("Fabric")}</dt><dd>${esc(p.fabricCode)}</dd></div>
          <div><dt>${t("Colour")}</dt><dd>${esc(p.colorCode)}</dd></div>
        </dl>
      </div>
    </article>`;
}

function renderGrid(){
  const grid=$("#productGrid"); const list=currentGroups;
  if(!list.length){
    grid.innerHTML=`<div class="empty-state"><h3>${t("No pieces match")}</h3><p>${t("Try widening your filters or clearing the search.")}</p><button type="button" class="btn-secondary" data-clear style="display:inline-flex">${t("Clear all filters")}</button></div>`;
    $("#loadMoreWrap").style.display="none"; return;
  }
  grid.innerHTML=list.slice(0,state.visibleCount).map(cardHTML).join("");
  const remaining=list.length-state.visibleCount;
  const wrap=$("#loadMoreWrap");
  if(remaining>0){ wrap.style.display="flex"; $("#loadMoreBtn").textContent=t("Show more ({n} left)",{n:fmt(remaining)}); }
  else wrap.style.display="none";
}

/* redraw one card in place (after a colour switch or a selection change) */
function redrawCard(key){
  const card=$(`.card[data-group="${CSS.escape(key)}"]`); const group=groupByKey.get(key);
  if(card && group) card.outerHTML=cardHTML(group);
}
function choose(id){
  const p=ID_INDEX.get(id); if(!p) return;
  pick.set(gKey(p), id); redrawCard(gKey(p));
}

$("#productGrid").addEventListener("click",e=>{
  if(e.target.closest("[data-clear]")) return clearAllFilters();
  const sw=e.target.closest("[data-pick]"); if(sw) return choose(sw.dataset.pick);
  const sel=e.target.closest("[data-select]"); if(sel) return toggleSelect(sel.dataset.select);
  const open=e.target.closest("[data-open]"); if(open) openModal(open.dataset.open);
});
/* Computer: show the second photo (back / detail) when the mouse is over a card */
if(matchMedia("(hover:hover) and (pointer:fine)").matches){
  $("#productGrid").addEventListener("mouseover",e=>{
    const m=e.target.closest(".card-media[data-alt]"); if(!m || m.querySelector(".alt")) return;
    const img=new Image(); img.className="alt"; img.alt=""; img.decoding="async";
    img.onload=()=>m.classList.add("has-alt"); img.src=m.dataset.alt;
    m.insertBefore(img, m.querySelector(".heart-btn"));
  });
}
$("#loadMoreBtn").addEventListener("click",()=>{ state.visibleCount+=PAGE_SIZE; renderGrid(); });

/* ========================= SELECTION ========================= */
function updateSelectionBadge(){
  const count=state.selected.size; const badge=$("#selCountBadge");
  badge.textContent=count; badge.classList.toggle("zero",count===0);
}
function paintSelection(id){
  const p=ID_INDEX.get(id); if(p) redrawCard(gKey(p));
}
function toggleSelect(id){
  const was=state.selected.has(id); was?state.selected.delete(id):state.selected.add(id);
  persist(); updateSelectionBadge(); renderDrawer();
  if(state.selectedOnly) render(); else paintSelection(id);
  if(state.modalIndex!==null){ syncModalSelectButton(); paintModalColours(); }
  const p=PRODUCTS.find(x=>x.id===id);
  toast(was?t("Removed {name}",{name:p.name}):t("Added {name} to your selection",{name:p.name}));
}

/* ========================= MODAL ========================= */
let modalList=[]; let lastFocus=null;       /* list of colour groups */
const modalCur = () => state.modalIndex!==null && modalList[state.modalIndex] ? shownVariant(modalList[state.modalIndex]) : null;

function openModal(id, fromRoute){
  const target=ID_INDEX.get(id); if(!target) return;
  modalList=currentGroups;
  let idx=modalList.findIndex(g=>g.some(p=>p.id===id));
  if(idx<0){ modalList=[[target],...modalList]; idx=0; }
  pick.set(gKey(target), id);
  const wasOpen = state.modalIndex!==null;
  state.modalIndex=idx; if(!wasOpen) lastFocus=document.activeElement;
  paintModal(); $("#modalOverlay").classList.add("open"); document.body.style.overflow="hidden"; $("#modalCloseBtn").focus();
  if(!fromRoute){ syncUrl(); state.modalPushed=true; }   /* phone back button closes it */
}
function closeModal(fromRoute){
  if(state.modalIndex===null) return;
  if(!fromRoute && state.modalPushed){ state.modalPushed=false; history.back(); return; }
  closeZoom();
  $("#modalOverlay").classList.remove("open"); state.modalIndex=null; state.modalPushed=false;
  document.body.style.overflow=""; if(lastFocus&&lastFocus.focus) lastFocus.focus();
  if(!fromRoute) syncUrl(true);
}
function paintModal(){
  const p=modalCur(); if(!p) return;
  paintModalColours();
  const name=esc(p.name); const hasImages=p.images?.length>0;
  $("#modalMediaInner").innerHTML=hasImages
    ?`<div class="product-gallery${p.images.length>1?" multi":""}">
        <div class="gallery-track" id="galleryTrack">${p.images.map((img,i)=>`
          <button type="button" class="gallery-slide" data-zoom="${i}" aria-label="${t("Zoom photo {n}",{n:i+1})}">
            <img src="${esc(img)}" alt="${i?"":name}"${i?' loading="lazy"':""}>
          </button>`).join("")}
        </div>
        <span class="zoom-hint" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></span>
        ${p.images.length>1?`
        <div class="gallery-dots" aria-hidden="true">${p.images.map((_,i)=>`<span class="${i===0?"on":""}"></span>`).join("")}</div>
        <div class="gallery-thumbs">${p.images.map((img,i)=>`
          <button type="button" class="thumb-btn${i===0?" active":""}" data-gallery-index="${i}" aria-label="${t("Show photo {n}",{n:i+1})}">
            <img src="${esc(sized(img,IMG_THUMB))}" alt="">
          </button>`).join("")}</div>`:""}
      </div>`
    :`<div class="img-pending">${pendingSVG()}<span>${t("No photo yet")}</span></div>`;
  const track=$("#galleryTrack");
  if(track) track.addEventListener("scroll",()=>{
    const i=Math.round(track.scrollLeft/Math.max(1,track.clientWidth));
    $$(".thumb-btn").forEach((b,j)=>b.classList.toggle("active",j===i));
    $$(".gallery-dots span").forEach((d,j)=>d.classList.toggle("on",j===i));
  },{passive:true});
  $("#modalCat").textContent=catLabel(p.category);
  $("#modalName").textContent=p.name;
  $("#modalGender").textContent=genderLabel(p.gender);
  $("#modalStyle").textContent=p.styleCode;
  $("#modalFabric").textContent=p.fabricCode;
  $("#modalColor").textContent=p.colorCode;
  $("#modalFamily").textContent=famLabel(p.family);
  $("#modalDesc").hidden=hasImages;
  syncModalSelectButton();
}
function paintModalColours(){
  const p=modalCur(); if(!p) return; const group=modalList[state.modalIndex];
  $("#modalColours").innerHTML = group.length>1
    ? `<div class="modal-colours-label">${t("Colour")} <strong>${esc(p.colorCode)}</strong> · ${t("{n} available",{n:group.length})}</div>${swatchesHTML(group,p,"modal")}`
    : "";
}
function syncModalSelectButton(){
  const p=modalCur(); if(!p) return;
  const btn=$("#modalSelectBtn"); const selected=state.selected.has(p.id);
  btn.textContent=selected?t("Selected — remove"):t("Select this piece");
  btn.classList.toggle("selected",selected);
}

$("#modalColours").addEventListener("click",e=>{
  const sw=e.target.closest("[data-pick]"); if(!sw) return;
  choose(sw.dataset.pick); paintModal(); syncUrl(true);
});
$("#modalMediaInner").addEventListener("click",e=>{
  const z=e.target.closest("[data-zoom]"); if(z) return openZoom(+z.dataset.zoom);
  const thumb=e.target.closest("[data-gallery-index]"); if(!thumb) return;
  const track=$("#galleryTrack"); const i=+thumb.dataset.galleryIndex;
  track.scrollTo({left:i*track.clientWidth, behavior:"smooth"});
});
/* ---- Zoom: computer = follows the mouse; phone = pan with a finger, pinch works too ---- */
const FINE_POINTER = matchMedia("(hover:hover) and (pointer:fine)").matches;
let zoomIndex=0;
function openZoom(i){
  const p=modalCur(); if(!p?.images?.[i]) return;
  zoomIndex=i;
  const img=$("#zoomImg"); img.src=sized(p.images[i],IMG_ZOOM); img.alt=p.name;
  $("#zoomStage").classList.toggle("zoomed", !FINE_POINTER);
  $("#zoomOverlay").hidden=false; $("#zoomCloseBtn").focus();
  if(!FINE_POINTER) img.onload=()=>{ const st=$("#zoomStage"); st.scrollLeft=(st.scrollWidth-st.clientWidth)/2; st.scrollTop=(st.scrollHeight-st.clientHeight)/3; };
}
function closeZoom(){ $("#zoomOverlay").hidden=true; $("#zoomImg").removeAttribute("src"); }
$("#zoomCloseBtn").addEventListener("click",closeZoom);
$("#zoomStage").addEventListener("click",e=>{
  if(!FINE_POINTER) return;
  const st=$("#zoomStage"); st.classList.toggle("zoomed"); moveZoom(e);
});
function moveZoom(e){
  const st=$("#zoomStage"), img=$("#zoomImg");
  if(!st.classList.contains("zoomed") || !img.offsetWidth) return;
  const r=st.getBoundingClientRect();                     /* un-zoomed photo box, so the maths stays steady */
  const clamp=v=>Math.min(100,Math.max(0,v)).toFixed(1);
  img.style.transformOrigin=`${clamp((e.clientX-r.left-img.offsetLeft)/img.offsetWidth*100)}% ${clamp((e.clientY-r.top-img.offsetTop)/img.offsetHeight*100)}%`;
}
$("#zoomStage").addEventListener("mousemove",e=>{ if(FINE_POINTER) moveZoom(e); });

$("#modalCloseBtn").addEventListener("click",()=>closeModal());
$("#modalOverlay").addEventListener("click",e=>{ if(e.target.id==="modalOverlay") closeModal(); });
$("#modalPrevBtn").addEventListener("click",()=>{ state.modalIndex=(state.modalIndex-1+modalList.length)%modalList.length; paintModal(); syncUrl(true); });
$("#modalNextBtn").addEventListener("click",()=>{ state.modalIndex=(state.modalIndex+1)%modalList.length; paintModal(); syncUrl(true); });
$("#modalShareBtn").addEventListener("click",()=>{
  const p=modalCur(); if(!p) return;
  shareLink(productUrl(p), `Emporio Armani — ${p.name} (${p.styleCode})`);
});
$("#modalSelectBtn").addEventListener("click",()=>toggleSelect(modalCur().id));
$("#modalDrawerBtn").addEventListener("click",()=>{ closeModal(); openDrawer(); });

document.addEventListener("keydown",e=>{
  const mo=$("#modalOverlay").classList.contains("open");
  if(!$("#zoomOverlay").hidden){ if(e.key==="Escape") closeZoom(); return; }
  if(!$("#sendChoice").hidden){ if(e.key==="Escape") closeSendChoice(); return; }
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
  state.selected.clear(); persist(); updateSelectionBadge(); renderDrawer(); render(); toast(t("Selection cleared"));
});

function renderDrawer(){
  const list=PRODUCTS.filter(p=>state.selected.has(p.id));
  $("#drawerCount").textContent=t("{pieces} selected",{pieces:piecesText(list.length)});
  const box=$("#drawerList");
  if(!list.length){ box.innerHTML=`<div class="drawer-empty">${t("Nothing selected yet.")}<br>${t("Tap the heart on any piece to add it here.")}</div>`; return; }
  box.innerHTML=list.map(p=>`
    <div class="drawer-item">
      <div class="thumb">${p.images?.length?`<img src="${esc(sized(p.images[0],IMG_THUMB))}" alt="${esc(p.name)}" loading="lazy">`:pendingSVG()}</div>
      <div class="drawer-item-info">
        <div class="name">${esc(p.name)}</div>
        <div class="meta">${esc(genderLabel(p.gender))}${IS_AR?"، ":", "}${esc(catLabel(p.category))}</div>
        <div class="codes">${t("Style")} ${esc(p.styleCode)}<br>${t("Fabric")} ${esc(p.fabricCode)}<br>${t("Colour")} ${esc(p.colorCode)}</div>
        <div class="drawer-note${state.notes[p.id]?" open":""}">
          <textarea data-note="${esc(p.id)}" rows="2" maxlength="300"
            placeholder="${t("A note for your Client Advisor, e.g. is this available in my size?")}">${esc(state.notes[p.id]||"")}</textarea>
        </div>
        <div class="drawer-item-actions">
          ${state.notes[p.id]?"":`<button type="button" class="drawer-link" data-addnote="${esc(p.id)}">${t("Add a note")}</button>`}
          <button type="button" class="drawer-link" data-remove="${esc(p.id)}">${t("Remove")}</button>
        </div>
      </div>
    </div>`).join("");
}
$("#drawerList").addEventListener("click",e=>{
  const b=e.target.closest("[data-remove]"); if(b) return toggleSelect(b.dataset.remove);
  const a=e.target.closest("[data-addnote]");
  if(a){ const box=a.closest(".drawer-item").querySelector(".drawer-note"); box.classList.add("open"); box.querySelector("textarea").focus(); a.remove(); }
});
$("#drawerList").addEventListener("input",e=>{
  const t=e.target.closest("[data-note]"); if(!t) return;
  const v=t.value.trim(); if(v) state.notes[t.dataset.note]=v; else delete state.notes[t.dataset.note];
  try{ localStorage.setItem("ea_notes",JSON.stringify(state.notes)); }catch(_){}
});

/* ========================= CLIENT DETAILS + SHARE ========================= */
$("#buyerName").value=state.buyer.name||"";
$("#buyerPhone").value=state.buyer.phone||"";
$("#buyerNotes").value=state.buyer.notes||"";
$("#buyerToggleBtn").addEventListener("click",()=>{
  const open=$("#buyerForm").classList.toggle("open");
  $("#buyerToggleBtn").setAttribute("aria-expanded",String(open));
});
["buyerName","buyerPhone","buyerNotes"].forEach(id=>{
  $("#"+id).addEventListener("input",()=>{
    state.buyer={name:$("#buyerName").value.trim(),phone:$("#buyerPhone").value.trim(),notes:$("#buyerNotes").value.trim()};
    localStorage.setItem("ea_buyer",JSON.stringify(state.buyer));
  });
});

$("#shareBtn").addEventListener("click",()=>{
  if(!state.selected.size){ toast(t("Select at least one piece first")); return; }
  const list=PRODUCTS.filter(p=>state.selected.has(p.id));
  let text=t("Hello, I'd like to talk about these pieces from the Emporio Armani FW26 collection.")+"\n";
  if(state.buyer.name)  text+=`\n${t("Name")}: ${state.buyer.name}`;
  if(state.buyer.phone) text+=`\n${t("Mobile")}: ${state.buyer.phone}`;
  if(state.buyer.notes) text+=`\n${t("Message")}: ${state.buyer.notes}`;
  text+=`\n\n${t("My selection ({pieces})",{pieces:piecesText(list.length)})}:\n`;
  list.forEach((p,i)=>{
    const c = IS_AR ? "، " : ", ";
    text+=`\n${i+1}. ${p.name} (${genderLabel(p.gender)}${c}${catLabel(p.category)})\n   ${t("Style")} ${p.styleCode}${c}${t("Fabric")} ${p.fabricCode}${c}${t("Colour")} ${p.colorCode}`;
    if(state.notes[p.id]) text+=`\n   ${t("Note")}: ${state.notes[p.id]}`;
  });
  text+=`\n\n${t("View with photos:")}\n${selectionUrl()}`;
  pendingShareText=text;
  if(STORE.whatsapp) openSendChoice();
  else sendWhatsApp("");
});

/* ---- WhatsApp: to the boutique, or to anyone the client chooses ---- */
let pendingShareText="";
function sendWhatsApp(number, text=pendingShareText){
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`,"_blank","noopener");
}
function openSendChoice(){ $("#sendChoice").hidden=false; $("#sendToStoreBtn").focus(); }
function closeSendChoice(){ $("#sendChoice").hidden=true; }
$("#sendToStoreBtn").addEventListener("click",()=>{ closeSendChoice(); sendWhatsApp(STORE.whatsapp); });
$("#sendToAnyoneBtn").addEventListener("click",()=>{ closeSendChoice(); sendWhatsApp(""); });
$("#sendChoiceCancel").addEventListener("click",closeSendChoice);
$("#sendChoice").addEventListener("click",e=>{ if(e.target.id==="sendChoice") closeSendChoice(); });
$("#sendStoreName").textContent=t(STORE.name);

renderStoreInfo();
setInterval(renderStoreInfo, 5*60*1000);   /* keep "Open now" correct if the page stays open */

/* English ⇄ العربية */
$$(".lang-btn").forEach(b=>{
  b.textContent = IS_AR ? "English" : "العربية";
  b.lang = IS_AR ? "en" : "ar";
  b.addEventListener("click",()=>setLang(IS_AR?"en":"ar"));
});

/* floating "Chat with us" button */
if(STORE.whatsapp){
  const fab=$("#chatFab"); fab.hidden=false;
  fab.href=`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(t("Hello, I have a question about the Emporio Armani FW26 collection."))}`;
}

/* ---- Save as PDF: a printable page of the selection (the browser's Print → Save as PDF) ---- */
$("#pdfBtn").addEventListener("click",async()=>{
  if(!state.selected.size){ toast(t("Select at least one piece first")); return; }
  const list=PRODUCTS.filter(p=>state.selected.has(p.id));
  const date=new Date().toLocaleDateString(IS_AR?"ar-BH-u-nu-latn":"en-GB",{day:"numeric",month:"long",year:"numeric"});
  const who=[state.buyer.name, state.buyer.phone].filter(Boolean).map(esc).join(" · ");
  $("#printSheet").innerHTML=`
    <header class="ps-head">
      <img src="assets/logo/emporio-armani-logo.png" alt="Emporio Armani">
      <div class="ps-title">${t("My selection")}</div>
      <div class="ps-sub">${t("Marassi Mall, Bahrain")} · FW26 · ${date}${who?` · ${who}`:""}</div>
      ${state.buyer.notes?`<p class="ps-msg">${esc(state.buyer.notes)}</p>`:""}
    </header>
    <div class="ps-grid">${list.map(p=>`
      <article class="ps-item">
        <div class="ps-img">${p.images?.length?`<img src="${esc(sized(p.images[0],IMG_CARD))}" alt="">`:`<span>${t("No photo yet")}</span>`}</div>
        <div class="ps-name">${esc(p.name)}</div>
        <div class="ps-meta">${esc(genderLabel(p.gender))} · ${esc(catLabel(p.category))}</div>
        <div class="ps-codes">${t("Style")} ${esc(p.styleCode)} · ${t("Fabric")} ${esc(p.fabricCode)} · ${t("Colour")} ${esc(p.colorCode)}</div>
        ${state.notes[p.id]?`<div class="ps-note">“${esc(state.notes[p.id])}”</div>`:""}
      </article>`).join("")}
    </div>
    <footer class="ps-foot">${piecesText(list.length)} · ${t("Emporio Armani · Marassi Mall")} · ${t("View online")}: <span dir="ltr">${esc(selectionUrl())}</span></footer>`;
  toast(t("Preparing your PDF…"));
  /* wait for the photos (max 6 s) so they appear in the PDF */
  const imgs=[...$("#printSheet").querySelectorAll("img")];
  await Promise.race([
    Promise.all(imgs.map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r;}))),
    new Promise(r=>setTimeout(r,6000))
  ]);
  const old=document.title; document.title=`Emporio Armani - My selection - ${date}`;
  window.print();
  document.title=old;
});

$("#copyLinkBtn").addEventListener("click",()=>{
  if(!state.selected.size){ toast(t("Select at least one piece first")); return; }
  shareLink(selectionUrl(), t("Emporio Armani — my selection"));
});

/* ========================= SHARED SELECTION ========================= */
function openShared(keys){
  const ids = keys.map(k=>KEY_INDEX.get(k)).filter(Boolean).map(p=>p.id);
  enterCatalogue(null,null);
  state.shared = new Set(ids);
  renderCategoryNav(); renderFilterPanel(); render(); renderBreadcrumb();
}
function renderSharedBanner(){
  const b=$("#sharedBanner");
  b.hidden = !state.shared;
  if(!state.shared) return;
  const n=state.shared.size, mine=[...state.shared].filter(id=>state.selected.has(id)).length;
  $("#sharedBannerText").textContent = n
    ? t("{pieces} were shared with you.",{pieces:piecesText(n)})
    : t("This link has no pieces that are in the current catalogue.");
  $("#sharedAddAllBtn").hidden = !n || mine===n;
}
$("#sharedAddAllBtn").addEventListener("click",()=>{
  state.shared.forEach(id=>state.selected.add(id));
  persist(); updateSelectionBadge(); renderDrawer(); render();
  toast(t("Added {pieces} to your selection",{pieces:piecesText(state.shared.size)}));
});
$("#sharedBrowseBtn").addEventListener("click",()=>enterCatalogue(null,null));

/* ========================= LINKS (URL) ========================= */
let ROUTING = false;

function catalogueHash(gs, cs, ss){
  let h = "#/" + (gs.length ? gs.map(gSlug).join(",") : "all") + "/" + (cs.length ? cs.map(slug).join(",") : "all");
  if(ss.length) h += "?type=" + ss.map(slug).join(",");
  return h;
}
function stateHash(){
  if(!$("#landingGender").hidden)   return "#/";
  if(!$("#landingCategory").hidden) return "#/" + gSlug(state.activeGender);
  if(state.shared) return "#/selection/" + [...state.shared].map(id=>encodeURIComponent(pKey(ID_INDEX.get(id)))).join(",");
  const gs = [...new Set([...state.filters.gender].map(displayGender))].sort((a,b)=>genderRank(a)-genderRank(b));
  return catalogueHash(gs, [...state.filters.category].sort(), [...state.filters.sub].sort());
}
/* Put the current screen in the address bar (new history step, or replace) */
function syncUrl(replace){
  if(ROUTING) return;
  let h = stateHash();
  const open = state.modalIndex!==null && modalCur();
  if(open) h += (h.includes("?")?"&":"?") + "p=" + encodeURIComponent(pKey(open));
  const now = location.hash || "#/";
  if(h===now) return;
  history[replace ? "replaceState" : "pushState"](null, "", h);
}

const findGender = s => GENDERS.find(g=>gSlug(g)===s);
const findCat    = s => CATEGORIES.find(c=>slug(c)===s);
const findSub    = s => { for(const p of PRODUCTS) if(slug(p.sub)===s) return p.sub; return null; };
const rawGenders = d => d==="MAN" ? [...MAN_GENDERS] : [d];

/* Read the address bar and show that screen (page load, back/forward, pasted link) */
function route(){
  ROUTING = true;
  try{
    const raw = decodeURI(location.hash).replace(/^#\/?/, "");
    const qi = raw.indexOf("?");
    const path = qi<0 ? raw : raw.slice(0,qi);
    const q = {};
    (qi<0 ? "" : raw.slice(qi+1)).split("&").filter(Boolean).forEach(kv=>{
      const i=kv.indexOf("="); if(i>0) q[kv.slice(0,i)] = kv.slice(i+1);
    });
    const parts = path.split("/").filter(Boolean);

    if(parts[0]==="selection"){
      const keys = (parts.slice(1).join("/")).split(",").filter(Boolean).map(k=>{ try{return decodeURIComponent(k);}catch(e){return k;} });
      const wanted = keys.map(k=>KEY_INDEX.get(k)?.id).filter(Boolean);
      const same = state.shared && $("#landingGender").hidden && $("#landingCategory").hidden &&
                   wanted.length===state.shared.size && wanted.every(id=>state.shared.has(id));
      if(!same) openShared(keys);
    }
    else if(parts.length===1 && findGender(parts[0])){
      closeModal(true); showCategoryLanding(findGender(parts[0])); return;
    }
    else if(parts.length>=1){
      const gs = parts[0]==="all" ? [] : parts[0].split(",").map(findGender).filter(Boolean);
      const cs = (!parts[1]||parts[1]==="all") ? [] : parts[1].split(",").map(findCat).filter(Boolean);
      const ss = q.type ? q.type.split(",").map(findSub).filter(Boolean) : [];
      const target = catalogueHash(gs, cs, ss);
      const onCatalogue = !$("#catalogueWrap").hidden && !state.shared;
      if(!(onCatalogue && stateHash()===target)){
        enterCatalogue(gs.length===1 ? gs[0] : null, cs.length===1 ? cs[0] : null);
        state.filters.gender   = new Set(gs.flatMap(rawGenders));
        state.filters.category = new Set(cs);
        state.filters.sub      = new Set(ss);
        renderGenderNav(); renderSubNav(cs.length===1 ? cs[0] : null);
        renderCategoryNav(); renderFilterPanel(); render(); renderBreadcrumb();
      }
    }
    else { closeModal(true); showScreen("gender"); return; }

    /* product open in the modal? */
    const p = q.p ? KEY_INDEX.get(decodeURIComponent(q.p)) : null;
    if(p) openModal(p.id, true); else closeModal(true);
  } finally { ROUTING = false; }
}

function productUrl(p){
  return `${SITE_URL()}#/${gSlug(displayGender(p.gender))}/${slug(p.category)}?p=${encodeURIComponent(pKey(p))}`;
}
function selectionUrl(){
  const keys = PRODUCTS.filter(p=>state.selected.has(p.id)).map(p=>encodeURIComponent(pKey(p)));
  return `${SITE_URL()}#/selection/${keys.join(",")}`;
}
/* Phone: opens the share sheet. Computer: copies the link. */
async function shareLink(url, title){
  if(navigator.share && matchMedia("(pointer:coarse)").matches){
    try{ await navigator.share({title, url}); return; }catch(e){ if(e.name==="AbortError") return; }
  }
  try{ await navigator.clipboard.writeText(url); }
  catch(e){
    const t=document.createElement("textarea"); t.value=url; document.body.appendChild(t); t.select();
    try{ document.execCommand("copy"); }catch(_){}
    t.remove();
  }
  toast(t("Link copied — paste it anywhere"));
}

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

/* ========================= INSTALL AS AN APP ========================= */
if("serviceWorker" in navigator && location.protocol!=="file:"){
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
/* Android / computer Chrome: show our own "Install" button when the browser allows it.
   (iPhone: Share → Add to Home Screen — Safari has no install button for websites.) */
let installPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{ e.preventDefault(); installPrompt=e; $("#installBtn").hidden=false; });
$("#installBtn").addEventListener("click",async()=>{
  if(!installPrompt) return; installPrompt.prompt();
  await installPrompt.userChoice.catch(()=>{}); installPrompt=null; $("#installBtn").hidden=true;
});
window.addEventListener("appinstalled",()=>{ $("#installBtn").hidden=true; });

/* ========================= INIT ========================= */
loadProducts();
