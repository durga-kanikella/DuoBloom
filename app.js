const $=id=>document.getElementById(id), today=()=>new Date().toISOString().slice(0,10);
const defaults={names:{her:"Her",him:"Him"},targets:{sleep:8,water:2.5,steps:8000},durations:[30,45,60,90,120],activities:["Cardio","Biceps","Abs","Back","Chest","Legs"],restLabel:"Rest day",xp:{sleep:10,water:10,steps:10,protein:10,fibre:10,gym:10,food:10},deduction:20,penalty:100,punishmentDays:30,milestoneFrequency:"monthly",punishments:["Plan a healthy meal together","Take a relaxing walk together"],habits:{her:["Supplement","Sunscreen"],him:["Supplement"]}};
let state=JSON.parse(localStorage.getItem("newme_data")||"null")||{settings:structuredClone(defaults),entries:{her:{},him:{}},_demoSeeded:true};
let draft={}; 
state.entries ||= {her:{},him:{}}; state.entries.her ||= {}; state.entries.him ||= {};
if(!Object.keys(state.entries.her).length && !Object.keys(state.entries.him).length) state._demoSeeded=true;
state.settings ||= structuredClone(defaults);
state.settings.xp = {...defaults.xp, ...(state.settings.xp||{})};
state.settings.penalty = Number.isFinite(Number(state.settings.penalty)) ? Number(state.settings.penalty) : 100;
state.settings.deduction = 20;
state.settings.punishmentDays = Number(state.settings.punishmentDays)||30;
state.settings.milestoneFrequency = "monthly";
delete state.settings.milestoneDays; delete state.settings.milestoneXP; delete state.settings.milestoneAmount;
// First-run demo data: three months of varied combinations for both profiles.
if(!state._emptyByChoice && !Object.keys(state.entries?.her||{}).length && !Object.keys(state.entries?.him||{}).length) {
 const now=new Date(); const start=new Date(now.getFullYear(),now.getMonth()-2,1);
 for(const person of ["her","him"]) {
  for(let offset=0;offset<Math.min(3,3);offset++) {
   const month=new Date(start.getFullYear(),start.getMonth()+offset,1);
   const daysInMonth=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
   for(let day=1;day<=daysInMonth;day++) {
    const dt=new Date(month.getFullYear(),month.getMonth(),day); if(dt>now) continue;
    const idx=(day+offset+(person==="him"?2:0))%8;
    const yesNo=["yes","no","not_today"];
    const e={sleep:["target","below","above","not_today"][idx%4],water:["target","below","above","not_today"][(idx+1)%4],steps:["target","below","above","not_today"][(idx+2)%4],protein:yesNo[idx%3],fibre:yesNo[(idx+1)%3],gym:idx===0||idx===5?{duration:"",activities:[],rest:true}:{duration:[30,45,60,90][idx%4],activities:[["Cardio"],["Biceps","Abs"],["Back"],["Legs","Chest"]][idx%4],rest:false},food:{sugar:yesNo[idx%3],maida:yesNo[(idx+1)%3],junk:yesNo[(idx+2)%3]},habits:{},createdAt:dt.toLocaleDateString()+" 8:00 PM",updatedAt:dt.toLocaleDateString()+" 8:00 PM"};
    for(const h of (defaults.habits[person]||[])) e.habits[h]=yesNo[(idx+h.length)%3];
    state.entries[person][`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`]=e;
   }
  }
 }
 state.pets ||= {her:{coins:0,owned:[],equipped:[]},him:{coins:0,owned:[],equipped:[]}};
}
state.pets ||= {her:{breedMonth:"",coins:0,owned:[],equipped:[]},him:{breedMonth:"",coins:0,owned:[],equipped:[]}};
const save=()=>{localStorage.setItem("newme_data",JSON.stringify(state));renderDashboard();renderProfiles();renderRecent();if(document.getElementById("petSplit"))renderPets();};
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const settings=()=>state.settings, name=p=>settings().names[p], entry=(p,d)=>state.entries[p][d];
function maxXP(){let x=settings().xp;return Object.keys(x).reduce((a,k)=>a+Number(x[k]||0)*(k==="food"?3:1),0)}
function dayMax(p,d){let e=p&&d?entry(p,d):null;if(!e)return maxXP();let x=settings().xp,m=0;for(let k of ["sleep","water","steps","protein","fibre"])if(e[k]!=="not_today")m+=+x[k];if(!e.gym?.rest)m+=+x.gym;m+=+x.food*["sugar","maida","junk"].filter(k=>e.food?.[k]!=="not_today").length;return m}
function threshold(p,d){return Math.min(Number(settings().minXP??50),dayMax(p,d))}
function xpFor(p,d){let e=entry(p,d);if(!e)return 0;let x=0;for(let k of ["sleep","water","steps"])if(e[k]==="target"||e[k]==="above")x+=+settings().xp[k];for(let k of ["protein","fibre"])if(e[k]==="yes")x+=+settings().xp[k];if(e.gym?.duration&&!e.gym.rest&&e.gym.activities?.length)x+=+settings().xp.gym;x+=+settings().xp.food*["sugar","maida","junk"].filter(k=>e.food?.[k]==="yes").length;return x}
function streak(p){let d=today(),n=0;while(entry(p,d)&&xpFor(p,d)>=threshold(p,d)){n++;d=shift(d,-1)}return n}
function shift(d,days){let x=new Date(d+"T12:00:00");x.setDate(x.getDate()+days);return x.toISOString().slice(0,10)}
function dateRange(start,end){let a=[];for(let d=start;d<=end;d=shift(d,1))a.push(d);return a}
function card(p){let e=entry(p,today()),x=xpFor(p,today()),pass=e&&x>=threshold(p,today());return `<div class="profile-card ${p}"><div class="profile-top"><div style="display:flex;align-items:center;gap:12px"><div class="avatar avatar-art"><img src="assets/${p}-avatar.png" alt="${p==='her'?'Cute queen avatar':'Cute king avatar'}"></div><div><div class="profile-name">${esc(name(p))}</div><div class="muted small">${e?"Today's check-in saved":"No check-in yet today"}</div>${typeof weightLine=="function"?weightLine(p):""}</div></div><span class="pill">${e?(pass?"ON TRACK":"KEEP GOING"):"PENDING"}</span></div><div class="big-xp">${e?x:0} <span class="muted" style="font-size:15px">/ ${dayMax(p,e?today():null)} XP</span></div><div class="progress"><span style="width:${Math.min(100,(e?x:0)/Math.max(1,dayMax(p,e?today():null))*100)}%"></span></div><div class="stat-row"><div class="mini-stat"><strong>${streak(p)} 🔥</strong><span>day streak</span></div><div class="mini-stat"><strong>${Object.keys(state.entries[p]).filter(d=>xpFor(p,d)>=threshold(p,d)).length}</strong><span>successful days</span></div><div class="mini-stat"><strong>${Object.keys(state.entries[p]).filter(d=>xpFor(p,d)<threshold(p,d)).length}</strong><span>lost days</span></div><div class="mini-stat"><strong>₹${typeof piggy=="function"?piggy(p):0}</strong><span>piggy bank</span></div></div><button class="secondary" onclick="openCheck('${p}')">${e?"Edit today's check-in":"Start check-in"} →</button></div>`}

const breeds=[
 {month:1,name:"Corgi",emoji:"🐕",vibe:"Tiny legs, huge personality"},
 {month:2,name:"Pomeranian",emoji:"🐩",vibe:"A fluffy little cloud"},
 {month:3,name:"Shiba Inu",emoji:"🐕‍🦺",vibe:"Confident, curious and cute"},
 {month:4,name:"Golden Retriever",emoji:"🦮",vibe:"Sunny, loyal best friend"},
 {month:5,name:"Dachshund",emoji:"🐶",vibe:"Long body, big heart"},
 {month:6,name:"Beagle",emoji:"🐶",vibe:"Playful little explorer"},
 {month:7,name:"French Bulldog",emoji:"🐕",vibe:"A snorty cuddle buddy"},
 {month:8,name:"Toy Poodle",emoji:"🐩",vibe:"Clever curls and charm"},
 {month:9,name:"Samoyed",emoji:"🐻‍❄️",vibe:"A smiling snow puff"},
 {month:10,name:"Shih Tzu",emoji:"🐶",vibe:"Royal little sweetheart"},
 {month:11,name:"Border Collie",emoji:"🐕‍🦺",vibe:"Bright, bouncy and clever"},
 {month:12,name:"Labrador",emoji:"🦮",vibe:"Everyone's best pal"}
];
const shopItems=[
 {id:"chain",name:"Fancy chain",emoji:"📿",category:"collar",price:30,variants:["Gold chain","Silver chain","Bronze chain"]},
 {id:"bell",name:"Jingle bell",emoji:"🔔",category:"collar",price:15,variants:["Gold bell","Silver bell","Bronze bell"]},
 {id:"collar",name:"Collar",emoji:"🎀",category:"collar",price:20,variants:["Gold buckle","Silver buckle","Bronze buckle"]},
 {id:"specs",name:"Tiny specs",emoji:"🤓",category:"accessory",price:25,variants:["Golden round","Silver star","Bronze retro"]},
 {id:"belt",name:"Style belt",emoji:"🧷",category:"accessory",price:20,variants:["Gold trim","Silver trim","Bronze trim"]},
 {id:"earring",name:"Earrings",emoji:"✨",category:"accessory",price:25,variants:["Gold hoops","Silver stars","Bronze hearts"]},
 {id:"bone",name:"Bone toy",emoji:"🦴",category:"toy",price:15,variants:["Golden bone","Silver bone","Bronze bone"]},
 {id:"ball",name:"Bouncy ball",emoji:"🧶",category:"toy",price:15,variants:["Gold shimmer","Silver sparkle","Bronze glow"]},
 {id:"dress",name:"Party dress",emoji:"👗",category:"clothing",price:40,variants:["Golden glam","Silver moon","Bronze rose"]},
 {id:"hoodie",name:"Cozy hoodie",emoji:"🧥",category:"clothing",price:35,variants:["Gold detail","Silver detail","Bronze detail"]},
 {id:"crown",name:"Tiny crown",emoji:"👑",category:"accessory",price:35,variants:["Gold crown","Silver crown","Bronze crown"]}
];
const chosenVariants={her:{},him:{}},petFilter={her:"all",him:"all"},petStages={};
function currentBreed(){let m=Number($("petMonthSelect")?.value||new Date().getMonth()+1);return breeds.find(b=>b.month===m)||breeds[0]}
function setupPetMonths(){let sel=$("petMonthSelect");if(!sel)return;let now=new Date(),cur=now.getMonth()+1;sel.innerHTML=breeds.filter(b=>b.month<=cur).map(b=>`<option value="${b.month}">${new Date(now.getFullYear(),b.month-1,1).toLocaleString(undefined,{month:"long"})} · ${b.name}</option>`).join("");sel.value=String(cur);sel.onchange=()=>renderPets()}
function petData(p){state.pets ||= {};state.pets[p] ||= {coins:0,owned:[],equipped:[]};let d=state.pets[p];d.owned ||= [];d.equipped ||= [];return d}
// Wallet = every XP point earned from saved check-ins minus what this profile has spent in its own boutique.
function totalXP(p){return Object.keys(state.entries[p]||{}).reduce((n,d)=>n+xpFor(p,d),0)}
function petSpent(p){return petData(p).owned.reduce((n,o)=>n+(shopItems.find(i=>i.id===o.id)?.price||0),0)}
function petWallet(p){return Math.max(0,totalXP(p)-petSpent(p))}
function outfitFor(p){return petData(p).equipped.map(o=>{let it=shopItems.find(i=>i.id===o.id);return it?{id:o.id,vi:Math.max(0,it.variants.indexOf(o.variant))}:null}).filter(Boolean)}
const catOptions=[["all","All items"],["collar","Collars, chains & bells"],["accessory","Accessories"],["toy","Toys & treats"],["clothing","Clothes"]];
function buildPetColumns(){
 const host=$("petSplit");if(!host||host.dataset.built)return;host.dataset.built="1";
 host.innerHTML=["her","him"].map(p=>`<div class="pet-col ${p}"><div class="pet-col-head"><div class="avatar avatar-art"><img src="assets/${p}-avatar.png" alt=""></div><div style="flex:1"><div class="profile-name" id="petName-${p}"></div><div class="muted small" id="petBreed-${p}"></div></div><div class="pet-wallet" id="petWallet-${p}"></div></div><div class="pet-stage" id="petStage-${p}"></div><div class="muted small pet-hint">Drag to turn your pup · double-tap to reset the view</div><div class="pet-wearing" id="petWearing-${p}"></div><div class="panel boutique"><div class="panel-head"><div><h2 id="shopTitle-${p}"></h2><p>Buy an item, then tap “Add to puppy” to dress your pup.</p></div><span class="pill">XP ONLY</span></div><div class="filters"><label>Item type<select id="petCategory-${p}">${catOptions.map(([v,l])=>`<option value="${v}">${l}</option>`).join("")}</select></label></div><div class="pet-shop" id="petShop-${p}"></div></div><div class="panel"><h2 id="wardrobeTitle-${p}"></h2><p class="muted small">Bought items stay in your own collection. Equip or unequip them anytime.</p><div id="petWardrobe-${p}"></div></div></div>`).join("");
 for(const p of ["her","him"]){petStages[p]=window.PetStage?window.PetStage($("petStage-"+p)):null;$("petCategory-"+p).onchange=e=>{petFilter[p]=e.target.value;renderShop(p)}}
 host.addEventListener("click",ev=>{const b=ev.target.closest("[data-act]");if(!b)return;const {act,p,id,v}=b.dataset;
  if(act==="variant"){chosenVariants[p][id]=v;renderShop(p)}
  else if(act==="buy")buyPetItem(p,id);
  else if(act==="equip")toggleEquip(p,id,v)});
}
function renderPets(){return; // old puppy renderer disabled; see gym.js

 if(!$("petSplit"))return;buildPetColumns();const breed=currentBreed();
 $("petMonth").innerHTML=`<div><span class="eyebrow">THIS MONTH'S UNLOCK</span><h2>${breed.name} is here! ${breed.emoji}</h2><p>${breed.vibe}. A new breed unlocks automatically each calendar month.</p></div><div class="breed">${breed.emoji}</div>`;
 for(const p of ["her","him"])renderPetCol(p,breed);
}
function renderPetCol(p,breed){
 const d=petData(p),st=petStages[p];
 $("petName-"+p).textContent=name(p)+"'s pup";$("petBreed-"+p).textContent=breed.name+" · personal pet";$("petWallet-"+p).textContent=petWallet(p)+" XP";
 $("shopTitle-"+p).textContent=name(p)+"'s boutique";$("wardrobeTitle-"+p).textContent=name(p)+"'s wardrobe";
 if(st){st.setBreed(breed.month);st.setOutfit(outfitFor(p))}
 else $("petStage-"+p).innerHTML=`<div class="pet-fallback"><div class="pet-fallback-dog">${breed.emoji}</div><div>${d.equipped.map(o=>shopItems.find(i=>i.id===o.id)?.emoji||"").join(" ")}</div><small>3D view needs an internet connection (Three.js) and WebGL.</small></div>`;
 $("petWearing-"+p).innerHTML=d.equipped.length?`<b>Wearing:</b> `+d.equipped.map(o=>`<span class="wear-chip">${shopItems.find(i=>i.id===o.id)?.emoji||""} ${esc(o.variant)}</span>`).join(""):`<span class="muted small">Nothing yet — buy something below and watch your pup dress up!</span>`;
 renderShop(p);renderWardrobe(p);
}
function renderShop(p){
 const d=petData(p),cat=petFilter[p],wallet=petWallet(p);
 $("petShop-"+p).innerHTML=shopItems.filter(i=>cat==="all"||i.category===cat).map(i=>{
  const variant=chosenVariants[p][i.id]||i.variants[0],owned=d.owned.some(o=>o.id===i.id&&o.variant===variant),worn=d.equipped.some(o=>o.id===i.id&&o.variant===variant),afford=wallet>=i.price;
  return `<div class="pet-item"><div class="item-emoji">${i.emoji}</div><h3>${i.name}</h3><div class="variant-list">${i.variants.map(v=>`<button class="variant ${v===variant?"selected":""}" data-act="variant" data-p="${p}" data-id="${i.id}" data-v="${esc(v)}">${esc(v)}</button>`).join("")}</div><div class="pet-item-foot"><b>${i.price} XP</b>${owned?`<button class="${worn?"secondary":"primary"}" data-act="equip" data-p="${p}" data-id="${i.id}" data-v="${esc(variant)}">${worn?"Take off":"Add to puppy"}</button>`:`<button class="primary" ${afford?"":"disabled"} data-act="buy" data-p="${p}" data-id="${i.id}">${afford?"Buy":"Need "+(i.price-wallet)+" XP"}</button>`}</div></div>`}).join("");
}
function renderWardrobe(p){
 const d=petData(p);
 $("petWardrobe-"+p).innerHTML=d.owned.length?d.owned.map(o=>{const it=shopItems.find(i=>i.id===o.id),eq=d.equipped.some(e=>e.id===o.id&&e.variant===o.variant);
  return `<div class="pet-wardrobe-item"><span class="item-emoji">${it?.emoji||"🎀"}</span><div style="flex:1"><b>${esc(it?.name||o.id)}</b><div class="muted small">${esc(o.variant)}</div></div><button class="secondary" data-act="equip" data-p="${p}" data-id="${esc(o.id)}" data-v="${esc(o.variant)}">${eq?"Unequip":"Equip"}</button></div>`}).join(""):'<div class="empty">Your collection is waiting for its first item.</div>';
}
function setEquipped(p,id,v,on){const d=petData(p);d.equipped=d.equipped.filter(o=>o.id!==id);if(on)d.equipped.push({id,variant:v})}
function buyPetItem(p,id){
 const it=shopItems.find(i=>i.id===id),d=petData(p),v=chosenVariants[p][id]||it.variants[0];
 if(d.owned.some(o=>o.id===id&&o.variant===v)){toast("You already own this style!");return}
 const wallet=petWallet(p);if(wallet<it.price){toast(`You need ${it.price-wallet} more XP for this item.`);return}
 d.owned.push({id,variant:v,boughtAt:new Date().toLocaleString()});
 save();toast(`Bought ${v}! Tap “Add to puppy” to dress your pup 🐾`);
}
function toggleEquip(p,id,v){const d=petData(p),on=!d.equipped.some(o=>o.id===id&&o.variant===v);setEquipped(p,id,v,on);save();toast(on?"Looking adorable! ✨":"Item put away")}

function renderDashboard(){$("todayLabel").textContent=new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});$("dashDate").textContent=today();$("compare").innerHTML=card("her")+card("him");}
function renderProfiles(){return;for(let p of ["her","him"]){$(p+"Nav").textContent="♡ "+name(p);$(p+"Title").textContent=name(p)+"’s activity";let dates=Object.keys(state.entries[p]).sort().reverse();$(p+"Profile").innerHTML=`<div class="compare">${card(p)}</div><div class="panel"><h2>Saved check-ins</h2>${dates.length?dates.map(d=>`<div class="activity-item"><div class="activity-head"><strong>${d} · ${xpFor(p,d)} XP ${xpFor(p,d)>=threshold(p,d)?"· Successful day":"· Below XP target"}</strong><button class="secondary" onclick="openCheck('${p}','${d}')">View / edit</button></div><div class="activity-meta">Saved: ${esc(entry(p,d).createdAt||"—")} · Updated: ${esc(entry(p,d).updatedAt||"—")}</div></div>`).join(""):'<div class="empty">No saved check-ins yet.</div>'}</div>`}}
function detailLines(p,d,e){
 const out=[],add=(label,val,xp,kind="xp")=>out.push({label,val,xp,kind}),x=settings().xp;
 for(let k of ["sleep","water","steps"]){let v=e[k]||"not answered";add(({sleep:"Sleep",water:"Water",steps:"Steps"})[k],v,["target","above"].includes(v)?+x[k]:0)}
 for(let k of ["protein","fibre"]){let v=e[k]||"not answered";add(k==="protein"?"Protein":"Fibre",v,v==="yes"?+x[k]:0)}
 if(e.gym?.rest)add("Gym",settings().restLabel+" selected",0,"rest");
 else if(e.gym?.duration&&e.gym?.activities?.length)add("Gym",e.gym.duration+" min · "+e.gym.activities.join(", "),+x.gym);
 else add("Gym","Not selected",0);
 for(const [k,t] of [["sugar","Sugar avoided"],["maida","Maida avoided"],["junk","Junk avoided"]]){const v=e.food?.[k]||"not answered";add(t,v,v==="yes"?+x.food:0)}
 for(let h of settings().habits[p]||[])add(h,e.habits?.[h]||"not answered",null,"noxp");
 return out;
}
const recentLimit={her:8,him:8};
const recentKinds=[["all","All activity"],["xp","Days with XP earned"],["missed","Missed XP items"],["habit","Optional habits done"],["rest","Rest days"]];
function buildRecentColumns(){
 const host=$("recentSplit");if(!host||host.dataset.built)return;host.dataset.built="1";
 host.innerHTML=["her","him"].map(p=>`<div class="recent-col ${p}"><div class="recent-head"><div class="avatar avatar-art small-avatar"><img src="assets/${p}-avatar.png" alt=""></div><h3 id="recentName-${p}"></h3><span class="pill" id="recentCount-${p}"></span></div><div class="filters compact"><label>From<input type="date" id="recentFrom-${p}"></label><label>To<input type="date" id="recentTo-${p}"></label><label>Activity<select id="recentKind-${p}">${recentKinds.map(([v,l])=>`<option value="${v}">${l}</option>`).join("")}</select></label><button class="secondary" id="recentClear-${p}">Clear</button></div><div id="recent-${p}"></div></div>`).join("");
 for(const p of ["her","him"]){
  for(const f of ["From","To","Kind"])for(const ev of ["change","input"])$("recent"+f+"-"+p).addEventListener(ev,()=>{recentLimit[p]=8;renderRecentCol(p)});
  $("recentClear-"+p).onclick=()=>{$("recentFrom-"+p).value="";$("recentTo-"+p).value="";$("recentKind-"+p).value="all";recentLimit[p]=8;renderRecentCol(p)};
 }
 host.addEventListener("click",ev=>{const b=ev.target.closest("[data-more]");if(!b)return;recentLimit[b.dataset.more]+=8;renderRecentCol(b.dataset.more)});
}
function renderRecent(){buildRecentColumns();for(const p of ["her","him"])renderRecentCol(p)}
function renderRecentCol(p){
 const from=$("recentFrom-"+p).value,to=$("recentTo-"+p).value,kind=$("recentKind-"+p).value;
 $("recentName-"+p).textContent=name(p);
 const rows=[];
 for(const d of Object.keys(state.entries[p]))if((!from||d>=from)&&(!to||d<=to)){
  const e=entry(p,d),lines=detailLines(p,d,e),
   earned=lines.filter(l=>l.kind==="xp"&&l.xp>0),missed=lines.filter(l=>l.kind==="xp"&&l.xp===0),
   hDone=lines.filter(l=>l.kind==="noxp"&&l.val==="yes"),hNot=lines.filter(l=>l.kind==="noxp"&&l.val!=="yes"),rest=lines.filter(l=>l.kind==="rest");
  if((kind==="xp"&&!earned.length)||(kind==="missed"&&!missed.length)||(kind==="habit"&&!hDone.length)||(kind==="rest"&&!rest.length))continue;
  rows.push({d,e,earned,missed,hDone,hNot,rest});
 }
 rows.sort((a,b)=>b.d.localeCompare(a.d));
 $("recentCount-"+p).textContent=rows.length+(rows.length===1?" day":" days");
 if(!rows.length){$("recent-"+p).innerHTML='<div class="empty">No activity matches these filters.</div>';return}
 const line=arr=>arr.length?arr.map(l=>l.label).join(", "):"None",shown=rows.slice(0,recentLimit[p]);
 $("recent-"+p).innerHTML=shown.map(({d,e,earned,missed,hDone,hNot,rest})=>{const xp=xpFor(p,d),ok=xp>=threshold(p,d);
  return `<div class="activity-item"><div class="activity-head"><strong>${d} · ${xp} XP</strong><span class="day-pill ${ok?"ok":"low"}">${ok?"Successful":"Below target"}</span><button class="secondary small-btn" onclick="openCheck('${p}','${d}')">View / edit</button></div><div class="activity-summary"><div><b>Earned XP:</b> ${esc(line(earned))}</div><div><b>No XP:</b> ${esc(line(missed))}</div><div><b>Optional habits done:</b> ${esc(line(hDone))}</div><div><b>Optional habits not done:</b> ${esc(line(hNot))}</div>${rest.length?`<div><b>Rest:</b> ${esc(line(rest))}</div>`:""}</div><div class="activity-meta">Recorded: ${esc(e.createdAt||"—")} · Updated: ${esc(e.updatedAt||"—")}</div></div>`}).join("")
  +(rows.length>shown.length?`<button class="secondary more-btn" data-more="${p}">Show more (${rows.length-shown.length} more days)</button>`:"");
}
function openCheck(p="her",d=today()){$("checkPerson").value=p;$("checkDate").value=d;loadDraft();go("checkin")}
function loadDraft(){let p=$("checkPerson").value,d=$("checkDate").value||today(),e=entry(p,d);draft=JSON.parse(JSON.stringify(e||{sleep:"",water:"",steps:"",protein:"",fibre:"",gym:{duration:"",activities:[],rest:false},food:{sugar:"",maida:"",junk:""},habits:{}}));$("checkStatus").textContent=e?`Loaded saved check-in for ${d}. You can edit it.`:`New check-in for ${d}.`;renderCheckForm()}
function choiceGroup(key,title,sub,opts,val,rest=false){return `<div class="check-group"><h3>${title}</h3><p>${sub}</p><div class="choices">${opts.map(([v,label])=>`<button class="choice ${val===v?"selected":""} ${rest&&v==="rest"?"rest":""}" data-field="${key}" data-value="${v}">${label}</button>`).join("")}</div></div>`}
function renderCheckForm(){let s=settings(),p=$("checkPerson").value;let html=`<div class="panel"><div class="panel-head"><div><h2>${esc(name(p))}’s daily check-in</h2><p>Target options show your current settings.</p></div><span class="pill">${$("checkDate").value}</span></div>`;
html+=choiceGroup("sleep","😴 Sleep",`Target: ${s.targets.sleep} hours`,[["below","Below target"],["target","Target met"],["above","Target +"],["not_today","Not today"]],draft.sleep);
html+=choiceGroup("water","💧 Water",`Target: ${s.targets.water} litres`,[["below","Below target"],["target","Target met"],["above","Target +"],["not_today","Not today"]],draft.water);
html+=choiceGroup("steps","👟 Steps",`Target: ${Number(s.targets.steps).toLocaleString()} steps`,[["below","Below target"],["target","Target met"],["above","Target +"],["not_today","Not today"]],draft.steps);
html+=choiceGroup("protein","🥚 Protein","Did you meet your protein goal?",[["yes","Yes ✓"],["no","No"],["not_today","Not today"]],draft.protein)+choiceGroup("fibre","🥦 Fibre","Did you meet your fibre goal?",[["yes","Yes ✓"],["no","No"],["not_today","Not today"]],draft.fibre);
html+=`<div class="check-group"><h3>🏋️ Gym</h3><p>Choose a duration and any activities, or mark a rest day. Rest days earn no gym XP and are excluded from gym scoring.</p><div class="choices"><button class="choice ${draft.gym?.rest?"selected rest":""}" data-field="gymrest" data-value="rest">${esc(s.restLabel||"Rest day")} 🌿</button>${s.durations.map(n=>`<button class="choice ${draft.gym?.duration==n&&!draft.gym?.rest?"selected":""}" data-field="gymduration" data-value="${n}">${n} min</button>`).join("")}</div><p style="margin-top:14px">Activities</p><div class="choices">${s.activities.map(a=>`<button class="choice ${(draft.gym?.activities||[]).includes(a)&&!draft.gym?.rest?"selected":""}" data-field="gymactivity" data-value="${esc(a)}">${esc(a)}</button>`).join("")}</div></div>`;
html+=`<div class="check-group"><h3>🍓 Food choices</h3><p>Tap Yes when you avoided the item today. Each Yes earns its own XP.</p><div class="habit-grid">${[["sugar","Avoided sugary foods/drinks?"],["maida","Avoided maida / refined flour?"],["junk","Avoided junk food?"]].map(([k,t])=>`<div><b>${t}</b><div class="choices" style="margin-top:8px"><button class="choice ${draft.food?.[k]==="yes"?"selected":""}" data-field="food.${k}" data-value="yes">Yes</button><button class="choice ${draft.food?.[k]==="no"?"selected":""}" data-field="food.${k}" data-value="no">No</button><button class="choice ${draft.food?.[k]==="not_today"?"selected":""}" data-field="food.${k}" data-value="not_today">Not today</button></div></div>`).join("")}</div></div>`;
html+=`<div class="check-group"><h3>🌼 Optional habits · no XP</h3><p>These habits do not affect your XP or pass threshold.</p><div class="habit-grid">${(s.habits[p]||[]).map(h=>`<label class="habit"><input type="checkbox" data-habit="${esc(h)}" ${draft.habits?.[h]==="yes"?"checked":""}>${esc(h)}</label>`).join("")||'<span class="muted">Add optional habits in Settings.</span>'}</div></div><div class="stat-row"><div class="mini-stat"><strong id="draftXP">${draftXP()}</strong><span>XP so far</span></div><div class="mini-stat"><strong id="draftMax">${draftMax()}</strong><span>max XP today</span></div><div class="mini-stat"><strong>${Math.max(0,draftMax()-Number(s.deduction||0))}</strong><span>XP needed to pass</span></div></div></div>`;$("checkForm").innerHTML=html;
$("checkForm").querySelectorAll("[data-field]").forEach(b=>b.addEventListener("click",()=>{let k=b.dataset.field,v=b.dataset.value;if(k==="gymrest"){draft.gym={duration:"",activities:[],rest:true}}else if(k==="gymduration"){draft.gym.rest=false;draft.gym.duration=+v}else if(k==="gymactivity"){draft.gym.rest=false;draft.gym.activities=draft.gym.activities||[];draft.gym.activities=draft.gym.activities.includes(v)?draft.gym.activities.filter(a=>a!==v):[...draft.gym.activities,v]}else if(k.startsWith("food.")){draft.food[k.split(".")[1]]=v}else draft[k]=v;renderCheckForm()}));
$("checkForm").querySelectorAll("[data-habit]").forEach(c=>c.addEventListener("change",()=>{draft.habits=draft.habits||{};draft.habits[c.dataset.habit]=c.checked?"yes":"no"}))}
function draftMax(){let P=$("checkPerson").value,D=$("checkDate").value,old=entry(P,D);state.entries[P][D]=draft;let m=dayMax(P,D);if(old)state.entries[P][D]=old;else delete state.entries[P][D];return m}
function draftXP(){let old=entry($("checkPerson").value,$("checkDate").value);state.entries[$("checkPerson").value][$("checkDate").value]=draft;let x=xpFor($("checkPerson").value,$("checkDate").value);if(old)state.entries[$("checkPerson").value][$("checkDate").value]=old;else delete state.entries[$("checkPerson").value][$("checkDate").value];return x}
function loadDemoData(force=false){
 if(force && !confirm("Load the NEW ME sample dataset? This replaces existing check-ins and resets settings on this browser.")) return;
 state.settings=JSON.parse(JSON.stringify(defaults));
 state.entries={her:{},him:{}};
 const now=new Date();
 // Previous two complete months plus every date in the current month through today.
 for(const person of ["her","him"]) {
  for(let offset=2;offset>=0;offset--) {
   const month=new Date(now.getFullYear(),now.getMonth()-offset,1);
   const daysInMonth=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
   const limit=offset===0?now.getDate():daysInMonth;
   for(let day=1;day<=limit;day++) {
    const dt=new Date(month.getFullYear(),month.getMonth(),day);
    const key=`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const idx=(day+offset+(person==="him"?2:0))%8;
    const choices=["yes","no","not_today"];
    const sleep=["target","below","above","not_today"][idx%4];
    const water=["target","below","above","not_today"][(idx+1)%4];
    const steps=["target","below","above","not_today"][(idx+2)%4];
    const gym=(idx===0||idx===5)?{duration:"",activities:[],rest:true}:{duration:[30,45,60,90][idx%4],activities:[["Cardio"],["Biceps","Abs"],["Back"],["Legs","Chest"]][idx%4],rest:false};
    const stamp=new Date(dt.getFullYear(),dt.getMonth(),dt.getDate(),20,0,0).toLocaleString();
    const e={sleep,water,steps,protein:choices[idx%3],fibre:choices[(idx+1)%3],gym,food:{sugar:choices[idx%3],maida:choices[(idx+1)%3],junk:choices[(idx+2)%3]},habits:{},createdAt:stamp,updatedAt:stamp,petCreditedXP:0,_demo:true};
    for(const h of (defaults.habits[person]||[])) e.habits[h]=choices[(idx+h.length)%3];
    state.entries[person][key]=e;
   }
  }
 }
 state.pets={her:{breedMonth:"",coins:0,owned:[],equipped:[]},him:{breedMonth:"",coins:0,owned:[],equipped:[]}};
 state._demoSeeded=true;
 try {
  localStorage.setItem("newme_data",JSON.stringify(state));
  renderSettings();
  save();
  // Refresh the actual visible check-in form and history after seeding.
  $("checkDate").value=today();
  loadDraft();
  renderCheckForm();
  renderRecent();
  renderDashboard();
  renderProfiles();
  setupPetMonths();
  renderPets();
  report();
  const status=$("settingsSaveStatus");
  if(status) status.textContent=`Sample data loaded successfully: ${Object.keys(state.entries.her).length} Her logs and ${Object.keys(state.entries.him).length} Him logs.`;
  toast("Sample check-ins loaded for both profiles ♡");
 } catch(err) {
  console.error("NEW ME sample-data load failed:",err);
  const status=$("settingsSaveStatus");
  if(status) status.textContent=`Sample data was generated but the screen could not refresh: ${err.message}`;
  toast("Sample data load error — check browser console");
 }
}
function renderSettings(){let s=settings();$("herName").value=s.names.her;$("himName").value=s.names.him;const targetId={sleep:"sleepTarget",water:"waterTarget",steps:"stepTarget"};for(let k of ["sleep","water","steps"])$(targetId[k]).value=s.targets[k];$("gymDurations").value=s.durations.join(", ");$("gymActivities").value=s.activities.join(", ");$("restLabel").value=s.restLabel||"Rest day";for(let k of Object.keys(s.xp))$("xp"+k[0].toUpperCase()+k.slice(1)).value=s.xp[k];$("xpDeduction").value=s.deduction;$("missPenalty").value=s.penalty;$("punishmentDays").value=s.punishmentDays;$("punishments").value=s.punishments.join("\n");$("herHabits").value=s.habits.her.join(", ");$("himHabits").value=s.habits.him.join(", ");$("thresholdPreview").textContent=`Maximum possible XP: ${maxXP()} · Deduction: ${s.deduction} · Passing threshold: ${threshold()} XP (exactly ${threshold()} passes).`}
function report(){
 let period=$("reportPeriod").value,end=$("reportEnd").value||today(),start=$("reportStart").value||end;
 if(period!=="custom"){let days={daily:1,weekly:7,biweekly:14,monthly:30,yearly:365}[period];start=shift(end,-(days-1));$("reportStart").value=start}
 let dates=dateRange(start,end),prevEnd=shift(start,-1),daysCount=Math.max(1,dates.length),prevStart=shift(prevEnd,-(daysCount-1)),prevDates=dateRange(prevStart,prevEnd);
 let data={};
 for(let p of ["her","him"]){
  let saved=dates.filter(d=>entry(p,d)),total=saved.reduce((n,d)=>n+xpFor(p,d),0),passed=saved.filter(d=>xpFor(p,d)>=threshold(p,d)).length,lost=saved.length-passed;
  let prevSaved=prevDates.filter(d=>entry(p,d)),prevTotal=prevSaved.reduce((n,d)=>n+xpFor(p,d),0);
  let cats=["sleep","water","steps","protein","fibre","gym","food"],counts={};
  for(let k of cats){counts[k]=saved.filter(d=>{let e=entry(p,d);if(k==="sleep"||k==="water"||k==="steps")return ["target","above"].includes(e[k]);if(k==="protein"||k==="fibre")return e[k]==="yes";if(k==="gym")return !e.gym?.rest&&!!e.gym?.duration&&!!e.gym?.activities?.length;return ["sugar","maida","junk"].every(f=>e.food?.[f]==="yes")}).length}
  data[p]={saved,total,passed,lost,prevTotal,prevSaved:prevSaved.length,counts,rate:saved.length?Math.round(passed/saved.length*100):0,avg:saved.length?Math.round(total/saved.length):0,prevAvg:prevSaved.length?Math.round(prevTotal/prevSaved.length):0};
 }
 $("reportOutput").innerHTML=`<div class="report-grid report-side-by-side">${["her","him"].map(p=>{let x=data[p],avatar=p==="her"?"her-avatar.png":"him-avatar.png";return `<div class="report-card ${p}"><div class="report-person"><img src="assets/${avatar}" alt="${esc(name(p))} avatar"><div><h2>${esc(name(p))}</h2><p class="muted">${start} to ${end}</p></div></div><div class="report-kpis"><div><strong>${x.total}</strong><span>Total XP</span></div><div><strong>${x.passed}</strong><span>Achieved days</span></div><div><strong>${x.lost}</strong><span>Lost days</span></div></div><h3>Daily XP trend</h3><div class="trend-bars">${dates.map(d=>{let has=!!entry(p,d),v=has?xpFor(p,d):0;return `<div class="trend-col" title="${d}: ${has?v+" XP":"No check-in"}"><span style="height:${Math.max(2,Math.min(100,v/Math.max(1,maxXP())*100))}%"></span><small>${d.slice(8)}</small></div>`}).join("")}</div><h3>Achieved vs lost days</h3><div class="outcome-bars"><div><span>Achieved</span><b>${x.passed}</b><i style="width:${Math.min(100,x.saved.length?x.passed/x.saved.length*100:0)}%"></i></div><div><span>Lost</span><b>${x.lost}</b><i style="width:${Math.min(100,x.saved.length?x.lost/x.saved.length*100:0)}%"></i></div></div><div class="report-row"><span>XP vs previous period</span><b>${x.total-x.prevTotal>=0?"+":""}${x.total-x.prevTotal} XP</b></div><div class="report-row"><span>Saved check-ins</span><b>${x.saved.length}/${daysCount}</b></div></div>`}).join("")}</div>`;
}
function go(page){document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id==="page-"+page));document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.page===page));if(page==="checkin"&&!$("checkDate").value)loadDraft();window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>go(b.dataset.page));document.querySelectorAll("[data-goto]").forEach(b=>b.onclick=()=>openCheck("her",today()));
$("checkPerson").onchange=loadDraft;$("checkDate").onchange=loadDraft;
$("saveCheckin").onclick=()=>{let p=$("checkPerson").value,d=$("checkDate").value||today(),old=entry(p,d),now=new Date().toLocaleString();draft.createdAt=old?.createdAt||now;draft.updatedAt=now;draft.petCreditedXP=old?.petCreditedXP||0;state.entries[p][d]=JSON.parse(JSON.stringify(draft));let earned=xpFor(p,d),delta=earned-draft.petCreditedXP;if(delta>0)petData(p).coins+=delta;else if(delta<0)petData(p).coins=Math.max(0,petData(p).coins+delta);state.entries[p][d].petCreditedXP=earned;save();$("checkStatus").textContent=`Saved ${d} · ${xpFor(p,d)} XP · ${xpFor(p,d)>=threshold(p,d)?"You passed! ✨":"Keep going — tomorrow is a fresh start."}`;toast("Check-in saved ♡");renderCheckForm()};

function saveSettings(e){
 if(e && typeof e.preventDefault==="function")e.preventDefault();
 try {
  const s=settings();
  s.names={her:$("herName").value.trim()||"Her",him:$("himName").value.trim()||"Him"};
  s.targets.sleep=Math.max(1,Number($("sleepTarget").value)||8);
  s.targets.water=Math.max(.5,Number($("waterTarget").value)||2.5);
  s.targets.steps=Math.max(500,Number($("stepTarget").value)||8000);
  s.durations=$("gymDurations").value.split(",").map(v=>Number(v.trim())).filter(n=>Number.isFinite(n)&&n>0);
  if(!s.durations.length)s.durations=[30,45,60];
  s.activities=$("gymActivities").value.split(",").map(v=>v.trim()).filter(Boolean);
  if(!s.activities.length)s.activities=["Cardio","Strength"];
  s.restLabel=$("restLabel").value.trim()||"Rest day";
  for(const k of Object.keys(s.xp)){const el=$("xp"+k[0].toUpperCase()+k.slice(1));s.xp[k]=Math.max(0,Number(el.value)||0);}
  s.deduction=Math.max(0,Number($("xpDeduction").value)||0);
  s.penalty=Math.max(0,Number($("missPenalty").value)||0);
  s.punishmentDays=Math.max(1,Number($("punishmentDays").value)||30);
  s.punishments=$("punishments").value.split("\n").map(v=>v.trim()).filter(Boolean);
  s.habits={her:$("herHabits").value.split(",").map(v=>v.trim()).filter(Boolean),him:$("himHabits").value.split(",").map(v=>v.trim()).filter(Boolean)};
  localStorage.setItem("newme_data",JSON.stringify(state));
  renderDashboard();renderProfiles();renderRecent();renderPets();
  $("settingsSaveStatus").textContent="Saved on this device ✓";
  $("thresholdPreview").textContent=`Maximum possible XP: ${maxXP()} · Deduction: ${s.deduction} · Passing threshold: ${threshold()} XP (exactly ${threshold()} passes).`;
  toast("Settings saved ♡");
 } catch(err) {
  console.error("Could not save NEW ME settings:",err);
  const status=$("settingsSaveStatus");if(status)status.textContent="Could not save. Please refresh and try again.";
 }
}
$("saveSettingsBtn").addEventListener("click",saveSettings);
$("settingsForm").addEventListener("submit",saveSettings);
// Persist settings as the user edits them, so navigating away does not discard entered values.
// This stores a draft locally; clicking Save settings validates and confirms it.
function persistSettingsDraft(){
 try {
  const s=settings();
  s.names={her:$("herName").value.trim()||"Her",him:$("himName").value.trim()||"Him"};
  for(const k of ["sleep","water","steps"]){const n=Number($(({sleep:"sleepTarget",water:"waterTarget",steps:"stepTarget"})[k]).value);if(Number.isFinite(n)&&n>0)s.targets[k]=n;}
  const durations=$("gymDurations").value.split(",").map(v=>Number(v.trim())).filter(n=>Number.isFinite(n)&&n>0);if(durations.length)s.durations=durations;
  const activities=$("gymActivities").value.split(",").map(v=>v.trim()).filter(Boolean);if(activities.length)s.activities=activities;
  s.restLabel=$("restLabel").value.trim()||"Rest day";
  for(const k of Object.keys(s.xp)){const n=Number($("xp"+k[0].toUpperCase()+k.slice(1)).value);if(Number.isFinite(n)&&n>=0)s.xp[k]=n;}
  for(const [field,key,min] of [["xpDeduction","deduction",0],["missPenalty","penalty",0],["punishmentDays","punishmentDays",1]]){const n=Number($(field).value);if(Number.isFinite(n)&&n>=min)s[key]=n;}
  s.punishments=$("punishments").value.split("\n").map(v=>v.trim()).filter(Boolean);
  s.habits={her:$("herHabits").value.split(",").map(v=>v.trim()).filter(Boolean),him:$("himHabits").value.split(",").map(v=>v.trim()).filter(Boolean)};
  localStorage.setItem("newme_data",JSON.stringify(state));
  const status=$("settingsSaveStatus");if(status)status.textContent="Changes saved automatically on this device";
  const preview=$("thresholdPreview");if(preview)preview.textContent=`Maximum possible XP: ${maxXP()} · Deduction: ${s.deduction} · Passing threshold: ${threshold()} XP (exactly ${threshold()} passes).`;
 } catch(err) { console.error("Could not persist settings draft:",err); }
}
$("settingsForm").querySelectorAll("input,textarea,select").forEach(el=>{
 el.addEventListener("input",persistSettingsDraft);
 el.addEventListener("change",persistSettingsDraft);
});
$("loadDemoData").onclick=(event)=>{event?.preventDefault();loadDemoData(true);};
$("resetData").onclick=()=>{if(confirm("Restore the NEW ME demo dataset? This replaces check-ins and settings on this browser.")){loadDemoData(false);}};
$("reportPeriod").onchange=()=>{if($("reportPeriod").value!=="custom")report()};$("runReport").onclick=report;

function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)}
const totalDemoEntries=Object.keys(state.entries.her||{}).length+Object.keys(state.entries.him||{}).length;
if(totalDemoEntries===0){
  // Seed before any UI renderer runs, so an empty-state renderer cannot prevent sample initialization.
  loadDemoData(false);
} else {
  renderSettings();$("checkDate").value=today();$("reportEnd").value=today();$("reportStart").value=today();loadDraft();save();setupPetMonths();renderPets();report();
  const st=$("settingsSaveStatus");
  if(st) st.textContent=`Loaded ${Object.keys(state.entries.her||{}).length} Her logs and ${Object.keys(state.entries.him||{}).length} Him logs on this browser.`;
}


// Backup and Excel-compatible CSV import/export.
function downloadFile(filename, content, type){
 const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function fullBackup(){
 const payload={app:"NEW ME",formatVersion:1,exportedAt:new Date().toISOString(),settings:state.settings,entries:state.entries,pets:state.pets};
 downloadFile(`NEW_ME_backup_${today()}.json`,JSON.stringify(payload,null,2),"application/json");
 $("backupStatus").textContent="Full backup downloaded ✓";
}
const csvCols=["profile","date","sleep","water","steps","protein","fibre","gym_duration","gym_activities","gym_rest","food_sugar","food_maida","food_junk","habits_json","createdAt","updatedAt"];
function csvCell(v){let s=String(v??"");return `"${s.replace(/"/g,'""')}"`;}
function exportCsv(){
 const rows=[csvCols];
 for(const p of ["her","him"]) for(const [date,e] of Object.entries(state.entries[p]||{})){
  rows.push([p,date,e.sleep,e.water,e.steps,e.protein,e.fibre,e.gym?.duration,(e.gym?.activities||[]).join("|"),e.gym?.rest?"true":"false",e.food?.sugar,e.food?.maida,e.food?.junk,JSON.stringify(e.habits||{}),e.createdAt,e.updatedAt]);
 }
 const csv="\uFEFF"+rows.map(r=>r.map(csvCell).join(",")).join("\r\n");
 downloadFile(`NEW_ME_checkins_${today()}.csv`,csv,"text/csv;charset=utf-8");
 $("backupStatus").textContent=`Exported ${rows.length-1} check-ins to an Excel-compatible CSV ✓`;
}
function parseCsv(text){
 const rows=[];let row=[],field="",quoted=false;
 text=text.replace(/^\uFEFF/,"");
 for(let i=0;i<text.length;i++){const c=text[i];
  if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"')quoted=false;else field+=c;}
  else if(c==='"')quoted=true;else if(c===","){row.push(field);field="";}
  else if(c==="\n"){row.push(field);rows.push(row);row=[];field="";}
  else if(c!=="\r")field+=c;
 }
 if(field.length||row.length){row.push(field);rows.push(row);}
 if(!rows.length)return [];
 const headers=rows.shift().map(h=>h.trim());
 return rows.filter(r=>r.some(v=>v!=="")).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??""])));
}
function mergeCsvLogs(text){
 const rows=parseCsv(text);let count=0;
 for(const r of rows){
  const p=String(r.profile||"").toLowerCase().trim(),d=String(r.date||"").trim();
  if(!["her","him"].includes(p)||!/^\d{4}-\d{2}-\d{2}$/.test(d))continue;
  let habits={};try{habits=JSON.parse(r.habits_json||"{}");}catch{}
  const e={sleep:r.sleep||"",water:r.water||"",steps:r.steps||"",protein:r.protein||"",fibre:r.fibre||"",
   gym:{duration:r.gym_duration||"",activities:String(r.gym_activities||"").split("|").filter(Boolean),rest:String(r.gym_rest).toLowerCase()==="true"},
   food:{sugar:r.food_sugar||"",maida:r.food_maida||"",junk:r.food_junk||""},habits,
   createdAt:r.createdAt||new Date().toLocaleString(),updatedAt:r.updatedAt||new Date().toLocaleString()};
  state.entries[p][d]=e;count++;
 }
 if(!count)throw new Error("No valid rows found. Use a NEW ME CSV exported with profile and date columns.");
 localStorage.setItem("newme_data",JSON.stringify(state));
 renderSettings();$("checkDate").value=today();loadDraft();save();renderRecent();renderProfiles();report();
 $("backupStatus").textContent=`Imported ${count} check-ins. Matching profile/date entries were replaced; other dates were preserved.`;
}
$("exportFullBackup")?.addEventListener("click",fullBackup);
$("exportExcelCsv")?.addEventListener("click",exportCsv);
$("importBackupFile")?.addEventListener("change",async ev=>{
 const file=ev.target.files?.[0];if(!file)return;
 try{
  const content=await file.text();
  if(file.name.toLowerCase().endsWith(".json")){
   const obj=JSON.parse(content),candidate=obj?.formatVersion?obj:obj;
   if(!candidate||!candidate.settings||!candidate.entries?.her||!candidate.entries?.him)throw new Error("This JSON file is not a valid NEW ME full backup.");
   if(!confirm("Restore this full backup? It will replace settings, check-ins, and pet collections saved in this browser."))return;
   state.settings={...structuredClone(defaults),...candidate.settings,xp:{...defaults.xp,...(candidate.settings.xp||{})}};
   state.entries={her:candidate.entries.her||{},him:candidate.entries.him||{}};
   state.pets=candidate.pets||{her:{coins:0,owned:[],equipped:[]},him:{coins:0,owned:[],equipped:[]}};
   localStorage.setItem("newme_data",JSON.stringify(state));
   renderSettings();$("checkDate").value=today();loadDraft();save();setupPetMonths();renderPets();report();
   $("backupStatus").textContent="Full backup restored successfully ✓";
  }else if(file.name.toLowerCase().endsWith(".csv")){
   if(!confirm("Import these Excel CSV check-ins? Matching profile/date entries will be overwritten; other dates will be kept."))return;
   mergeCsvLogs(content);
  }else throw new Error("Choose a .json full backup or .csv exported from Excel.");
 }catch(err){console.error("Backup import failed:",err);$("backupStatus").textContent=`Import failed: ${err.message}`;}
 finally{ev.target.value="";}
});
