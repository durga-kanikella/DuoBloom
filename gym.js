/* NEW ME · Gym Room — replaces the Pet House. Images live in assets/gym/<her|him>/<key>.jpg (swap any file for sharper art).
   Edit names / prices in the lists below. Data is saved in state.pets[p] (owned, equipped, outfit, theme). */
(()=>{
const D="assets/gym/",PFX={eq:"",dec:"",acc:"",out:"o-",thm:"t-"};
const dec=[["neon","Neon sign",75],["poster","Motivational poster",50],["led","LED lights",65],["plant","Plant (Monstera)",40],["shelfplant","Plant shelf",75],["rug","Rug (round)",50],["mirror","Mirror",100],["wallshelf","Wall shelf",65]];
const L={
 her:{eq:[["mat","Yoga mat (pink)",0],["dumb","Dumbbell set",0],["tread","Treadmill",300],["bike","Spin bike",250],["ellip","Elliptical",300],["bench","Adjustable bench",125],["rack","Squat rack",375],["multi","Multi gym",450],["kettle","Kettlebell set",100],["barbell","Barbell set",250],["bands","Resistance bands",75],["pullup","Pull up bar",150]],
  dec:[...dec,["bottle","Water bottle stand",50]],
  acc:[["heart","Heart necklace",50],["star","Star necklace",60],["pearl","Pearl necklace",75],["hoops","Hoop earrings",40],["studs","Stud earrings",40],["charm","Charm bracelet",50],["swatch","Smart watch strap",75],["cap","Cap",50],["gbag","Gym bag",75],["clip","Hair clip",25],["shades","Sunglasses",40],["scrunch","Scrunchie set",30]],
  out:[["black","Black Set",0],["pink","Pink Set",100],["purple","Purple Set",100],["beige","Beige Set",125]],
  thm:[["pink","Aesthetic Pink","Soft and cozy vibes",0,""],["neutral","Minimal Neutral","Clean and modern",200,"#d9c3a5"],["dark","Dark Mode","Bold and powerful",200,"#6d5bd0"],["nature","Nature Vibes","Fresh and calming",200,"#6fbf73"],["sky","Sky Blue","Bright and energetic",200,"#4aa3e8"]]},
 him:{eq:[["dumb","Dumbbell set",0],["tread","Treadmill",300],["bike","Spin bike",250],["ellip","Elliptical",300],["bench","Adjustable bench",125],["rack","Squat rack",375],["multi","Multi gym",450],["kettle","Kettlebell set",100],["barbell","Barbell set",250],["bands","Resistance bands",75],["pullup","Pull up bar",150],["plates","Weight plates",100]],
  dec:[...dec,["bottle","Bottle stand",50]],
  acc:[["watch","Smart watch",100],["cwatch","Classic watch",125],["swatch","Sports watch",100],["capb","Cap (black)",50],["capw","Cap (white)",50],["shades","Sunglasses",50],["brace","Bracelet (leather)",60],["chain","Chain necklace",75],["ring","Ring (set)",60],["gbag","Gym bag",100],["wbottle","Water bottle",50],["phones","Headphones",75]],
  out:[["black","Black Set",0],["grey","Grey Set",100],["blue","Blue Set",125],["white","White Set",125],["sports","Sports Set",125]],
  thm:[["dark","Modern Dark","Bold and powerful",0,""],["neutral","Minimal Neutral","Clean and modern",200,"#d9c3a5"],["industrial","Industrial","Raw and strong",200,"#f59e0b"],["nature","Nature Vibes","Fresh and calming",200,"#6fbf73"],["blue","Blue Energy","Cool and focused",200,"#38bdf8"],["sunset","Sunset","Warm and motivating",200,"#fb923c"]]}};
const ITEMS=[];
for(const p of["her","him"])for(const c in L[p])L[p][c].forEach(a=>{const th=c==="thm";ITEMS.push({id:`${p}-${c}-${a[0]}`,name:a[1],sub:th?a[2]:"",category:c,price:th?a[3]:a[2],tint:th?a[4]:"",who:[p],img:`${D}${p}/${PFX[c]}${a[0]}.jpg`,variants:[""]})});
shopItems.length=0;shopItems.push(...ITEMS); // app.js wallet maths reads shopItems
const TABS=[["eq","🏋️","Equipment"],["dec","🪴","Decorations"],["out","🧍","My avatar"],["acc","💍","Accessories"],["thm","🏠","Themes"]];
const tab={her:"eq",him:"eq"},byId=id=>ITEMS.find(i=>i.id===id),pick=(p,c)=>ITEMS.filter(i=>i.category===c&&i.who[0]===p);
const has=(d,id)=>d.owned.some(o=>o.id===id),on=(d,id)=>d.equipped.some(o=>o.id===id);
function init(p){const d=petData(p);if(d.gym===2)return d;d.gym=2;d.owned=[];d.equipped=[];
 ITEMS.filter(i=>i.price===0&&i.who[0]===p).forEach(i=>{d.owned.push({id:i.id,variant:""});if(i.category==="eq")d.equipped.push({id:i.id,variant:""})});
 d.outfit=pick(p,"out")[0].id;d.theme=pick(p,"thm")[0].id;return d}
const ph=(i,badge)=>`<div class="gym-ph"><img src="${i.img}" alt="${i.name}" loading="lazy">${badge||""}</div>`;
function heroHTML(p,d){
 const th=byId(d.theme),tabName=(TABS.find(t=>t[0]===tab[p])||[])[2];
 const mine=ITEMS.filter(i=>["eq","dec"].includes(i.category)&&i.who[0]===p&&on(d,i.id)),wear=[byId(d.outfit),...ITEMS.filter(i=>i.category==="acc"&&i.who[0]===p&&on(d,i.id))];
 return `<div class="gym-hero" style="--glow:${th.tint||"transparent"}"><img src="${D}${p}/hero.jpg" alt="${esc(name(p))}'s gym room">${th.tint?'<div class="gym-tint"></div>':""}
 <div class="gym-top"><h2>${p==="her"?"My":"His"} Gym Room</h2><span class="gym-xp">⭐ ${petWallet(p)} XP</span></div>
 <div class="gym-nav">${TABS.map(([k,ic,l])=>`<button class="${tab[p]===k?"on":""}" data-tab="${k}" data-p="${p}"><span>${ic}</span>${k==="acc"&&p==="her"?"Jewellery":l}</button>`).join("")}</div></div>
 <div class="gym-strip"><b>In your room</b>${mine.map(i=>`<img src="${i.img}" alt="${i.name}" title="${i.name}">`).join("")||"Nothing placed yet"}</div>
 <div class="gym-strip"><b>Wearing</b>${wear.map(i=>`<img src="${i.img}" alt="${i.name}" title="${i.name}">`).join("")}</div>
 <div class="gym-h"><h3>${p==="her"&&tab[p]==="acc"?"Jewellery & accessories":tabName}</h3><small>Spend XP to unlock · tap Place to add to your room</small></div>`}
function card(p,d,i){
 const k=i.category,own=has(d,i.id),w=petWallet(p),act=k==="out"?d.outfit===i.id:k==="thm"?d.theme===i.id:on(d,i.id),can=w>=i.price;
 const lbl=k==="out"?(act?"Wearing":"Wear"):k==="thm"?(act?"Active":"Apply"):(k==="acc"?(act?"Take off":"Wear"):(act?"Remove":"Place"));
 const btn=own?`<button class="${act?"secondary":"primary"} sm" data-use="${i.id}" data-p="${p}" ${(k==="out"||k==="thm")&&act?"disabled":""}>${lbl}</button>`:`<button class="primary sm" data-buy="${i.id}" data-p="${p}" ${can?"":"disabled"}>${can?"Buy":"Need "+(i.price-w)+" XP"}</button>`;
 const badge=own?'<i class="own">✓</i>':can?"":'<i class="lock">🔒</i>',price=`<span>⭐ ${i.price?i.price+" XP":"Free"}</span>`;
 if(k==="thm")return `<div class="gym-theme ${act?"is-on":""}">${ph(i,badge)}<div><b>${i.name}</b><small>${i.sub}</small></div><div class="gym-foot">${price}${btn}</div></div>`;
 return `<div class="gym-item ${act?"is-on":""}">${ph(i,badge)}<b>${i.name}</b><div class="gym-foot">${price}${btn}</div></div>`}
window.renderPets=function(){
 const host=$("petSplit");if(!host)return;
 host.innerHTML=["her","him"].map(p=>{const d=init(p),k=tab[p],list=pick(p,k).map(i=>card(p,d,i)).join(""),o=byId(d.outfit);
  const prev=k==="out"?`<div class="gym-prev">${ph(o)}<div><b>${o.name}</b><small>Your current outfit</small></div></div>`:"";
  return `<div class="gym-col ${p}">${heroHTML(p,d)}${prev}<div class="${k==="thm"?"gym-themes":"gym-grid"}">${list}</div></div>`}).join("")};
$("petSplit")?.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;const p=b.dataset.p,d=petData(p);
 if(b.dataset.tab){tab[p]=b.dataset.tab;renderPets();return}
 const id=b.dataset.buy||b.dataset.use,it=byId(id);if(!it)return;
 if(b.dataset.buy){if(petWallet(p)<it.price){toast("Not enough XP yet");return}d.owned.push({id,variant:""});toast(`${it.name} unlocked!`)}
 if(it.category==="out")d.outfit=id;else if(it.category==="thm")d.theme=id;
 else{const was=on(d,id);d.equipped=d.equipped.filter(o=>o.id!==id);if(!was||b.dataset.buy)d.equipped.push({id,variant:""})}
 save()});
renderPets(); // replace the puppy columns the old code drew before this file loaded
})();
