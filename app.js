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
let state = {entries:{}, custom:[]};
let docRef = null;
let current = "bobler";

const $ = s => document.querySelector(s);
const allItems = () => ITEMS.concat(state.custom || []);
const entry = id => (state.entries && state.entries[id]) || {};

function setSync(t){ $("#sync").textContent = t; }

function loadLocal(){
  try{ const raw = localStorage.getItem(LS_KEY); if(raw) state = Object.assign({entries:{},custom:[]}, JSON.parse(raw)); }catch(e){}
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
    writing = writing.then(()=>setDoc(docRef, {entries:state.entries, custom:state.custom}))
      .then(()=>setSync("Gemt, og synkroniseret mellem jeres telefoner."))
      .catch(e=>setSync(e && e.code==="permission-denied" ? "Databasen afviste gemningen. Tjek koden i linket og reglerne i Firebase." : "Kunne ikke gemme online lige nu. Gemt på denne enhed."))
      .finally(()=>{pending=false;});
  }, delay);
}

function update(id, patch, delay=0){
  state.entries = state.entries || {};
  state.entries[id] = Object.assign({}, entry(id), patch);
  persist(delay);
}

const heartSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.5c2.1 0 3.6 1.2 4.4 2.5.8-1.3 2.3-2.5 4.4-2.5 3.7 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z"/></svg>';
const checkSvg = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M3 8.5l3.2 3L13 4.5"/></svg>';

function renderMenu(){
  const dl = $("#menu"); dl.innerHTML = "";
  CATS.forEach(c=>{
    const best = allItems().filter(i=>i.cat===c.id && (entry(i.id).rating||0)>0)
      .sort((a,b)=>(entry(b.id).rating||0)-(entry(a.id).rating||0))[0];
    const dt = document.createElement("dt"); dt.textContent = c.label;
    const dd = document.createElement("dd");
    if(best){ dd.textContent = best.name + "  " + "♥".repeat(entry(best.id).rating); }
    else { dd.textContent = "Ikke bedømt endnu"; dd.className = "empty"; }
    dl.append(dt, dd);
  });
}

function renderTabs(){
  const nav = $("#tabs"); nav.innerHTML = "";
  CATS.forEach(c=>{
    const items = allItems().filter(i=>i.cat===c.id);
    const tried = items.filter(i=>entry(i.id).tried).length;
    const b = document.createElement("button");
    b.className = "tab"; b.type = "button";
    b.setAttribute("aria-pressed", c.id===current);
    b.innerHTML = "";
    b.append(c.label);
    const n = document.createElement("span"); n.className="n"; n.textContent = tried+"/"+items.length;
    b.append(n);
    b.onclick = ()=>{ current = c.id; if(location.hash!=="#"+c.id) history.replaceState(null,"","#"+c.id); render(); };
    nav.append(b);
  });
}

function renderList(){
  const main = $("#list");
  const active = document.activeElement;
  if(active && active.classList.contains("note")) return; // don't wipe a note being typed
  main.innerHTML = "";
  const cat = CATS.find(c=>c.id===current);
  const head = document.createElement("div"); head.className="cat-head";
  head.innerHTML = '<h2></h2><p></p>';
  head.querySelector("h2").textContent = cat.label;
  head.querySelector("p").textContent = cat.sub;
  main.append(head);

  const onlyUntried = $("#f-untried").checked, onlyFav = $("#f-fav").checked;
  const items = allItems().filter(i=>i.cat===current)
    .filter(i=>!onlyUntried || !entry(i.id).tried)
    .filter(i=>!onlyFav || (entry(i.id).rating||0)>=4);

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
    const lbl = document.createElement("span"); lbl.className="lbl"; lbl.textContent="Hendes dom";
    rate.append(lbl);
    for(let k=1;k<=5;k++){
      const hb = document.createElement("button");
      hb.type="button"; hb.className="heart"+((e.rating||0)>=k?" on":"");
      hb.innerHTML = heartSvg;
      hb.setAttribute("aria-label", k+" af 5 hjerter");
      hb.onclick = ()=>{ const r = e.rating===k ? 0 : k; update(i.id,{rating:r, tried:true}); render(); };
      rate.append(hb);
    }
    body.append(rate);

    const note = document.createElement("textarea");
    note.className="note"; note.rows=1; note.placeholder="Noter: for sød, købt i Føtex, bedre kold…";
    note.value = e.note || "";
    note.setAttribute("aria-label","Noter om "+i.name);
    note.oninput = ()=>{ update(i.id,{note:note.value}, 800); };
    note.onblur = ()=>{ renderMenu(); };
    body.append(note);

    if(i.custom){
      const del = document.createElement("button"); del.className="del"; del.type="button";
      del.textContent="Fjern fra listen";
      del.onclick = ()=>{ state.custom = state.custom.filter(x=>x.id!==i.id); delete state.entries[i.id]; persist(); render(); };
      body.append(del);
    }

    row.append(chk, body); card.append(row); main.append(card);
  });

  const add = document.createElement("form"); add.className="add";
  add.innerHTML = '<input type="text" placeholder="Fandt du noget andet? Skriv navnet" aria-label="Navn på ny drik"><button class="btn" type="submit">Tilføj</button>';
  add.onsubmit = ev=>{
    ev.preventDefault();
    const v = add.querySelector("input").value.trim(); if(!v) return;
    state.custom = (state.custom||[]).concat({id:"c"+Date.now().toString(36), cat:current, name:v, custom:true});
    persist(); render();
  };
  main.append(add);
}

function render(){ renderTabs(); renderMenu(); renderList(); }

$("#f-untried").onchange = renderList;
$("#f-fav").onchange = renderList;

function fromHash(){ const h = location.hash.slice(1); if(CATS.some(c=>c.id===h)){ current=h; render(); } }
window.addEventListener("hashchange", fromHash);

loadLocal();
const h0 = location.hash.slice(1); if(CATS.some(c=>c.id===h0)) current = h0;
render();
setSync("Gemmes på denne enhed.");

(()=>{
  const kode = new URLSearchParams(location.search).get("kode");
  if(firebaseConfig.apiKey === "INDSÆT-HER"){ setSync("Firebase er ikke sat op endnu. Gemmes kun på denne enhed."); return; }
  if(!kode){ setSync("Linket mangler ?kode=… til sidst. Gemmes kun på denne enhed."); return; }
  try{
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    docRef = doc(db, "lister", kode);
    let first = true;
    onSnapshot(docRef, snap=>{
      if(snap.exists()){
        const d = snap.data() || {};
        state = {entries: d.entries || {}, custom: d.custom || []};
        saveLocal();
        render();
      } else if(first && (Object.keys(state.entries||{}).length || (state.custom||[]).length)){
        persist();
      }
      if(first) setSync("Synkroniseret mellem jeres telefoner.");
      first = false;
    }, err=>setSync(err && err.code==="permission-denied"
        ? "Databasen afviste adgang. Tjek at koden i linket matcher reglerne i Firebase."
        : "Mistede forbindelsen. Gemmes på denne enhed."));
  }catch(e){ setSync("Kunne ikke forbinde til databasen. Gemmes på denne enhed."); }
})();
