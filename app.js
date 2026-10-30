// ====== Indsæt din egen Firebase-konfiguration her (se VEJLEDNING.md) ======
const firebaseConfig = {
  apiKey: "AIzaSyBVp36GLYiwavTkXqJKxQYzKQRGa7OchXs",
  authDomain: "tastetest-28299.firebaseapp.com",
  projectId: "tastetest-28299",
  storageBucket: "tastetest-28299.firebasestorage.app",
  messagingSenderId: "585241871199",
  appId: "1:585241871199:web:e1ef660b939fb163576cea"
};
// ===========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CATS = [
  {id:"bobler", label:"Bobler", sub:"I stedet for champagne og cava, til velkomst og kl. 12"},
  {id:"hvid", label:"Hvid", sub:"I stedet for hvidvin, til maden"},
  {id:"roed", label:"Rød", sub:"I stedet for rødvin, til maden"},
  {id:"dessert", label:"Dessert", sub:"I stedet for dessertvin, til risalamanden"},
  {id:"varm", label:"Varm", sub:"I stedet for gløgg"},
  {id:"mocktail", label:"Mocktails", sub:"Hen over aftenen"}
];
const ITEMS = [
  {id:"b1",cat:"bobler",name:"Mousserende hvid druesaft",desc:"Det, der ligner champagne mest i glasset. Findes i de fleste supermarkeder op til jul."},
  {id:"b2",cat:"bobler",name:"Mousserende rød eller rosé druesaft",desc:"Lidt sødere og mere bærpræget."},
  {id:"b3",cat:"bobler",name:"Mousserende æblemost",desc:"Friskere og mindre sød end druesaft."},
  {id:"b4",cat:"bobler",name:"Mousserende hyldeblomstdrik",desc:"Blomstret og let, god til velkomstdrinken."},
  {id:"b5",cat:"bobler",name:"Danskvand med hyldeblomstsaft",desc:"Det billige hjemmelavede bud.",how:"Ca. 1 del saft til 6 dele danskvand, en tynd skive citron."},
  {id:"h1",cat:"hvid",name:"Tør æblemost (én sort)",desc:"F.eks. Ingrid Marie eller Belle de Boskoop. Passer til sild, fisk og and."},
  {id:"h2",cat:"hvid",name:"Hvid druesaft med danskvand",desc:"Druesaft alene er sød; fortyndet bliver den mere vinagtig.",how:"Halvt druesaft, halvt danskvand, evt. et skvæt citron."},
  {id:"h3",cat:"hvid",name:"Pæremost",desc:"Blødere og rundere end æblemost."},
  {id:"h4",cat:"hvid",name:"Rabarbermost eller -drik",desc:"Syrlig og frisk, skærer gennem fed mad."},
  {id:"r1",cat:"roed",name:"Rød druesaft med citron",desc:"Den nemmeste vej til noget rødvinsagtigt.",how:"2 dele rød druesaft, 1 del danskvand, et skvæt citron."},
  {id:"r2",cat:"roed",name:"Aroniamost",desc:"Tør og lidt snerpende, minder mest om rødvinens garvesyre."},
  {id:"r3",cat:"roed",name:"Solbærmost",desc:"Syrlig og kraftig, god til flæskesteg og and."},
  {id:"r4",cat:"roed",name:"Kirsebærmost",desc:"Mørk og frugtig."},
  {id:"d1",cat:"dessert",name:"Kirsebærsaft (koncentreret)",desc:"Lille glas, ufortyndet eller næsten. Passer til kirsebærsovsen."},
  {id:"d2",cat:"dessert",name:"Hyldebærsaft",desc:"Dyb og krydret sødme."},
  {id:"d3",cat:"dessert",name:"Solbærsaft, let fortyndet",desc:"Mere syre, så den ikke bliver for tung."},
  {id:"v1",cat:"varm",name:"Hjemmelavet solbær-gløgg",desc:"Den klassiske smag uden noget gæret.",how:"1 l solbærsaft (fortyndet), 1 stang kanel, 6 nelliker, 5 kardemommekapsler, 1 stjerneanis, skal af ½ appelsin. Varm op uden at koge, træk 20 min. Rosiner og mandler i."},
  {id:"v2",cat:"varm",name:"Druesaft-gløgg",desc:"Rød druesaft med de samme krydderier. Sødere og rundere."},
  {id:"v3",cat:"varm",name:"Varm æblemost med kanel",desc:"Mildere end gløgg.",how:"Varm most med kanelstang, et par nelliker og en skive appelsin."},
  {id:"m1",cat:"mocktail",name:"Hyldeblomst-fizz",desc:"Frisk og let.",how:"3 cl hyldeblomstsaft, lime, et par myntblade, is, top med danskvand."},
  {id:"m2",cat:"mocktail",name:"Granatæble og rosmarin",desc:"Flot dyb rød farve til nytår.",how:"Halvt glas granatæblejuice, top med danskvand, en kvist rosmarin."},
  {id:"m3",cat:"mocktail",name:"Virgin mojito",desc:"Lime, mynte og rørsukker.",how:"Mos ½ lime og mynte med 2 tsk rørsukker, knust is, top med danskvand."},
  {id:"m4",cat:"mocktail",name:"Tranebær og appelsin",desc:"Julet og syrlig.",how:"Lige dele tranebærjuice og appelsinjuice, top med danskvand."},
  {id:"m5",cat:"mocktail",name:"Ingefær-fizz",desc:"Hjemmelavet, så ingen gæring.",how:"Ingefærsirup (revet ingefær kogt med sukker og vand), lime, top med danskvand."}
];

const LS_KEY = "smagsproever-v1";
let state = {entries:{}, custom:[], kategorier:[], navne:{}};
let docRef = null;
let current = "bobler";
let editing = false; // "Rediger" er slået til, og fanernes navne kan ændres
let deleting = false; // "Slet" er slået til, og et tryk på en fane sletter kategorien
const NY = "ny-kategori"; // fanen, hvor man opretter en ny kategori

const $ = s => document.querySelector(s);
// De faste kategoriers navne kan ændres; de nye navne gemmes i state.navne.
// Slettede faste kategorier står i state.kategorier som {id, skjult:true}.
const allCats = () => {
  const k = state.kategorier || [];
  const skjult = id => k.some(x=>x.id===id && x.skjult);
  return CATS.filter(c=>!skjult(c.id))
    .map(c=>state.navne && state.navne[c.id] ? Object.assign({}, c, {label:state.navne[c.id]}) : c)
    .concat(k.filter(x=>!x.skjult));
};
// Faste drikke, der er fjernet, markeres med removed:true i entries (så Firestore-reglerne ikke skal ændres)
const allItems = () => ITEMS.filter(i=>!entry(i.id).removed).concat(state.custom || []);
const entry = id => (state.entries && state.entries[id]) || {};

function setSync(t){ $("#sync").textContent = t; }

function loadLocal(){
  try{ const raw = localStorage.getItem(LS_KEY); if(raw) state = Object.assign({entries:{},custom:[],kategorier:[],navne:{}}, JSON.parse(raw)); }catch(e){}
}
function saveLocal(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(state)); }catch(e){} }

let writing = Promise.resolve(), pending = false, timer = null;
function persist(delay=0){
  saveLocal();
  if(!docRef) return;
  clearTimeout(timer);
  timer = setTimeout(()=>{
    if(pending) return;
    pending = true;
    writing = writing.then(()=>setDoc(docRef, {entries:state.entries, custom:state.custom, kategorier:state.kategorier||[], navne:state.navne||{}}))
      .then(()=>setSync("Gemt, og synkroniseret mellem jeres telefoner."))
      .catch(e=>setSync(e && e.code==="permission-denied" ? "Databasen afviste gemningen. Tjek koden og reglerne i Firebase." : "Kunne ikke gemme online lige nu. Gemt på denne enhed."))
      .finally(()=>{pending=false;});
  }, delay);
}

function update(id, patch, delay=0){
  state.entries = state.entries || {};
  state.entries[id] = Object.assign({}, entry(id), patch);
  persist(delay);
}

// Standard eller witchy mode. Valget huskes på enheden; index.html sætter data-vibe, før siden tegnes.
const VIBE_KEY = "smagsproever-vibe";
const isWitchy = () => document.documentElement.dataset.vibe === "witchy";
const VIBES = {
  std:   {btn:"Switch to witchy mode",   icon:"🥂", color:"#2F5249", unit:"hjerter"},
  witchy:{btn:"Switch to standard mode", icon:"🔮", color:"#3B2756", unit:"eliksirer"}
};
function applyVibe(){
  const v = VIBES[isWitchy() ? "witchy" : "std"];
  $("#vibe").textContent = v.btn;
  $("#favicon").href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">'+v.icon+'</text></svg>';
  document.querySelector('meta[name="theme-color"]').content = v.color;
}
$("#vibe").onclick = ()=>{
  if(isWitchy()) delete document.documentElement.dataset.vibe; else document.documentElement.dataset.vibe = "witchy";
  try{ localStorage.setItem(VIBE_KEY, isWitchy() ? "witchy" : "std"); }catch(e){}
  applyVibe(); render();
};

// Lys/mørk. Uden et valg følger siden telefonens indstilling; index.html sætter data-theme, før siden tegnes.
const THEME_KEY = "smagsproever-theme";
const systemDark = matchMedia("(prefers-color-scheme: dark)");
const isDark = () => document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : systemDark.matches;
function applyTheme(){ $("#theme").textContent = isDark() ? "Light mode" : "Dark mode"; }
$("#theme").onclick = ()=>{
  document.documentElement.dataset.theme = isDark() ? "light" : "dark";
  try{ localStorage.setItem(THEME_KEY, document.documentElement.dataset.theme); }catch(e){}
  applyTheme();
};
systemDark.addEventListener("change", applyTheme);
applyTheme();

const heartSvgStd = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.5c2.1 0 3.6 1.2 4.4 2.5.8-1.3 2.3-2.5 4.4-2.5 3.7 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z"/></svg>';
// En lille eliksirflaske med prop og to bobler (boblerne er huller i formen)
const potionSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M9 1.5h6v2.2h-1v4.6a7 7 0 1 1-4 0V3.7H9z M9.3 15.2a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0-2.6 0z M13.4 18.2a.85.85 0 1 0 1.7 0a.85.85 0 1 0-1.7 0z"/></svg>';
const heartSvg = () => isWitchy() ? potionSvg : heartSvgStd;
const checkSvg = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M3 8.5l3.2 3L13 4.5"/></svg>';

function renderMenu(){
  const dl = $("#menu"); dl.innerHTML = "";
  allCats().forEach(c=>{
    const top = allItems().filter(i=>i.cat===c.id && (entry(i.id).rating||0)>0)
      .sort((a,b)=>(entry(b.id).rating||0)-(entry(a.id).rating||0)).slice(0,3);
    const dt = document.createElement("dt"); dt.textContent = c.label;
    const dd = document.createElement("dd");
    if(top.length){
      const ol = document.createElement("ol");
      top.forEach(i=>{
        const li = document.createElement("li");
        const s = document.createElement("span"); s.className = "score"; s.innerHTML = heartSvg(); s.append(entry(i.id).rating);
        li.append(i.name, s);
        ol.append(li);
      });
      dd.append(ol);
    }
    else { dd.textContent = "Ikke bedømt endnu"; dd.className = "empty"; }
    dl.append(dt, dd);
  });
}

function rename(c, label){
  label = label.trim();
  if(c.custom){
    const k = state.kategorier.find(k=>k.id===c.id);
    if(k && label) k.label = label;
  } else {
    state.navne = state.navne || {};
    const orig = CATS.find(x=>x.id===c.id).label;
    if(!label || label===orig) delete state.navne[c.id]; else state.navne[c.id] = label;
  }
}

function renderTabs(){
  const nav = $("#tabs");
  const active = document.activeElement;
  if(editing && active && active.tagName==="INPUT" && nav.contains(active)) return; // don't wipe a name being typed
  nav.innerHTML = "";
  if(!editing && !deleting){
    const ny = document.createElement("button");
    ny.className = "tab ny"; ny.type = "button";
    ny.setAttribute("aria-pressed", current===NY);
    ny.textContent = "+ Ny kategori";
    ny.onclick = ()=>{ current = NY; history.replaceState(null,"","#"+NY); render(); $("#ny-navn").focus(); };
    nav.append(ny);
  }
  allCats().forEach(c=>{
    if(editing){
      const inp = document.createElement("input");
      inp.className = "tab edit"; inp.type = "text"; inp.value = c.label;
      inp.size = Math.max(4, c.label.length + 1);
      inp.setAttribute("aria-label", "Nyt navn til "+c.label);
      inp.oninput = ()=>{ inp.size = Math.max(4, inp.value.length + 1); rename(c, inp.value); persist(800); renderMenu(); };
      inp.onkeydown = e=>{ if(e.key==="Enter") inp.blur(); };
      nav.append(inp);
      return;
    }
    const items = allItems().filter(i=>i.cat===c.id);
    const tried = items.filter(i=>entry(i.id).tried).length;
    const b = document.createElement("button");
    b.className = "tab"; b.type = "button";
    if(deleting){
      b.classList.add("slet");
      b.textContent = "✕ " + c.label;
      b.setAttribute("aria-label", "Slet kategorien "+c.label);
      b.onclick = ()=>removeCat(c);
      nav.append(b);
      return;
    }
    b.setAttribute("aria-pressed", c.id===current);
    b.innerHTML = "";
    b.append(c.label);
    const n = document.createElement("span"); n.className="n"; n.textContent = tried+"/"+items.length;
    b.append(n);
    b.onclick = ()=>{ current = c.id; if(location.hash!=="#"+c.id) history.replaceState(null,"","#"+c.id); render(); };
    nav.append(b);
  });
  if(!deleting){
    const red = document.createElement("button");
    red.className = "tab rediger"; red.type = "button";
    red.setAttribute("aria-pressed", editing);
    red.textContent = editing ? "Færdig" : "Rediger";
    red.onclick = ()=>{ editing = !editing; render(); };
    nav.append(red);
  }
  if(!editing){
    const sl = document.createElement("button");
    sl.className = "tab rediger"; sl.type = "button";
    sl.setAttribute("aria-pressed", deleting);
    sl.textContent = deleting ? "Færdig" : "Slet";
    sl.onclick = ()=>{ deleting = !deleting; render(); };
    nav.append(sl);
  }
}

function renderNewCat(main){
  const head = document.createElement("div"); head.className="cat-head";
  head.innerHTML = '<h2>Ny kategori</h2><p>F.eks. "Til kaffen" eller "Nytårsaften kl. 12"</p>';
  main.append(head);
  const form = document.createElement("form"); form.className="add stack";
  form.innerHTML = '<input type="text" id="ny-navn" placeholder="Navn, f.eks. Til osten" aria-label="Navn på kategorien">'
    + '<input type="text" id="ny-sub" placeholder="Beskrivelse (kan springes over)" aria-label="Kort beskrivelse">'
    + '<button class="btn" type="submit">Opret kategori</button>';
  form.onsubmit = ev=>{
    ev.preventDefault();
    const label = $("#ny-navn").value.trim(); if(!label) return;
    const c = {id:"k"+Date.now().toString(36), label, sub:$("#ny-sub").value.trim(), custom:true};
    state.kategorier = (state.kategorier||[]).concat(c);
    current = c.id; history.replaceState(null,"","#"+c.id);
    persist(); render();
  };
  main.append(form);
}

function removeCat(c){
  if(!confirm('Slet kategorien "'+c.label+'" og alle drikke i den?')) return;
  const ids = (state.custom||[]).filter(i=>i.cat===c.id).map(i=>i.id);
  state.custom = (state.custom||[]).filter(i=>i.cat!==c.id);
  ids.forEach(id=>{ delete state.entries[id]; });
  state.kategorier = (state.kategorier||[]).filter(k=>k.id!==c.id);
  if(!c.custom) state.kategorier.push({id:c.id, skjult:true});
  if(current===c.id || !allCats().some(x=>x.id===current)){
    current = allCats().length ? allCats()[0].id : NY;
    history.replaceState(null,"","#"+current);
  }
  persist(); render();
}

function renderList(){
  const main = $("#list");
  const active = document.activeElement;
  if(active && active.classList.contains("note")) return; // don't wipe a note being typed
  main.innerHTML = "";
  if(current===NY){ renderNewCat(main); return; }
  const cat = allCats().find(c=>c.id===current) || allCats()[0];
  if(!cat){ current = NY; renderNewCat(main); return; }
  current = cat.id;
  const head = document.createElement("div"); head.className="cat-head";
  head.innerHTML = '<h2></h2><p></p>';
  head.querySelector("h2").textContent = cat.label;
  head.querySelector("p").textContent = cat.sub;
  main.append(head);

  const onlyUntried = $("#f-untried").checked, onlyFav = $("#f-fav").checked;
  const items = allItems().filter(i=>i.cat===current)
    .filter(i=>!onlyUntried || !entry(i.id).tried)
    .filter(i=>!onlyFav || (entry(i.id).rating||0)>=8);

  if(!items.length){
    const p = document.createElement("p"); p.className="empty-state";
    p.textContent = onlyUntried||onlyFav ? "Intet matcher filtrene. Slå dem fra for at se hele kategorien." : "Ingen drikke her endnu. Tilføj en nedenfor.";
    main.append(p);
  }

  items.forEach(i=>{
    const e = entry(i.id);
    const card = document.createElement("article");
    card.className = "item" + (e.tried?" tried":"");
    const row = document.createElement("div"); row.className="row";

    const chk = document.createElement("button");
    chk.className="check"; chk.type="button"; chk.innerHTML = checkSvg;
    chk.setAttribute("aria-pressed", !!e.tried);
    chk.setAttribute("aria-label", (e.tried?"Markér som ikke smagt: ":"Markér som smagt: ")+i.name);
    chk.onclick = ()=>{ update(i.id,{tried:!e.tried}); render(); };

    const body = document.createElement("div"); body.className="body";
    const h = document.createElement("p"); h.className="name"; h.textContent=i.name;
    body.append(h);
    if(i.desc){ const d=document.createElement("p"); d.className="desc"; d.textContent=i.desc; body.append(d); }
    if(i.how){ const hw=document.createElement("p"); hw.className="how"; hw.textContent="Sådan: "+i.how; body.append(hw); }

    const rate = document.createElement("div"); rate.className="rate";
    const lbl = document.createElement("span"); lbl.className="lbl"; lbl.textContent="Silkes vurdering";
    rate.append(lbl);
    for(let k=1;k<=10;k++){
      const hb = document.createElement("button");
      hb.type="button"; hb.className="heart"+((e.rating||0)>=k?" on":"");
      hb.innerHTML = heartSvg();
      hb.setAttribute("aria-label", k+" af 10 "+VIBES[isWitchy() ? "witchy" : "std"].unit);
      hb.onclick = ()=>{ const r = e.rating===k ? 0 : k; update(i.id,{rating:r, tried:true}); render(); };
      rate.append(hb);
    }
    // Hjerter, noter og fjern-knap ligger under fluebenet og fylder hele kortets bredde
    const foot = document.createElement("div"); foot.className="foot";
    foot.append(rate);

    const note = document.createElement("textarea");
    note.className="note"; note.rows=1; note.placeholder="Noter: for sød, købt i Føtex, bedre kold…";
    note.value = e.note || "";
    note.setAttribute("aria-label","Noter om "+i.name);
    note.oninput = ()=>{ update(i.id,{note:note.value}, 800); };
    note.onblur = ()=>{ renderMenu(); };
    foot.append(note);

    const del = document.createElement("button"); del.className="del"; del.type="button";
    del.textContent="Fjern fra listen";
    del.onclick = ()=>{
      if(i.custom){ state.custom = state.custom.filter(x=>x.id!==i.id); delete state.entries[i.id]; }
      else state.entries[i.id] = {removed:true};
      persist(); render();
    };
    foot.append(del);

    row.append(chk, body); card.append(row, foot); main.append(card);
  });

  const add = document.createElement("form"); add.className="add stack";
  add.innerHTML = '<input type="text" name="navn" placeholder="Fandt du noget andet? Skriv navnet" aria-label="Navn på ny drik">'
    + '<textarea name="how" rows="3" placeholder="Sådan: (kan springes over)" aria-label="Sådan laver man den"></textarea>'
    + '<button class="btn" type="submit">Tilføj</button>';
  add.onsubmit = ev=>{
    ev.preventDefault();
    const v = add.elements.navn.value.trim(); if(!v) return;
    const how = add.elements.how.value.trim();
    const item = {id:"c"+Date.now().toString(36), cat:current, name:v, custom:true};
    if(how) item.how = how;
    state.custom = (state.custom||[]).concat(item);
    persist(); render();
  };
  main.append(add);

  const removed = ITEMS.filter(i=>i.cat===current && entry(i.id).removed);
  if(removed.length){
    const back = document.createElement("button"); back.className="del"; back.type="button";
    back.textContent = "Vis fjernede igen ("+removed.length+")";
    back.onclick = ()=>{ removed.forEach(i=>{ delete state.entries[i.id]; }); persist(); render(); };
    main.append(back);
  }

  if(cat.custom){
    const del = document.createElement("button"); del.className="del"; del.type="button";
    del.textContent = "Fjern kategorien";
    del.onclick = ()=>removeCat(cat);
    main.append(del);
  }
}

function render(){ renderTabs(); renderMenu(); renderList(); }

// Træk i fanerne med musen. Et træk tæller ikke som et klik på en fane.
(()=>{
  const tabs = $("#tabs");
  let drag = null, dragged = false;
  tabs.addEventListener("pointerdown", e=>{
    if(e.pointerType!=="mouse" || e.button!==0 || e.target.tagName==="INPUT") return;
    drag = {x:e.clientX, left:tabs.scrollLeft}; dragged = false;
  });
  window.addEventListener("pointermove", e=>{
    if(!drag) return;
    const dx = e.clientX - drag.x;
    if(!dragged && Math.abs(dx) > 5){ dragged = true; tabs.classList.add("dragging"); }
    if(dragged) tabs.scrollLeft = drag.left - dx;
  });
  window.addEventListener("pointerup", ()=>{ drag = null; tabs.classList.remove("dragging"); });
  tabs.addEventListener("click", e=>{ if(dragged){ e.stopPropagation(); e.preventDefault(); dragged = false; } }, true);
})();

$("#f-untried").onchange = renderList;
$("#f-fav").onchange = renderList;

const knownTab = h => h===NY || allCats().some(c=>c.id===h);
function fromHash(){ const h = location.hash.slice(1); if(knownTab(h)){ current=h; render(); } }
window.addEventListener("hashchange", fromHash);

loadLocal();
const h0 = location.hash.slice(1); if(knownTab(h0)) current = h0;
applyVibe();
render();
setSync("Gemmes på denne enhed.");

// Koden skrives én gang og huskes på telefonen. Et gammelt link med ?kode=… virker stadig:
// koden gemmes, og den fjernes fra adresselinjen.
const KODE_KEY = "smagsproever-kode";
function getKode(){ try{ return localStorage.getItem(KODE_KEY); }catch(e){ return null; } }
function setKode(k){ try{ k ? localStorage.setItem(KODE_KEY, k) : localStorage.removeItem(KODE_KEY); }catch(e){} }

function askKode(msg){
  setSync(msg);
  $("#kode-form").hidden = false;
}
$("#kode-form").onsubmit = ev=>{
  ev.preventDefault();
  const k = $("#kode-input").value.trim(); if(!k) return;
  setKode(k);
  $("#kode-form").hidden = true;
  connect(k);
};

let db = null, unsubscribe = null;
function connect(kode){
  try{
    if(!db) db = getFirestore(initializeApp(firebaseConfig));
    if(unsubscribe) unsubscribe();
    setSync("Forbinder…");
    docRef = doc(db, "lister", kode);
    let first = true;
    unsubscribe = onSnapshot(docRef, snap=>{
      if(snap.exists()){
        const d = snap.data() || {};
        state = {entries: d.entries || {}, custom: d.custom || [], kategorier: d.kategorier || [], navne: d.navne || {}};
        saveLocal();
        render();
      } else if(first && (Object.keys(state.entries||{}).length || (state.custom||[]).length)){
        persist();
      }
      if(first) setSync("Synkroniseret mellem jeres telefoner.");
      first = false;
    }, err=>{
      if(err && err.code==="permission-denied"){
        docRef = null; setKode(null);
        askKode("Forkert kode. Prøv igen.");
      } else setSync("Mistede forbindelsen. Gemmes på denne enhed.");
    });
  }catch(e){
    docRef = null; setKode(null);
    askKode("Forkert kode. Prøv igen.");
  }
}

(()=>{
  if(firebaseConfig.apiKey === "INDSÆT-HER"){ setSync("Firebase er ikke sat op endnu. Gemmes kun på denne enhed."); return; }
  const params = new URLSearchParams(location.search);
  const fraLink = params.get("kode");
  if(fraLink){
    setKode(fraLink);
    params.delete("kode");
    const q = params.toString();
    history.replaceState(null, "", location.pathname + (q ? "?" + q : "") + location.hash);
  }
  const kode = fraLink || getKode();
  if(kode) connect(kode);
  else askKode("Skriv jeres kode for at se jeres fælles liste.");
})();