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
let editItem = null; // id på den drik, hvis navn og "Sådan" rettes lige nu
const NY = "ny-kategori"; // fanen, hvor man opretter en ny kategori

const $ = s => document.querySelector(s);
// De faste kategoriers navne kan ændres; de nye navne gemmes i state.navne[id],
// og nye beskrivelser i state.navne["sub:"+id] (så Firestore-reglerne ikke skal ændres).
// Slettede faste kategorier står i state.kategorier som {id, skjult:true}.
// Den rækkefølge, man har trukket fanerne i, står i state.navne._order som "id1,id2,…".
const allCats = () => {
  const k = state.kategorier || [];
  const n = state.navne || {};
  const skjult = id => k.some(x=>x.id===id && x.skjult);
  const cats = CATS.filter(c=>!skjult(c.id))
    .map(c=>Object.assign({}, c, n[c.id] ? {label:n[c.id]} : {}, ("sub:"+c.id) in n ? {sub:n["sub:"+c.id]} : {}))
    .concat(k.filter(x=>!x.skjult));
  const ord = (n._order || "").split(",").filter(Boolean);
  const pos = c => { const p = ord.indexOf(c.id); return p < 0 ? ord.length : p; }; // nye kategorier sidst
  return cats.map((c,idx)=>({c,idx})).sort((a,b)=>pos(a.c)-pos(b.c) || a.idx-b.idx).map(x=>x.c);
};
// Faste drikke, der er fjernet, markeres med removed:true i entries (så Firestore-reglerne ikke skal ændres).
// Rettet navn og "Sådan" på faste drikke gemmes også i entries[id] som name/how.
const allItems = () => ITEMS.filter(i=>!entry(i.id).removed)
  .map(i=>{ const e = entry(i.id); return Object.assign({}, i, "name" in e ? {name:e.name} : {}, "how" in e ? {how:e.how} : {}); })
  .concat(state.custom || []);

function setItem(i, field, value){
  value = value.trim();
  if(i.custom){
    const c = state.custom.find(x=>x.id===i.id);
    if(c && (value || field==="how")) c[field] = value;
  } else {
    const orig = ITEMS.find(x=>x.id===i.id)[field] || "";
    state.entries = state.entries || {};
    const e = Object.assign({}, entry(i.id));
    if((field==="name" && !value) || value===orig) delete e[field]; else e[field] = value;
    state.entries[i.id] = e;
  }
  persist(800);
}
const entry = id => (state.entries && state.entries[id]) || {};
// En drik tæller som smagt, når den har fået en vurdering
const isTried = id => (entry(id).rating||0) > 0;

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
    if(pending){ persist(300); return; } // en gemning er i gang; prøv igen lidt senere, så ændringen ikke går tabt
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
  std:   {btn:"Switch to witchy mode",   icon:"🥂", color:"#121918", unit:"hjerter"},
  witchy:{btn:"Switch to standard mode", icon:"🔮", color:"#140F1E", unit:"eliksirer"}
};
function applyVibe(){
  const v = VIBES[isWitchy() ? "witchy" : "std"];
  $("#vibe").textContent = v.btn;
  $("#favicon").href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">'+v.icon+'</text></svg>';
  document.querySelector('meta[name="theme-color"]').content = v.color;
  applySky();
}
function toggleVibe(){
  if(isWitchy()) delete document.documentElement.dataset.vibe; else document.documentElement.dataset.vibe = "witchy";
  try{ localStorage.setItem(VIBE_KEY, isWitchy() ? "witchy" : "std"); }catch(e){}
  applyVibe(); render();
}
// 7. Fortryllelsen: en gennemsigtig, lysende bølge breder sig fra knappen, og alt, den passerer, bliver witchy.
//    Siden forvandles inde i den voksende cirkel (View Transitions), mens kanten gløder lilla og drysser funkler.
//    Tilbage til standard sker det modsatte: det heksede trækker sig sammen og forsvinder ind i knappen.
const SPELL_MS = 1600; // så længe forvandlingen tager
$("#vibe").onclick = ()=>{
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduce || $(".magic-ring")) return toggleVibe();
  const out = isWitchy(); // true: fra witchy tilbage til standard
  const r = $("#vibe").getBoundingClientRect();
  const x = r.left + r.width/2, y = r.top + r.height/2;
  const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)); // til det fjerneste hjørne
  const ease = "cubic-bezier(.45,.05,.35,1)";
  const small = `circle(0px at ${x}px ${y}px)`, big = `circle(${R}px at ${x}px ${y}px)`;

  if(document.startViewTransition){
    // Ind i witchy: den nye side afsløres inde i en voksende cirkel.
    // Ud af witchy: den gamle, heksede side ligger øverst og trækker sig sammen ind i knappen.
    // Ring og funkler starter først, når browseren er klar, så de følger cirklens kant.
    const root = document.documentElement;
    root.classList.toggle("spell-out", out);
    let switched = false;
    const vt = document.startViewTransition(()=>{ switched = true; toggleVibe(); });
    setTimeout(()=>{ if(!switched) vt.skipTransition(); }, 1500); // sikkerhed: skift alligevel, hvis browseren ikke kommer i gang
    vt.finished.finally(()=>root.classList.remove("spell-out"));
    vt.ready.then(()=>{
      root.animate({clipPath: out ? [big, small] : [small, big]},
        {duration:SPELL_MS, easing:ease, pseudoElement: out ? "::view-transition-old(root)" : "::view-transition-new(root)"});
      spellFront(x, y, R, ease, out);
    }).catch(()=>spellFront(x, y, R, ease, out));
  } else {
    // Reserve for ældre browsere: et gennemsigtigt lilla slør, og siden skifter, når bølgen er halvvejs
    const m = document.createElement("div"); m.className = "magic";
    m.style.setProperty("--x", x + "px"); m.style.setProperty("--y", y + "px");
    document.body.append(m);
    m.animate(out
      ? [{clipPath:big, opacity:0}, {clipPath:big, opacity:.9, offset:.4}, {clipPath:small, opacity:1}]
      : [{clipPath:small, opacity:1}, {clipPath:big, opacity:.9, offset:.6}, {clipPath:big, opacity:0}],
      {duration:SPELL_MS, easing:ease, fill:"forwards"}).onfinish = ()=>m.remove();
    setTimeout(toggleVibe, SPELL_MS*(out ? .55 : .45));
    setTimeout(()=>m.remove(), SPELL_MS + 400);
    spellFront(x, y, R, ease, out);
  }
};

function spellFront(x, y, R, ease, out){
  // Bølgefronten: en lysende, gennemsigtig ring, der vokser med cirklen (eller skrumper ind mod knappen)
  const ring = document.createElement("div"); ring.className = "magic-ring";
  ring.style.left = x + "px"; ring.style.top = y + "px";
  ring.style.width = ring.style.height = (R*2) + "px";
  document.body.append(ring);
  const grow = [
    {transform:"translate(-50%,-50%) scale(0)", opacity:0},
    {transform:"translate(-50%,-50%) scale(.08)", opacity:1, offset:.08},
    {transform:"translate(-50%,-50%) scale(.85)", opacity:.9, offset:.8},
    {transform:"translate(-50%,-50%) scale(1)", opacity:0}
  ];
  const shrink = [
    {transform:"translate(-50%,-50%) scale(1)", opacity:0},
    {transform:"translate(-50%,-50%) scale(.85)", opacity:.9, offset:.2},
    {transform:"translate(-50%,-50%) scale(.08)", opacity:1, offset:.92},
    {transform:"translate(-50%,-50%) scale(0)", opacity:0}
  ];
  ring.animate(out ? shrink : grow, {duration:SPELL_MS, easing:ease, fill:"forwards"}).onfinish = ()=>ring.remove();
  setTimeout(()=>ring.remove(), SPELL_MS + 500);

  // Funkler, der dukker op langs bølgefronten, mens den passerer, og blinker ud igen.
  // På vej ud driver de ind mod knappen, som om magien bliver suget tilbage.
  for(let k=0; k<34; k++){
    const t = rnd(.05, .85); // hvor langt bølgen er nået
    const reach = 1 - Math.pow(1 - t, 2.2); // følger nogenlunde ringens fart
    const a = rnd(0, Math.PI*2), d = R * (out ? 1 - reach : reach);
    const px = x + Math.cos(a)*d, py = y + Math.sin(a)*d;
    if(px < -20 || py < -20 || px > innerWidth+20 || py > innerHeight+20) continue;
    const s = particle("fx-dust fx-top", px, py, Math.random() < .7 ? "✦" : "✧");
    s.style.fontSize = rnd(8, 18) + "px";
    s.style.color = Math.random() < .5 ? "#E8D2FF" : "var(--gold)";
    const drift = out ? -14 : 14;
    fly(s, [
      {transform:"translate(-50%,-50%) scale(0) rotate(0)", opacity:0},
      {transform:"translate(-50%,-50%) scale(1.3) rotate(90deg)", opacity:1, offset:.3},
      {transform:`translate(calc(-50% + ${Math.cos(a)*drift}px),calc(-50% + ${Math.sin(a)*drift - 10}px)) scale(0) rotate(200deg)`, opacity:0}
    ], {duration:rnd(500, 800), delay:t*SPELL_MS, easing:"ease-out"});
  }
}

// 6. Stjernehimmel bag hele siden: stjernerne blinker langsomt, og en gang imellem farer et stjerneskud forbi.
//    Himlen ligger fast, mens man scroller, så den altid fylder hele skærmen.
let shootTimer = null;
function addStars(el, count){
  const made = [];
  for(let k=0; k<count; k++){
    const s = document.createElement("span"); s.className = "star" + (Math.random() < .35 ? " gold" : "");
    const z = rnd(1.2, 3);
    s.style.cssText = `left:${rnd(2, 98)}%;top:${rnd(2, 95)}%;width:${z}px;height:${z}px;animation-duration:${rnd(2.4, 5.5)}s;animation-delay:${-rnd(0, 5)}s`;
    el.append(s); made.push(s);
  }
  return made;
}
function applySky(){
  const sky = $(".sky");
  if(!isWitchy()){ if(sky) sky.remove(); clearTimeout(shootTimer); return; }
  if(sky) return;
  const el = document.createElement("div"); el.className = "sky"; el.setAttribute("aria-hidden", "true");
  addStars(el, Math.round(Math.min(70, Math.max(30, innerWidth*innerHeight/14000)))); // flere stjerner på store skærme
  document.body.prepend(el);
  const shoot = (first)=>{
    shootTimer = setTimeout(()=>{
      if(fxOn() && !document.hidden){
        const s = document.createElement("span"); s.className = "shooting";
        s.style.left = rnd(5, 60) + "%"; s.style.top = rnd(4, 80) + "%";
        el.append(s);
        s.animate([
          {transform:"translate(0,0) rotate(20deg) scaleX(.2)", opacity:0},
          {transform:"translate(70px,25px) rotate(20deg) scaleX(1)", opacity:1, offset:.25},
          {transform:"translate(280px,102px) rotate(20deg) scaleX(.6)", opacity:0}
        ], {duration:900, easing:"ease-in"}).onfinish = ()=>s.remove();
      }
      shoot(false);
    }, first ? rnd(3000, 6000) : rnd(12000, 30000)); // det første kommer hurtigt, derefter sjældent
  };
  clearTimeout(shootTimer);
  shoot(true);
}

// Siden er altid mørk; et gammelt lys/mørk-valg fra tidligere udgaver ryddes væk
try{ localStorage.removeItem("smagsproever-theme"); }catch(e){}

// ===== Easter egg 🤫 =====
// En usynlig knap øverst til højre: stjernerne på himlen samler sig til et hjerte, et stjerneskud flyver ind i det,
// og "I love you" toner frem. Bagefter flyver stjernerne tilbage, og alt er som før.
// I standard mode, hvor der ingen stjernehimmel er, laves en midlertidig.
// (Knappen kan mangle i en gammel, gemt index.html lige efter en opdatering; så springes det over i stedet for at fejle.)
const EGG_STYLE = "pass"; // "pass" eller "hit" (se nedenfor)
const EGG_SPEED = .75;    // px pr. ms; stjerneskuddets fart, når det suser forbi (hurtigt, som et rigtigt stjerneskud)
const EGG_START = .75;    // stjerneskuddet starter, når hjertet er så langt (0–1) i at samle sig
const EGG_LAG = 80;       // px; så langt bag stjerneskuddets hoved teksten bliver skrevet
const EGG_AFTER = 1500;   // ms; så længe hjertet og teksten bliver stående, når teksten er skrevet
// Hvor langt fra hjertets midte stjerneskuddet toner frem og forsvinder igen: højst 420 px.
// På en smal skærm starter det lige uden for kanten, så det får et tilløb, og er tonet helt frem kort efter, det kommer ind.
const eggReach = () => Math.min(420, innerWidth/2 + 60);
const eggPassMs = () => 2*eggReach() / EGG_SPEED;

// "pass": stjerneskuddet toner frem til venstre for hjertet, suser skråt gennem det og toner ud igen til højre,
// og teksten bliver skrevet frem med en blød kant et stykke bag dets hale
function eggPass(text, cx, cy, reduce){
  text.style.transform = "translate(-50%,-50%)";
  document.body.append(text);
  const t = text.getBoundingClientRect();
  const x0 = cx - eggReach(), x1 = cx + eggReach(), y0 = cy + 36, y1 = cy - 36; // svagt opadgående bane gennem hjertet
  const span = x1 - x0, D = reduce ? 1 : eggPassMs();
  const ang = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI;
  const at = x => [x, y0 + (y1 - y0) * (x - x0) / span]; // punktet på banen ved en given x
  const when = x => (x - x0) / span * D;                  // hvornår hovedet er ved en given x

  const shot = document.createElement("span"); shot.className = "egg-shoot";
  shot.style.left = x0 + "px"; shot.style.top = y0 + "px";
  document.body.append(shot);
  const pos = f => `translate(${span*f}px,${(y1-y0)*f}px) rotate(${ang}deg)`;
  shot.animate([
    {transform:pos(0) + " scaleX(.2)", opacity:0},        // toner frem ud af ingenting, mens halen vokser
    {transform:pos(.22) + " scaleX(1)", opacity:1, offset:.22},
    {transform:pos(.8) + " scaleX(1)", opacity:1, offset:.8},
    {transform:pos(1) + " scaleX(.6)", opacity:0}         // og toner ud igen
  ], {duration:D, easing:"linear", fill:"forwards"}).onfinish = ()=>shot.remove();
  setTimeout(()=>shot.remove(), D + 600);

  // Teksten skrives frem med en blød, glidende kant (en maske), der følger efter halen i samme fart.
  // Masken er 3 gange så bred som teksten; den bløde kant flytter sig 2 tekstbredder, fra lidt før teksten til lidt efter.
  const W = t.width;
  text.style.webkitMaskImage = text.style.maskImage = "linear-gradient(90deg,#000 0%,#000 42%,transparent 58%,transparent 100%)";
  text.style.webkitMaskSize = text.style.maskSize = "300% 100%";
  text.style.webkitMaskRepeat = text.style.maskRepeat = "no-repeat";
  const edgeFrom = t.left - .5*W, startMs = when(edgeFrom + EGG_LAG), lenMs = 2*W / span * D;
  text.animate([
    {maskPosition:"100% 0", webkitMaskPosition:"100% 0"},
    {maskPosition:"0% 0", webkitMaskPosition:"0% 0"}
  ], {duration:reduce ? 1 : lenMs, delay:reduce ? 0 : startMs, easing:"linear", fill:"both"});
  // Nyskrevet tekst gløder ekstra kraftigt og falder til ro (glød i stedet for et filter, som kan give en mørk firkant bag teksten)
  const acc = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#C39BE6";
  const glowOf = (a, b) => `0 0 ${a}px #fff, 0 0 ${b}px ${acc}, 0 0 ${b*2.4}px ${acc}`;
  text.animate([{textShadow:glowOf(6, 18)}, {textShadow:glowOf(6, 18), offset:.5}, {textShadow:glowOf(2, 12)}],
    {duration:reduce ? 1 : lenMs + 700, delay:reduce ? 0 : startMs, easing:"ease-out", fill:"both"});

  // Halen drysser funkler, der langsomt daler og blinker ud (kun hvor stjerneskuddet er tydeligt)
  if(!reduce) for(let k=0; k<20; k++){
    const f = .15 + .7 * k / 19, [px, py] = at(x0 + span*f);
    const p = particle("fx-dust fx-top egg-spark", px, py + rnd(-6, 6), Math.random() < .6 ? "✦" : "✧");
    p.style.fontSize = rnd(7, 14) + "px";
    p.style.color = Math.random() < .5 ? "#E8D2FF" : "var(--gold)";
    fly(p, [
      {transform:"translate(-50%,-50%) scale(0)", opacity:0},
      {transform:"translate(-50%,-50%) scale(1.2)", opacity:1, offset:.2},
      {transform:`translate(calc(-50% + ${rnd(-8, 8)}px),calc(-50% + ${rnd(12, 30)}px)) scale(.2)`, opacity:0}
    ], {duration:rnd(700, 1100), delay:f*D, easing:"ease-out"});
  }
}

if($("#egg")) $("#egg").onclick = ()=>{
  const root = document.documentElement;
  if(root.classList.contains("easter")) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("easter");

  const dim = document.createElement("div"); dim.className = "egg-dim"; document.body.append(dim);
  let sky = $(".sky"), tempSky = null;
  if(!sky){ tempSky = sky = document.createElement("div"); sky.className = "sky"; sky.setAttribute("aria-hidden", "true"); document.body.prepend(sky); addStars(sky, 40); }
  let stars = [...sky.querySelectorAll(".star")];
  const extra = stars.length < 48 ? addStars(sky, 48 - stars.length) : []; // nok stjerner til et tydeligt hjerte
  stars = stars.concat(extra);
  extra.forEach(s=>s.animate([{opacity:0}, {opacity:1}], {duration:500}));

  // Hjertets kurve, centreret på skærmen
  const cx = innerWidth/2, cy = innerHeight/2 - 10;
  const u = Math.min(innerWidth, innerHeight) * .021; // 32 enheder bredt ≈ 2/3 af skærmen
  const heart = t => [cx + u*16*Math.pow(Math.sin(t), 3), cy - u*(13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t))];
  const order = stars.map((s, i)=>({s, r:Math.random()})).sort((a,b)=>a.r-b.r).map(x=>x.s); // hver stjerne får en tilfældig plads på hjertet
  const GATHER = reduce ? 1 : 1700;
  const moves = order.map((s, i)=>{
    const b = s.getBoundingClientRect();
    const [tx, ty] = heart(i / order.length * Math.PI * 2);
    const dx = tx - (b.left + b.width/2), dy = ty - (b.top + b.height/2);
    s.classList.add("in-heart");
    return s.animate([
      {transform:"translate(0,0) scale(1)", opacity:.6},
      {transform:`translate(${dx}px,${dy}px) scale(2.2)`, opacity:1}
    ], {duration:GATHER, delay:reduce ? 0 : rnd(0, 350), easing:"cubic-bezier(.6,.05,.25,1)", fill:"forwards"});
  });
  dim.animate([{opacity:0}, {opacity:1}], {duration:600, fill:"forwards"});

  const text = document.createElement("div"); text.className = "egg-text"; text.textContent = "I love you";
  text.style.left = cx + "px"; text.style.top = cy + "px";

  // To varianter af stjerneskuddet (skift EGG_STYLE øverst ved easter egget):
  //  "pass": stjerneskuddet suser forbi gennem hjertet, og halen skriver "I love you" efter sig
  //  "hit":  stjerneskuddet flyver ind i hjertets midte, funkler, og teksten toner frem
  if(EGG_STYLE === "pass") setTimeout(()=>eggPass(text, cx, cy, reduce), GATHER * EGG_START); // allerede mens hjertet bliver færdigt
  else setTimeout(()=>{
    const shot = document.createElement("span"); shot.className = "egg-shoot";
    shot.style.left = cx + "px"; shot.style.top = cy + "px";
    document.body.append(shot);
    const fromX = -cx - 60, fromY = -cy*0.55;
    const ang = Math.atan2(-fromY, -fromX) * 180 / Math.PI;
    shot.animate([
      {transform:`translate(${fromX}px,${fromY}px) rotate(${ang}deg) scaleX(.3)`, opacity:0},
      {transform:`translate(${fromX*.6}px,${fromY*.6}px) rotate(${ang}deg) scaleX(1)`, opacity:1, offset:.3},
      {transform:`translate(0,0) rotate(${ang}deg) scaleX(.2)`, opacity:1}
    ], {duration:reduce ? 1 : 800, easing:"cubic-bezier(.5,0,.8,.6)", fill:"forwards"}).onfinish = ()=>shot.remove();
    setTimeout(()=>shot.remove(), 1500);

    setTimeout(()=>{
      if(!reduce) for(let k=0; k<14; k++){
        const a = rnd(0, Math.PI*2), d = rnd(30, 90);
        const p = particle("fx-dust fx-top egg-spark", cx, cy, Math.random() < .7 ? "✦" : "✧");
        p.style.fontSize = rnd(9, 18) + "px";
        fly(p, [
          {transform:"translate(-50%,-50%) scale(.2)", opacity:0},
          {transform:`translate(calc(-50% + ${Math.cos(a)*d*.6}px),calc(-50% + ${Math.sin(a)*d*.6}px)) scale(1.2)`, opacity:1, offset:.35},
          {transform:`translate(calc(-50% + ${Math.cos(a)*d}px),calc(-50% + ${Math.sin(a)*d}px)) scale(.3)`, opacity:0}
        ], {duration:rnd(700, 1000), easing:"ease-out"});
      }
      document.body.append(text);
      text.animate([
        {transform:"translate(-50%,-50%) scale(.6)", opacity:0, filter:"blur(6px)"},
        {transform:"translate(-50%,-50%) scale(1)", opacity:1, filter:"blur(0)"}
      ], {duration:reduce ? 1 : 900, easing:"cubic-bezier(.2,1.2,.4,1)", fill:"forwards"});
    }, reduce ? 0 : 780);
  }, GATHER + 250);

  // Efter et par sekunder: teksten toner ud, stjernerne flyver tilbage, og alt bliver normalt igen
  const HOLD = EGG_STYLE === "pass" ? GATHER*EGG_START + eggPassMs() + 300 + EGG_AFTER : GATHER + 250 + 780 + 2400;
  setTimeout(()=>{
    text.animate([{opacity:1}, {opacity:0, transform:"translate(-50%,-50%) scale(1.08)"}], {duration:700, fill:"forwards"}).onfinish = ()=>text.remove();
    moves.forEach(a=>{ try{ a.reverse(); }catch(_){} }); // stjernerne flyver samme vej tilbage
    dim.animate([{opacity:1}, {opacity:0}], {duration:1200, fill:"forwards"});
    extra.forEach(s=>s.animate([{opacity:1}, {opacity:0}], {duration:GATHER, fill:"forwards"}));
  }, HOLD);
  setTimeout(()=>{
    moves.forEach(a=>{ try{ a.cancel(); }catch(_){} });
    order.forEach(s=>s.classList.remove("in-heart"));
    extra.forEach(s=>s.remove());
    if(tempSky) tempSky.remove();
    text.remove(); dim.remove();
    root.classList.remove("easter");
  }, HOLD + GATHER + 500);
};

const heartSvgStd = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.5c2.1 0 3.6 1.2 4.4 2.5.8-1.3 2.3-2.5 4.4-2.5 3.7 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z"/></svg>';
// En lille eliksirflaske med prop og to bobler (boblerne er huller i formen)
const potionSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M9 1.5h6v2.2h-1v4.6a7 7 0 1 1-4 0V3.7H9z M9.3 15.2a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0-2.6 0z M13.4 18.2a.85.85 0 1 0 1.7 0a.85.85 0 1 0-1.7 0z"/></svg>';
const heartSvg = () => isWitchy() ? potionSvg : heartSvgStd;

// ===== Witchy-animationer =====
// Alle effekter kører kun i witchy mode og springes over, hvis telefonen har "reducer bevægelse" slået til.
// Partiklerne ligger øverst, kan ikke klikkes på og fjerner sig selv.
const fxOn = () => isWitchy() && !matchMedia("(prefers-reduced-motion: reduce)").matches;
const rnd = (a, b) => a + Math.random()*(b-a);
function particle(cls, x, y, html){
  const el = document.createElement("div");
  el.className = "fx " + cls;
  el.style.left = x + "px"; el.style.top = y + "px";
  if(html) el.innerHTML = html;
  document.body.append(el);
  setTimeout(()=>el.remove(), 2500); // sikkerhed
  return el;
}
const fly = (el, frames, opts) => { el.animate(frames, Object.assign({fill:"both"}, opts)).onfinish = ()=>el.remove(); };

// 1. Små lilla bobler stiger op fra den eliksir, man trykker på
function bubbles(r){
  for(let k=0; k<5; k++){
    const s = rnd(4, 9);
    const b = particle("fx-bubble", r.left + r.width/2 - s/2 + rnd(-6, 6), r.top + r.height*.3);
    b.style.width = b.style.height = s + "px";
    const up = rnd(28, 60), side = rnd(-14, 14);
    fly(b, [
      {transform:"translate(0,0) scale(.4)", opacity:0},
      {transform:`translate(${side*.4}px,${-up*.35}px) scale(1)`, opacity:.9, offset:.3},
      {transform:`translate(${side}px,${-up}px) scale(1.2)`, opacity:0}
    ], {duration:rnd(550, 850), delay:k*40, easing:"ease-out"});
  }
}
// 2. Fuld score: flaskerne hopper op og falder ned igen én efter én, så det bliver en bølge,
//    mens der drysser guldstøv ned over kortet
function perfectTen(card){
  // Gløden har samme opbygning i alle trin (to lilla skygger, der bare tændes og slukkes),
  // ellers kan nogle browsere blande farverne forkert og vise rød eller grøn
  const glow = (a, b) => `drop-shadow(0 0 ${a}px rgba(181,123,234,${b})) drop-shadow(0 0 ${a/3}px rgba(232,210,255,${b}))`;
  card.querySelectorAll(".heart svg").forEach((svg, k)=>{
    svg.animate([
      {transform:"translateY(0) scale(1)", filter:glow(0, 0)},
      {transform:"translateY(-14px) scale(1.25)", filter:glow(7, 1), offset:.35, easing:"ease-in"},
      {transform:"translateY(2px) scale(.95)", filter:glow(3, .4), offset:.7},
      {transform:"translateY(0) scale(1)", filter:glow(0, 0)}
    ], {duration:440, delay:k*65, easing:"ease-out"});
  });
  const r = card.getBoundingClientRect();
  for(let k=0; k<18; k++){
    const d = particle("fx-dust", rnd(r.left+8, r.right-8), r.top + rnd(-10, 20), "✦");
    d.style.fontSize = rnd(8, 15) + "px";
    fly(d, [
      {transform:"translateY(0) rotate(0) scale(.3)", opacity:0},
      {transform:`translateY(${r.height*.25}px) rotate(90deg) scale(1)`, opacity:1, offset:.25},
      {transform:`translateY(${r.height*rnd(.6, .95)}px) rotate(${rnd(180, 360)}deg) scale(.6)`, opacity:0}
    ], {duration:rnd(900, 1300), delay:rnd(0, 350), easing:"ease-in"});
  }
}
// 4 og 5. Lilla røg, når noget brygges frem eller forsvinder
function smoke(r, n, rise){
  for(let k=0; k<n; k++){
    const s = rnd(26, 54);
    const p = particle("fx-smoke", rnd(r.left, r.right) - s/2, rnd(r.top, r.bottom) - s/2);
    p.style.width = p.style.height = s + "px";
    fly(p, [
      {transform:"translate(0,0) scale(.4)", opacity:0},
      {transform:`translate(${rnd(-10, 10)}px,${-rise*.4}px) scale(1)`, opacity:.55, offset:.35},
      {transform:`translate(${rnd(-25, 25)}px,${-rise}px) scale(1.6)`, opacity:0}
    ], {duration:rnd(700, 1000), delay:rnd(0, 120), easing:"ease-out"});
  }
}
const justAdded = new Set(); // id på drikke/kategorier, der lige er oprettet og skal "brygges frem"
// 10/10 og ny nr. 1 fejres først, når man er færdig med at vurdere: lige før kortene sorteres (se scheduleAuto)
const pendingTen = new Set(); // drikke, der har fået 10, siden sidste sortering
const crownBase = {};         // kategori -> nr. 1, som den var, før man begyndte at vurdere
const topFirst = cat => {
  const rated = allItems().filter(i=>i.cat===cat && (entry(i.id).rating||0)>0)
    .sort((a,b)=>(entry(b.id).rating||0)-(entry(a.id).rating||0));
  return rated.length ? rated[0].id : null;
};
// 3. Ny nr. 1: en lilla lysstribe glider hen over kortet fra venstre mod højre
function shine(card){
  const s = document.createElement("span"); s.className = "sheen"; s.setAttribute("aria-hidden", "true");
  card.append(s);
  card.classList.add("shining");
  setTimeout(()=>{ s.remove(); card.classList.remove("shining"); }, 1400);
}

// Top 3 holdes stille, mens man vurderer i en kategori (menuHold), og glider på plads sammen med kortene
const menuHold = {}; // kategori -> id'er i Top 3, som de stod, før man begyndte at vurdere
const topIds = cat => allItems().filter(i=>i.cat===cat && (entry(i.id).rating||0)>0)
  .sort((a,b)=>(entry(b.id).rating||0)-(entry(a.id).rating||0)).slice(0,3).map(i=>i.id);

function renderMenu(){
  const dl = $("#menu"); dl.innerHTML = "";
  const byId = new Map(allItems().map(i=>[i.id, i]));
  allCats().forEach(c=>{
    const top = ((c.id in menuHold) ? menuHold[c.id] : topIds(c.id)).map(id=>byId.get(id)).filter(Boolean);
    const dt = document.createElement("dt"); dt.textContent = c.label; dt.dataset.key = "dt:"+c.id;
    const dd = document.createElement("dd");
    if(top.length){
      const ol = document.createElement("ol");
      top.forEach(i=>{
        const li = document.createElement("li"); li.dataset.id = i.id; li.dataset.key = c.id+":"+i.id;
        const s = document.createElement("span"); s.className = "score"; s.innerHTML = heartSvg(); s.append(entry(i.id).rating);
        const nm = document.createElement("span"); nm.className = "top-name"; nm.textContent = i.name;
        const dots = document.createElement("span"); dots.className = "leader"; dots.setAttribute("aria-hidden", "true"); // prikker som i en opskrift (kun witchy)
        const row = document.createElement("span"); row.className = "top-row";
        row.append(nm, dots, s);
        li.append(row);
        ol.append(li);
      });
      dd.append(ol);
    }
    else { dd.textContent = "Ikke bedømt endnu"; dd.className = "empty"; dd.dataset.key = "empty:"+c.id; }
    dl.append(dt, dd);
  });
}

// Top 3 glider på plads (FLIP), og hver drik, der har fået en ny plads, får lysstriben, når den er landet
function menuFlip(cat){
  const keyed = () => [...document.querySelectorAll("#menu [data-key]")];
  const before = new Map(keyed().map(el=>[el.dataset.key, el.getBoundingClientRect().top]));
  const oldRank = menuHold[cat] || [];
  delete menuHold[cat];
  renderMenu();
  const newRank = topIds(cat);
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  keyed().forEach(el=>{
    const b = before.get(el.dataset.key);
    if(b==null){ // ny i Top 3: toner ind fra venstre
      el.animate([{opacity:0, transform:"translateX(-12px)"}, {opacity:1, transform:"none"}], {duration:600, delay:250, easing:"ease-out", fill:"backwards"});
      return;
    }
    const dy = b - el.getBoundingClientRect().top; if(Math.abs(dy) < 1) return;
    el.animate([{transform:`translateY(${dy}px)`}, {transform:"none"}], {duration:900, easing:"cubic-bezier(.22,.9,.24,1)"});
  });
  if(!fxOn()) return;
  setTimeout(()=>{
    newRank.forEach((id, idx)=>{
      if(oldRank.indexOf(id) === idx) return; // samme plads som før
      const li = document.querySelector(`#menu li[data-key="${cat}:${id}"]`);
      if(li){ li.classList.remove("crowned"); void li.offsetWidth; li.classList.add("crowned"); }
    });
  }, 900);
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

function setSub(c, sub){
  sub = sub.trim();
  if(c.custom){
    const k = state.kategorier.find(k=>k.id===c.id);
    if(k) k.sub = sub;
  } else {
    state.navne = state.navne || {};
    const orig = CATS.find(x=>x.id===c.id).sub;
    if(sub===orig) delete state.navne["sub:"+c.id]; else state.navne["sub:"+c.id] = sub;
  }
}

function renderTabs(){
  const nav = $("#tabs");
  const active = document.activeElement;
  if(editing && active && active.tagName==="INPUT" && nav.contains(active)) return; // don't wipe a name being typed
  if(arrange.dragEl) return; // en fane er ved at blive trukket
  nav.innerHTML = "";
  nav.classList.toggle("arranging", arrange.on);
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
    const tried = items.filter(i=>isTried(i.id)).length;
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
    b.classList.add("cat"); b.dataset.id = c.id;
    if(arrange.on) b.classList.add("jiggle");
    if(justAdded.has(c.id) && fxOn()) b.classList.add("brewed");
    b.setAttribute("aria-pressed", c.id===current);
    b.innerHTML = "";
    b.append(c.label);
    const n = document.createElement("span"); n.className="n"; n.textContent = tried+"/"+items.length;
    b.append(n);
    b.onclick = ()=>{ if(arrange.on) return; current = c.id; if(location.hash!=="#"+c.id) history.replaceState(null,"","#"+c.id); render(); };
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
    justAdded.add(c.id);
    persist(); render();
    justAdded.clear();
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
  if(active && ["note","sub-edit","item-edit"].some(c=>active.classList.contains(c))) return; // don't wipe text being typed
  main.innerHTML = "";
  if(current===NY){ renderNewCat(main); return; }
  const cat = allCats().find(c=>c.id===current) || allCats()[0];
  if(!cat){ current = NY; renderNewCat(main); return; }
  current = cat.id;
  const head = document.createElement("div"); head.className="cat-head";
  head.innerHTML = '<h2></h2>';
  head.querySelector("h2").textContent = cat.label;
  if(editing){
    // Under "Rediger" kan beskrivelsen af den kategori, man står på, rettes
    const sub = document.createElement("textarea");
    sub.className = "sub-edit"; sub.rows = 2; sub.value = cat.sub || "";
    sub.placeholder = "Beskrivelse (kan være tom)";
    sub.setAttribute("aria-label", "Beskrivelse af "+cat.label);
    sub.oninput = ()=>{ setSub(cat, sub.value); persist(800); };
    head.append(sub);
  } else {
    const p = document.createElement("p"); p.textContent = cat.sub || "";
    head.append(p);
  }
  main.append(head);

  const onlyUntried = $("#f-untried").checked;
  const byId = new Map(allItems().map(i=>[i.id, i]));
  const items = displayIds(current).map(id=>byId.get(id))
    .filter(i=>!onlyUntried || !isTried(i.id));

  if(!items.length){
    const p = document.createElement("p"); p.className="empty-state";
    p.textContent = onlyUntried ? "Intet matcher filteret. Slå det fra for at se hele kategorien." : "Ingen drikke her endnu. Tilføj en nedenfor.";
    main.append(p);
  }

  items.forEach(i=>{
    const e = entry(i.id);
    const card = document.createElement("article");
    card.className = "item" + (isTried(i.id)?" tried":"") + (editItem===i.id?" editing":"");
    card.dataset.id = i.id;
    if(justAdded.has(i.id) && fxOn()){
      card.classList.add("brewed");
      setTimeout(()=>smoke(card.getBoundingClientRect(), 7, 50)); // 4. bobler op af gryden (når kortet er sat ind på siden)
    }
    const row = document.createElement("div"); row.className="row";

    const body = document.createElement("div"); body.className="body";
    if(editItem===i.id){
      // Kortet er åbnet ved at holde nede: navn og "Sådan" kan rettes
      const hint = document.createElement("p"); hint.className = "edit-hint";
      hint.textContent = "Ret navn og Sådan · tryk et andet sted for at stoppe";
      body.append(hint);
      const nameIn = document.createElement("input");
      nameIn.type = "text"; nameIn.className = "item-edit"; nameIn.value = i.name;
      nameIn.setAttribute("aria-label", "Navn på drikken");
      nameIn.oninput = ()=>{ setItem(i, "name", nameIn.value); renderMenu(); };
      const howIn = document.createElement("textarea");
      howIn.className = "item-edit"; howIn.rows = 3; howIn.value = i.how || "";
      howIn.placeholder = "Sådan: (kan springes over)";
      howIn.setAttribute("aria-label", "Sådan laver man den");
      howIn.oninput = ()=>{ setItem(i, "how", howIn.value); };
      body.append(nameIn);
      if(i.desc){ const d=document.createElement("p"); d.className="desc"; d.textContent=i.desc; body.append(d); }
      body.append(howIn);
    } else {
      const h = document.createElement("p"); h.className="name"; h.textContent=i.name;
      body.append(h);
      if(i.desc){ const d=document.createElement("p"); d.className="desc"; d.textContent=i.desc; body.append(d); }
      if(i.how){ const hw=document.createElement("p"); hw.className="how"; hw.textContent="Sådan: "+i.how; body.append(hw); }
    }

    const rate = document.createElement("div"); rate.className="rate";
    const lbl = document.createElement("span"); lbl.className="lbl"; lbl.textContent="Silkes vurdering";
    rate.append(lbl);
    for(let k=1;k<=10;k++){
      const hb = document.createElement("button");
      hb.type="button"; hb.className="heart"+((e.rating||0)>=k?" on":"");
      hb.innerHTML = heartSvg();
      hb.setAttribute("aria-label", k+" af 10 "+VIBES[isWitchy() ? "witchy" : "std"].unit);
      // Samme vurdering igen nulstiller, så drikken igen tæller som ikke smagt
      hb.onclick = ()=>{
        const r = e.rating===k ? 0 : k;
        if(fxOn() && r) bubbles(hb.getBoundingClientRect()); // før listen tegnes om, mens flasken stadig er der
        if(!(i.cat in crownBase)) crownBase[i.cat] = topFirst(i.cat);
        if(!(i.cat in menuHold)) menuHold[i.cat] = topIds(i.cat);
        update(i.id,{rating:r}); render();
        if(r===10) pendingTen.add(i.id); else pendingTen.delete(i.id);
        scheduleAuto(i.cat);
      };
      rate.append(hb);
    }
    // Hjerter, noter og fjern-knap fylder hele kortets bredde
    const foot = document.createElement("div"); foot.className="foot";
    foot.append(rate);

    const note = document.createElement("textarea");
    note.className="note"; note.rows=1; note.placeholder="Skriv noter her";
    note.value = e.note || "";
    note.setAttribute("aria-label","Noter om "+i.name);
    note.oninput = ()=>{ update(i.id,{note:note.value}, 800); };
    note.onblur = ()=>{ renderMenu(); };
    foot.append(note);

    const del = document.createElement("button"); del.className="del"; del.type="button";
    del.textContent="Fjern fra listen";
    del.onclick = ()=>{
      const gone = ()=>{
        if(i.custom){ state.custom = state.custom.filter(x=>x.id!==i.id); delete state.entries[i.id]; }
        else state.entries[i.id] = {removed:true};
        persist(); render();
      };
      if(!fxOn()) return gone();
      // 5. Kortet opløses i en lilla røgsky, der driver opad, før det fjernes
      if(card.classList.contains("vanishing")) return;
      card.classList.add("vanishing");
      smoke(card.getBoundingClientRect(), 10, 70);
      setTimeout(gone, 480);
    };
    foot.append(del);

    row.append(body); card.append(row, foot); main.append(card);
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
    justAdded.add(item.id);
    persist(); render();
    justAdded.clear();
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

// ===== Højest vurderede drik øverst =====
// Alle kategorier sorterer automatisk lidt efter, man har vurderet.
// Rækkefølgen ligger fast imellem, så kortene ikke hopper rundt, mens man vurderer.
const AUTO_DELAY = 1800; // ms efter sidste vurdering, før listen sorteres
let order = {};          // kategori -> drikkenes id i den rækkefølge, de vises

function sortByRating(ids){
  // Stabil sortering: højeste vurdering først; ved lige vurdering beholdes den nuværende rækkefølge
  return ids.map((id,idx)=>({id, r:entry(id).rating||0, idx}))
    .sort((a,b)=>b.r-a.r || a.idx-b.idx).map(x=>x.id);
}
function displayIds(cat){
  const ids = allItems().filter(i=>i.cat===cat).map(i=>i.id);
  if(!order[cat]) order[cat] = sortByRating(ids);
  const known = order[cat].filter(id=>ids.includes(id));
  return known.concat(ids.filter(id=>!known.includes(id))); // nye drikke lægges nederst, indtil der sorteres
}

// Kortene glider fra deres gamle til deres nye plads (FLIP). Siden scroller ikke med.
function flip(mutate){
  const before = new Map([...document.querySelectorAll(".item[data-id]")].map(el=>[el.dataset.id, el.getBoundingClientRect().top]));
  mutate();
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".item[data-id]").forEach(el=>{
    const b = before.get(el.dataset.id); if(b==null) return;
    const dy = b - el.getBoundingClientRect().top; if(Math.abs(dy) < 1) return;
    el.style.transition = "none";
    el.style.transform = `translateY(${dy}px)`;
    el.classList.add(dy > 0 ? "rising" : "sinking");
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      el.style.transition = "transform .9s cubic-bezier(.22,.9,.24,1)";
      el.style.transform = "";
    }));
    el.addEventListener("transitionend", ()=>{ el.classList.remove("rising","sinking"); el.style.transition = ""; }, {once:true});
  });
}
function resort(cat){
  if(current===cat) flip(()=>{ order[cat] = sortByRating(displayIds(cat)); renderList(); });
  else order[cat] = sortByRating(displayIds(cat));
  menuFlip(cat);
}
const autoTimers = {}; // én ventetid pr. kategori, så en vurdering i én kategori ikke aflyser sorteringen i en anden
function scheduleAuto(cat){
  clearTimeout(autoTimers[cat]);
  autoTimers[cat] = setTimeout(()=>{
    const a = document.activeElement;
    if(a && ["note","sub-edit","item-edit"].some(c=>a.classList.contains(c))){ scheduleAuto(cat); return; } // vent, til man er færdig med at skrive
    // Man er færdig med at vurdere: først fejres 10/10 og en ny nr. 1, så glider kortene på plads
    if(celebrate(cat)) setTimeout(()=>resort(cat), CELEBRATE_MS); else resort(cat);
  }, AUTO_DELAY);
}
const CELEBRATE_MS = 900; // så længe fejringen får, før kortene begynder at glide
function celebrate(cat){
  let played = false;
  const cardOf = id => current===cat ? document.querySelector(`.item[data-id="${id}"]`) : null;
  if(fxOn()){
    pendingTen.forEach(id=>{
      const it = allItems().find(x=>x.id===id);
      if(!it || it.cat!==cat || entry(id).rating!==10) return;
      const c = cardOf(id); if(c){ perfectTen(c); played = true; }
    });
    const now = topFirst(cat);
    if(cat in crownBase && now && now !== crownBase[cat]){
      const c = cardOf(now); if(c){ shine(c); played = true; } // Top 3-rækken får sin lysstribe, når den er landet (menuFlip)
    }
  }
  pendingTen.forEach(id=>{ const it = allItems().find(x=>x.id===id); if(!it || it.cat===cat) pendingTen.delete(id); });
  delete crownBase[cat];
  return played;
}

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
    if(arrange.dragEl){ drag = null; return; } // man har fat i en fane og flytter den; så skal rækken ikke rulle
    const dx = e.clientX - drag.x;
    if(!dragged && Math.abs(dx) > 5){ dragged = true; tabs.classList.add("dragging"); }
    if(dragged) tabs.scrollLeft = drag.left - dx;
  });
  window.addEventListener("pointerup", ()=>{ drag = null; tabs.classList.remove("dragging"); });
  tabs.addEventListener("click", e=>{ if(dragged){ e.stopPropagation(); e.preventDefault(); dragged = false; } }, true);
})();

// Et "tryk et vilkårligt sted" skal være et rigtigt tryk: fingeren må ikke flytte sig (så er det et scroll).
// Selve trykket gør ikke andet end at stoppe; det, der skal ske bagefter, venter, til klikket er spist,
// så siden ikke tegnes om under fingeren, og klikket rammer noget andet.
function onTapOutside(isActive, isInside, onTap){
  let tap = null, swallow = false, after = null;
  const finish = ()=>{ if(after){ const f = after; after = null; f(); } };
  document.addEventListener("pointerdown", e=>{
    tap = (isActive() && !isInside(e.target)) ? {x:e.clientX, y:e.clientY} : null;
  }, true);
  window.addEventListener("pointermove", e=>{
    if(tap && Math.hypot(e.clientX-tap.x, e.clientY-tap.y) > 10) tap = null; // det blev et scroll
  }, true);
  window.addEventListener("pointercancel", ()=>{ tap = null; }, true); // telefonen overtog trykket for at scrolle
  window.addEventListener("pointerup", ()=>{
    if(!tap) return;
    tap = null; swallow = true;
    after = onTap();
    setTimeout(()=>{ swallow = false; finish(); }, 400); // hvis der ikke kommer noget klik
  }, true);
  document.addEventListener("click", e=>{
    if(!swallow) return;
    swallow = false; e.stopPropagation(); e.preventDefault();
    finish();
  }, true);
}

// ===== Hold nede på et kort: navn og "Sådan" kan rettes =====
// Et tryk et vilkårligt sted uden for felterne stopper redigeringen; man kan godt scrolle imens.
(()=>{
  const list = $("#list");
  let timer = null, start = null, swallow = false;
  list.addEventListener("pointerdown", e=>{
    const card = e.target.closest(".item[data-id]");
    if(!card || card.dataset.id===editItem || e.target.closest("button, input, textarea, a")) return;
    start = {x:e.clientX, y:e.clientY};
    clearTimeout(timer);
    timer = setTimeout(()=>{
      start = null;
      if(navigator.vibrate) navigator.vibrate(12);
      editItem = card.dataset.id;
      swallow = true; setTimeout(()=>{ swallow = false; }, 600); // klikket, når man slipper, skal ikke gøre noget
      render();
    }, LONG_PRESS_CARD);
  });
  window.addEventListener("pointermove", e=>{
    if(start && Math.hypot(e.clientX-start.x, e.clientY-start.y) > 8){ clearTimeout(timer); start = null; } // det var et scroll
  });
  const up = ()=>{ clearTimeout(timer); start = null; };
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
  list.addEventListener("contextmenu", e=>{ if(e.target.closest(".item .body")) e.preventDefault(); });

  document.addEventListener("click", e=>{
    if(swallow){ swallow = false; e.stopPropagation(); e.preventDefault(); } // klikket efter det lange tryk
  }, true);
  onTapOutside(()=>!!editItem, t=>!!t.closest(".item-edit"), ()=>{
    editItem = null;
    return render; // listen tegnes først om, når klikket er spist
  });
})();
const LONG_PRESS_CARD = 500; // ms

// ===== Hold nede på en fane: fanerne ryster, og man kan trække dem i ny rækkefølge =====
// 1) Hold nede på en fane, så ryster de. 2) Hold igen på en fane, til den får et omrids; så har man fat i den
// og kan trække den. Trykker man og trækker med det samme, ruller man i stedet fanerækken.
// Et tryk (ikke et scroll) et vilkårligt sted uden for fanerne afslutter. Rækkefølgen bruges også i Top 3.
const LONG_PRESS = 500; // ms, for at få fanerne til at ryste
const GRAB_PRESS = 350; // ms, for at få fat i en fane, når de ryster
const arrange = {on:false, timer:null, start:null, dragEl:null, startX:0, lastX:0};
(()=>{
  const nav = $("#tabs");
  const catTabs = () => [...nav.querySelectorAll(".tab.cat")];
  const layoutLeft = el => el.getBoundingClientRect().left - (new DOMMatrix(getComputedStyle(el).transform).m41 || 0);

  function startArrange(){
    arrange.on = true;
    if(navigator.vibrate) navigator.vibrate(12);
    nav.classList.add("arranging");
    catTabs().forEach(t=>t.classList.add("jiggle"));
  }
  function stopArrange(){
    arrange.on = false; arrange.dragEl = null;
    renderTabs(); // kun fanerne, så det, man trykkede på, ikke skiftes ud midt i trykket
  }
  function beginDrag(el, x){
    arrange.dragEl = el; arrange.startX = x;
    el.classList.add("lifted");
    if(navigator.vibrate) navigator.vibrate(8);
  }
  function moveDrag(x){
    const el = arrange.dragEl;
    // Kør fanerækken med, når fanen trækkes ud mod kanten
    const r = nav.getBoundingClientRect(), edge = 44;
    const s0 = nav.scrollLeft;
    if(x < r.left + edge) nav.scrollLeft -= 10; else if(x > r.right - edge) nav.scrollLeft += 10;
    arrange.startX -= nav.scrollLeft - s0;
    el.style.transform = `translateX(${x - arrange.startX}px) scale(1.04)`;
    // Byt plads med naboen, når fanens midte passerer naboens midte
    const tabs = catTabs(), i = tabs.indexOf(el);
    const mid = el.getBoundingClientRect().left + el.offsetWidth/2;
    const prev = tabs[i-1], next = tabs[i+1];
    let moved = null;
    // Det er naboen, der flyttes i DOM'en; den trukne fane bliver, hvor den er, så fingeren ikke "slipper" den
    if(next && mid > next.getBoundingClientRect().left + next.offsetWidth/2) moved = ()=>el.before(next);
    else if(prev && mid < prev.getBoundingClientRect().left + prev.offsetWidth/2) moved = ()=>el.after(prev);
    if(moved){
      const before = layoutLeft(el);
      moved();
      arrange.startX += layoutLeft(el) - before; // så fanen bliver under fingeren
      el.style.transform = `translateX(${x - arrange.startX}px) scale(1.04)`;
    }
  }
  function endDrag(){
    const el = arrange.dragEl; if(!el) return;
    arrange.dragEl = null;
    el.classList.remove("lifted");
    el.style.transform = "";
    state.navne = state.navne || {};
    state.navne._order = catTabs().map(t=>t.dataset.id).join(",");
    persist(); renderMenu();
  }

  nav.addEventListener("pointerdown", e=>{
    const tab = e.target.closest(".tab.cat");
    if(!tab || editing || deleting) return;
    arrange.start = {x:e.clientX, y:e.clientY}; arrange.lastX = e.clientX;
    clearTimeout(arrange.timer);
    const id = e.pointerId;
    arrange.timer = arrange.on
      ? setTimeout(()=>{ arrange.start = null; beginDrag(tab, arrange.lastX); try{ tab.setPointerCapture(id); }catch(_){} }, GRAB_PRESS) // få fat i fanen
      : setTimeout(()=>{ arrange.start = null; startArrange(); }, LONG_PRESS); // få fanerne til at ryste
  });
  window.addEventListener("pointermove", e=>{
    arrange.lastX = e.clientX;
    if(arrange.dragEl){ moveDrag(e.clientX); return; }
    // Flytter fingeren sig, før tiden er gået, er det et scroll af fanerækken
    if(arrange.start && Math.hypot(e.clientX-arrange.start.x, e.clientY-arrange.start.y) > 8){ clearTimeout(arrange.timer); arrange.start = null; }
  });
  const up = ()=>{ clearTimeout(arrange.timer); arrange.start = null; endDrag(); };
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
  // Mens man trækker på en telefon, må siden ikke scrolle
  document.addEventListener("touchmove", e=>{ if(arrange.dragEl) e.preventDefault(); }, {passive:false});
  nav.addEventListener("contextmenu", e=>{ if(e.target.closest(".tab.cat")) e.preventDefault(); });

  // Et tryk uden for fanerne afslutter (et scroll gør ikke), og trykket gør ikke andet end det
  onTapOutside(()=>arrange.on && !arrange.dragEl, t=>!!t.closest(".tab.cat"), ()=>{ stopArrange(); return null; });
  // Et tryk på en fane, mens de ryster, skifter ikke kategori
  document.addEventListener("click", e=>{
    if(arrange.on && e.target.closest(".tab.cat")){ e.stopPropagation(); e.preventDefault(); }
  }, true);
})();

$("#f-untried").onchange = renderList;

const knownTab = h => h===NY || allCats().some(c=>c.id===h);
function fromHash(){ const h = location.hash.slice(1); if(knownTab(h)){ current=h; render(); } }
window.addEventListener("hashchange", fromHash);

loadLocal();
const h0 = location.hash.slice(1); if(knownTab(h0)) current = h0;
applyVibe();
render();
setSync("Gemmes på denne enhed.");

// ===== Witchy: "Welcome back"-popup =====
// Vises, når siden åbnes (ikke ved en almindelig genindlæsning), og når man kommer tilbage efter et stykke tid væk.
// "Continue Journey!" lukker den hurtigt, mens en flok flagermus flyver ud fra den.
const AWAY_MS = 10 * 60 * 1000; // 10 minutter væk, før den vises igen
// Klassisk tegnefilmsflagermus: spidse ører, krop og takkede vinger. Hver vinge er sin egen del, så den kan baske.
const BAT_WING = "M50 30 Q60 18 72 12 Q84 6 98 10 Q93 17 92 26 Q87 22 82 25 Q80 30 80 35 Q75 30 69 32 Q65 34 63 40 Q58 34 52 36 Z";
const batSvg = '<svg viewBox="0 0 100 50" aria-hidden="true">'
  + '<path class="wing r" fill="currentColor" d="'+BAT_WING+'"/>'
  + '<path class="wing l" fill="currentColor" d="'+BAT_WING+'" transform="matrix(-1 0 0 1 100 0)"/>'
  + '<path fill="currentColor" d="M44 22 L43 11 L48 17 Q50 16 52 17 L57 11 L56 22 Q57 31 50 40 Q43 31 44 22 Z"/>'
  + '</svg>';

function showWelcome(){
  if(!isWitchy() || $(".welcome")) return;
  const tasted = allItems().filter(i=>isTried(i.id)).length;
  const ov = document.createElement("div"); ov.className = "welcome";
  ov.innerHTML = '<div class="welcome-card" role="dialog" aria-modal="true" aria-labelledby="welcome-h">'
    + '<div class="welcome-moon" aria-hidden="true">☾</div>'
    + '<h2 id="welcome-h">Welcome back</h2>'
    + '<p></p>'
    + '<button class="btn" type="button">Continue Journey!</button></div>';
  ov.querySelector("p").textContent = tasted
    ? "The cauldron is still warm. " + tasted + (tasted===1 ? " brew" : " brews") + " tasted so far."
    : "The cauldron is warm and the first brews are waiting.";
  const btn = ov.querySelector("button");
  btn.onclick = ()=>closeWelcome(ov);
  ov.addEventListener("click", e=>{ if(e.target===ov) closeWelcome(ov); });
  document.addEventListener("keydown", function esc(e){ if(e.key==="Escape"){ document.removeEventListener("keydown", esc); closeWelcome(ov); } });
  document.body.append(ov);
  btn.focus({preventScroll:true});
}

function closeWelcome(ov){
  if(ov.classList.contains("closing")) return;
  ov.classList.add("closing");
  const card = ov.querySelector(".welcome-card");
  const r = card.getBoundingClientRect();
  if(!matchMedia("(prefers-reduced-motion: reduce)").matches) releaseBats(r.left + r.width/2, r.top + r.height/2);
  setTimeout(()=>ov.remove(), 380);
}

// Som i tegnefilm, når nogen går ind i en hule: kortet bliver til et mørkt hul, og en hel sværm
// af sorte flagermus eksploderer ud af det på én gang, kommer imod en, flagrer i zigzag og er væk på lidt over et sekund.
function releaseBats(cx, cy){
  const n = 34;
  const far = Math.hypot(innerWidth, innerHeight) * .75;
  for(let k=0; k<n; k++){
    const bat = document.createElement("div"); bat.className = "bat";
    bat.innerHTML = batSvg;
    bat.style.opacity = 0; // usynlig, indtil animationen tager over, så de aldrig står og klumper i midten
    const w = 30 + Math.random()*26;
    bat.style.width = w + "px"; bat.style.height = (w/2) + "px";
    bat.style.left = (cx - w/2) + "px"; bat.style.top = (cy - w/4) + "px";
    bat.style.setProperty("--flap", (0.07 + Math.random()*0.05) + "s"); // hurtige, nervøse vingeslag
    document.body.append(bat);
    // Jævnt fordelt hele vejen rundt (lidt flere opad), så sværmen spreder sig som en eksplosion
    let ang = (k / n) * Math.PI * 2 + (Math.random()-.5) * .35;
    if(Math.sin(ang) > .4 && Math.random() < .4) ang = -ang;
    const dirX = Math.cos(ang), dirY = Math.sin(ang);
    const start = 10 + Math.random()*30; // de starter på en lille ring om midten, ikke oven i hinanden
    const dist = far * (.8 + Math.random()*.5);
    const zig = (Math.random() < .5 ? -1 : 1) * (25 + Math.random()*45); // sidelæns zigzag
    const px = -dirY, py = dirX; // vinkelret på flyveretningen
    const grow = 1.3 + Math.random()*1.1; // de kommer imod en og bliver større
    const tilt = (Math.random()-.5) * 40;
    const at = (f, z, s, o) => {
      const d = start + (dist - start) * f;
      return {transform:`translate(${dirX*d + px*z}px,${dirY*d + py*z}px) rotate(${tilt*f}deg) scale(${s})`, opacity:o};
    };
    // Fart på fra start: en stor del af vejen tilbagelægges i første fjerdedel
    bat.animate([
      {...at(0,    0,       .6,       0), offset:0},
      {...at(.08,  zig*.3,  .9,       1), offset:.05},
      {...at(.3,  -zig*.6,  grow*.85, 1), offset:.22},
      {...at(.55,  zig,     grow,     1), offset:.45},
      {...at(.8,  -zig*.6,  grow*1.1, 1), offset:.72},
      {...at(1,    0,       grow*1.2, 0), offset:1}
    ], {duration: 900 + Math.random()*350, easing:"linear", delay: Math.random()*40, fill:"both"})
      .onfinish = ()=>bat.remove();
    setTimeout(()=>bat.remove(), 2000); // sikkerhed, hvis animationen bliver sat på pause, f.eks. i en baggrundsfane
  }
}

(()=>{
  const KEY = "smagsproever-velkommen";
  let opened = false;
  try{ opened = sessionStorage.getItem(KEY) === "1"; sessionStorage.setItem(KEY, "1"); }catch(e){}
  if(!opened) setTimeout(showWelcome, 350); // nyåbnet side, ikke en genindlæsning
  let hiddenAt = null;
  document.addEventListener("visibilitychange", ()=>{
    if(document.hidden) hiddenAt = Date.now();
    else if(hiddenAt && Date.now() - hiddenAt > AWAY_MS) showWelcome();
  });
})();

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
      // Vores egen ændring kommer straks tilbage som et "ekko". Den er allerede vist, og en ny tegning
      // ville afbryde animationerne, så vi venter med at tegne, til ændringen kommer fra den anden telefon.
      if(!first && snap.metadata.hasPendingWrites) return;
      if(snap.exists()){
        const d = snap.data() || {};
        state = {entries: d.entries || {}, custom: d.custom || [], kategorier: d.kategorier || [], navne: d.navne || {}};
        if(first) order = {}; // første gang de rigtige data kommer, sorteres listerne på ny
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