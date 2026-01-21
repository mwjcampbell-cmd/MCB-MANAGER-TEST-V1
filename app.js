

// ===== AUTO UPDATE (Option 1) =====
// BUILD MCB_AUTOUPDATE_OPTION1 20260121220011
function showUpdateBanner(onReload){
  // Small non-intrusive banner at top of page
  let el = document.getElementById("updateBanner");
  if(!el){
    el = document.createElement("div");
    el.id = "updateBanner";
    el.style.position = "fixed";
    el.style.left = "12px";
    el.style.right = "12px";
    el.style.top = "12px";
    el.style.zIndex = "99999";
    el.style.padding = "12px 14px";
    el.style.borderRadius = "14px";
    el.style.border = "1px solid rgba(255,255,255,0.16)";
    el.style.background = "rgba(15,22,32,0.92)";
    el.style.backdropFilter = "blur(10px)";
    el.style.webkitBackdropFilter = "blur(10px)";
    el.style.boxShadow = "0 18px 40px rgba(0,0,0,0.45)";
    el.innerHTML = `
      <div style="display:flex;gap:10px;align-items:center;justify-content:space-between">
        <div>
          <div style="font-weight:700;letter-spacing:.2px">Update available</div>
          <div style="opacity:.75;font-size:13px">Reload to use the latest version.</div>
        </div>
        <button id="updateReloadBtn" style="min-height:42px;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,0.18);background:linear-gradient(135deg, rgba(82,132,255,0.95), rgba(157,92,255,0.92));color:rgba(255,255,255,0.95);font-weight:700">Reload</button>
      </div>`;
    document.body.appendChild(el);
  }
  const btn = document.getElementById("updateReloadBtn");
  if(btn) btn.onclick = ()=>{ try{ onReload && onReload(); }finally{ window.location.reload(); } };
}

(function registerServiceWorkerAutoUpdate(){
  if(!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").then((reg)=>{
    reg.addEventListener("updatefound", ()=>{
      const newWorker = reg.installing;
      if(!newWorker) return;
      newWorker.addEventListener("statechange", ()=>{
        // installed + existing controller means an update is ready
        if(newWorker.state === "installed" && navigator.serviceWorker.controller){
          showUpdateBanner();
        }
      });
    });
  }).catch(()=>{});

  // If the controller changes, reload once (new SW took control)
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", ()=>{
    if(refreshing) return;
    refreshing = true;
    window.location.reload();
  });
})();
// ===== /AUTO UPDATE =====

// BUILD HS_DELEGATE_FIX 20260121112818

// Minimal toast (used by clipboard + sync messages). Safe fallback on iOS/Safari.
function toast(msg, ms=2200){
  try{
    const el = document.createElement("div");
    el.textContent = String(msg ?? "");
    el.style.position = "fixed";
    el.style.left = "50%";
    el.style.bottom = "84px";
    el.style.transform = "translateX(-50%)";
    el.style.background = "rgba(0,0,0,0.85)";
    el.style.color = "#fff";
    el.style.padding = "10px 12px";
    el.style.borderRadius = "12px";
    el.style.fontSize = "14px";
    el.style.zIndex = "99999";
    el.style.maxWidth = "92vw";
    el.style.textAlign = "center";
    document.body.appendChild(el);
    setTimeout(()=>{ try{ el.remove(); }catch(e){} }, ms);
  }catch(e){
    // absolute fallback
    alert(String(msg ?? ""));
  }
}
// BUILD HS_DELEGATE_FIX 20260121112818
// BUILD HS_DELEGATE_FIX 20260121112818
// BUILD HS_DELEGATE_FIX 20260121112818
// BUILD HS_DELEGATE_FIX 20260121112818
// BUILD HS_DELEGATE_FIX 20260121112818
// BUILD HS_DELEGATE_FIX 20260121112818
// BUILD HS_DELEGATE_FIX 20260121112818
// BUILD HS_DELEGATE_FIX 20260121112818
// BUILD HS_DELEGATE_FIX 20260121112818
// BUILD HS_DELEGATE_FIX 20260121112818
// BUILD HS_DELEGATE_FIX 20260121112818
// PHASE 2 BUILD 20260119055027

/* ===== LOGIN GATE ===== */
const AUTH_USER = "mattyc";
const AUTH_PASS = "2323";

function isLoggedIn(){
  // If login UI is not present in this build, treat as logged in
  if(!document.getElementById("loginScreen") && !document.getElementById("loginBtn")) return true;
  return localStorage.getItem("mcb_logged_in")==="1";
}
function showApp(){
  const ls=document.getElementById("loginScreen"); if(ls) ls.style.display="none";
  const ap=document.getElementById("app"); if(ap) ap.style.display="block";
  render(); try{renderDeletedProjectsUI();}catch(e){}
}
document.addEventListener("DOMContentLoaded", ()=>{
  
  // Auto-bypass login if login UI is not present
  if(!document.getElementById("loginBtn")){ try{ showApp(); }catch(e){} }
if(isLoggedIn()){
    showApp();
  } else {
    const __loginBtn = document.getElementById("loginBtn");
if(__loginBtn){
  __loginBtn.onclick = ()=>{
      const u=document.getElementById("loginUser").value;
      const p=document.getElementById("loginPass").value;
      if(u===AUTH_USER && p===AUTH_PASS){
        localStorage.setItem("mcb_logged_in","1");
        showApp();
      } else {
        document.getElementById("loginError").style.display="block";
      }
    };
}

  }
});
/* ===== END LOGIN GATE ===== */
/* MCB Site Manager - offline-first single-file storage (localStorage)
   Modules: Projects, Tasks, Diary, Variations, Subbies, Deliveries, Inspections, Reports, Settings
   Root logo: ./logo.png (used in header + reports)
*/
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

const STORE_KEY = "mcb_site_manager_v1_full";
const SETTINGS_KEY = "mcb_settings_v1";

const defaults = () => ({
  projects: [],
  tasks: [],
  diary: [],
  variations: [],
  subbies: [],
  deliveries: [],
  inspections: []
});

const defaultSettings = () => ({
  theme: "dark",
  companyName: "Matty Campbell Building",
  labourRate: 90, // NZD/hr default - editable
  currency: "NZD"
});

function loadState(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw) return defaults();
    const parsed = JSON.parse(raw);
    return { ...defaults(), ...parsed };
  }catch(e){
    return defaults();
  }
}
function saveState(state){
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}
function loadSettings(){
  try{
    const raw = localStorage.getItem(SETTINGS_KEY);
    if(!raw) return defaultSettings();
    return { ...defaultSettings(), ...JSON.parse(raw) };
  }catch(e){
    return defaultSettings();
  }
}
function saveSettings(s){
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

let state = loadState();
// H&S defaults
state.hsProfiles = state.hsProfiles || [];
state.hsInductions = state.hsInductions || [];
state.hsHazards = state.hsHazards || [];
state.hsToolboxes = state.hsToolboxes || [];
state.hsIncidents = state.hsIncidents || [];
// UI selections (Fieldwire-style)
state.uiSelections = state.uiSelections || { tasks:{}, diary:{}, hs:{}};

let settings = loadSettings();

function applyTheme(){
  document.documentElement.setAttribute("data-theme", settings.theme || "dark");
}
applyTheme();

// Service worker
const __NO_SW__ = new URLSearchParams(location.search).has("nosw");
if("serviceWorker" in navigator){
  window.addEventListener("load", async ()=>{
    try{ await navigator.serviceWorker.register("./sw.js"); }catch(e){}
  });
}

function setHeader(title){
  $("#headerTitle").textContent = title || "MCB Site Manager";
}

function navTo(route, params={}){
  const q = new URLSearchParams(params).toString();
  location.hash = q ? `#/${route}?${q}` : `#/${route}`;
}

function parseRoute(){
  const h = location.hash || "#/projects";
  const [path, query] = h.replace(/^#\//,"").split("?");
  const params = Object.fromEntries(new URLSearchParams(query || ""));
  return { path: path || "projects", params };
}

function money(n){
  const v = Number(n || 0);
  return new Intl.NumberFormat("en-NZ", { style:"currency", currency:"NZD" }).format(v);
}
function dateFmt(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleDateString("en-NZ", {year:"numeric", month:"short", day:"2-digit"});
  }catch(e){ return iso || "";}
}
function escapeHtml(s){
  s = String(s ?? "");

  return (String(s ?? "")).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function setBtnBusy(btn, busy, label="Saving…"){
  if(!btn) return;
  if(busy){
    btn.dataset._oldText = btn.textContent;
    btn.disabled = true;
    btn.textContent = label;
  }else{
    btn.disabled = false;
    if(btn.dataset._oldText) btn.textContent = btn.dataset._oldText;
    delete btn.dataset._oldText;
  }
}
function showSavingHint(msg="Working…"){
  const el = document.createElement("div");
  el.className = "savingHint";
  el.textContent = msg;
  const modal = document.querySelector("#modal");
  if(modal) modal.appendChild(el);
  return el;
}
function statusBadgeClass(status){
  const s = String(status||"").toLowerCase();
  if(s.includes("done") || s.includes("complete")) return "ok";
  if(s.includes("overdue") || s.includes("urgent") || s.includes("high")) return "danger";
  if(s.includes("progress") || s.includes("active")) return "warn";
  return "muted";
}

function confirmDelete(label){
  return confirm(`Delete ${label}? This can't be undone.`);
}

function isoToday(){
  return new Date().toISOString().slice(0,10);
}
function inNextDays(dateStr, days){
  if(!dateStr) return false;
  const d0 = new Date(isoToday());
  const d1 = new Date(dateStr);
  const diff = (d1 - d0) / 86400000;
  return diff >= 0 && diff <= days;
}
function upcomingSummary(days=7, limit=12){
  const items = [];
  // Due tasks
  for(const t of (state.tasks||[])){
    if(t.dueDate && inNextDays(t.dueDate, days) && t.status !== "Done"){
      const p = projectById(t.projectId);
      items.push({ when: t.dueDate, kind:"Task", title:t.title, project:p?.name || "", badge:t.status||"To do", nav: {route:"project", params:{id:t.projectId, tab:"tasks"}} });
    }
  }
  // Deliveries
  for(const d of (state.deliveries||[])){
    if(d.date && inNextDays(d.date, days)){
      const p = projectById(d.projectId);
      items.push({ when: d.date, kind:"Delivery", title:(d.supplier||"Delivery"), project:p?.name || "", badge:d.status||"Expected", nav: {route:"project", params:{id:d.projectId, tab:"deliveries"}} });
    }
  }
  // Inspections
  for(const i of (state.inspections||[])){
    if(i.date && inNextDays(i.date, days)){
      const p = projectById(i.projectId);
      items.push({ when: i.date, kind:"Inspection", title:(i.type||"Inspection"), project:p?.name || "", badge:i.result||"Booked", nav: {route:"project", params:{id:i.projectId, tab:"inspections"}} });
    }
  }

  items.sort((a,b)=> (a.when||"").localeCompare(b.when||"") || a.kind.localeCompare(b.kind));
  return items.slice(0, limit);
}
function upcomingCardHTML(days=7){
  const items = upcomingSummary(days);
  if(!items.length){
    return `
      <div class="card">
        <h2>Upcoming (next ${days} days)</h2>
        <div class="sub">Nothing scheduled. You're having a good week.</div>
      </div>
    `;
  }
  const rows = items.map(it=>`
    <div class="item clickable" data-upnav="${encodeURIComponent(JSON.stringify(it.nav))}">
      <div class="row space">
        <div>
          <div class="title">${escapeHtml(dateFmt(it.when))} — ${escapeHtml(it.kind)}</div>
          <div class="meta">${escapeHtml(it.title)}${it.project ? ` • ${escapeHtml(it.project)}` : ""}</div>
        </div>
        <div class="meta"><span class="badge">${escapeHtml(it.badge||"")}</span></div>
      </div>
    </div>
  `).join("");
  return `
    <div class="card">
      <div class="row space">
        <h2>Upcoming (next ${days} days)</h2>
        <button class="btn small" id="upcomingRefresh" type="button">Refresh</button>
      </div>
      <div class="list" id="upcomingList">${rows}</div>
    </div>
  `;
}

// Modal
function showModal(html){
  $("#modal").innerHTML = html;
  $("#modalBack").classList.add("show");
}
function closeModal(){
  $("#modalBack").classList.remove("show");
  $("#modal").innerHTML = "";
}
$("#modalBack").addEventListener("click", (e)=>{
  if(e.target.id === "modalBack") closeModal();
});

// File -> dataURL for offline
function filesToDataUrls(fileList){
  const files = [...(fileList || [])];
  if(!files.length) return Promise.resolve([]);
  return Promise.all(files.map(f => new Promise((res)=>{
    const r = new FileReader();
    r.onload = () => res({ id: uid(), name:f.name, type:f.type, size:f.size, dataUrl:r.result, createdAt:new Date().toISOString() });
    r.onerror = () => res(null); // never throw - some iOS formats (e.g. HEIC) can fail
    try{
      r.readAsDataURL(f);
    }catch(e){
      res(null);
    }
  }))).then(arr => arr.filter(Boolean));
}

// Geo (optional): try geocode with Nominatim (works on https; may be blocked on some hosts)
async function geocodeAddress(address){
  const q = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1&countrycodes=nz`;
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if(!res.ok) throw new Error("geocode failed");
  const data = await res.json();
  if(!data || !data[0]) throw new Error("no result");
  return { lat: Number(data[0].lat), lng: Number(data[0].lon), display: data[0].display_name };
}

// Helpers
function projectById(id){ return state.projects.find(p=>p.id===id); }
function subbieById(id){ return state.subbies.find(s=>s.id===id); }

// =========================
// H&S MODULE (Phase 3 - test build)
// =========================
function hsGetActiveProjectId(){
  const sel = document.getElementById("hsProjectSelect");
  return sel ? sel.value : (state.hsActiveProjectId || state.activeProjectId || "");
}
function hsProjectOptionsHtml(selectedId){
  const projects = (state.projects||[]).filter(p=>!p.deletedAt);
  const opts = ['<option value="">Select a site…</option>']
    .concat(projects.map(p=>`<option value="${p.id}" ${String(p.id)===String(selectedId)?'selected':''}>${escapeHtml(p.name || p.address || ('Site '+p.id))}</option>`));
  return opts.join("");
}
function hsSubnav(active){
  const items = [
    ["dashboard","Dashboard"],
    ["hazards","Hazards"],
    ["profile","Safety Profile"],
    ["inductions","Inductions"],
    ["toolbox","Toolbox"],
    ["incidents","Incidents"],
  ];
  return `
    <div class="segmented" style="margin:10px 0;">
      ${items.map(([k,label])=>`<button class="segbtn ${active===k?'active':''}" data-hsview="${k}">${label}</button>`).join("")}
    </div>
  `;
}
function hsRiskLabel(score){
  if(score>=20) return "Extreme";
  if(score>=12) return "High";
  if(score>=6) return "Medium";
  return "Low";
}
function hsRiskBadge(label){
  const cls = label==="Extreme"?"badge danger":label==="High"?"badge danger":label==="Medium"?"badge warn":"badge ok";
  return `<span class="${cls}">${escapeHtml(label)}</span>`;
}
function hsIsOverdue(dateStr){
  if(!dateStr) return false;
  const d = new Date(String(dateStr).slice(0,10));
  if(isNaN(d)) return false;
  const today = new Date();
  today.setHours(0,0,0,0);
  return d < today;
}

function hsBindSubnav(){
  document.querySelectorAll("[data-hsview]").forEach(b=>{
    b.onclick = ()=>{
      state.hsActiveView = b.dataset.hsview;
      saveState(state);
      render();
    };
  });
}
function renderHS(){
  const activeView = state.hsActiveView || "dashboard";
  const pid = state.hsActiveProjectId || state.activeProjectId || "";
  return `
  <div class="card">
    <h2>H&S</h2>
    <div class="row" style="gap:10px;align-items:center">
      <div style="flex:1">
        <div class="label">Site</div>
        <select id="hsProjectSelect" class="input">${hsProjectOptionsHtml(pid)}</select>
      </div>
    </div>
    ${hsSubnav(activeView)}
    <div id="hsContent">${renderHSView(activeView, pid)}</div>
  </div>
  `;
}
function hsEnsureProjectSelected(pid){
  if(!pid){
    return `<div class="muted" style="padding:12px 0;">Select a site to manage Health & Safety.</div>`;
  }
  return "";
}
function renderHSView(view, pid){
  const need = hsEnsureProjectSelected(pid);
  if(need) return need;
  if(view==="dashboard") return renderHSDashboard(pid);
  if(view==="profile") return renderHSSafetyProfile(pid);
  if(view==="inductions") return renderHSInductions(pid);
  if(view==="toolbox") return renderHSToolbox(pid);
  if(view==="incidents") return renderHSIncidents(pid);
  const hid = state.uiSelections?.hs?.hazardId;
  if(hid){
    const hz = (state.hsHazards||[]).find(x=>!x.deletedAt && String(x.id)===String(hid) && String(x.projectId)===String(pid));
    if(hz) return renderHSHazardDetail(pid, hz);
  }
  return renderHSHazards(pid);
}
function hsGetProfile(pid){
  return (state.hsProfiles||[]).find(x=>String(x.projectId)===String(pid) && !x.deletedAt) || null;
}
function renderHSDashboard(pid){
  const proj = (state.projects||[]).find(p=>String(p.id)===String(pid)) || {};
  const hazards = (state.hsHazards||[]).filter(x=>!x.deletedAt && String(x.projectId)===String(pid));
  const openHaz = hazards.filter(h=>String(h.status||"Open")!=="Closed");
  const overdue = hazards.filter(h=>String(h.status||"Open")!=="Closed" && hsIsOverdue(h.reviewDate));
  const toolboxes = (state.hsToolboxes||[]).filter(x=>!x.deletedAt && String(x.projectId)===String(pid)).sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
  const lastToolbox = toolboxes[0]?.date || "";
  const incidents = (state.hsIncidents||[]).filter(x=>!x.deletedAt && String(x.projectId)===String(pid));
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const incidentsThisMonth = incidents.filter(i=>String(i.date||"").startsWith(monthKey));

  const recentHaz = hazards.slice().sort((a,b)=>String(b.dateIdentified||"").localeCompare(String(a.dateIdentified||""))).slice(0,5);

  return `
    <div class="hsDash">
      <div class="muted" style="margin-bottom:10px">${escapeHtml(proj.name||proj.address||"")}</div>

      <div class="hsGrid">
        <div class="hsStat">
          <div class="hsStatLabel">Open hazards</div>
          <div class="hsStatValue">${openHaz.length}</div>
        </div>
        <div class="hsStat">
          <div class="hsStatLabel">Overdue reviews</div>
          <div class="hsStatValue ${overdue.length? "dangerText": ""}">${overdue.length}</div>
        </div>
        <div class="hsStat">
          <div class="hsStatLabel">Last toolbox</div>
          <div class="hsStatValue">${formatDateNZ(lastToolbox)}</div>
        </div>
        <div class="hsStat">
          <div class="hsStatLabel">Incidents this month</div>
          <div class="hsStatValue">${incidentsThisMonth.length}</div>
        </div>
      </div>

      <div class="row" style="gap:10px;flex-wrap:wrap;margin:12px 0;">
        <button class="btn primary" id="hsQuickHazard">+ Hazard</button>
        <button class="btn" id="hsQuickToolbox">+ Toolbox</button>
        <button class="btn" id="hsQuickIncident">+ Near Miss</button>
        <button class="btn" id="hsQuickInduction">+ Induction</button>
      </div>

      <div class="cardSub">
        <div class="row" style="justify-content:space-between;align-items:center">
          <div class="title">Recent hazards</div>
          <button class="btn" id="hsGoHazards">View all</button>
        </div>
        <div class="list compact">
          ${recentHaz.map(h=>{
            const score = (Number(h.likelihood||0) * Number(h.consequence||0)) || Number(h.riskScore||0) || 0;
            const label = h.risk || hsRiskLabel(score);
            const overdueCls = (String(h.status||"Open")!=="Closed" && hsIsOverdue(h.reviewDate)) ? "dangerText" : "";
            return `
              <div class="listItem">
                <div style="flex:1">
                  <div class="title">${escapeHtml(h.hazard||"")}</div>
                  <div class="muted ${overdueCls}">${escapeHtml(h.status||"Open")} • Review ${formatDateNZ(h.reviewDate)}</div>
                </div>
                ${hsRiskBadge(label)}
              </div>
            `;
          }).join("") || `<div class="muted" style="padding:10px 0;">No hazards yet.</div>`}
        </div>
      </div>
    </div>
  `;
}

function renderHSSafetyProfile(pid){
  const p = (state.projects||[]).find(x=>String(x.id)===String(pid)) || {};
  const prof = hsGetProfile(pid) || {id:uid(), projectId: pid, pcbu:"Matty Campbell Building", supervisor:"", emergencyContact:"", assemblyPoint:"", nearestHospital:"", siteRules:"", ppe:"Hi-vis, Boots, Hard hat", inductionRequired:true, createdAt:nowIso(), updatedAt:nowIso()};
  return `
    <div class="row" style="justify-content:space-between;align-items:center">
      <div class="muted">${escapeHtml(p.name||p.address||"")}</div>
      <button class="btn primary" id="hsEditProfileBtn">${hsGetProfile(pid) ? "Edit" : "Create"}</button>
    </div>
    <div class="kv" style="margin-top:12px">
      ${kv("PCBU", prof.pcbu)}
      ${kv("Supervisor", prof.supervisor)}
      ${kv("Emergency contact", prof.emergencyContact)}
      ${kv("Assembly point", prof.assemblyPoint)}
      ${kv("Nearest hospital", prof.nearestHospital)}
      ${kv("PPE", prof.ppe)}
      ${kv("Induction required", prof.inductionRequired ? "Yes" : "No")}
      ${kv("Site rules", prof.siteRules || "—")}
    </div>
  `;
}
function renderHSInductions(pid){
  const list = (state.hsInductions||[]).filter(x=>!x.deletedAt && String(x.projectId)===String(pid))
    .sort((a,b)=>(String(b.date||"")).localeCompare(String(a.date||"")));
  return `
    <div class="row" style="justify-content:space-between;align-items:center">
      <div class="muted">${list.length} inducted</div>
      <button class="btn primary" id="hsAddInductionBtn">Add</button>
    </div>
    <div class="list">
      ${list.map(x=>`
        <div class="listItem">
          <div style="flex:1">
            <div class="title">${escapeHtml(x.name||"")}</div>
            <div class="muted">${escapeHtml(x.company||"")} • ${formatDateNZ(x.date)}</div>
          </div>
          <button class="btn" data-hsedit="induction" data-id="${x.id}">Edit</button>
          <button class="btn danger" data-hsdel="induction" data-id="${x.id}">Delete</button>
        </div>
      `).join("") || `<div class="muted" style="padding:12px 0;">No inductions yet.</div>`}
    </div>
  `;
}
function renderHSHazards(pid){
  const list = (state.hsHazards||[]).filter(x=>!x.deletedAt && String(x.projectId)===String(pid))
    .sort((a,b)=>(String(b.dateIdentified||"")).localeCompare(String(a.dateIdentified||"")));
  const openCount = list.filter(x=>String(x.status||"Open")!=="Closed").length;
  return `
    <div class="row" style="justify-content:space-between;align-items:center">
      <div class="fwMeta">${openCount} open</div>
      <button class="btn primary" id="hsAddHazardBtn">Add</button>
    </div>
    <div class="list">
      ${list.map(h=>{
        const score = (Number(h.likelihood||0) * Number(h.consequence||0)) || Number(h.riskScore||0) || 0;
        const label = h.risk || hsRiskLabel(score);
        const overdue = (String(h.status||"Open")!=="Closed" && hsIsOverdue(h.reviewDate));
        const overdueCls = overdue ? "dangerText" : "";
        const meta = `${escapeHtml(h.status||"Open")} • Review ${formatDateNZ(h.reviewDate)}${score?` • ${score}`:""}`;
        return `
          <div class="fwListItem" data-hsopen="hazard" data-id="${x.id}"><div class="fwMain">
              <div class="fwTitle">${escapeHtml(h.hazard||"")}</div>
              <div class="muted ${overdueCls}">${meta}</div>
            </div>
            ${hsRiskBadge(label)}
            <button class="btn" data-hsedit="hazard" data-id="${h.id}">Edit</button>
            <button class="btn danger" data-hsdel="hazard" data-id="${h.id}">Delete</button>
          </div>
        `;
      }).join("") || `<div class="muted" style="padding:12px 0;">No hazards yet.</div>`}
    </div>
  `;
}
function renderHSToolbox(pid){
  const list = (state.hsToolboxes||[]).filter(x=>!x.deletedAt && String(x.projectId)===String(pid))
    .sort((a,b)=>(String(b.date||"")).localeCompare(String(a.date||"")));
  return `
    <div class="row" style="justify-content:space-between;align-items:center">
      <div class="muted">${list.length} meetings</div>
      <button class="btn primary" id="hsAddToolboxBtn">Add</button>
    </div>
    <div class="list">
      ${list.map(x=>`
        <div class="listItem">
          <div style="flex:1">
            <div class="title">${formatDateNZ(x.date)} • ${escapeHtml(x.conductedBy||"")}</div>
            <div class="muted">${escapeHtml((x.topics||"").slice(0,80))}${(x.topics||"").length>80?"…":""}</div>
          </div>
          <button class="btn" data-hsedit="toolbox" data-id="${x.id}">Edit</button>
          <button class="btn danger" data-hsdel="toolbox" data-id="${x.id}">Delete</button>
        </div>
      `).join("") || `<div class="muted" style="padding:12px 0;">No toolbox meetings yet.</div>`}
    </div>
  `;
}
function renderHSIncidents(pid){
  const list = (state.hsIncidents||[]).filter(x=>!x.deletedAt && String(x.projectId)===String(pid))
    .sort((a,b)=>(String(b.date||"")).localeCompare(String(a.date||"")));
  return `
    <div class="row" style="justify-content:space-between;align-items:center">
      <div class="muted">${list.length} logged</div>
      <button class="btn primary" id="hsAddIncidentBtn">Add</button>
    </div>
    <div class="list">
      ${list.map(x=>`
        <div class="listItem">
          <div style="flex:1">
            <div class="title">${formatDateNZ(x.date)} • ${escapeHtml(x.type||"Incident")}</div>
            <div class="muted">${escapeHtml((x.description||"").slice(0,80))}${(x.description||"").length>80?"…":""}</div>
          </div>
          <button class="btn" data-hsedit="incident" data-id="${x.id}">Edit</button>
          <button class="btn danger" data-hsdel="incident" data-id="${x.id}">Delete</button>
        </div>
      `).join("") || `<div class="muted" style="padding:12px 0;">No incidents yet.</div>`}
    </div>
  `;
}

function renderHSHazardDetail(pid, x){
  const p = (state.projects||[]).find(z=>String(z.id)===String(pid)) || {};
  const riskLabel = x.riskLabel || x.risk || "—";
  const score = (x.riskScore!=null && x.riskScore!=="") ? String(x.riskScore) : "";
  const due = x.reviewDate ? formatDateNZ(x.reviewDate) : "—";
  const ident = x.dateIdentified ? formatDateNZ(x.dateIdentified) : "—";
  const badgeText = score ? `${riskLabel} (${score})` : riskLabel;
  return `
    <div class="fwDetail">
      <div class="fwDetailTop">
        <button class="btn" id="hsBackHaz" type="button">Back</button>
        <div class="fwDetailActions">
          <button class="btn" id="hsEditHaz" type="button">Edit</button>
          <button class="btn danger" id="hsDelHaz" type="button">Delete</button>
        </div>
      </div>
      <div class="card">
        <div class="fwH1">${escapeHtml(x.hazard||"Hazard")}</div>
        <div class="fwMeta">${escapeHtml(p.name||p.address||"")}</div>
        <div class="fwBadgeRow">
          <span class="fwBadge ${statusBadgeClass(String(riskLabel))}">${escapeHtml(badgeText)}</span>
          <span class="fwBadge muted">${escapeHtml(x.status||"Open")}</span>
          <span class="fwBadge muted">Review ${escapeHtml(due)}</span>
        </div>
        <div class="fwSection">
          <div class="fwSectionTitle">Assessment</div>
          <div class="fwKV">
            ${kv("Likelihood", x.likelihood || "—")}
            ${kv("Consequence", x.consequence || "—")}
            ${kv("Identified", ident)}
            ${kv("Responsible", x.responsible || "—")}
          </div>
        </div>
        <div class="fwSection">
          <div class="fwSectionTitle">Controls</div>
          <div class="fwKV">
            ${kv("Control measures", x.controls || "—")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function openHSProfileForm(pid){
  const existing = hsGetProfile(pid);
  const rec = existing ? {...existing} : {id:uid(), projectId:pid, pcbu:"Matty Campbell Building", supervisor:"", emergencyContact:"", assemblyPoint:"", nearestHospital:"", siteRules:"", ppe:"Hi-vis, Boots, Hard hat", inductionRequired:true, createdAt:nowIso(), updatedAt:nowIso()};
  showModal(`
    <h3>Site Safety Profile</h3>
    ${inputText("PCBU","hs_pcbu",rec.pcbu)}
    ${inputText("Supervisor","hs_supervisor",rec.supervisor)}
    ${inputText("Emergency contact","hs_emergency",rec.emergencyContact)}
    ${inputText("Assembly point","hs_assembly",rec.assemblyPoint)}
    ${inputText("Nearest hospital","hs_hospital",rec.nearestHospital)}
    ${inputText("PPE required","hs_ppe",rec.ppe)}
    ${inputCheckbox("Induction required","hs_induction_req",!!rec.inductionRequired)}
    ${inputTextarea("Site rules","hs_rules",rec.siteRules)}
    <div class="row" style="gap:10px;justify-content:flex-end;margin-top:12px">
      <button class="btn" type="button" id="hsCancel">Cancel</button>
      <button class="btn primary" type="button" id="hsSave">Save</button>
    </div>
  `);
  document.getElementById("hsCancel").onclick=closeModal;
  document.getElementById("hsSave").onclick=()=>{
    rec.pcbu = val("hs_pcbu");
    rec.supervisor = val("hs_supervisor");
    rec.emergencyContact = val("hs_emergency");
    rec.assemblyPoint = val("hs_assembly");
    rec.nearestHospital = val("hs_hospital");
    rec.ppe = val("hs_ppe");
    rec.inductionRequired = !!document.getElementById("hs_induction_req").checked;
    rec.siteRules = val("hs_rules");
    rec.updatedAt = nowIso();
    if(existing){
      state.hsProfiles = (state.hsProfiles||[]).map(x=>String(x.id)===String(rec.id)?rec:x);
    }else{
      state.hsProfiles = state.hsProfiles || [];
      state.hsProfiles.push(rec);
    }
    saveState(state);
    closeModal();
    render();
  };
}
function openHSInductionForm(pid, id=null){
  const existing = id ? (state.hsInductions||[]).find(x=>String(x.id)===String(id)) : null;
  const rec = existing ? {...existing} : {id:uid(), projectId:pid, name:"", company:"", role:"", date:todayIso(), inductedBy:"", acknowledged:true, notes:"", createdAt:nowIso(), updatedAt:nowIso()};
  showModal(`
    <h3>Induction</h3>
    ${inputText("Name","hs_in_name",rec.name)}
    ${inputText("Company","hs_in_company",rec.company)}
    ${inputText("Role","hs_in_role",rec.role)}
    ${inputDate("Date","hs_in_date",rec.date)}
    ${inputText("Inducted by","hs_in_by",rec.inductedBy)}
    ${inputCheckbox("Acknowledged site rules","hs_in_ack",!!rec.acknowledged)}
    ${inputTextarea("Notes","hs_in_notes",rec.notes)}
    <div class="row" style="gap:10px;justify-content:flex-end;margin-top:12px">
      <button class="btn" type="button" id="hsCancel">Cancel</button>
      <button class="btn primary" type="button" id="hsSave">Save</button>
    </div>
  `);
  document.getElementById("hsCancel").onclick=closeModal;
  document.getElementById("hsSave").onclick=()=>{
    rec.name=val("hs_in_name");
    rec.company=val("hs_in_company");
    rec.role=val("hs_in_role");
    rec.date=val("hs_in_date");
    rec.inductedBy=val("hs_in_by");
    rec.acknowledged=!!document.getElementById("hs_in_ack").checked;
    rec.notes=val("hs_in_notes");
    rec.updatedAt=nowIso();
    if(existing){
      state.hsInductions = (state.hsInductions||[]).map(x=>String(x.id)===String(rec.id)?rec:x);
    }else{
      state.hsInductions = state.hsInductions || [];
      state.hsInductions.push(rec);
    }
    saveState(state); closeModal(); render();
  };
}
function openHSHazardForm(pid, id=null){
  const existing = id ? (state.hsHazards||[]).find(x=>String(x.id)===String(id)) : null;
  const rec = existing ? {...existing} : {
    id:uid(), projectId:pid,
    hazard:"",
    likelihood: 3,
    consequence: 3,
    riskScore: 9,
    risk:"Medium",
    controls:"",
    responsible:"",
    reviewDate:todayIso(),
    status:"Open",
    dateIdentified:todayIso(),
    createdAt:nowIso(),
    updatedAt:nowIso()
  };

  // normalise older records
  rec.likelihood = Number(rec.likelihood||0) || 3;
  rec.consequence = Number(rec.consequence||0) || 3;
  rec.riskScore = Number(rec.riskScore||0) || (rec.likelihood * rec.consequence);
  rec.risk = rec.risk || hsRiskLabel(rec.riskScore);

  function renderRiskPreview(){
    const l = Number(document.getElementById("hs_hz_like").value||0);
    const c = Number(document.getElementById("hs_hz_cons").value||0);
    const score = l*c;
    const label = hsRiskLabel(score);
    const el = document.getElementById("hsRiskPreview");
    if(el) el.innerHTML = `${hsRiskBadge(label)} <span class="muted" style="margin-left:8px">Score: ${score}</span>`;
  }

  showModal(`
    <h3>Hazard</h3>

    ${inputText("Hazard","hs_hz_hazard",rec.hazard)}

    <div class="hsMatrixRow">
      <div class="field" style="flex:1">
        <div class="label">Likelihood</div>
        <select class="input" id="hs_hz_like">
          ${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===rec.likelihood?'selected':''}>${n}</option>`).join("")}
        </select>
        <div class="hint">1 Rare • 5 Almost certain</div>
      </div>
      <div class="field" style="flex:1">
        <div class="label">Consequence</div>
        <select class="input" id="hs_hz_cons">
          ${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===rec.consequence?'selected':''}>${n}</option>`).join("")}
        </select>
        <div class="hint">1 Minor • 5 Catastrophic</div>
      </div>
    </div>

    <div class="field">
      <div class="label">Risk rating</div>
      <div id="hsRiskPreview"></div>
    </div>

    ${inputSelect("Status","hs_hz_status",["Open","Controlled","Closed"],rec.status)}
    ${inputTextarea("Control measures","hs_hz_controls",rec.controls)}
    ${inputText("Responsible person","hs_hz_resp",rec.responsible)}
    ${inputDate("Review date","hs_hz_review",rec.reviewDate)}
    ${inputDate("Date identified","hs_hz_ident",rec.dateIdentified)}

    <div class="row" style="gap:10px;justify-content:flex-end;margin-top:12px">
      <button class="btn" id="hsCancel">Cancel</button>
      <button class="btn primary" id="hsSave">Save</button>
    </div>
  `);

  renderRiskPreview();
  const likeEl = document.getElementById("hs_hz_like");
  const consEl = document.getElementById("hs_hz_cons");
  if(likeEl) likeEl.onchange = renderRiskPreview;
  if(consEl) consEl.onchange = renderRiskPreview;

  document.getElementById("hsCancel").onclick=closeModal;
  document.getElementById("hsSave").onclick=()=>{
    rec.hazard=val("hs_hz_hazard");
    rec.likelihood = Number(val("hs_hz_like")||0);
    rec.consequence = Number(val("hs_hz_cons")||0);
    rec.riskScore = rec.likelihood * rec.consequence;
    rec.risk = hsRiskLabel(rec.riskScore);

    rec.status=val("hs_hz_status");
    rec.controls=val("hs_hz_controls");
    rec.responsible=val("hs_hz_resp");
    rec.reviewDate=val("hs_hz_review");
    rec.dateIdentified=val("hs_hz_ident");
    rec.updatedAt=nowIso();

    if(existing){
      state.hsHazards = (state.hsHazards||[]).map(x=>String(x.id)===String(rec.id)?rec:x);
    }else{
      state.hsHazards = state.hsHazards || [];
      state.hsHazards.push(rec);
    }
    saveState(state); closeModal(); render();
  };
}

function openHSToolboxForm(pid, id=null){
  const existing = id ? (state.hsToolboxes||[]).find(x=>String(x.id)===String(id)) : null;
  const rec = existing ? {...existing} : {id:uid(), projectId:pid, date:todayIso(), conductedBy:"", topics:"", attendees:"", actions:"", createdAt:nowIso(), updatedAt:nowIso()};
  showModal(`
    <h3>Toolbox Meeting</h3>
    ${inputDate("Date","hs_tb_date",rec.date)}
    ${inputText("Conducted by","hs_tb_by",rec.conductedBy)}
    ${inputTextarea("Topics covered","hs_tb_topics",rec.topics)}
    ${inputTextarea("Attendees (names)","hs_tb_att",rec.attendees)}
    ${inputTextarea("Actions","hs_tb_actions",rec.actions)}
    <div class="row" style="gap:10px;justify-content:flex-end;margin-top:12px">
      <button class="btn" type="button" id="hsCancel">Cancel</button>
      <button class="btn primary" type="button" id="hsSave">Save</button>
    </div>
  `);
  document.getElementById("hsCancel").onclick=closeModal;
  document.getElementById("hsSave").onclick=()=>{
    rec.date=val("hs_tb_date");
    rec.conductedBy=val("hs_tb_by");
    rec.topics=val("hs_tb_topics");
    rec.attendees=val("hs_tb_att");
    rec.actions=val("hs_tb_actions");
    rec.updatedAt=nowIso();
    if(existing){
      state.hsToolboxes = (state.hsToolboxes||[]).map(x=>String(x.id)===String(rec.id)?rec:x);
    }else{
      state.hsToolboxes = state.hsToolboxes || [];
      state.hsToolboxes.push(rec);
    }
    saveState(state); closeModal(); render();
  };
}
function openHSIncidentForm(pid, id=null){
  const existing = id ? (state.hsIncidents||[]).find(x=>String(x.id)===String(id)) : null;
  const rec = existing ? {...existing} : {id:uid(), projectId:pid, date:todayIso(), type:"Near miss", description:"", injury:false, medical:false, worksafe:false, immediateActions:"", followUp:"", createdAt:nowIso(), updatedAt:nowIso()};
  showModal(`
    <h3>Incident / Near Miss</h3>
    ${inputDate("Date","hs_ic_date",rec.date)}
    ${inputSelect("Type","hs_ic_type",["Incident","Near miss"],rec.type)}
    ${inputTextarea("Description","hs_ic_desc",rec.description)}
    ${inputCheckbox("Injury","hs_ic_injury",!!rec.injury)}
    ${inputCheckbox("Medical treatment required","hs_ic_med",!!rec.medical)}
    ${inputCheckbox("Reported to WorkSafe","hs_ic_ws",!!rec.worksafe)}
    ${inputTextarea("Immediate actions taken","hs_ic_im",rec.immediateActions)}
    ${inputTextarea("Follow-up","hs_ic_fu",rec.followUp)}
    <div class="row" style="gap:10px;justify-content:flex-end;margin-top:12px">
      <button class="btn" type="button" id="hsCancel">Cancel</button>
      <button class="btn primary" type="button" id="hsSave">Save</button>
    </div>
  `);
  document.getElementById("hsCancel").onclick=closeModal;
  document.getElementById("hsSave").onclick=()=>{
    rec.date=val("hs_ic_date");
    rec.type=val("hs_ic_type");
    rec.description=val("hs_ic_desc");
    rec.injury=!!document.getElementById("hs_ic_injury").checked;
    rec.medical=!!document.getElementById("hs_ic_med").checked;
    rec.worksafe=!!document.getElementById("hs_ic_ws").checked;
    rec.immediateActions=val("hs_ic_im");
    rec.followUp=val("hs_ic_fu");
    rec.updatedAt=nowIso();
    if(existing){
      state.hsIncidents = (state.hsIncidents||[]).map(x=>String(x.id)===String(rec.id)?rec:x);
    }else{
      state.hsIncidents = state.hsIncidents || [];
      state.hsIncidents.push(rec);
    }
    saveState(state); closeModal(); render();
  };
}
function hsBindActions(){
  const sel = document.getElementById("hsProjectSelect");
  if(sel){
    sel.onchange = ()=>{
      state.hsActiveProjectId = sel.value;
      saveState(state);
      render();
    };
  }
  const pid = hsGetActiveProjectId();
  const editProf = document.getElementById("hsEditProfileBtn");
  if(editProf) editProf.onclick = ()=> openHSProfileForm(pid);
  const addInd = document.getElementById("hsAddInductionBtn");
  if(addInd) addInd.onclick = ()=> openHSInductionForm(pid);
  const addHz = document.getElementById("hsAddHazardBtn");
  if(addHz) addHz.onclick = ()=> openHSHazardForm(pid);
  const addTb = document.getElementById("hsAddToolboxBtn");
  if(addTb) addTb.onclick = ()=> openHSToolboxForm(pid);
  const addIc = document.getElementById("hsAddIncidentBtn");
  if(addIc) addIc.onclick = ()=> openHSIncidentForm(pid);
  document.querySelectorAll("[data-hsedit]").forEach(b=>{
    const id = b.dataset.id;
    const type = b.dataset.hsedit;
    b.onclick = ()=>{
      if(type==="induction") return openHSInductionForm(pid, id);
      if(type==="hazard") return openHSHazardForm(pid, id);
      if(type==="toolbox") return openHSToolboxForm(pid, id);
      if(type==="incident") return openHSIncidentForm(pid, id);
    };
  });
  document.querySelectorAll("[data-hsdel]").forEach(b=>{
    const id=b.dataset.id;
    const type=b.dataset.hsdel;
    b.onclick = ()=>{
      if(!confirm("Delete this record?")) return;
      const ts = nowIso();
      const mark=(arr)=>arr.map(x=>String(x.id)===String(id)?({...x,deletedAt:ts,updatedAt:ts}):x);
      if(type==="induction") state.hsInductions = mark(state.hsInductions||[]);
      if(type==="hazard") state.hsHazards = mark(state.hsHazards||[]);
      if(type==="toolbox") state.hsToolboxes = mark(state.hsToolboxes||[]);
      if(type==="incident") state.hsIncidents = mark(state.hsIncidents||[]);
      saveState(state); render();
    };
  });

  document.querySelectorAll("[data-hsopen='hazard']").forEach(row=>{
    row.onclick = ()=>{
      state.uiSelections.hs = state.uiSelections.hs || {};
      state.uiSelections.hs.hazardId = row.dataset.id;
      saveState(state);
      render();
    };
  });
  const backHaz = document.getElementById("hsBackHaz");
  if(backHaz) backHaz.onclick = ()=>{
    state.uiSelections.hs = state.uiSelections.hs || {};
    delete state.uiSelections.hs.hazardId;
    saveState(state);
    render();
  };
  const editHaz = document.getElementById("hsEditHaz");
  if(editHaz) editHaz.onclick = ()=>{
    const hid = state.uiSelections?.hs?.hazardId;
    const hz = (state.hsHazards||[]).find(z=>String(z.id)===String(hid));
    if(hz) openHSHazardForm(pid, hz.id);
  };
  const delHaz = document.getElementById("hsDelHaz");
  if(delHaz) delHaz.onclick = ()=>{
    const hid = state.uiSelections?.hs?.hazardId;
    const hz = (state.hsHazards||[]).find(z=>String(z.id)===String(hid));
    if(hz && confirm("Delete this record?")){
      const ts = nowIso();
      state.hsHazards = (state.hsHazards||[]).map(z=>String(z.id)===String(hid)?({...z,deletedAt:ts,updatedAt:ts}):z);
      state.uiSelections.hs = state.uiSelections.hs || {};
      delete state.uiSelections.hs.hazardId;
      saveState(state);
      render();
    }
  };
  hsBindSubnav();
}

// Tiny helpers used by H&S (safe if already defined elsewhere)
function kv(k,v){ return `<div class="kvRow"><div class="kvK">${escapeHtml(k)}</div><div class="kvV">${escapeHtml(String(v??""))}</div></div>`; }
function inputText(label,id,value){ return `<div class="field"><div class="label">${escapeHtml(label)}</div><input class="input" id="${id}" value="${escapeHtml(String(value??""))}"/></div>`; }
function inputDate(label,id,value){ return `<div class="field"><div class="label">${escapeHtml(label)}</div><input class="input" type="date" id="${id}" value="${escapeHtml(String(value??""))}"/></div>`; }
function inputTextarea(label,id,value){ return `<div class="field"><div class="label">${escapeHtml(label)}</div><textarea class="input" id="${id}" rows="4">${escapeHtml(String(value??""))}</textarea></div>`; }
function inputCheckbox(label,id,checked){ return `<label class="field" style="display:flex;gap:10px;align-items:center"><input type="checkbox" id="${id}" ${checked?"checked":""}/> <span>${escapeHtml(label)}</span></label>`; }
function inputSelect(label,id,opts,value){ return `<div class="field"><div class="label">${escapeHtml(label)}</div><select class="input" id="${id}">${opts.map(o=>`<option value="${escapeHtml(o)}" ${String(o)===String(value)?'selected':''}>${escapeHtml(o)}</option>`).join("")}</select></div>`; }
function val(id){ const el=document.getElementById(id); return el ? el.value : ""; }
function todayIso(){ const d=new Date(); const m=('0'+(d.getMonth()+1)).slice(-2); const da=('0'+d.getDate()).slice(-2); return `${d.getFullYear()}-${m}-${da}`; }
function nowIso(){ return new Date().toISOString(); }
function formatDateNZ(iso){
  if(!iso) return "—";
  const s = String(iso).slice(0,10);
  const parts = s.split("-");
  if(parts.length!==3) return s;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function hsHandleDelegatedClick(e){
  const t = e.target && (e.target.closest ? e.target.closest("button") : e.target);
  if(!t) return;
  const id = t.id || "";
  if(!id) return;

  // Only act when H&S screen is visible
  const hsRoot = document.querySelector(".hsDash") || document.getElementById("hsContent");
  if(!hsRoot) return;

  const pid = hsGetActiveProjectId ? hsGetActiveProjectId() : (state.hsActiveProjectId || state.activeProjectId || "");
  if(id==="hsQuickHazard"){ e.preventDefault(); openHSHazardForm(pid); }
  else if(id==="hsQuickToolbox"){ e.preventDefault(); openHSToolboxForm(pid); }
  else if(id==="hsQuickIncident"){ e.preventDefault(); openHSIncidentForm(pid); }
  else if(id==="hsQuickInduction"){ e.preventDefault(); openHSInductionForm(pid); }
  else if(id==="hsGoHazards"){ e.preventDefault(); state.hsActiveView="hazards"; saveState(state); render(); }
}
function hsEnsureDelegated(){
  if(window.__hsDelegated) return;
  window.__hsDelegated = true;
  document.addEventListener("click", hsHandleDelegatedClick, true);
}

function renderHSPage(app, params){
  setHeader("H&S");
  app.innerHTML = renderHS();
  // bind after DOM is injected
  try{ hsBindActions(); }catch(e){ console.warn("hsBindActions failed", e); }
  try{ hsEnsureDelegated(); }catch(e){}
}

function render(){
  // LOGIN_RENDER_GUARD
  if(typeof isLoggedIn==="function" && !isLoggedIn()){
    const ls=document.getElementById("loginScreen");
    const appEl=document.getElementById("app");
    if(ls) ls.style.display="flex";
    if(appEl) appEl.style.display="none";
    return;
  }

  const { path, params } = parseRoute();
  const app = $("#app");
  // active nav styling
  $$(".nav .btn").forEach(b=>{
    b.classList.toggle("primary", b.dataset.nav === path);
  });

  if(path === "projects") return renderProjects(app, params);
  if(path === "project") return renderProjectDetail(app, params);
  if(path === "tasks") return renderTasks(app, params);
  if(path === "diary") return renderDiary(app, params);
  if(path === "reports") return renderReports(app, params);
  if(path === "hs") return renderHSPage(app, params);
  if(path === "settings") return renderSettings(app, params);
  renderDeletedProjectsUI();
  // fallback
  navTo("projects");
}

window.addEventListener("hashchange", render);
window.addEventListener("load", ()=>{
  if(!location.hash) navTo("projects");
  render(); try{renderDeletedProjectsUI();}catch(e){}
});

// Footer nav
$$(".nav .btn").forEach(b=>b.addEventListener("click", ()=>navTo(b.dataset.nav)));
// Ensure H&S button exists in footer nav (injected by JS to avoid HTML changes)
(function ensureHsNav(){
  const nav = document.querySelector(".footerbar .nav");
  if(!nav) return;
  if(nav.querySelector('[data-nav="hs"]')) return;
  const btn = document.createElement("button");
  btn.className = "btn";
  btn.dataset.nav = "hs";
  btn.type = "button";
  btn.textContent = "H&S";
  const settingsBtn = nav.querySelector('[data-nav="settings"]');
  if(settingsBtn) nav.insertBefore(btn, settingsBtn);
  else nav.appendChild(btn);
  btn.addEventListener("click", ()=>navTo("hs"));
})();

// Header buttons
$("#homeBtn").addEventListener("click", ()=>navTo("projects"));
$("#themeBtn").addEventListener("click", ()=>{
  settings.theme = settings.theme === "dark" ? "light" : "dark";
  saveSettings(settings);
  applyTheme();
});
$("#exportBtn").addEventListener("click", ()=>{
  const blob = new Blob([JSON.stringify({ state, settings, exportedAt: new Date().toISOString() }, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `mcb-site-manager-export-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1500);
});
$("#importBtn").addEventListener("click", ()=>$("#importFile").click());
$("#importFile").addEventListener("change", async (e)=>{
  const file = e.target.files?.[0];
  if(!file) return;
  try{
    const text = await file.text();
    const data = JSON.parse(text);

    // Accept multiple export formats:
    // 1) { state, settings, exportedAt }
    // 2) { projects, tasks, diary, ... }   (older/raw state)
    // 3) { mcb: {state...} } or nested variants (best-effort)
    let nextState = null;
    let nextSettings = null;

    if(data && typeof data === "object"){
      if(data.state) nextState = data.state;
      if(data.settings) nextSettings = data.settings;

      // Raw state fallback
      const looksLikeState = ("projects" in data) || ("tasks" in data) || ("diary" in data) || ("variations" in data) || ("subbies" in data);
      if(!nextState && looksLikeState) nextState = data;

      // Nested fallback (rare)
      if(!nextState && data.mcb && typeof data.mcb === "object"){
        if(data.mcb.state) nextState = data.mcb.state;
        if(data.mcb.settings) nextSettings = data.mcb.settings;
      }
    }

    if(!nextState && !nextSettings){
      alert("Import failed: unrecognised file format.");
      return;
    }

    if(nextState) state = { ...defaults(), ...nextState };
    if(nextSettings) settings = { ...defaultSettings(), ...nextSettings };

    await saveState(state);
    await saveSettings(settings);
    applyTheme();
    render(); try{renderDeletedProjectsUI();}catch(e){}
    alert("Imported successfully.");
  }catch(err){
    console.error(err);
    alert("Import failed. Check the file.");
  }finally{
    e.target.value = "";
  }
});

// ----------------- Projects -----------------
function renderProjects(app){
  setHeader("Projects");
  const list = aliveArr(state.projects)
    .slice()
    .sort((a,b)=> (b.updatedAt||"").localeCompare(a.updatedAt||""));
  app.innerHTML = `
    <div class="grid two">
      ${upcomingCardHTML(7)}
      <div class="card">
        <div class="row space">
          <h2>Projects</h2>
          <button class="btn primary" id="newProject" type="button">New Project</button>
        </div>
        <div class="sub">Tap a project to manage: diary, tasks, variations, subbies, deliveries, inspections, reports.</div>
        <hr/>
        <div class="list" id="projectList">
          ${list.length ? list.map(p=>projectCard(p)).join("") : `<div class="sub">No projects yet. Create your first one.</div>`}
        </div>
      </div>
      <div class="card">
        <h2>Quick tips</h2>
        <div class="sub">
          • “Drive” opens Waze with the project destination.<br/>
          • “Live Map” shows the site location based on the saved address (and coordinates if geocoded).<br/>
          • Everything is editable / deletable. Data is stored locally on this device.<br/>
        </div>
        <hr/>
        <button class="btn" id="demoBtn" type="button">Load demo data</button>
        <div class="smallmuted">Demo is optional — you can delete it later.</div>
      </div>
    </div>
  `;
  $("#newProject").onclick = ()=> openProjectForm();
  $("#demoBtn").onclick = ()=> loadDemo();
  $$("#projectList .item").forEach(el=>{
    el.addEventListener("click", (e)=>{
      if(e.target.closest("[data-action]")) return;
      const id = el.dataset.id;
      navTo("project", { id });
    });
  });
  $$("#projectList [data-action='drive']").forEach(btn=>btn.addEventListener("click",(e)=>{
    e.stopPropagation();
    const id = btn.dataset.id;
    openWazeForProject(projectById(id));
  }));
  $$("#projectList [data-action='edit']").forEach(btn=>btn.addEventListener("click",(e)=>{
    e.stopPropagation();
    openProjectForm(projectById(btn.dataset.id));
  }));
  $$("#projectList [data-action='delete']").forEach(btn=>btn.addEventListener("click",(e)=>{
    e.stopPropagation();
    const id = btn.dataset.id;
    const p = projectById(id);
    if(!p) return;
    if(confirmDelete(`project "${p.name}"`)){
      // also remove linked items
      state.projects = softDeleteById(state.projects, id);
// NOTE: soft delete handled elsewhere

      state.tasks = softDeleteWhere(state.tasks, x => x.projectId === id);
// NOTE: soft delete handled elsewhere

      state.diary = softDeleteWhere(state.diary, x => x.projectId === id);
// NOTE: soft delete handled elsewhere

      state.variations = softDeleteWhere(state.variations, x => x.projectId === id);
// NOTE: soft delete handled elsewhere

      state.deliveries = softDeleteWhere(state.deliveries, x => x.projectId === id);
// NOTE: soft delete handled elsewhere

      state.inspections = softDeleteWhere(state.inspections, x => x.projectId === id);
// NOTE: soft delete handled elsewhere

      // keep subbies global
      saveState(state);
      render(); try{renderDeletedProjectsUI();}catch(e){}
    }
  }));
  // Upcoming card navigation
  $$("#app [data-upnav]").forEach(el=>{
    el.addEventListener("click", ()=>{
      try{
        const nav = JSON.parse(decodeURIComponent(el.dataset.upnav));
        if(nav?.route) navTo(nav.route, nav.params || {});
      }catch(e){}
    });
  });
  $("#upcomingRefresh") && ($("#upcomingRefresh").onclick = ()=> render());

}

function projectCard(p){
  const addr = p.address ? escapeHtml(p.address) : "No address";
  const coords = (p.lat && p.lng) ? `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}` : "—";
  return `
    <div class="item" data-id="${p.id}">
      <div class="row space">
        <div>
          <div class="title">${escapeHtml(p.name || "Untitled project")}</div>
          <div class="meta">${addr}</div>
          <div class="meta">Coords: ${coords}</div>
        </div>
        <div class="row">
          <button class="btn small" data-action="drive" data-id="${p.id}" type="button">Drive</button>
          <button class="btn small" data-action="edit" data-id="${p.id}" type="button">Edit</button>
          <button class="btn small danger" data-action="delete" data-id="${p.id}" type="button">Delete</button>
        </div>
      </div>
    </div>
  `;
}

function openProjectForm(p=null){
  const isEdit = !!p;
  const data = p || { id: uid(), name:"", address:"", clientName:"", clientPhone:"", notes:"", lat:null, lng:null };
  showModal(`
    <div class="row space">
      <h2>${isEdit ? "Edit Project" : "New Project"}</h2>
      <button class="btn" id="closeM" type="button">Close</button>
    </div>
    <label>Project name</label>
    <input class="input" id="p_name" value="${escapeHtml(data.name)}" placeholder="e.g., 14 Kowhai Road Renovation" />
    <label>Address</label>
    <input class="input" id="p_address" value="${escapeHtml(data.address)}" placeholder="Street, suburb, city (NZ)" />
    <div class="row" style="margin-top:10px">
      <button class="btn" id="geoBtn" type="button">Geocode address</button>
      <span class="smallmuted" id="geoStatus">${(data.lat && data.lng) ? `Saved coords: ${data.lat.toFixed(5)}, ${data.lng.toFixed(5)}` : "Optional (improves map + Waze accuracy)"}</span>
    </div>
    <div class="grid two">
      <div>
        <label>Client name</label>
        <input class="input" id="p_clientName" value="${escapeHtml(data.clientName||"")}" placeholder="Optional" />
      </div>
      <div>
        <label>Client phone</label>
        <input class="input" id="p_clientPhone" value="${escapeHtml(data.clientPhone||"")}" placeholder="Optional" />
      </div>
    </div>
    <label>Notes</label>
    <textarea class="input" id="p_notes" placeholder="Access, hazards, gate code, etc.">${escapeHtml(data.notes||"")}</textarea>
    <hr/>
    <div class="row space actionsSticky">
      <button class="btn ${isEdit ? "primary" : "primary"}" id="saveP" type="button">${isEdit ? "Save changes" : "Create project"}</button>
      ${isEdit ? `<button class="btn danger" id="delP" type="button">Delete</button>` : `<button class="btn" id="cancelP" type="button">Cancel</button>`}
    </div>
  `);
  $("#closeM").onclick = closeModal;
  $("#cancelP") && ($("#cancelP").onclick = closeModal);

  $("#geoBtn").onclick = async ()=>{
    const addr = $("#p_address").value.trim();
    if(!addr) alert("Enter an address first.");
    $("#geoStatus").textContent = "Geocoding…";
    try{
      const g = await geocodeAddress(addr);
      data.lat = g.lat; data.lng = g.lng;
      $("#geoStatus").textContent = `Saved coords: ${g.lat.toFixed(5)}, ${g.lng.toFixed(5)}`;
    }catch(e){
      $("#geoStatus").textContent = "Geocode failed (try again later or just save address).";
    }
  };

  $("#saveP").onclick = ()=>{
    data.name = $("#p_name").value.trim();
    data.address = $("#p_address").value.trim();
    data.clientName = $("#p_clientName").value.trim();
    data.clientPhone = $("#p_clientPhone").value.trim();
    data.notes = $("#p_notes").value.trim();
    data.updatedAt = new Date().toISOString();
    if(!data.name) alert("Project name required.");
    if(isEdit){
      state.projects = alive(state.projects).filter(isAlive).map(x=>x.id===data.id ? data : x);
    }else{
      data.createdAt = new Date().toISOString();
      state.projects.unshift(data);
    }
    saveState(state);
    closeModal();
    render(); try{renderDeletedProjectsUI();}catch(e){}
  };

  $("#delP") && ($("#delP").onclick = ()=>{
    if(confirmDelete(`project "${data.name}"`)){
      state.projects = softDeleteById(state.projects, data.id);
// NOTE: soft delete handled elsewhere

      state.tasks = softDeleteWhere(state.tasks, x => x.projectId === data.id);
// NOTE: soft delete handled elsewhere

      state.diary = softDeleteWhere(state.diary, x => x.projectId === data.id);
// NOTE: soft delete handled elsewhere

      state.variations = softDeleteWhere(state.variations, x => x.projectId === data.id);
// NOTE: soft delete handled elsewhere

      state.deliveries = softDeleteWhere(state.deliveries, x => x.projectId === data.id);
// NOTE: soft delete handled elsewhere

      state.inspections = softDeleteWhere(state.inspections, x => x.projectId === data.id);
// NOTE: soft delete handled elsewhere

      saveState(state);
      closeModal();
      render(); try{renderDeletedProjectsUI();}catch(e){}
    }
  });
}

function openWazeForProject(p){
  if(!p) return;
  const hasCoords = p.lat && p.lng;
  const url = hasCoords
    ? `https://waze.com/ul?ll=${encodeURIComponent(p.lat + "," + p.lng)}&navigate=yes`
    : `https://waze.com/ul?q=${encodeURIComponent(p.address || p.name)}&navigate=yes`;
  window.open(url, "_blank");
}

// ----------------- Project Detail (tabs) -----------------
function renderProjectDetail(app, params){
  const p = projectById(params.id);
  if(!p){ navTo("projects"); return; }
  setHeader(p.name || "Project");

  const tab = params.tab || "overview";
  const tabs = [
    ["overview","Overview"],
    ["map","Live Map"],
    ["tasks","Tasks"],
    ["diary","Diary"],
    ["variations","Variations"],
    ["subbies","Subbies"],
    ["deliveries","Deliveries"],
    ["inspections","Inspections"],
    ["reports","Reports"]
  ];
  app.innerHTML = `
    <div class="card">
      <div class="row space">
        <div>
          <h2>${escapeHtml(p.name)}</h2>
          <div class="sub">${escapeHtml(p.address || "")}</div>
        </div>
        <div class="row noPrint">
          <button class="btn" id="driveBtn" type="button">Drive (Waze)</button>
          <button class="btn" id="editProjBtn" type="button">Edit</button>
        </div>
      </div>
      <div class="tabs noPrint">
        ${tabs.map(([k,label])=>`<button class="btn small tab ${k===tab?"primary":""}" data-tab="${k}" type="button">${label}</button>`).join("")}
      </div>
    </div>

    <div id="tabContent" style="margin-top:12px"></div>
  `;
  $("#driveBtn").onclick = ()=> openWazeForProject(p);
  $("#editProjBtn").onclick = ()=> openProjectForm(p);
  $$(".tab").forEach(b=>b.onclick = ()=> navTo("project", { id:p.id, tab:b.dataset.tab }));

  const wrap = $("#tabContent");
  if(tab==="overview") wrap.innerHTML = projectOverview(p);
  if(tab==="map") wrap.innerHTML = projectMap(p);
  if(tab==="tasks") wrap.innerHTML = projectTasks(p);
  if(tab==="diary") wrap.innerHTML = projectDiary(p);
  if(tab==="variations") wrap.innerHTML = projectVariations(p);
  if(tab==="subbies") wrap.innerHTML = projectSubbies(p);
  if(tab==="deliveries") wrap.innerHTML = projectDeliveries(p);
  if(tab==="inspections") wrap.innerHTML = projectInspections(p);
  if(tab==="reports") wrap.innerHTML = projectReports(p);

  bindProjectTabEvents(p, tab);
}

function projectOverview(p){
  const openTasks = alive(state.tasks).filter(t=>t.projectId===p.id && t.status!=="Done" && isAlive(t)).length;
  const diaryCount = alive(state.diary).filter(d=>d.projectId===p.id && isAlive(d)).length;
  const varOpen = alive(state.variations).filter(v=>v.projectId===p.id && v.status!=="Approved" && isAlive(v)).length;
  const inspNext = aliveArr(state.inspections)
    .filter(i=>i.projectId===p.id && isAlive(i))
    .sort((a,b)=>(a.date||"").localeCompare(b.date||""))
    .find(i=> new Date(i.date) >= new Date(new Date().toISOString().slice(0,10)));
  return `
    <div class="grid two">
      <div class="card">
        <h2>Status</h2>
        <div class="kv"><div class="k">Open tasks</div><div class="v">${openTasks}</div></div>
        <div class="kv"><div class="k">Diary entries</div><div class="v">${diaryCount}</div></div>
        <div class="kv"><div class="k">Open variations</div><div class="v">${varOpen}</div></div>
        <div class="kv"><div class="k">Next inspection</div><div class="v">${inspNext ? `${escapeHtml(inspNext.type)} — ${dateFmt(inspNext.date)}` : "—"}</div></div>
        <hr/>
        <button class="btn primary" id="quickTask" type="button">New task</button>
        <button class="btn" id="quickDiary" type="button">New diary entry</button>
        <button class="btn" id="quickVar" type="button">New variation</button>
      </div>

      <div class="card">
        <h2>Contacts</h2>
        <div class="kv"><div class="k">Client</div><div class="v">${escapeHtml(p.clientName||"—")}</div></div>
        <div class="kv"><div class="k">Phone</div><div class="v">${p.clientPhone ? `<a href="tel:${escapeHtml(p.clientPhone)}">${escapeHtml(p.clientPhone)}</a>` : "—"}</div></div>
        <hr/>
        <h2>Notes</h2>
        <div class="sub">${escapeHtml(p.notes||"—")}</div>
      </div>
    </div>
  `;
}

function projectMap(p){
  const addr = p.address || "";
  const hasCoords = p.lat && p.lng;
  const mapSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?marker=${encodeURIComponent(p.lat)}%2C${encodeURIComponent(p.lng)}&zoom=16`
    : `https://www.openstreetmap.org/export/embed.html?search=${encodeURIComponent(addr)}&zoom=16`;
  // Note: OSM embed doesn't always support search param everywhere; fallback is showing map homepage with query in link.
  const link = hasCoords
    ? `https://www.openstreetmap.org/?mlat=${encodeURIComponent(p.lat)}&mlon=${encodeURIComponent(p.lng)}#map=16/${encodeURIComponent(p.lat)}/${encodeURIComponent(p.lng)}`
    : `https://www.openstreetmap.org/search?query=${encodeURIComponent(addr)}`;
  return `
    <div class="card">
      <div class="row space">
        <h2>Live Map</h2>
        <div class="row noPrint">
          <button class="btn" id="copyAddr" type="button">Copy address</button>
          <a class="btn" href="${link}" target="_blank" rel="noopener">Open map</a>
        </div>
      </div>
      <div class="sub">${escapeHtml(addr || "No address saved.")}</div>
      <div style="margin-top:12px; border-radius:16px; overflow:hidden; border:1px solid var(--border)">
        <iframe title="map" src="${mapSrc}" style="width:100%; height:420px; border:0"></iframe>
      </div>
      <div class="smallmuted" style="margin-top:10px">
        Tip: Use “Geocode address” in Edit Project for best accuracy.
      </div>
    </div>
  `;
}

function bindProjectTabEvents(p, tab){
  if(tab==="overview"){
    $("#quickTask").onclick = ()=> openTaskForm({ projectId:p.id });
    $("#quickDiary").onclick = ()=> openDiaryForm({ projectId:p.id });
    $("#quickVar").onclick = ()=> openVariationForm({ projectId:p.id });
  }
  if(tab==="map"){
    $("#copyAddr") && ($("#copyAddr").onclick = async ()=>{
      try{ await navigator.clipboard.writeText(p.address || ""); alert("Copied."); }catch(e){ alert("Copy failed."); }
    });
  }
  if(tab==="tasks"){
    $("#addTaskProj").onclick = ()=> openTaskForm({ projectId:p.id });
    $$("#taskListProj [data-action='edit']").forEach(b=>b.onclick = ()=> openTaskForm(state.tasks.find(t=>String(t.id)===String(b.dataset.id))));
    $$("#taskListProj [data-action='delete']").forEach(b=>b.onclick = ()=>{
      const t = state.tasks.find(x=>String(x.id)===String(b.dataset.id));
      if(t && confirmDelete(`task "${t.title}"`)){
        state.tasks = softDeleteById(state.tasks, t.id);
// NOTE: soft delete handled elsewhere

        saveState(state); renderTasks(app, { projectId });
render(); try{renderDeletedProjectsUI();}catch(e){}
      }
    });
  }
  if(tab==="diary"){
    $("#addDiaryProj").onclick = ()=> openDiaryForm({ projectId:p.id });
    $$("#diaryListProj [data-action='edit']").forEach(b=>b.onclick = ()=> openDiaryForm(state.diary.find(d=>String(d.id)===String(b.dataset.id))));
    $$("#diaryListProj [data-action='delete']").forEach(b=>b.onclick = ()=>{
      const d = state.diary.find(x=>String(x.id)===String(b.dataset.id));
      if(d && confirmDelete(`diary entry ${dateFmt(d.date)}`)){
        state.diary = softDeleteById(state.diary, d.id);
// NOTE: soft delete handled elsewhere

        saveState(state); renderDiary(app, { projectId });
render(); try{renderDeletedProjectsUI();}catch(e){}
      }
    });
  }
  if(tab==="variations"){
    $("#addVarProj").onclick = ()=> openVariationForm({ projectId:p.id });
    $$("#varListProj [data-action='edit']").forEach(b=>b.onclick = ()=> openVariationForm(state.variations.find(v=>String(v.id)===String(b.dataset.id))));
    $$("#varListProj [data-action='delete']").forEach(b=>b.onclick = ()=>{
      const v = state.variations.find(x=>String(x.id)===String(b.dataset.id));
      if(v && confirmDelete(`variation "${v.title}"`)){
        state.variations = softDeleteById(state.variations, v.id);
// NOTE: soft delete handled elsewhere

        saveState(state); render(); try{renderDeletedProjectsUI();}catch(e){}
      }
    });
  }
  if(tab==="subbies"){
    // Create subbie from within this project: default projectId to this project.
    $("#addSubbie").onclick = ()=> openSubbieForm({ projectId: p.id });
    $("#addSubbieBottom") && ($("#addSubbieBottom").onclick = ()=> openSubbieForm({ projectId: p.id }));
    $$("#subbieListProj [data-action='edit']").forEach(b=>b.onclick = ()=> openSubbieForm(subbieById(b.dataset.id)));
    $$("#subbieListProj [data-action='delete']").forEach(b=>b.onclick = ()=>{
      const s = subbieById(b.dataset.id);
      if(s && confirmDelete(`subbie "${s.name}"`)){
        state.subbies = softDeleteById(state.subbies, s.id);
// NOTE: soft delete handled elsewhere

        // unassign from tasks
        const now = new Date().toISOString();
        state.tasks = (state.tasks||[]).map(t => (t && t.assignedSubbieId===s.id)
          ? { ...t, assignedSubbieId: null, updatedAt: now }
          : t
        );
        saveState(state); render(); try{renderDeletedProjectsUI();}catch(e){}
      }
    });
  }
  if(tab==="deliveries"){
    $("#addDelivery").onclick = ()=> openDeliveryForm({ projectId:p.id });
    $$("#deliveryListProj [data-action='edit']").forEach(b=>b.onclick = ()=> openDeliveryForm(state.deliveries.find(d=>String(d.id)===String(b.dataset.id))));
    $$("#deliveryListProj [data-action='delete']").forEach(b=>b.onclick = ()=>{
      const d = state.deliveries.find(x=>String(x.id)===String(b.dataset.id));
      if(d && confirmDelete(`delivery "${d.supplier || 'delivery'}"`)){
        state.deliveries = softDeleteById(state.deliveries, d.id);
// NOTE: soft delete handled elsewhere

        saveState(state); render(); try{renderDeletedProjectsUI();}catch(e){}
      }
    });
  }
  if(tab==="inspections"){
    $("#addInspection").onclick = ()=> openInspectionForm({ projectId:p.id });
    $$("#inspectionListProj [data-action='edit']").forEach(b=>b.onclick = ()=> openInspectionForm(state.inspections.find(i=>String(i.id)===String(b.dataset.id))));
    $$("#inspectionListProj [data-action='delete']").forEach(b=>b.onclick = ()=>{
      const i = state.inspections.find(x=>String(x.id)===String(b.dataset.id));
      if(i && confirmDelete(`inspection "${i.type}"`)){
        state.inspections = softDeleteById(state.inspections, i.id);
// NOTE: soft delete handled elsewhere

        saveState(state); render(); try{renderDeletedProjectsUI();}catch(e){}
      }
    });
  }
  if(tab==="reports"){
    $("#runProjectReport").onclick = ()=> runReportUI(p.id);
    $("#hnryExportProj").onclick = ()=> runHnryExportUI(p.id);
  }
}

// Project tab renderers
function projectTasks(p){
  const tasks = aliveArr(state.tasks)
    .filter(t=>t.projectId===p.id && isAlive(t))
    .sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""));
  return `
    <div class="card">
      <div class="row space">
        <h2>Tasks</h2>
        <button class="btn primary" id="addTaskProj" type="button">New task</button>
      </div>
      <div class="list" id="taskListProj">
        ${tasks.length ? tasks.map(taskRow).join("") : `<div class="sub">No tasks yet.</div>`}
      </div>
    </div>
  `;
}

function taskRow(t){
  const badgeClass = t.status==="Done" ? "ok" : (t.status==="In progress" ? "warn" : "");
  const subbie = t.assignedSubbieId ? subbieById(t.assignedSubbieId) : null;
  return `
    <div class="item">
      <div class="row space">
        <div>
          <div class="title">${escapeHtml(t.title)}</div>
          <div class="meta">
            <span class="badge ${badgeClass}">${escapeHtml(t.status||"To do")}</span>
            ${subbie ? `<span class="badge">👷 ${escapeHtml(subbie.name)}</span>` : ""}
            ${t.dueDate ? `<span class="badge">📅 ${dateFmt(t.dueDate)}</span>` : ""}
          </div>
        </div>
        <div class="row">
          <button class="btn small" data-action="edit" data-id="${t.id}" type="button">Edit</button>
          <button class="btn small danger" data-action="delete" data-id="${t.id}" type="button">Delete</button>
        </div>
      </div>
      ${t.photos?.length ? `<div class="thumbgrid">${t.photos.slice(0,6).map(ph=>`<div class="thumb"><img src="${ph.dataUrl}" alt="${escapeHtml(ph.name)}"/></div>`).join("")}</div>` : ""}
    </div>
  `;
}

function projectDiary(p){
  const entries = aliveArr(state.diary)
    .filter(d=>d.projectId===p.id && isAlive(d))
    .sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  return `
    <div class="card">
      <div class="row space">
        <h2>Diary</h2>
        <button class="btn primary" id="addDiaryProj" type="button">New entry</button>
      </div>
      <div class="list" id="diaryListProj">
        ${entries.length ? entries.map(diaryRow).join("") : `<div class="sub">No diary entries yet.</div>`}
      </div>
    </div>
  `;
}
function diaryRow(d){
  return `
    <div class="item">
      <div class="row space">
        <div>
          <div class="title">${dateFmt(d.date)}</div>
          <div class="meta">${escapeHtml((d.summary||"").slice(0,140))}</div>
          <div class="meta">
            ${d.hours ? `<span class="badge">⏱ ${escapeHtml(String(d.hours))}h</span>` : ""}
            ${d.billable ? `<span class="badge ok">Billable</span>` : `<span class="badge">Non‑billable</span>`}
            ${d.category ? `<span class="badge">${escapeHtml(d.category)}</span>` : ""}
          </div>
        </div>
        <div class="row">
          <button class="btn small" data-action="edit" data-id="${d.id}" type="button">Edit</button>
          <button class="btn small danger" data-action="delete" data-id="${d.id}" type="button">Delete</button>
        </div>
      </div>
      ${d.photos?.length ? `<div class="thumbgrid">${d.photos.slice(0,6).map(ph=>`<div class="thumb"><img src="${ph.dataUrl}" alt="${escapeHtml(ph.name)}"/></div>`).join("")}</div>` : ""}
    </div>
  `;
}

function projectVariations(p){
  const vars = aliveArr(state.variations)
    .filter(v=>v.projectId===p.id && isAlive(v))
    .sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""));
  return `
    <div class="card">
      <div class="row space">
        <h2>Variations</h2>
        <button class="btn primary" id="addVarProj" type="button">New variation</button>
      </div>
      <div class="list" id="varListProj">
        ${vars.length ? vars.map(variationRow).join("") : `<div class="sub">No variations yet.</div>`}
      </div>
    </div>
  `;
}
function variationRow(v){
  const badgeClass = v.status==="Approved" ? "ok" : (v.status==="Sent" ? "warn" : "");
  return `
    <div class="item">
      <div class="row space">
        <div>
          <div class="title">${escapeHtml(v.title)}</div>
          <div class="meta">
            <span class="badge ${badgeClass}">${escapeHtml(v.status||"Draft")}</span>
            ${v.amount ? `<span class="badge">💲 ${money(v.amount)}</span>` : ""}
            ${v.date ? `<span class="badge">📅 ${dateFmt(v.date)}</span>` : ""}
          </div>
          <div class="meta">${escapeHtml((v.description||"").slice(0,160))}</div>
        </div>
        <div class="row">
          <button class="btn small" data-action="edit" data-id="${v.id}" type="button">Edit</button>
          <button class="btn small danger" data-action="delete" data-id="${v.id}" type="button">Delete</button>
        </div>
      </div>
      ${v.photos?.length ? `<div class="thumbgrid">${v.photos.slice(0,6).map(ph=>`<div class="thumb"><img src="${ph.dataUrl}" alt="${escapeHtml(ph.name)}"/></div>`).join("")}</div>` : ""}
    </div>
  `;
}

function projectSubbies(p){
  // subbies are global; show with quick assign by using tasks, etc.
  const subbies = aliveArr(state.subbies).slice().sort((a,b)=>(a.name||"").localeCompare(b.name||""));
  const used = new Set(alive(state.tasks).filter(t=>t.projectId===p.id && isAlive(t)).map(t=>t.assignedSubbieId).filter(Boolean));
  return `
    <div class="card">
      <div class="row space">
        <h2>Subbies</h2>
        <button class="btn primary" id="addSubbie" type="button">Add subbie</button>
      </div>
      <div class="sub">Subbies are shared across projects. Assign them to tasks.</div>
      <hr/>
      <div class="list" id="subbieListProj">
        ${subbies.length ? subbies.map(s=>subbieRow(s, used.has(s.id))).join("") : `<div class="sub">No subcontractors saved yet.</div>`}
      </div>

      <div class="row" style="margin-top:12px">
        <button class="btn primary" id="addSubbieBottom" type="button" style="width:100%">Add subbie</button>
      </div>
    </div>
  `;
}
function subbieRow(s, used){
  return `
    <div class="item">
      <div class="row space">
        <div>
          <div class="title">${escapeHtml(s.name)}</div>
          <div class="meta">
            ${s.trade ? `<span class="badge">${escapeHtml(s.trade)}</span>` : ""}
            ${used ? `<span class="badge ok">Assigned on this job</span>` : ""}
          </div>
          <div class="meta">
            ${s.phone ? `<a href="tel:${escapeHtml(s.phone)}">${escapeHtml(s.phone)}</a>` : ""}
            ${s.email ? ` • <a href="mailto:${escapeHtml(s.email)}">${escapeHtml(s.email)}</a>` : ""}
          </div>
          ${s.notes ? `<div class="meta">${escapeHtml(s.notes)}</div>` : ""}
        </div>
        <div class="row">
          <button class="btn small" data-action="edit" data-id="${s.id}" type="button">Edit</button>
          <button class="btn small danger" data-action="delete" data-id="${s.id}" type="button">Delete</button>
        </div>
      </div>
    </div>
  `;
}

function projectDeliveries(p){
  const deliveries = aliveArr(state.deliveries)
    .filter(d=>d.projectId===p.id && isAlive(d))
    .sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  return `
    <div class="card">
      <div class="row space">
        <h2>Deliveries</h2>
        <button class="btn primary" id="addDelivery" type="button">New delivery</button>
      </div>
      <div class="list" id="deliveryListProj">
        ${deliveries.length ? deliveries.map(deliveryRow).join("") : `<div class="sub">No deliveries logged yet.</div>`}
      </div>
    </div>
  `;
}
function deliveryRow(d){
  const badgeClass = d.status==="Delivered" ? "ok" : (d.status==="Missing/Damaged" ? "bad" : "warn");
  return `
    <div class="item">
      <div class="row space">
        <div>
          <div class="title">${escapeHtml(d.supplier || "Delivery")}</div>
          <div class="meta">
            <span class="badge ${badgeClass}">${escapeHtml(d.status||"Expected")}</span>
            ${d.date ? `<span class="badge">📅 ${dateFmt(d.date)}</span>` : ""}
          </div>
          <div class="meta">${escapeHtml((d.items||"").slice(0,180))}</div>
          ${d.dropPoint ? `<div class="meta">Drop: ${escapeHtml(d.dropPoint)}</div>` : ""}
        </div>
        <div class="row">
          <button class="btn small" data-action="edit" data-id="${d.id}" type="button">Edit</button>
          <button class="btn small danger" data-action="delete" data-id="${d.id}" type="button">Delete</button>
        </div>
      </div>
      ${d.photos?.length ? `<div class="thumbgrid">${d.photos.slice(0,6).map(ph=>`<div class="thumb"><img src="${ph.dataUrl}" alt="${escapeHtml(ph.name)}"/></div>`).join("")}</div>` : ""}
    </div>
  `;
}

function projectInspections(p){
  const inspections = aliveArr(state.inspections)
    .filter(i=>i.projectId===p.id && isAlive(i))
    .sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  const ccc = buildCCCStatus(p.id, inspections);
  return `
    <div class="grid two">
      <div class="card">
        <div class="row space">
          <h2>Inspections</h2>
          <button class="btn primary" id="addInspection" type="button">New inspection</button>
        </div>
        <div class="list" id="inspectionListProj">
          ${inspections.length ? inspections.map(inspectionRow).join("") : `<div class="sub">No inspections scheduled yet.</div>`}
        </div>
      </div>
      <div class="card">
        <h2>CCC tracker</h2>
        <div class="sub">Mark each inspection result to track CCC readiness.</div>
        <hr/>
        ${ccc}
      </div>
    </div>
  `;
}
function inspectionRow(i){
  const cls = i.result==="Pass" ? "ok" : (i.result==="Fail" ? "bad" : "warn");
  return `
    <div class="item">
      <div class="row space">
        <div>
          <div class="title">${escapeHtml(i.type || "Inspection")}</div>
          <div class="meta">
            <span class="badge ${cls}">${escapeHtml(i.result || "Booked")}</span>
            ${i.date ? `<span class="badge">📅 ${dateFmt(i.date)}</span>` : ""}
            ${i.inspector ? `<span class="badge">👤 ${escapeHtml(i.inspector)}</span>` : ""}
          </div>
          ${i.notes ? `<div class="meta">${escapeHtml(i.notes)}</div>` : ""}
        </div>
        <div class="row">
          <button class="btn small" data-action="edit" data-id="${i.id}" type="button">Edit</button>
          <button class="btn small danger" data-action="delete" data-id="${i.id}" type="button">Delete</button>
        </div>
      </div>
      ${i.photos?.length ? `<div class="thumbgrid">${i.photos.slice(0,6).map(ph=>`<div class="thumb"><img src="${ph.dataUrl}" alt="${escapeHtml(ph.name)}"/></div>`).join("")}</div>` : ""}
    </div>
  `;
}
function buildCCCStatus(projectId, inspections){
  // lightweight stage list – editable later
  const stages = ["Pre-slab", "Pre-line", "Post-line", "Final"];
  const rows = stages.map(s=>{
    const done = inspections.filter(i=> (i.type||"").toLowerCase().includes(s.toLowerCase().replace("-","")) && i.result==="Pass").length>0;
    const badge = done ? `<span class="badge ok">✔ Passed</span>` : `<span class="badge warn">⏳ Pending</span>`;
    return `<div class="row space"><div><strong>${escapeHtml(s)}</strong></div><div>${badge}</div></div>`;
  }).join("<hr/>");
  return rows;
}

function projectReports(p){
  return `
    <div class="card">
      <div class="row space">
        <h2>Reports</h2>
        <div class="row">
          <button class="btn" id="hnryExportProj" type="button">Hnry Invoice Export</button>
          <button class="btn primary" id="runProjectReport" type="button">Run Job Report</button>
        </div>
      </div>
      <div class="sub">
        Job Report = printable client/internal summary (diary + tasks + variations + deliveries + inspections).<br/>
        Hnry Export = copy/paste line items from diary entries.
      </div>
    </div>
  `;
}

// ----------------- Tasks (global) -----------------
function renderTasks(app, params){
  setHeader("Tasks");
  const projectId = params.projectId || "";
  const selectedId = params.id || (state.uiSelections?.tasks?.selectedId || "");
  const projects = aliveArr(state.projects).slice().sort((a,b)=>(a.name||"").localeCompare(b.name||""));
  const tasks = aliveArr(state.tasks)
    .filter(t=> !projectId || t.projectId===projectId)
    .slice()
    .sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""));
  
  if(selectedId){
    const tsel = aliveArr(state.tasks).find(t=>String(t.id)===String(selectedId));
    if(tsel){
      state.uiSelections.tasks = state.uiSelections.tasks || {};
      state.uiSelections.tasks.selectedId = String(selectedId);
      saveState(state);
      app.innerHTML = renderTaskDetail(tsel);
      bindTaskDetail(tsel, projectId);
      return;
    } else {
      // stale selection
      state.uiSelections.tasks = state.uiSelections.tasks || {};
      delete state.uiSelections.tasks.selectedId;
      saveState(state);
    }
  }
app.innerHTML = `
    <div class="card">
      <div class="row space">
        <h2>Tasks</h2>
        <button class="btn primary" id="newTask" type="button">New Task</button>
      </div>
      <div class="grid two">
        <div>
          <label>Filter by project</label>
          <select id="taskProjectFilter" class="input">
            <option value="">All projects</option>
            ${projects.map(p=>`<option value="${p.id}" ${p.id===projectId?"selected":""}>${escapeHtml(p.name)}</option>`).join("")}
          </select>
        </div>
        <div></div>
      </div>
      <hr/>
      <div class="list" id="taskList">${tasks.length ? tasks.map(taskRowWithProject).join("") : `<div class="sub">No tasks yet.</div>`}</div>
    </div>
  `;
  $("#newTask").onclick = ()=> openTaskForm(projectId ? { projectId } : {});
  $("#taskProjectFilter").onchange = (e)=>{
    const v = e.target.value;
    navTo("tasks", v ? {projectId:v} : {});
  };

  $$("#taskList [data-action='open']").forEach(row=>row.onclick = ()=>{
    const id = row.dataset.id;
    navTo("tasks", Object.assign({}, projectId ? {projectId} : {}, { id }));
  });
}
function taskRowWithProject(t){
  const p = projectById(t.projectId);
  const status = t.status || "Open";
  const due = t.dueDate ? dateFmt(t.dueDate) : "";
  const assigned = t.assignedToName || (t.subbieId ? (subbieById(t.subbieId)?.name||"") : "");
  const metaBits = [
    p ? escapeHtml(p.name||p.address||"") : "No project",
    due ? ("Due " + escapeHtml(due)) : "",
    assigned ? ("Assigned " + escapeHtml(assigned)) : ""
  ].filter(Boolean).join(" • ");
  const badge = `<span class="fwBadge ${statusBadgeClass(status)}">${escapeHtml(status)}</span>`;
  return `
    <div class="fwListItem" data-action="open" data-id="${t.id}">
      <div class="fwMain">
        <div class="fwTitleRow">
          <div class="fwTitle">${escapeHtml(t.title || "(Untitled task)")}</div>
          ${badge}
        </div>
        <div class="fwMeta">${escapeHtml(metaBits || " ")}</div>
      </div>
      <div class="fwChevron">›</div>
    </div>
  `;
}

function renderTaskDetail(t){
  const p = projectById(t.projectId);
  const status = t.status || "Open";
  const due = t.dueDate ? dateFmt(t.dueDate) : "";
  const created = t.createdAt ? dateFmt(String(t.createdAt).slice(0,10)) : "";
  const updated = t.updatedAt ? dateFmt(String(t.updatedAt).slice(0,10)) : "";
  const photosTaken = !!(t.photosTaken || (t.photosJson && String(t.photosJson).trim()) || (t.photos && t.photos.length));
  return `
    <div class="fwDetail">
      <div class="fwDetailTop">
        <button class="btn" id="taskBack" type="button">Back</button>
        <div class="fwDetailActions">
          <button class="btn" id="taskEdit" type="button">Edit</button>
          <button class="btn danger" id="taskDelete" type="button">Delete</button>
        </div>
      </div>

      <div class="card">
        <div class="fwH1">${escapeHtml(t.title || "(Untitled task)")}</div>
        <div class="fwMeta">${p ? escapeHtml(p.name||p.address||"") : "No project"}</div>

        <div class="fwBadgeRow">
          <span class="fwBadge ${statusBadgeClass(status)}">${escapeHtml(status)}</span>
          ${due ? `<span class="fwBadge muted">Due ${escapeHtml(due)}</span>` : ``}
          ${photosTaken ? `<span class="fwBadge ok">Photos taken</span>` : `<span class="fwBadge muted">No photos</span>`}
        </div>

        <div class="fwSection">
          <div class="fwSectionTitle">Details</div>
          <div class="fwKV">
            ${kv("Description", t.description || "—")}
            ${kv("Assigned", t.assignedToName || (t.subbieId ? (subbieById(t.subbieId)?.name||"") : "") || "—")}
            ${kv("Priority", t.priority || "—")}
            ${kv("Created", created || "—")}
            ${kv("Updated", updated || "—")}
          </div>
        </div>
      </div>
    </div>
  `;
}
function bindTaskDetail(t, projectId){
  $("#taskBack").onclick = ()=>{
    if(state.uiSelections?.tasks) delete state.uiSelections.tasks.selectedId;
    saveState(state);
    navTo("tasks", projectId ? {projectId} : {});
  };
  $("#taskEdit").onclick = ()=> openTaskForm(t);
  $("#taskDelete").onclick = ()=>{
    if(confirmDelete(`task "${t.title}"`)){
      state.tasks = softDeleteById(state.tasks, t.id);
      if(state.uiSelections?.tasks) delete state.uiSelections.tasks.selectedId;
      saveState(state);
      navTo("tasks", projectId ? {projectId} : {});
    }
  };
}

function openTaskForm(seed={}){
  const isEdit = !!seed.id;
  const t = isEdit ? seed : {
    id: uid(),
    projectId: seed.projectId || (state.projects[0]?.id || ""),
    title: "",
    details: "",
    status: "To do",
    dueDate: "",
    assignedSubbieId: null,
    photos: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const projects = aliveArr(state.projects).slice().sort((a,b)=>(a.name||"").localeCompare(b.name||""));
  const subbies = aliveArr(state.subbies).slice().sort((a,b)=>(a.name||"").localeCompare(b.name||""));
  showModal(`
    <div class="row space">
      <h2>${isEdit ? "Edit Task" : "New Task"}</h2>
      <button class="btn" id="closeM" type="button">Close</button>
    </div>
    <label>Project</label>
    <select id="t_project" class="input">
      ${projects.map(p=>`<option value="${p.id}" ${p.id===t.projectId?"selected":""}>${escapeHtml(p.name)}</option>`).join("")}
    </select>
    <label>Title</label>
    <input id="t_title" class="input" value="${escapeHtml(t.title)}" placeholder="e.g., Fit off bathroom, fix jamb, order LVL" />
    <label>Details</label>
    <textarea id="t_details" class="input" placeholder="Notes for you / subbie">${escapeHtml(t.details||"")}</textarea>
    <div class="grid two">
      <div>
        <label>Status</label>
        <select id="t_status" class="input">
          ${["To do","In progress","Blocked","Done"].map(s=>`<option ${s===t.status?"selected":""}>${s}</option>`).join("")}
        </select>
      </div>
      <div>
        <label>Due date</label>
        <input id="t_due" class="input" type="date" value="${escapeHtml(t.dueDate||"")}" />
      </div>
    </div>
    <label>Assign to subbie (optional)</label>
    <select id="t_subbie" class="input">
      <option value="">Unassigned</option>
      ${subbies.map(s=>`<option value="${s.id}" ${s.id===t.assignedSubbieId?"selected":""}>${escapeHtml(s.name)}${s.trade?` — ${escapeHtml(s.trade)}`:""}</option>`).join("")}
    </select>

    <label class="checkboxRow">
      <input id="t_photosTaken" class="input" type="checkbox" ${((t.photosJson&&String(t.photosJson).trim()) || (t.photos&&t.photos.length)) ? "checked" : ""} />
      Photos taken
    </label>
    <div class="small" style="opacity:.8">Store photos externally (not uploaded in-app).</div>
<hr/>
    <div class="row space actionsSticky">
      <button class="btn primary" id="saveT" type="button">${isEdit ? "Save" : "Create"}</button>
      <button class="btn" id="cancelT" type="button">Cancel</button>
      ${isEdit ? `<button class="btn danger" id="delT" type="button">Delete</button>` : ""}
    </div>
  `);
  $("#closeM").onclick = closeModal;
  $("#cancelT").onclick = closeModal;

  $("#saveT").onclick = async ()=>{
    const __btn = $("#saveT");
    setBtnBusy(__btn, true);
    const __hint = showSavingHint("Saving…");
    try{
t.projectId = $("#t_project").value;
    t.title = $("#t_title").value.trim();
    t.details = $("#t_details").value.trim();
    t.status = $("#t_status").value;
    t.dueDate = $("#t_due").value;
    t.assignedSubbieId = $("#t_subbie").value || null;

    t.photosJson = ($("#t_photosTaken") && $("#t_photosTaken").checked) ? "true" : "";
t.updatedAt = new Date().toISOString();
    if(!t.title) alert("Title required.");
    if(isEdit){
      state.tasks = alive(state.tasks).filter(isAlive).map(x=>x.id===t.id ? t : x);
    }else{
      state.tasks.unshift(t);
    }
    saveState(state);
    closeModal();
    render(); try{renderDeletedProjectsUI();}catch(e){}
    } finally {
      __hint && __hint.remove();
      setBtnBusy(__btn, false);
    }

  };

  $("#delT") && ($("#delT").onclick = ()=>{
    if(confirmDelete(`task "${t.title}"`)){
      state.tasks = softDeleteById(state.tasks, t.id);
// NOTE: soft delete handled elsewhere

      saveState(state);
      renderTasks(app, { projectId });
closeModal();
      render(); try{renderDeletedProjectsUI();}catch(e){}
    }
  });
}

// ----------------- Diary (global) -----------------

function openDiaryView(d){
  if(!d) return;
  const p = (state.projects||[]).find(x=>x.id===d.projectId);
  showModal(`
    <div class="row space">
      <h2>Diary Entry</h2>
      <div class="row">
        <button class="btn" id="closeM" type="button">Close</button>
        <button class="btn primary" id="editV" type="button">Edit</button>
      </div>
    </div>
    <div class="sub"><strong>${escapeHtml(p?.name || "Project")}</strong><br/>${escapeHtml(p?.address || "")}</div>
    <hr/>
    <div class="kv"><div class="k">Date</div><div class="v">${escapeHtml(dateFmt(d.date))}</div></div>
    <div class="kv"><div class="k">Category</div><div class="v">${escapeHtml(d.category||"")}</div></div>
    <div class="kv"><div class="k">Billable</div><div class="v">${d.billable ? "Yes" : "No"}</div></div>
    ${d.hours ? `<div class="kv"><div class="k">Hours</div><div class="v">${escapeHtml(String(d.hours))}</div></div>` : ""}
    ${d.rate ? `<div class="kv"><div class="k">Rate</div><div class="v">${escapeHtml(String(d.rate))}</div></div>` : ""}
    <hr/>
    <h2 style="margin-top:0">Notes</h2>
    <div class="sub" style="white-space:pre-wrap">${escapeHtml(d.summary||"—")}</div>
    ${d.photos?.length ? `<hr/><h2 style="margin-top:0">Photos</h2><div class="thumbgrid">${d.photos.map(ph=>`<div class="thumb"><img src="${ph.dataUrl}" alt="${escapeHtml(ph.name)}"/></div>`).join("")}</div>` : ""}
  `);
  $("#closeM").onclick = closeModal;
  $("#editV").onclick = ()=> openDiaryForm(d);
}
function renderDiary(app, params){
  setHeader("Diary");
  const projectId = params.projectId || "";
  const selectedId = params.id || (state.uiSelections?.tasks?.selectedId || "");
  const projects = aliveArr(state.projects).slice().sort((a,b)=>(a.name||"").localeCompare(b.name||""));
  const entries = aliveArr(state.diary)
    .filter(d=> !projectId || d.projectId===projectId)
    .slice()
    .sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  
  if(selectedId){
    const dsel = aliveArr(state.diary).find(d=>String(d.id)===String(selectedId));
    if(dsel){
      state.uiSelections.diary = state.uiSelections.diary || {};
      state.uiSelections.diary.selectedId = String(selectedId);
      saveState(state);
      app.innerHTML = renderDiaryDetail(dsel);
      bindDiaryDetail(dsel, projectId);
      return;
    } else {
      state.uiSelections.diary = state.uiSelections.diary || {};
      delete state.uiSelections.diary.selectedId;
      saveState(state);
    }
  }
app.innerHTML = `
    <div class="card">
      <div class="row space">
        <h2>Diary</h2>
        <button class="btn primary" id="newDiary" type="button">New Entry</button>
      </div>
      <div class="grid two">
        <div>
          <label>Filter by project</label>
          <select id="diaryProjectFilter" class="input">
            <option value="">All projects</option>
            ${projects.map(p=>`<option value="${p.id}" ${p.id===projectId?"selected":""}>${escapeHtml(p.name)}</option>`).join("")}
          </select>
        </div>
        <div></div>
      </div>
      <hr/>
      <div class="list" id="diaryList">${entries.length ? entries.map(diaryRowWithProject).join("") : `<div class="sub">No diary entries yet.</div>`}</div>
    </div>
  `;
  $("#newDiary").onclick = ()=> openDiaryForm(projectId ? { projectId } : {});
  $("#diaryProjectFilter").onchange = (e)=>{
    const v = e.target.value;
    navTo("diary", v ? {projectId:v} : {});
  };

  $$("#diaryList [data-action='open']").forEach(row=>row.onclick = ()=>{
    const id = row.dataset.id;
    navTo("diary", Object.assign({}, projectId ? {projectId} : {}, { id }));
  });
  // (Fieldwire UI refactor) Delete is handled by detail view actions.
}
function diaryRowWithProject(d){
  const p = projectById(d.projectId);
  const date = d.date ? dateFmt(d.date) : "";
  const hours = (d.hours!=null && d.hours!=="") ? `${escapeHtml(String(d.hours))}h` : "";
  const photosTaken = !!(d.photosTaken || (d.photosJson && String(d.photosJson).trim()) || (d.photos && d.photos.length));
  const metaBits = [
    p ? escapeHtml(p.name||p.address||"") : "No project",
    hours,
    photosTaken ? "Photos taken" : ""
  ].filter(Boolean).join(" • ");
  return `
    <div class="fwListItem" data-action="open" data-id="${d.id}">
      <div class="fwMain">
        <div class="fwTitleRow">
          <div class="fwTitle">${escapeHtml(date || "Diary entry")}</div>
          ${hours ? `<span class="fwBadge muted">${hours}</span>` : ``}
        </div>
        <div class="fwMeta">${escapeHtml(metaBits || " ")}</div>
        ${d.notes ? `<div class="fwSub">${escapeHtml(String(d.notes).slice(0,90))}${String(d.notes).length>90?"…":""}</div>` : ``}
      </div>
      <div class="fwChevron">›</div>
    </div>
  `;
}

function renderDiaryDetail(d){
  const p = projectById(d.projectId);
  const date = d.date ? dateFmt(d.date) : "";
  const hours = (d.hours!=null && d.hours!=="") ? `${escapeHtml(String(d.hours))} hours` : "—";
  const photosTaken = !!(d.photosTaken || (d.photosJson && String(d.photosJson).trim()) || (d.photos && d.photos.length));
  return `
    <div class="fwDetail">
      <div class="fwDetailTop">
        <button class="btn" id="diaryBack" type="button">Back</button>
        <div class="fwDetailActions">
          <button class="btn" id="diaryEdit" type="button">Edit</button>
          <button class="btn danger" id="diaryDelete" type="button">Delete</button>
        </div>
      </div>

      <div class="card">
        <div class="fwH1">${escapeHtml(date || "Diary entry")}</div>
        <div class="fwMeta">${p ? escapeHtml(p.name||p.address||"") : "No project"}</div>

        <div class="fwBadgeRow">
          <span class="fwBadge muted">${hours}</span>
          ${photosTaken ? `<span class="fwBadge ok">Photos taken</span>` : `<span class="fwBadge muted">No photos</span>`}
        </div>

        <div class="fwSection">
          <div class="fwSectionTitle">Summary</div>
          <div class="fwKV">
            ${kv("Weather", d.weather || "—")}
            ${kv("Crew", d.crew || "—")}
            ${kv("Notes", d.notes || "—")}
            ${kv("Variations", d.variations || "—")}
          </div>
        </div>
      </div>
    </div>
  `;
}
function bindDiaryDetail(d, projectId){
  $("#diaryBack").onclick = ()=>{
    if(state.uiSelections?.diary) delete state.uiSelections.diary.selectedId;
    saveState(state);
    navTo("diary", projectId ? {projectId} : {});
  };
  $("#diaryEdit").onclick = ()=> openDiaryForm(d);
  $("#diaryDelete").onclick = ()=>{
    if(confirmDelete(`diary entry ${dateFmt(d.date)}`)){
      state.diary = softDeleteById(state.diary, d.id);
      if(state.uiSelections?.diary) delete state.uiSelections.diary.selectedId;
      saveState(state);
      navTo("diary", projectId ? {projectId} : {});
    }
  };
}

function openDiaryForm(seed={}){
  const isEdit = !!seed.id;
  const d = isEdit ? seed : {
    id: uid(),
    projectId: seed.projectId || (state.projects[0]?.id || ""),
    date: new Date().toISOString().slice(0,10),
    summary: "",
    hours: "",
    billable: true,
    category: "Labour",
    rate: "",
    photos: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const projects = aliveArr(state.projects).slice().sort((a,b)=>(a.name||"").localeCompare(b.name||""));
  showModal(`
    <div class="row space">
      <h2>${isEdit ? "Edit Diary Entry" : "New Diary Entry"}</h2>
      <button class="btn" id="closeM" type="button">Close</button>
    </div>
    <label>Project</label>
    <select id="d_project" class="input">
      ${projects.map(p=>`<option value="${p.id}" ${p.id===d.projectId?"selected":""}>${escapeHtml(p.name)}</option>`).join("")}
    </select>
    <div class="grid two">
      <div>
        <label>Date</label>
        <input id="d_date" class="input" type="date" value="${escapeHtml(d.date)}" />
      </div>
      <div>
        <label>Hours (optional)</label>
        <input id="d_hours" class="input" type="number" step="0.25" value="${escapeHtml(d.hours||"")}" placeholder="e.g., 7.5" />
      </div>
    </div>
    <div class="grid two">
      <div>
        <label>Category</label>
        <select id="d_cat" class="input">
          ${["Labour","Materials","Travel","Plant","Other"].map(c=>`<option ${c===d.category?"selected":""}>${c}</option>`).join("")}
        </select>
      </div>
      <div>
        <label>Billable</label>
        <select id="d_bill" class="input">
          <option value="true" ${d.billable?"selected":""}>Yes</option>
          <option value="false" ${!d.billable?"selected":""}>No</option>
        </select>
      </div>
    </div>
    <label>Rate (NZD/hr or item cost) — optional</label>
    <input id="d_rate" class="input" type="number" step="0.01" value="${escapeHtml(d.rate||"")}" placeholder="Leave blank to use default labour rate in Settings" />
    <label>Summary / notes</label>
    <textarea id="d_sum" class="input" placeholder="What was done today?">${escapeHtml(d.summary||"")}</textarea>
    <label class="checkboxRow">
      <input id="d_photosTaken" class="input" type="checkbox" ${((d.photosJson&&String(d.photosJson).trim()) || (d.photos&&d.photos.length)) ? "checked" : ""} />
      Photos taken
    </label>
    <div class="small" style="opacity:.8">Store photos externally (not uploaded in-app).</div>
<hr/>
    <div class="row space actionsSticky">
      <button class="btn primary" id="saveD" type="button">${isEdit ? "Save" : "Create"}</button>
      <button class="btn" id="cancelD" type="button">Cancel</button>
      ${isEdit ? `<button class="btn danger" id="delD" type="button">Delete</button>` : ""}
    </div>
  `);
  $("#closeM").onclick = closeModal;
  $("#cancelD").onclick = closeModal;

  $("#saveD").onclick = async ()=>{
    const __btn = $("#saveD");
    setBtnBusy(__btn, true);
    const __hint = showSavingHint("Saving…");
    try{
d.projectId = $("#d_project").value;
    d.date = $("#d_date").value;
    d.hours = $("#d_hours").value;
    d.category = $("#d_cat").value;
    d.billable = $("#d_bill").value === "true";
    d.rate = $("#d_rate").value;
    d.summary = $("#d_sum").value.trim();
d.updatedAt = new Date().toISOString();
    if(!d.projectId) alert("Project required.");
    if(!d.date) alert("Date required.");
    if(isEdit){
      state.diary = alive(state.diary).filter(isAlive).map(x=>x.id===d.id ? d : x);
    }else{
      state.diary.unshift(d);
    }
    saveState(state);
    closeModal();
    render(); try{renderDeletedProjectsUI();}catch(e){}
    } finally {
      __hint && __hint.remove();
      setBtnBusy(__btn, false);
    }

  };

  $("#delD") && ($("#delD").onclick = ()=>{
    if(confirmDelete(`diary entry ${dateFmt(d.date)}`)){
      state.diary = softDeleteById(state.diary, d.id);
// NOTE: soft delete handled elsewhere

      saveState(state);
      renderDiary(app, { projectId });
closeModal();
      render(); try{renderDeletedProjectsUI();}catch(e){}
    }
  });
}

// ----------------- Variations (global list is via project) -----------------
function openVariationForm(seed={}){
  const isEdit = !!seed.id;
  const v = isEdit ? seed : {
    id: uid(),
    projectId: seed.projectId || (state.projects[0]?.id || ""),
    date: new Date().toISOString().slice(0,10),
    title: "",
    description: "",
    amount: "",
    status: "Draft",
    photos: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const projects = aliveArr(state.projects).slice().sort((a,b)=>(a.name||"").localeCompare(b.name||""));
  showModal(`
    <div class="row space">
      <h2>${isEdit ? "Edit Variation" : "New Variation"}</h2>
      <button class="btn" id="closeM" type="button">Close</button>
    </div>
    <label>Project</label>
    <select id="v_project" class="input">
      ${projects.map(p=>`<option value="${p.id}" ${p.id===v.projectId?"selected":""}>${escapeHtml(p.name)}</option>`).join("")}
    </select>
    <div class="grid two">
      <div>
        <label>Date</label>
        <input id="v_date" class="input" type="date" value="${escapeHtml(v.date||"")}" />
      </div>
      <div>
        <label>Status</label>
        <select id="v_status" class="input">
          ${["Draft","Sent","Approved","Declined"].map(s=>`<option ${s===v.status?"selected":""}>${s}</option>`).join("")}
        </select>
      </div>
    </div>
    <label>Title</label>
    <input id="v_title" class="input" value="${escapeHtml(v.title||"")}" placeholder="e.g., Extra soffit lining / Change of tiles" />
    <label>Description</label>
    <textarea id="v_desc" class="input" placeholder="Scope change, photos, notes">${escapeHtml(v.description||"")}</textarea>
    <label>Amount (NZD)</label>
    <input id="v_amount" class="input" type="number" step="0.01" value="${escapeHtml(v.amount||"")}" />
    <label>Photos</label>
    <input id="v_photos" class="input" type="hidden" accept="image/*" multiple />
    ${v.photos?.length ? `<div class="thumbgrid">${v.photos.map(ph=>`<div class="thumb"><img src="${ph.dataUrl}" alt="${escapeHtml(ph.name)}"/></div>`).join("")}</div>` : ""}
    <hr/>
    <div class="row space actionsSticky">
      <button class="btn primary" id="saveV" type="button">${isEdit ? "Save" : "Create"}</button>
      <button class="btn" id="cancelV" type="button">Cancel</button>
      ${isEdit ? `<button class="btn danger" id="delV" type="button">Delete</button>` : ""}
    </div>
  `);
  $("#closeM").onclick = closeModal;
  $("#cancelV").onclick = closeModal;

  $("#saveV").onclick = async ()=>{
    const __btn = $("#saveV");
    setBtnBusy(__btn, true);
    const __hint = showSavingHint("Saving…");
    try{
    const added = await filesToDataUrls($("#v_photos").files);
    v.projectId = $("#v_project").value;
    v.date = $("#v_date").value;
    v.status = $("#v_status").value;
    v.title = $("#v_title").value.trim();
    v.description = $("#v_desc").value.trim();
    v.amount = $("#v_amount").value;
    v.photos = [...(v.photos||[]), ...added];
    v.updatedAt = new Date().toISOString();
    if(!v.title) alert("Title required.");
    if(isEdit){
      state.variations = alive(state.variations).filter(isAlive).map(x=>x.id===v.id ? v : x);
    }else{
      state.variations.unshift(v);
    }
    saveState(state);
    closeModal();
    render(); try{renderDeletedProjectsUI();}catch(e){}
    } finally {
      __hint && __hint.remove();
      setBtnBusy(__btn, false);
    }

  };

  $("#delV") && ($("#delV").onclick = ()=>{
    if(confirmDelete(`variation "${v.title}"`)){
      state.variations = softDeleteById(state.variations, v.id);
// NOTE: soft delete handled elsewhere

      saveState(state);
      closeModal();
      render(); try{renderDeletedProjectsUI();}catch(e){}
    }
  });
}

// ----------------- Subbies -----------------
function openSubbieForm(seed=null){
  const isEdit = !!seed?.id;
  // Subbies can be shared across projects (projectId = "") or linked to a specific project.
  const s = isEdit ? seed : {
    id: uid(),
    projectId: seed?.projectId || "",
    name:"", trade:"", phone:"", email:"", notes:"",
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString()
  };
  const projects = aliveArr(state.projects).slice().sort((a,b)=>(a.name||"").localeCompare(b.name||""));
  showModal(`
    <div class="row space">
      <h2>${isEdit ? "Edit Subbie" : "Add Subbie"}</h2>
      <button class="btn" id="closeM" type="button">Close</button>
    </div>
    <label>Name</label>
    <input id="s_name" class="input" value="${escapeHtml(s.name||"")}" placeholder="Company or person" />
    <label>Trade</label>
    <input id="s_trade" class="input" value="${escapeHtml(s.trade||"")}" placeholder="e.g., Plumber, Sparky, Gib, Painter" />
    <label>Project (optional)</label>
    <select id="s_project" class="input">
      <option value="" ${!s.projectId?"selected":""}>Shared (all projects)</option>
      ${projects.map(p=>`<option value="${p.id}" ${p.id===s.projectId?"selected":""}>${escapeHtml(p.name)}</option>`).join("")}
    </select>
    <div class="grid two">
      <div>
        <label>Phone</label>
        <input id="s_phone" class="input" value="${escapeHtml(s.phone||"")}" />
      </div>
      <div>
        <label>Email</label>
        <input id="s_email" class="input" value="${escapeHtml(s.email||"")}" />
      </div>
    </div>
    <label>Notes</label>
    <textarea id="s_notes" class="input">${escapeHtml(s.notes||"")}</textarea>
    <hr/>
    <div class="row space actionsSticky">
      <button class="btn primary" id="saveS" type="button">${isEdit ? "Save" : "Add"}</button>
      <button class="btn" id="cancelS" type="button">Cancel</button>
      ${isEdit ? `<button class="btn danger" id="delS" type="button">Delete</button>` : ""}
    </div>
  `);
  $("#closeM").onclick = closeModal;
  $("#cancelS").onclick = closeModal;

  $("#saveS").onclick = ()=>{
    s.name = $("#s_name").value.trim();
    s.trade = $("#s_trade").value.trim();
    s.projectId = $("#s_project") ? $("#s_project").value : (s.projectId || "");
    s.phone = $("#s_phone").value.trim();
    s.email = $("#s_email").value.trim();
    s.notes = $("#s_notes").value.trim();
    s.updatedAt = new Date().toISOString();
    if(!s.name) alert("Name required.");
    if(isEdit){
      state.subbies = alive(state.subbies).filter(isAlive).map(x=>x.id===s.id ? s : x);
    }else{
      state.subbies.unshift(s);
    }
    saveState(state);
    closeModal();
    render(); try{renderDeletedProjectsUI();}catch(e){}
  };

  $("#delS") && ($("#delS").onclick = ()=>{
    if(confirmDelete(`subbie "${s.name}"`)){
      state.subbies = softDeleteById(state.subbies, s.id);
// NOTE: soft delete handled elsewhere

      state.tasks = alive(state.tasks).filter(isAlive).map(t=> t.assignedSubbieId===s.id ? {...t, assignedSubbieId:null} : t);
      saveState(state);
      closeModal();
      render(); try{renderDeletedProjectsUI();}catch(e){}
    }
  });
}

// ----------------- Deliveries -----------------
function openDeliveryForm(seed={}){
  const isEdit = !!seed?.id;
  const d = isEdit ? seed : {
    id: uid(),
    projectId: seed.projectId || (state.projects[0]?.id || ""),
    supplier: "",
    date: new Date().toISOString().slice(0,10),
    status: "Expected",
    items: "",
    dropPoint: "",
    notes: "",
    photos: [],
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString()
  };
  const projects = aliveArr(state.projects).slice().sort((a,b)=>(a.name||"").localeCompare(b.name||""));
  showModal(`
    <div class="row space">
      <h2>${isEdit ? "Edit Delivery" : "New Delivery"}</h2>
      <button class="btn" id="closeM" type="button">Close</button>
    </div>
    <label>Project</label>
    <select id="del_project" class="input">
      ${projects.map(p=>`<option value="${p.id}" ${p.id===d.projectId?"selected":""}>${escapeHtml(p.name)}</option>`).join("")}
    </select>
    <div class="grid two">
      <div>
        <label>Supplier</label>
        <input id="del_supplier" class="input" value="${escapeHtml(d.supplier||"")}" placeholder="PlaceMakers / Carters / Mitre10 / ITM / etc" />
      </div>
      <div>
        <label>Date</label>
        <input id="del_date" class="input" type="date" value="${escapeHtml(d.date||"")}" />
      </div>
    </div>
    <label>Status</label>
    <select id="del_status" class="input">
      ${["Expected","Delivered","Missing/Damaged"].map(s=>`<option ${s===d.status?"selected":""}>${s}</option>`).join("")}
    </select>
    <label>Items</label>
    <textarea id="del_items" class="input" placeholder="What’s coming / what arrived">${escapeHtml(d.items||"")}</textarea>
    <label>Drop point</label>
    <input id="del_drop" class="input" value="${escapeHtml(d.dropPoint||"")}" placeholder="Front gate / garage / upstairs / etc" />
    <label>Notes</label>
    <textarea id="del_notes" class="input">${escapeHtml(d.notes||"")}</textarea>
    <label>Photos</label>
    <input id="del_photos" class="input" type="hidden" accept="image/*" multiple />
    ${d.photos?.length ? `<div class="thumbgrid">${d.photos.map(ph=>`<div class="thumb"><img src="${ph.dataUrl}" alt="${escapeHtml(ph.name)}"/></div>`).join("")}</div>` : ""}
    <hr/>
    <div class="row space actionsSticky">
      <button class="btn primary" id="saveDel" type="button">${isEdit ? "Save" : "Create"}</button>
      <button class="btn" id="cancelDel" type="button">Cancel</button>
      ${isEdit ? `<button class="btn danger" id="delDel" type="button">Delete</button>` : ""}
    </div>
  `);
  $("#closeM").onclick = closeModal;
  $("#cancelDel").onclick = closeModal;

  $("#saveDel").onclick = async ()=>{
    const __btn = $("#saveDel");
    setBtnBusy(__btn, true);
    const __hint = showSavingHint("Saving…");
    try{
    const added = await filesToDataUrls($("#del_photos").files);
    d.projectId = $("#del_project").value;
    d.supplier = $("#del_supplier").value.trim();
    d.date = $("#del_date").value;
    d.status = $("#del_status").value;
    d.items = $("#del_items").value.trim();
    d.dropPoint = $("#del_drop").value.trim();
    d.notes = $("#del_notes").value.trim();
d.updatedAt = new Date().toISOString();
    if(!d.projectId) alert("Project required.");
    if(isEdit){
      state.deliveries = alive(state.deliveries).filter(isAlive).map(x=>x.id===d.id ? d : x);
    }else{
      state.deliveries.unshift(d);
    }
    saveState(state);
    closeModal();
    render(); try{renderDeletedProjectsUI();}catch(e){}
    } finally {
      __hint && __hint.remove();
      setBtnBusy(__btn, false);
    }

  };

  $("#delDel") && ($("#delDel").onclick = ()=>{
    if(confirmDelete(`delivery "${d.supplier||'delivery'}"`)){
      state.deliveries = softDeleteById(state.deliveries, d.id);
// NOTE: soft delete handled elsewhere

      saveState(state);
      closeModal();
      render(); try{renderDeletedProjectsUI();}catch(e){}
    }
  });
}

// ----------------- Inspections -----------------
function openInspectionForm(seed={}){
  const isEdit = !!seed?.id;
  const i = isEdit ? seed : {
    id: uid(),
    projectId: seed.projectId || (state.projects[0]?.id || ""),
    type: "Pre-line",
    date: "",
    result: "Booked",
    inspector: "",
    notes: "",
    photos: [],
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString()
  };
  const projects = aliveArr(state.projects).slice().sort((a,b)=>(a.name||"").localeCompare(b.name||""));
  showModal(`
    <div class="row space">
      <h2>${isEdit ? "Edit Inspection" : "New Inspection"}</h2>
      <button class="btn" id="closeM" type="button">Close</button>
    </div>
    <label>Project</label>
    <select id="i_project" class="input">
      ${projects.map(p=>`<option value="${p.id}" ${p.id===i.projectId?"selected":""}>${escapeHtml(p.name)}</option>`).join("")}
    </select>
    <div class="grid two">
      <div>
        <label>Type</label>
        <input id="i_type" class="input" value="${escapeHtml(i.type||"")}" placeholder="Pre-slab / Pre-line / Post-line / Final / etc" />
      </div>
      <div>
        <label>Date</label>
        <input id="i_date" class="input" type="date" value="${escapeHtml(i.date||"")}" />
      </div>
    </div>
    <label>Result</label>
    <select id="i_result" class="input">
      ${["Booked","Pass","Fail","Conditional"].map(r=>`<option ${r===i.result?"selected":""}>${r}</option>`).join("")}
    </select>
    <label>Inspector</label>
    <input id="i_insp" class="input" value="${escapeHtml(i.inspector||"")}" placeholder="Optional" />
    <label>Notes</label>
    <textarea id="i_notes" class="input">${escapeHtml(i.notes||"")}</textarea>
    <label>Photos</label>
    <input id="i_photos" class="input" type="hidden" accept="image/*" multiple />
    ${i.photos?.length ? `<div class="thumbgrid">${i.photos.map(ph=>`<div class="thumb"><img src="${ph.dataUrl}" alt="${escapeHtml(ph.name)}"/></div>`).join("")}</div>` : ""}
    <hr/>
    <div class="row space actionsSticky">
      <button class="btn primary" id="saveI" type="button">${isEdit ? "Save" : "Create"}</button>
      <button class="btn" id="cancelI" type="button">Cancel</button>
      ${isEdit ? `<button class="btn danger" id="delI" type="button">Delete</button>` : ""}
    </div>
  `);
  $("#closeM").onclick = closeModal;
  $("#cancelI").onclick = closeModal;

  $("#saveI").onclick = async ()=>{
    const __btn = $("#saveI");
    setBtnBusy(__btn, true);
    const __hint = showSavingHint("Saving…");
    try{
    const added = await filesToDataUrls($("#i_photos").files);
    i.projectId = $("#i_project").value;
    i.type = $("#i_type").value.trim();
    i.date = $("#i_date").value;
    i.result = $("#i_result").value;
    i.inspector = $("#i_insp").value.trim();
    i.notes = $("#i_notes").value.trim();
    i.photos = [...(i.photos||[]), ...added];
    i.updatedAt = new Date().toISOString();
    if(!i.projectId) alert("Project required.");
    if(!i.type) alert("Type required.");
    if(isEdit){
      state.inspections = alive(state.inspections).filter(isAlive).map(x=>x.id===i.id ? i : x);
    }else{
      state.inspections.unshift(i);
    }
    saveState(state);
    closeModal();
    render(); try{renderDeletedProjectsUI();}catch(e){}
    } finally {
      __hint && __hint.remove();
      setBtnBusy(__btn, false);
    }

  };

  $("#delI") && ($("#delI").onclick = ()=>{
    if(confirmDelete(`inspection "${i.type}"`)){
      state.inspections = softDeleteById(state.inspections, i.id);
// NOTE: soft delete handled elsewhere

      saveState(state);
      closeModal();
      render(); try{renderDeletedProjectsUI();}catch(e){}
    }
  });
}

// ----------------- Reports -----------------
function renderReports(app){
  setHeader("Reports");
  const projects = aliveArr(state.projects).slice().sort((a,b)=>(a.name||"").localeCompare(b.name||""));
  app.innerHTML = `
    <div class="card">
      <div class="row space">
        <h2>Reports</h2>
        <div class="row">
          <button class="btn" id="hnryExport" type="button">Hnry Invoice Export</button>
          <button class="btn primary" id="runReport" type="button">Run Job Report</button>
        </div>
      </div>
      <div class="grid two">
        <div>
          <label>Project</label>
          <select id="r_project" class="input">
            <option value="__ALL__">All active sites (Hnry only)</option>
${projects.map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("")}
          </select>
        </div>
        <div></div>
      </div>
      <div class="grid two">
        <div>
          <label>Date from</label>
          <input id="r_from" class="input" type="date" value="${new Date(Date.now()-7*86400000).toISOString().slice(0,10)}" />
        </div>
        <div>
          <label>Date to</label>
          <input id="r_to" class="input" type="date" value="${new Date().toISOString().slice(0,10)}" />
        </div>
      </div>
      <div class="sub">Reports open in a printable preview. Use your browser share/print to save as PDF.</div>
    </div>
  `;
  $("#runReport").onclick = ()=>{
    const pid = $("#r_project").value;
    if(pid==="__ALL__"){ alert("Select a specific project for Job Report."); return; }
    runReportUI(pid, $("#r_from").value, $("#r_to").value);
  };
  $("#hnryExport").onclick = ()=>{
    const pid = $("#r_project").value;
    runHnryExportUI(pid, $("#r_from").value, $("#r_to").value);
  };

  // HNRY SIMPLE export binding (override after render)
  const hnryBtn = document.getElementById("hnryExport");
  if(hnryBtn){
    hnryBtn.onclick = () => {
      runHnryDiaryExportSimple(
        document.getElementById("r_project").value,
        document.getElementById("r_from").value,
        document.getElementById("r_to").value
      );
    };
  }
}

function runReportUI(projectId, from=null, to=null){
  const isAll = projectId === "__ALL__";
  const p = isAll ? null : projectById(projectId);
  if(!isAll && !p) return;
  const rangeFrom = from || new Date(Date.now()-7*86400000).toISOString().slice(0,10);
  const rangeTo = to || new Date().toISOString().slice(0,10);

  const tasks = alive(state.tasks).filter(t=>t.projectId===projectId && isAlive(t));
  const diary = alive(state.diary).filter(d=>d.projectId===projectId && isAlive(d)).filter(d=>d.date>=rangeFrom && d.date<=rangeTo).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  const vars = alive(state.variations).filter(v=>v.projectId===projectId && isAlive(v)).filter(v=> (v.date||"")>=rangeFrom && (v.date||"")<=rangeTo);
  const delivs = alive(state.deliveries).filter(d=>d.projectId===projectId && isAlive(d)).filter(d=> (d.date||"")>=rangeFrom && (d.date||"")<=rangeTo);
  const insps = alive(state.inspections).filter(i=>i.projectId===projectId && isAlive(i)).filter(i=> (i.date||"")>=rangeFrom && (i.date||"")<=rangeTo);

  const html = `
    <div class="card printOnly" style="padding:18px">
      <div style="display:flex; gap:14px; align-items:center">
        <img src="./logo.png" alt="logo" style="height:44px; width:auto"/>
        <div>
          <div style="font-size:18px; font-weight:900">${escapeHtml(settings.companyName)}</div>
          <div style="color:#333; font-size:12px">${escapeHtml(p.name)} • ${escapeHtml(p.address||"")}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="row space">
        <h2>Job Report</h2>
        <div class="row noPrint">
          <button class="btn" id="copyLink" type="button">Copy</button>
          <button class="btn primary" id="printBtn" type="button">Print / Save PDF</button>
        </div>
      </div>
      <div class="sub">${escapeHtml(p.name)} • ${escapeHtml(p.address||"")}<br/>Period: ${dateFmt(rangeFrom)} → ${dateFmt(rangeTo)}</div>
      <hr/>
      <h2>Diary</h2>
      ${diary.length ? diary.map(d=>`
        <div class="item">
          <div class="row space">
            <div><strong>${dateFmt(d.date)}</strong> ${d.billable?`<span class="badge ok">Billable</span>`:`<span class="badge">Non‑billable</span>`} ${d.hours?`<span class="badge">⏱ ${escapeHtml(String(d.hours))}h</span>`:""}</div>
            <div class="smallmuted">${escapeHtml(d.category||"")}</div>
          </div>
          <div class="meta">${escapeHtml(d.summary||"")}</div>
        </div>
      `).join("") : `<div class="sub">No diary entries in range.</div>`}

      <hr/>
      <h2>Open tasks</h2>
      ${tasks.filter(t=>t.status!=="Done").length ? `
        <table>
          <thead><tr><th>Task</th><th>Status</th><th>Due</th><th>Assigned</th></tr></thead>
          <tbody>
            ${tasks.filter(t=>t.status!=="Done").map(t=>{
              const s = t.assignedSubbieId ? subbieById(t.assignedSubbieId) : null;
              return `<tr><td>${escapeHtml(t.title)}</td><td>${escapeHtml(t.status||"")}</td><td>${t.dueDate?escapeHtml(dateFmt(t.dueDate)):""}</td><td>${s?escapeHtml(s.name):""}</td></tr>`;
            }).join("")}
          </tbody>
        </table>` : `<div class="sub">No open tasks.</div>`}

      <hr/>
      <h2>Variations</h2>
      ${vars.length ? `
        <table>
          <thead><tr><th>Title</th><th>Status</th><th>Date</th><th>Amount</th></tr></thead>
          <tbody>
            ${vars.map(v=>`<tr><td>${escapeHtml(v.title)}</td><td>${escapeHtml(v.status||"")}</td><td>${v.date?escapeHtml(dateFmt(v.date)):""}</td><td>${v.amount?escapeHtml(money(v.amount)):""}</td></tr>`).join("")}
          </tbody>
        </table>` : `<div class="sub">No variations in range.</div>`}

      <hr/>
      <h2>Deliveries</h2>
      ${delivs.length ? `
        <table>
          <thead><tr><th>Supplier</th><th>Date</th><th>Status</th><th>Items</th></tr></thead>
          <tbody>
            ${delivs.map(d=>`<tr><td>${escapeHtml(d.supplier||"")}</td><td>${d.date?escapeHtml(dateFmt(d.date)):""}</td><td>${escapeHtml(d.status||"")}</td><td>${escapeHtml((d.items||"").slice(0,120))}</td></tr>`).join("")}
          </tbody>
        </table>` : `<div class="sub">No deliveries in range.</div>`}

      <hr/>
      <h2>Inspections</h2>
      ${insps.length ? `
        <table>
          <thead><tr><th>Type</th><th>Date</th><th>Result</th><th>Notes</th></tr></thead>
          <tbody>
            ${insps.map(i=>`<tr><td>${escapeHtml(i.type||"")}</td><td>${i.date?escapeHtml(dateFmt(i.date)):""}</td><td>${escapeHtml(i.result||"")}</td><td>${escapeHtml((i.notes||"").slice(0,120))}</td></tr>`).join("")}
          </tbody>
        </table>` : `<div class="sub">No inspections in range.</div>`}

      <hr/>
      <div class="smallmuted">Generated ${new Date().toLocaleString("en-NZ")}</div>
    </div>
  `;

  // open in same app as modal with print
  showModal(html);
  $("#copyLink").onclick = async ()=>{
    try{
      await navigator.clipboard.writeText(`Job Report: ${p.name} (${rangeFrom} to ${rangeTo})`);
      alert("Copied.");
    }catch(e){ alert("Copy failed."); }
  };
  $("#printBtn").onclick = ()=> printModalOnly("Job Report");
}


function runHnryExportUI(projectId, from=null, to=null){
  const rangeFrom = from || new Date(Date.now()-7*86400000).toISOString().slice(0,10);
  const rangeTo = to || new Date().toISOString().slice(0,10);

  const isAll = projectId === "__ALL__";
  const p = isAll ? null : projectById(projectId);
  if(!isAll && !p) return;

  const diary = aliveArr(state.diary)
    .filter(d=>d.projectId===projectId && isAlive(d))
    .filter(d=>d.date>=rangeFrom && d.date<=rangeTo)
    .filter(d=>d.billable)
    .sort((a,b)=>(a.date||"").localeCompare(b.date||""));

  const totalBillableHours = diary.reduce((s,d)=> s + Number(d.hours || 0), 0);
  const labourHours = diary.filter(d=> (d.category||'')==='Labour').reduce((s,d)=> s + Number(d.hours || 0), 0);


  // Summarise into line items by category
  const lines = {};
  for(const d of diary){
    const cat = d.category || "Other";
    if(!lines[cat]) lines[cat] = { hours:0, amount:0, notes:[] };
    const hrs = Number(d.hours || 0);
    const rate = d.rate ? Number(d.rate) : (cat==="Labour" ? Number(settings.labourRate||0) : 0);
    lines[cat].hours += hrs;
    // amount: if materials/travel etc and no hours, interpret d.rate as amount if provided
    if(cat==="Labour"){
      lines[cat].amount += hrs * rate;
    }else{
      const amt = d.rate ? Number(d.rate) : 0;
      lines[cat].amount += amt;
    }
    if(d.summary) lines[cat].notes.push(d.summary);
  }

  const outLines = Object.entries(lines).map(([cat,v])=>{
    if(cat==="Labour"){
      return `${settings.companyName} – ${p.name}\n${cat} (${v.hours.toFixed(2)} hrs)    ${money(v.amount)}`;
    }
    return `${cat}    ${money(v.amount)}`;
  });

  
// Labour: break down hours by day (requested for Hnry)
const labourByDay = {};
for(const d of diary){
  if((d.category||"")!=="Labour") continue;
  const day = (d.date||"").slice(0,10);
  if(!labourByDay[day]) labourByDay[day] = { hours:0, amount:0, notes:[] };
  const hrs = Number(d.hours||0);
  const rate = d.rate ? Number(d.rate) : Number(settings.labourRate||0);
  labourByDay[day].hours += hrs;
  labourByDay[day].amount += hrs * rate;
  if(d.summary) labourByDay[day].notes.push(d.summary);
}

const total = Object.values(lines).reduce((s,v)=> s + (v.amount||0), 0);

  const block = [
    settings.companyName,
    `Project: ${isAll ? "All active sites" : p.name}`,
    isAll ? "" : (isAll ? "" : (p.address ? `Address: ${p.address}` : "")),
    `Period: ${rangeFrom} to ${rangeTo}`,
    "",
    ...(Object.keys(labourByDay).length ? ["Labour (hours by day):", ...Object.entries(labourByDay).sort((a,b)=>a[0].localeCompare(b[0])).map(([day,v])=>`  ${day}  ${v.hours.toFixed(2)} hrs    ${money(v.amount)}`), ""] : []),
    "",
    ...(Object.keys(labourByDay).length ? ["Labour (hours by day):", ...Object.entries(labourByDay).sort((a,b)=>a[0].localeCompare(b[0])).map(([day,v])=>`  ${day}  ${v.hours.toFixed(2)} hrs    ${money(v.amount)}`), ""] : []),
    "",
    ...Object.entries(lines).map(([cat,v])=>{
      if(cat==="Labour") return `Site labour – ${isAll ? "All sites" : p.name} (see daily breakdown below)    ${money(v.amount)}`;
      return `${cat}    ${money(v.amount)}`;
    }),
    "",
    `Total billable hours:    ${totalBillableHours.toFixed(2)} h`,
    `Labour hours:    ${labourHours.toFixed(2)} h`,
    `Total (ex GST):    ${money(total)}`
  ].filter(Boolean).join("\n");

  showModal(`
    <div class="row space">
      <h2>Hnry Invoice Export</h2>
      <div class="row">
        <button class="btn" id="copyH" type="button">Copy</button>
        <button class="btn" id="closeM" type="button">Close</button>
      </div>
    </div>
    <div class="sub">Copy/paste into Hnry invoice line items. Uses billable diary entries only.</div>
    <hr/>
    <textarea class="input" id="hnryBlock" style="min-height:260px">${escapeHtml(block)}</textarea>
    <div class="smallmuted">Billable hours: <strong>${totalBillableHours.toFixed(2)}h</strong> (Labour: ${labourHours.toFixed(2)}h). Tip: set your default labour rate in Settings.</div>
  `);
  $("#closeM").onclick = closeModal;
  $("#copyH").onclick = async ()=>{
    try{
      await navigator.clipboard.writeText(block);
      alert("Copied.");
    }catch(e){
      alert("Copy failed.");
    }
  };
}

// ----------------- Settings -----------------
function renderSettings(app){
  setHeader("Settings");
  app.innerHTML = `
    <div class="grid two">
      <div class="card">
        <div class="h">Google Sync</div>
        <button id="settingsSyncBtn" type="button" class="btn primary" style="width:100%;margin-top:8px">Sync now</button>
        <button id="settingsDownloadOnlyBtn" type="button" class="btn" style="width:100%;margin-top:8px">Download only</button>
        <div id="settingsSyncStatus" class="small" style="margin-top:8px;opacity:.8">Last synced: Never</div>
      </div>

      <div class="card">
        <h2>Appearance</h2>
        <label>Theme</label>
        <select id="set_theme" class="input">
          <option value="dark" ${settings.theme==="dark"?"selected":""}>Dark (default)</option>
          <option value="light" ${settings.theme==="light"?"selected":""}>Light</option>
        </select>
        <hr/>
        <h2>Business</h2>
        <label>Company name</label>
        <input id="set_company" class="input" value="${escapeHtml(settings.companyName||"")}" />
        <label>Default labour rate (NZD/hr)</label>
        <input id="set_rate" class="input" type="number" step="0.01" value="${escapeHtml(String(settings.labourRate||""))}" />
        <div class="smallmuted">Logo is loaded from the root file: <strong>./logo.png</strong></div>
        <hr/>
        <button class="btn primary" id="saveSettings" type="button">Save settings</button>
      </div>
      <div class="card">
        <h2>Data</h2>
        <div class="sub">
          This app stores everything locally on your device (localStorage).<br/>
          Use Export/Import in the header for backups or moving phones.
        </div>
        <hr/>
        <button class="btn danger" id="wipeBtn" type="button">Wipe all data</button>
      </div>
    
      <hr/>
      <div class="h">Deleted Jobs</div>
      <div id="deletedProjects" class="list" style="margin-top:8px"></div>
</div>
  `;

  // Google Sync (Settings)
  if(document.getElementById("settingsSyncBtn")){
    document.getElementById("settingsSyncStatus").textContent = "Last synced: " + formatLastSync();
    document.getElementById("settingsSyncBtn").onclick = syncNowSettings;
    const dlBtn = document.getElementById("settingsDownloadOnlyBtn");
    if(dlBtn) dlBtn.onclick = downloadOnlySettings;
  }
  $("#saveSettings").onclick = ()=>{
    settings.theme = $("#set_theme").value;
    settings.companyName = $("#set_company").value.trim() || "Matty Campbell Building";
    settings.labourRate = Number($("#set_rate").value || 0);
    saveSettings(settings);
    applyTheme();
    alert("Saved.");
  };
  $("#wipeBtn").onclick = ()=>{
    if(confirm("Wipe ALL app data? This can't be undone.")){
      state = defaults();
      saveState(state);
      alert("Wiped.");
      navTo("projects");
    }
  };
  setTimeout(()=>{ try{ renderDeletedProjectsUI(); }catch(e){} }, 0);
}


// ----------------- Demo data -----------------
function loadDemo(){
  if(alive(state.projects).length) {
    if(!confirm("Load demo data (this will add demo records). Continue?")) return;
  }
  const pid = uid();
  state.projects.unshift({
    id: pid,
    name: "14 Kowhai Road Renovation",
    address: "14 Kowhai Road, Auckland, New Zealand",
    clientName: "Client Example",
    clientPhone: "0210000000",
    notes: "Gate code 1234. Watch the dog. Power in garage.",
    lat: -36.8485,
    lng: 174.7633,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const sid = uid();
  state.subbies.unshift({ id:sid, name:"Sparkies Ltd", trade:"Electrician", phone:"0211111111", email:"spark@example.com", notes:"Prefers Fridays", createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() });
  state.tasks.unshift({ id:uid(), projectId:pid, title:"Book pre-line inspection", details:"Call council", status:"To do", dueDate:new Date(Date.now()+3*86400000).toISOString().slice(0,10), assignedSubbieId:null, photos:[], createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() });
  state.diary.unshift({ id:uid(), projectId:pid, date:new Date().toISOString().slice(0,10), summary:"Framing progress in lounge + checked bracing fixings.", hours:"7.5", billable:true, category:"Labour", rate:"", photos:[], createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() });
  state.variations.unshift({ id:uid(), projectId:pid, date:new Date().toISOString().slice(0,10), title:"Extra LVL beam", description:"Client requested opening widening; requires LVL + extra labour.", amount:"480", status:"Sent", photos:[], createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() });
  state.deliveries.unshift({ id:uid(), projectId:pid, supplier:"PlaceMakers", date:new Date().toISOString().slice(0,10), status:"Expected", items:"Timber pack + fixings", dropPoint:"Driveway", notes:"Call ahead", photos:[], createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() });
  state.inspections.unshift({ id:uid(), projectId:pid, type:"Pre-line", date:new Date(Date.now()+2*86400000).toISOString().slice(0,10), result:"Booked", inspector:"", notes:"Ensure smoke alarms locations confirmed", photos:[], createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() });
  saveState(state);
  render(); try{renderDeletedProjectsUI();}catch(e){}
}


/* ===== SETTINGS SYNC V2 ===== */
const SYNC_URL = "https://script.google.com/macros/s/AKfycbxv124HyhBW30KW9lCkrj1zs6O2v-o-vx-vX7mkuzmIfP-ZkakalSRXrfTNOXvteMlhxQ/exec";
const SYNC_KEY = "IsabellaHopeCampbell";
function getLastSync(){ return localStorage.getItem("mcb_lastSync") || ""; }
function setLastSync(v){ localStorage.setItem("mcb_lastSync", v || new Date().toISOString()); }
function formatLastSync(){ const v=getLastSync(); if(!v) return "Never"; const d=new Date(v); return isNaN(d)? "Never" : d.toLocaleString(); }

async function syncNowSettings(){
  const btn = document.getElementById("settingsSyncBtn");
  const status = document.getElementById("settingsSyncStatus");
  try {
    if(btn) btn.disabled = true;
    if(btn) btn.textContent = "Syncing…";
    if(status) status.textContent = "Syncing…";

    await fetch(SYNC_URL, {
      method:"POST",
      body:JSON.stringify({
        key: SYNC_KEY,
        action:"push",
        changes:{
          Projects:state.projects||[],
          Tasks:state.tasks||[],
          Diary:state.diary||[],
          Deliveries:state.deliveries||[],
          Inspections:state.inspections||[],
          Variations:state.variations||[],
          Subbies:state.subbies||[]
        }
      })
    });

    const pull = await fetch(SYNC_URL, {
      method:"POST",
      body:JSON.stringify({
        key: SYNC_KEY,
        action:"pull",
        lastSync:getLastSync()
      })
    }).then(async r=>{ const t = await r.text(); try { return JSON.parse(t);} catch(e){ throw new Error("Non-JSON response: "+t.slice(0,200)); } });

    if(pull?.data){
      if(pull.data.Projects) state.projects = mergeById(state.projects, pull.data.Projects);
      if(pull.data.Tasks) state.tasks = mergeById(state.tasks, pull.data.Tasks);
      if(pull.data.Diary) state.diary = mergeById(state.diary, pull.data.Diary);
      if(pull.data.Deliveries) state.deliveries = mergeById(state.deliveries, pull.data.Deliveries);
      if(pull.data.Inspections) state.inspections = mergeById(state.inspections, pull.data.Inspections);
      if(pull.data.Variations) state.variations = mergeById(state.variations, pull.data.Variations);
      if(pull.data.Subbies) state.subbies = mergeById(state.subbies, pull.data.Subbies);
      await saveState(state);
    }
    setLastSync(pull?.serverTime || new Date().toISOString());
  } catch(e) {
    console.error(e);
    alert("Sync failed. Check your Apps Script deployment access (Anyone) and try again.");
  } finally {
    if(btn) btn.disabled = false;
    if(btn) btn.textContent = "Sync now";
    if(status) status.textContent = "Last synced: " + formatLastSync();
  }
}
/* ===== END SETTINGS SYNC V2 ===== */


// ===== SAFE MERGE (prevents data loss) =====
function mergeById(local = [], remote = []) {
  const map = new Map();

  (local || []).forEach(item => {
    if (item && item.id) map.set(item.id, item);
  });

  (remote || []).forEach(item => {
    if (!item || !item.id) return;
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, item);
    } else {
      const lt = new Date(existing.updatedAt || 0).getTime();
      const rt = new Date(item.updatedAt || 0).getTime();
      if(item.deletedAt){ map.set(item.id, item); return; }
      if(item.deletedAt){ map.set(item.id, item); return; }
      map.set(item.id, rt > lt ? item : existing);
    }
  });

  return Array.from(map.values());
}


/* ===== SUBBIES PROJECTID MIGRATION ===== */
(function normalizeSubbiesProjectId(){
  // Ensure the field exists so sync can round-trip it.
  // We do NOT guess projectId for older subbies because they were historically shared.
  if(!state || !Array.isArray(state.subbies)) return;
  let changed = false;
  state.subbies = alive(state.subbies).filter(isAlive).map(s => {
    if(s && typeof s.projectId === "undefined"){
      changed = true;
      return { ...s, projectId: "" };
    }
    return s;
  });
  if(changed) saveState(state);
})();
/* ===== END SUBBIES PROJECTID MIGRATION ===== */



// ===== SOFT DELETE (sync-safe) =====
function softDeleteById(arr, id){
  const now = new Date().toISOString();
  try{ if(typeof window.render==='function'){ setTimeout(()=>window.render(),0); } }catch(e){}
  return (arr||[]).map(item => {
    if(item && item.id === id){
      return { ...item, deletedAt: now, updatedAt: now };
    }
    return item;
  });
}
function softDeleteWhere(arr, predicate){
  const now = new Date().toISOString();
  return (arr||[]).map(item => {
    if(item && predicate(item)){
      return { ...item, deletedAt: now, updatedAt: now };
    }
    return item;
  });
}
function isAlive(x){ return x && !x.deletedAt; }
function aliveArr(arr){ return (arr||[]).filter(isAlive); }

function alive(arr){ return (arr||[]).filter(isAlive); }


/* ===== PHASE1_PHOTOS_CHECKBOX ===== */
function photosFlagFromCheckbox(id){
  const el=document.getElementById(id);
  return el && el.checked ? "true" : "";
}

/* ===== PHASE1_UNDELETE ===== */
function renderDeletedProjectsUI(){
  const box=document.getElementById("deletedProjects");
  if(!box) return;
  const deleted=(state.projects||[]).filter(p=>p.deletedAt);
  box.innerHTML = deleted.length ? deleted.map(p=>`
    <div class="row">
      <strong>${p.name||p.address||"Site"}</strong>
      <button onclick="restoreProject('${p.id}')">Restore</button>
    </div>
  `).join("") : "<em>No deleted sites</em>";
}
function restoreProject(id){
  const now=new Date().toISOString();
  state.projects=state.projects.map(p=>p.id===id?{...p,deletedAt:null,updatedAt:now}:p);
  saveState(state); render(); try{renderDeletedProjectsUI();}catch(e){}
}

/* ===== PHASE1_TASK_FILTERS ===== */
let taskFilterSite="all", taskFilterStatus="all";
function filteredTasks(){
  return (state.tasks||[])
    .filter(t=>!t.deletedAt)
    .filter(t=>taskFilterSite==="all"||t.projectId===taskFilterSite)
    .filter(t=>taskFilterStatus==="all"||t.status===taskFilterStatus);
}

// ===== FORCE_PHOTOS_LABEL =====
function injectPhotosLabel(){
  document.querySelectorAll('input[type="checkbox"][data-photos]').forEach(cb=>{
    if(!cb.parentElement.querySelector('.photos-taken-label')){
      const span=document.createElement('span');
      span.className='photos-taken-label';
      span.innerHTML='Photos taken';
      cb.after(span);
    }
  });
}
// call after every render
const _render = render;
render = function(){
  _render();
  injectPhotosLabel();
};


// ===== PHASE 2: Print modal only (no page behind) =====
function printModalOnly(title="Report"){
  const modal = document.getElementById("modal");
  if(!modal) { window.print(); return; }
  const content = modal.innerHTML || "";
  const w = window.open("", "_blank");
  if(!w){ alert("Pop-up blocked. Allow pop-ups to print."); return; }
  const css = `
    <style>
      body{font-family:system-ui,-apple-system,BlinkMacSystemFont; padding:18px;}
      img{max-width:220px;height:auto}
      table{width:100%;border-collapse:collapse;margin-top:10px}
      th,td{border:1px solid #ddd;padding:6px;font-size:12px;vertical-align:top}
      th{background:#f5f5f5}
      button{display:none !important}
      .btn{display:none !important}
      .noPrint{display:none !important}
      .card{box-shadow:none !important;border:0 !important}
      @page{margin:12mm}
    </style>`;
  w.document.open();
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>${title}</title>${css}</head><body>${content}</body></html>`);
  w.document.close();
  w.focus();
  // Give images time to load (logo)
  setTimeout(()=>{ w.print(); }, 400);
}
// ===== END PHASE 2 =====



// ===== HNRY SIMPLE DIARY EXPORT (ACTIVE JOBS ONLY) =====
function formatDateNZ(iso){
  if(!iso) return "";
  const [y,m,d] = iso.slice(0,10).split("-");
  return `${d}/${m}/${y}`;
}

function runHnryDiaryExportSimple(projectId, from, to){
  const rangeFrom = from || new Date(Date.now()-7*86400000).toISOString().slice(0,10);
  const rangeTo   = to   || new Date().toISOString().slice(0,10);

  const activeProjects = aliveArr(state.projects).filter(p=>!p.deletedAt);
  const activeIds = activeProjects.map(p=>p.id);

  const diary = aliveArr(state.diary)
    .filter(d=>!d.deletedAt)
    .filter(d=>Number(d.hours||0)>0)
    .filter(d=>(d.date||"")>=rangeFrom && (d.date||"")<=rangeTo)
    .filter(d=> projectId==="__ALL__" ? activeIds.includes(d.projectId) : d.projectId===projectId)
    .sort((a,b)=>(a.date||"").localeCompare(b.date||""));

  const byDate = {};
  for(const d of diary){
    const day = (d.date||"").slice(0,10);
    if(!byDate[day]) byDate[day]=[];
    byDate[day].push(d);
  }

  let grandTotal = 0;
  const lines = [];
  lines.push("HNRY DIARY EXPORT");
  lines.push(`Period: ${rangeFrom} to ${rangeTo}`);
  lines.push("");

  Object.keys(byDate).sort().forEach(day=>{
    lines.push(formatDateNZ(day));
    let dailyTotal = 0;
    for(const d of byDate[day]){
      const proj = activeProjects.find(p=>p.id===d.projectId);
      if(!proj) continue;
      const hrs = Number(d.hours||0);
      dailyTotal += hrs;
      lines.push(`  ${proj.name} - ${hrs.toFixed(2)} hrs`);
    }
    lines.push(`  Daily total: ${dailyTotal.toFixed(2)} hrs`);
    lines.push("");
    grandTotal += dailyTotal;
  });

  lines.push("--------------------------------");
  lines.push(`TOTAL HOURS: ${grandTotal.toFixed(2)}`);

  const out = lines.join("\n");

  showModal(
    '<pre style="white-space:pre-wrap;font-size:13px">' + out + '</pre>' +
    '<button class="btn" id="copyH">Copy to clipboard</button>'
  );
  const c = document.getElementById("copyH");
  if(c){
    c.onclick = ()=>{
      navigator.clipboard.writeText(out);
      toast("Copied");
    };
  }
}


async function downloadOnlySettings(){
  const btn = document.getElementById("settingsDownloadOnlyBtn");
  const status = document.getElementById("settingsSyncStatus");
  try{
    if(btn) btn.disabled = true;
    if(status) status.textContent = "Downloading…";

    const resp = await fetch(SYNC_URL, {
      method:"POST",
      headers: {"Content-Type":"text/plain;charset=utf-8"},
      body: JSON.stringify({ key: SYNC_KEY, action:"pull",
        lastSync:null,
        full:true })
    });

    const text = await resp.text();
    let json;
    try{ json = JSON.parse(text); }
    catch(e){ throw new Error("Non-JSON response: " + text.slice(0,200)); }
    if(json.error) throw new Error(json.error);

    const data = json.data || json.payload || json;
    const pick = (name)=> data?.[name] ?? data?.[name.toLowerCase()] ?? data?.[name.toUpperCase()] ?? null;

    let updated = 0;
    const p = pick("Projects"); if(Array.isArray(p)){ state.projects = p; updated++; }
    const t = pick("Tasks"); if(Array.isArray(t)){ state.tasks = t; updated++; }
    const d = pick("Diary"); if(Array.isArray(d)){ state.diary = d; updated++; }
    const del = pick("Deliveries"); if(Array.isArray(del)){ state.deliveries = del; updated++; }
    const ins = pick("Inspections"); if(Array.isArray(ins)){ state.inspections = ins; updated++; }
    const v = pick("Variations"); if(Array.isArray(v)){ state.variations = v; updated++; }
    const s = pick("Subbies"); if(Array.isArray(s)){ state.subbies = s; updated++; }

    if(updated === 0){
      const keys = data ? Object.keys(data).slice(0,60).join(", ") : "(no data object)";
      throw new Error("Pull returned no tables. Keys: " + keys);
    }

    await saveState(state);
    setLastSync(json.serverTime || data.serverTime || new Date().toISOString());
    alert("Download complete ("+updated+" tables). Reloading…");
    setTimeout(()=>location.reload(), 120);
  }catch(err){
    console.error(err);
    alert("Download failed: " + (err && err.message ? err.message : err));
  }finally{
    if(btn) btn.disabled = false;
    if(status) status.textContent = "Last synced: " + formatLastSync();
  }
}
function toastSuccess(msg){ toast(msg); }
function toastError(msg){ toast(msg); }
