const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const viewport = document.getElementById("viewport");
const hotspots = document.getElementById("hotspots");
const dragHint = document.getElementById("dragHint");
const progressBar = document.getElementById("progressBar");

const animals = [
  { id: "bear", name: "Niedźwiedź polarny", latin: "Ursus maritimus", zone: "KRÓL LODU", emoji: "🐻‍❄️", description: "Samica i jej młode przemierzają krawędź lodu morskiego w poszukiwaniu fok. Ich białe futro działa jak izolacja, a pod skórą znajduje się gruba warstwa tłuszczu.", fact: "Niedźwiedź polarny potrafi wyczuć fokę z odległości niemal kilometra.", stats: [["WAGA", "350–700 kg"], ["SIEDLISKO", "Lód morski"], ["DIETA", "Foki, ryby"], ["STATUS", "Narażony"]], position: [.17, .46], color: "#b7dbe1" },
  { id: "penguin", name: "Pingwin cesarski", latin: "Aptenodytes forsteri", zone: "SERCE KOLONII", emoji: "🐧", description: "Największy z pingwinów nurkuje w lodowatych wodach, gdzie poluje na ryby i kryl. W kolonii każdy osobnik rozpoznaje głos swojego partnera.", fact: "Pingwiny cesarskie potrafią nurkować na głębokość ponad 500 metrów.", stats: [["WZROST", "115 cm"], ["NURKOWANIE", "22 min"], ["DIETA", "Ryby, kryl"], ["STATUS", "Stabilny"]], position: [.65, .71], color: "#e4ae78" },
  { id: "seal", name: "Foka Weddella", latin: "Leptonychotes weddellii", zone: "POD POWIERZCHNIĄ", emoji: "🦭", description: "Foka Weddella spędza większość życia pod lodem. Zęby pomagają jej utrzymywać otwory oddechowe w zamarzającej tafli.", fact: "To jeden z najgłębiej nurkujących ssaków Antarktyki.", stats: [["WAGA", "400–600 kg"], ["GŁĘBOKOŚĆ", "800 m"], ["DIETA", "Ryby, kałamarnice"], ["ODDECH", "Do 80 min"]], position: [.43, .76], color: "#7398b5" },
  { id: "orca", name: "Orka oceaniczna", latin: "Orcinus orca", zone: "OTWARTY OCEAN", emoji: "🐋", description: "Orki tworzą złożone społeczności rodzinne i polują wspólnie. Ich charakterystyczna płetwa przecina wodę przy granicy lodowca.", fact: "Każda rodzina orek ma własny dialekt i techniki polowania.", stats: [["DŁUGOŚĆ", "8–9 m"], ["PRĘDKOŚĆ", "56 km/h"], ["DIETA", "Foki, ryby"], ["GRUPA", "Rodzinna"]], position: [.86, .65], color: "#3d7899" },
  { id: "albatross", name: "Albatros wędrowny", latin: "Diomedea exulans", zone: "NAD HORYZONTEM", emoji: "🕊️", description: "Wielki albatros wykorzystuje prądy powietrzne nad oceanem. Jego skrzydła są najdłuższe spośród wszystkich żyjących ptaków.", fact: "Może przelecieć dziesiątki tysięcy kilometrów bez lądowania.", stats: [["ROZPIĘTOŚĆ", "3,5 m"], ["LOT", "Szybowcowy"], ["DIETA", "Ryby, kałamarnice"], ["ŻYCIE", "Do 60 lat"]], position: [.76, .23], color: "#9bb9bf" },
  { id: "leopard", name: "Lampart morski", latin: "Hydrurga leptonyx", zone: "SAMOTNY ŁOWCA", emoji: "🦭", description: "Największy drapieżnik wśród fok Antarktyki. Smukłe ciało pozwala mu błyskawicznie ścigać pingwiny pod wodą.", fact: "Jego szczęki potrafią odfiltrowywać kryl niczym sito.", stats: [["DŁUGOŚĆ", "3–3,5 m"], ["WAGA", "200–600 kg"], ["DIETA", "Pingwiny, foki"], ["CHARAKTER", "Terytorialny"]], position: [.36, .58], color: "#5b8197" }
];

let dpr = window.devicePixelRatio || 1, W, H, offset = 0, targetOffset = 0, dragging = false, startX = 0, startOffset = 0, t = 0;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
function resize() { const r = viewport.getBoundingClientRect(); W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = `${W}px`; canvas.style.height = `${H}px`; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
function rnd(seed) { const x = Math.sin(seed * 999) * 43758.5453; return x - Math.floor(x); }
function poly(points, fill, stroke) { ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); } }
function iceberg(x, y, s, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha;
  poly([[x-s*.5,y+s*.12],[x-s*.36,y-s*.45],[x-s*.14,y-s*.14],[x+.04*s,y-s*.72],[x+.22*s,y-s*.12],[x+.5*s,y+.04*s],[x+.31*s,y+s*.24],[x-s*.31,y+s*.25]], "#c7eef0");
  poly([[x-s*.36,y-s*.45],[x-s*.14,y-s*.14],[x+.04*s,y-s*.72],[x+.02*s,y+s*.1],[x-s*.23,y+s*.08]], "#f0ffff");
  poly([[x+.02*s,y+s*.1],[x+.5*s,y+.04*s],[x+.31*s,y+s*.24],[x-s*.31,y+s*.25]], "#8ac4d0");
  ctx.restore();
}
function drawBear(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = "#e7f2ef"; ctx.strokeStyle = "#b8d5d4"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, 0, s*.55, s*.29, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(-s*.5, -s*.16, s*.25, 0, Math.PI*2); ctx.fill(); ctx.stroke(); ctx.fillStyle="#9aaead"; ctx.beginPath(); ctx.arc(-s*.65,-s*.2,s*.045,0,7); ctx.fill();
  ctx.fillStyle="#d7e8e5"; [-.25,.25].forEach(a=>{ctx.beginPath();ctx.ellipse(a*s,s*.27,s*.09,s*.17,0,0,7);ctx.fill();});
  ctx.restore();
}
function drawPenguin(x, y, s, bob=0) {
  ctx.save(); ctx.translate(x,y+bob); ctx.fillStyle="#101e2b"; ctx.beginPath();ctx.ellipse(0,0,s*.3,s*.56,0,0,7);ctx.fill();
  ctx.fillStyle="#f1f0df";ctx.beginPath();ctx.ellipse(0,s*.08,s*.18,s*.38,0,0,7);ctx.fill();ctx.fillStyle="#e9a65e";ctx.beginPath();ctx.moveTo(-s*.08,-s*.38);ctx.lineTo(s*.16,-s*.33);ctx.lineTo(-s*.08,-s*.25);ctx.fill();ctx.restore();
}
function drawSeal(x,y,s,wave=0) { ctx.save();ctx.translate(x,y);ctx.fillStyle="#718fa1";ctx.beginPath();ctx.ellipse(0,0,s*.55,s*.23,0,0,7);ctx.fill();ctx.fillStyle="#91afbb";ctx.beginPath();ctx.arc(s*.47,-s*.04,s*.18,0,7);ctx.fill();ctx.fillStyle="#233d4a";ctx.beginPath();ctx.arc(s*.51,-s*.08,s*.025,0,7);ctx.fill();ctx.restore(); }
function drawOrca(x,y,s) { ctx.save();ctx.translate(x,y);ctx.fillStyle="#122735";ctx.beginPath();ctx.ellipse(0,0,s*.75,s*.2,0,0,7);ctx.fill();ctx.fillStyle="#e8f0ed";ctx.beginPath();ctx.ellipse(s*.22,s*.05,s*.2,s*.1,0,0,7);ctx.fill();ctx.fillStyle="#0d2735";ctx.beginPath();ctx.moveTo(-s*.1,-s*.1);ctx.lineTo(s*.03,-s*.52);ctx.lineTo(s*.16,-s*.12);ctx.fill();ctx.restore(); }
function drawScene() {
  ctx.clearRect(0,0,W,H); offset += (targetOffset-offset)*.1;
  const horizon = H*.48, pan = offset;
  const sky = ctx.createLinearGradient(0,0,0,horizon); sky.addColorStop(0,"#153f51"); sky.addColorStop(.52,"#83c2ce"); sky.addColorStop(1,"#d4eef0"); ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  const aurora = ctx.createLinearGradient(0,0,W*.9,0); aurora.addColorStop(0,"rgba(87,235,215,.15)"); aurora.addColorStop(.48,"rgba(165,240,217,.3)"); aurora.addColorStop(1,"rgba(112,210,239,.08)"); ctx.fillStyle=aurora; ctx.fillRect(0,0,W,H*.28);
  ctx.fillStyle="rgba(240,253,248,.8)"; for(let i=0;i<100;i++){const x=(rnd(i)*W+pan*.15)%W,y=rnd(i+13)*H*.38;ctx.globalAlpha=rnd(i+4)*.5;ctx.fillRect(x,y,1,1)} ctx.globalAlpha=1;
  ctx.fillStyle="#a5d8df";ctx.beginPath();ctx.arc(W*.76,H*.17,42,0,7);ctx.fill();ctx.fillStyle="rgba(218,250,247,.38)";ctx.beginPath();ctx.arc(W*.76,H*.17,57,0,7);ctx.fill();
  const snow = ctx.createLinearGradient(0,horizon,0,H); snow.addColorStop(0,"#e8f6f2");snow.addColorStop(.32,"#b8e1e3");snow.addColorStop(1,"#7ab0be");ctx.fillStyle=snow;ctx.fillRect(0,horizon,W,H*.52);
  for(let i=0;i<10;i++){let x=(i*W*.15+pan*.25)% (W+160)-80; iceberg(x,H*.45-rnd(i)*45,100+rnd(i)*100,.5+rnd(i)*.45);}
  ctx.fillStyle="#19485a";ctx.beginPath();ctx.moveTo(0,H*.67);for(let x=0;x<=W;x+=40)ctx.lineTo(x,H*.66+Math.sin(x*.018+pan*.01)*13);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();
  ctx.fillStyle="#2a6d83";for(let i=0;i<12;i++){let x=(rnd(i+50)*W+pan*.55)%W;ctx.beginPath();ctx.ellipse(x,H*.7+rnd(i)*H*.2,30+rnd(i)*55,2,0,0,7);ctx.fill();}
  // distant ridges
  for(let i=0;i<7;i++){const x=(i*W*.21+pan*.12)%(W+300)-150; poly([[x,H*.56],[x+100,H*.32-rnd(i)*80],[x+210,H*.56]], "#a9d8db");}
  drawBear(W*.18+pan*.04,H*.57,45); drawBear(W*.23+pan*.04,H*.59,30);
  for(let i=0;i<9;i++) drawPenguin(W*.55+i*24+Math.sin(t*.02+i)*3+pan*.12,H*.69-rnd(i)*12,22,Math.sin(t*.04+i)*2);
  drawSeal(W*.4+pan*.18,H*.77,64); drawOrca(W*.86+pan*.1,H*.77,85);
  // foreground snow facets
  ctx.globalAlpha=.22; for(let i=0;i<12;i++){let x=(i*150+pan*.7)%W;poly([[x,H],[x+70,H*.78],[x+140,H]],"#eafffb")}ctx.globalAlpha=1;
  positionHotspots(); progressBar.style.width = `${25 + Math.abs(offset)/(W*.7)*65}%`;
  requestAnimationFrame(()=>{t++;drawScene()});
}
function positionHotspots() {
  hotspots.querySelectorAll(".hotspot").forEach((el)=>{const a=animals.find(x=>x.id===el.dataset.id); el.style.left=`${(a.position[0]*100 + offset/W*8 + 100)%108 - 4}%`;el.style.top=`${a.position[1]*100}%`;});
}
function openInfo(id) { const a=animals.find(x=>x.id===id); document.getElementById("infoKicker").textContent=a.zone; document.getElementById("infoTitle").textContent=a.name; document.getElementById("infoLatin").textContent=a.latin; document.getElementById("infoDescription").textContent=a.description; document.getElementById("infoFact").textContent=a.fact; document.getElementById("infoImage").dataset.emoji=a.emoji; document.getElementById("infoImage").style.background=`linear-gradient(135deg, ${a.color}, #102f3c)`; document.getElementById("factGrid").innerHTML=a.stats.map(x=>`<div><small>${x[0]}</small><strong>${x[1]}</strong></div>`).join(""); document.getElementById("infoPanel").classList.add("open");document.getElementById("backdrop").classList.add("open");document.getElementById("infoPanel").setAttribute("aria-hidden","false"); }
function buildUI() {
  animals.forEach(a=>{const h=document.createElement("button");h.className="hotspot";h.dataset.id=a.id;h.innerHTML=`<span class="pin">✦</span><span class="tag">${a.name.toUpperCase()}</span>`;h.addEventListener("click",e=>{e.stopPropagation();openInfo(a.id)});hotspots.appendChild(h);
    const card=document.createElement("button");card.className="animal-card";card.innerHTML=`<div class="animal-art" style="--animal-bg:linear-gradient(135deg,${a.color},#0d2b37)"></div><span class="arrow">↗</span><h4>${a.name}</h4><p>${a.zone}</p>`;card.addEventListener("click",()=>openInfo(a.id));document.getElementById("animalGrid").appendChild(card);
  });
}
viewport.addEventListener("pointerdown",e=>{dragging=true;startX=e.clientX;startOffset=targetOffset;viewport.classList.add("dragging");dragHint.classList.add("hidden");viewport.setPointerCapture(e.pointerId)});
viewport.addEventListener("pointermove",e=>{if(dragging){targetOffset=clamp(startOffset+(e.clientX-startX),-W*.7,W*.7)}});
viewport.addEventListener("pointerup",()=>{dragging=false;viewport.classList.remove("dragging")});
document.getElementById("closePanel").addEventListener("click",()=>{document.getElementById("infoPanel").classList.remove("open");document.getElementById("backdrop").classList.remove("open")});
document.getElementById("backdrop").addEventListener("click",()=>document.getElementById("closePanel").click());
window.addEventListener("resize",resize); buildUI(); resize(); drawScene();
setInterval(()=>{document.getElementById("clock").textContent=new Date().toLocaleTimeString("pl-PL",{hour:"2-digit",minute:"2-digit"})+" UTC"},1000);
