/* NEW ME v7: rules, piggy banks, punishments, milestones, celebration, insights */
(function(){
const S=()=>state.settings;
state.milestones ||= [];state.punDone ||= {};
const s0=S();s0.minXP??=50;s0.milestoneDays??=30;s0.periodMode||="month";s0.muscleDays??=5;s0.cycleStart||=today().slice(0,8)+"01";s0.weights||={her:{now:"",goal:""},him:{now:"",goal:""}};
const other=p=>p==="her"?"him":"her",day=d=>new Date(d+"T12:00:00"),fmt=d=>day(d).toLocaleDateString(undefined,{day:"numeric",month:"short"});
const cyc=(d,len)=>Math.floor((day(d)-day(S().cycleStart))/864e5/len);
const cycRange=(i,len)=>[shift(S().cycleStart,i*len),shift(S().cycleStart,i*len+len-1)];
state.milestones.forEach(m=>{if(m.month&&m.cycle==null){m.cycle=Math.max(0,mcyc(m.month+"-01"));delete m.month}});
window.weightLine=p=>{const w=S().weights?.[p]||{};return w.now||w.goal?`<div class="muted small">⚖️ ${w.now||"—"} kg now → goal ${w.goal||"—"} kg</div>`:""};
const lost=p=>Object.keys(state.entries[p]).filter(d=>xpFor(p,d)<threshold(p,d)).sort();
const lostIn=(p,i)=>lost(p).filter(d=>mcyc(d)===i).length;
const spentIn=(p,i)=>state.milestones.reduce((n,m)=>n+(m.done&&m.cycle===i&&other(m.owner)===p?Number(m.amount||0):0),0);
const bal=(p,i)=>Math.max(0,lostIn(p,i)*Number(S().penalty||0)-spentIn(p,i));
window.piggy=p=>bal(p,mcyc(today()));
const mm=()=>S().periodMode==="month";
const mcyc=d=>{if(!mm())return cyc(d,S().milestoneDays);const a=day(S().cycleStart),b=day(d);return (b.getFullYear()-a.getFullYear())*12+b.getMonth()-a.getMonth()};
const mRange=i=>{if(!mm())return cycRange(i,S().milestoneDays);const a=day(S().cycleStart),f=new Date(a.getFullYear(),a.getMonth()+i,1),l=new Date(a.getFullYear(),a.getMonth()+i+1,0),z=x=>`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`;return [z(f),z(l)]};
const cLabel=i=>{const[a,b]=mRange(i);return mm()?day(a).toLocaleString(undefined,{month:"long",year:"numeric"}):`${fmt(a)} – ${fmt(b)}`};
function msCard(m,del){const end=mRange(m.cycle)[1],open=today()>end,o=m.owner;
 const btn=del?`<button class="secondary" data-ms-del="${m.id}">Delete</button>`:m.done?'<span class="pill">DONE ✓</span>':open?`<button class="primary" data-ms-done="${m.id}">Achieved! Spend</button>`:`<span class="pill">Opens ${fmt(shift(end,1))}</span>`;
 return `<div class="ms-item ${m.done?"done":""}"><div><b>${esc(m.text)}</b><div class="muted small">${esc(name(o))} · ${cLabel(m.cycle)}${m.done?` · spent ₹${m.amount} from ${esc(name(other(o)))}'s piggy bank on ${esc(m.bought||"—")}`:""}</div></div>${btn}</div>`}

// Milestones remain active until achieved; status colour reflects how many months have elapsed.
msCard=function(m,del){
 const o=m.owner,cur=mcyc(today()),lag=Math.max(0,cur-Number(m.cycle||0));
 const lagText=lag===0?'Current month':lag===1?'Lagging · 1 month':`Lagging · ${lag} months`;
 const status=m.done?'<span class="ms-status ms-status-done">Completed ✓</span>':
   `<span class="ms-status ${lag===0?'ms-status-current':lag===1?'ms-status-late':'ms-status-overdue'}">${lagText}</span>`;
 const btn=del?`<button class="secondary" data-ms-del="${m.id}">Delete</button>`:
   m.done?'<span class="pill">DONE ✓</span>':`<button class="primary" data-ms-done="${m.id}">Achieved! Record reward</button>`;
 return `<div class="ms-item ${m.done?'done':''} ${lag>=2&&!m.done?'ms-lag-overdue':lag===1&&!m.done?'ms-lag-late':''}">
   <div class="ms-item-copy"><b>${esc(m.text)}</b>
   <div class="muted small">${esc(name(o))} · Started ${cLabel(m.cycle)}${m.done?` · reward ₹${m.amount} from ${esc(name(other(o)))}'s piggy bank on ${esc(m.bought||'—')}`:''}</div>
   <div class="ms-status-line">${status}${!m.done&&lag>0?`<span class="muted small">Started ${lag} month${lag===1?'':'s'} ago — still active</span>`:''}</div></div>${btn}</div>`;
};

function punishPeriods(){const len=Number(S().punishmentDays)||14,by={};
 Object.keys(state.entries.her).filter(d=>state.entries.him[d]&&xpFor("her",d)<threshold("her",d)&&xpFor("him",d)<threshold("him",d)).forEach(d=>{(by[cyc(d,len)]||=[]).push(d)});
 const list=S().punishments||[];return Object.keys(by).map(Number).sort((a,b)=>b-a).map(i=>({i,days:by[i].sort(),range:cycRange(i,len),over:today()>cycRange(i,len)[1],what:list.length?list[((i%list.length)+list.length)%list.length]:"(add punishment ideas in Settings)"}))}
function renderRewards(){const b=$("rewardsBoard");if(!b)return;const pen=Number(S().penalty||0),cur=mcyc(today());
 const bank=p=>{const n=lostIn(p,cur),hist=[1,2,3,4,5].map(k=>cur-k).filter(i=>i>=0).map(i=>`<tr><td>${cLabel(i)}</td><td>${lostIn(p,i)}</td><td>₹${lostIn(p,i)*pen}</td><td>₹${spentIn(p,i)}</td><td><b>₹${bal(p,i)}</b></td></tr>`).join("");
  return `<div class="ms-bank ${p}"><b>🐷 ${esc(name(p))}'s piggy bank · ${cLabel(cur)}</b><strong>₹${bal(p,cur)}</strong><span class="muted small">${n} lost day${n==1?"":"s"} × ₹${pen} = ₹${n*pen} deposited · ₹${spentIn(p,cur)} spent on ${esc(name(other(p)))}'s rewards</span><span class="muted small">Win a day with ${S().minXP}+ XP. Lost days this period: ${lost(p).filter(d=>mcyc(d)===cur).map(fmt).join(", ")||"none 🎉"}</span>${hist?`<table class="cmp"><tr><th>Earlier</th><th>Lost</th><th>Deposited</th><th>Spent</th><th>Left</th></tr>${hist}</table>`:""}</div>`};
 const pp=punishPeriods();
 b.innerHTML=`<div class="ms-banks">${bank("her")}${bank("him")}</div><h2 class="sub-h">Milestones</h2><div class="ms-cols">${["her","him"].map(p=>{const l=state.milestones.filter(m=>m.owner===p&&m.cycle<=cur&&(!m.done||m.cycle>=cur-1)).sort((a,c)=>c.cycle-a.cycle);return `<div><h3 class="who ${p}">${esc(name(p))}</h3>${l.map(m=>msCard(m)).join("")||'<div class="empty">No milestone yet — write one in Settings.</div>'}</div>`}).join("")}</div>`+
 `<h2 class="sub-h">Punishments <span class="muted small">(when both miss the same day · every ${S().punishmentDays} days)</span></h2>`+(pp.map(x=>`<div class="ms-item ${state.punDone[x.i]?"done":""}"><div><b>${esc(x.what)}</b><div class="muted small">${fmt(x.range[0])} – ${fmt(x.range[1])} · both missed ${x.days.length} day${x.days.length==1?"":"s"} (${x.days.map(fmt).join(", ")}) ${x.over?"":"· due at period end"}</div></div><label class="habit"><input type="checkbox" data-pun="${x.i}" ${state.punDone[x.i]?"checked":""}>Done</label></div>`).join("")||'<div class="empty">No shared lost days — no punishments. 💛</div>')+
 `<h2 class="sub-h">How points work</h2><div class="panel"><p class="muted">XP per habit: ${Object.entries(S().xp).map(([k,v])=>`${k} ${v}`).join(" · ")}. Under <b>${S().minXP} XP</b> a day is lost (Not today / rest days lower that day's maximum). Each lost day: ₹${pen} into your own piggy bank. Piggy banks and milestones run per ${mm()?"calendar month":S().milestoneDays+"-day period"}.</p></div>`;
 b.querySelectorAll("[data-ms-done]").forEach(x=>x.onclick=()=>doneMs(x.dataset.msDone));
 b.querySelectorAll("[data-pun]").forEach(x=>x.onchange=()=>{state.punDone[x.dataset.pun]=x.checked;save()})}
function doneMs(id){const m=state.milestones.find(x=>x.id===id);if(!m)return;const src=other(m.owner),av=bal(src,m.cycle);
 let amt=prompt(`Milestone achieved! 🎉\nHow much will ${name(m.owner)} spend from ${name(src)}'s piggy bank? (available ₹${av})`,"0");if(amt===null)return;amt=Number(amt);if(!(amt>=0)||amt>av){toast(`Enter 0 to ₹${av}.`);return}
 m.done=true;m.amount=amt;m.bought=(prompt("What was bought as the reward?","")||"").trim();save();toast("Milestone completed ✨")}
function renderSettingsExtras(){const s=S();const set=(i,v)=>{const e=$(i);if(e&&document.activeElement!==e)e.value=v??""};
 set("minXP",s.minXP);set("milestoneDays",s.milestoneDays);set("periodMode",s.periodMode);set("cycleStart",s.cycleStart);set("muscleDays",s.muscleDays);
 for(const p of["her","him"]){set(p+"WNow",s.weights[p].now);set(p+"WGoal",s.weights[p].goal)}
 const cur=Math.max(0,mcyc(today())),sel=$("msCycle");if(sel&&document.activeElement!==sel){sel.innerHTML=[0,1,2,3].map(k=>`<option value="${cur+k}">${k?"":"Current · "}${cLabel(cur+k)}</option>`).join("")}
 const l=$("msList");if(l){l.innerHTML=state.milestones.slice().sort((a,b)=>b.cycle-a.cycle).map(m=>msCard(m,1)).join("");l.querySelectorAll("[data-ms-del]").forEach(x=>x.onclick=()=>{state.milestones=state.milestones.filter(m=>m.id!==x.dataset.msDel);save()})}}
document.addEventListener("change",e=>{const id=e.target.id,n=Number(e.target.value),s=S();
 if(id==="minXP")s.minXP=Math.max(0,n);else if(id==="periodMode")s.periodMode=e.target.value;else if(id==="milestoneDays")s.milestoneDays=Math.max(1,n||30);else if(id==="muscleDays")s.muscleDays=Math.max(1,n||5);else if(id==="cycleStart"&&e.target.value)s.cycleStart=e.target.value;
 else if(/^(her|him)W(Now|Goal)$/.test(id)){s.weights[id.slice(0,3)==="her"?"her":"him"][id.endsWith("Now")?"now":"goal"]=e.target.value}else return;save()});
document.addEventListener("click",e=>{if(e.target.id!=="msAdd")return;const t=$("msText").value.trim();if(!t){toast("Write the milestone first.");return}
 state.milestones.push({id:"m"+Date.now(),owner:$("msOwner").value,cycle:Number($("msCycle").value),text:t,done:false});$("msText").value="";save()});
/* celebration / motivation card */
function showCard(html,cls){let o=$("celebrate");if(!o){o=document.createElement("div");o.id="celebrate";document.body.appendChild(o)}o.innerHTML=`<div class="cele-card ${cls}">${html}<button class="primary" id="celeClose">${cls==="win"?"Yay! ♡":"Okay, onwards"}</button></div>`;o.className="show";$("celeClose").onclick=()=>o.className=""}
const _sv=$("saveCheckin").onclick;$("saveCheckin").onclick=()=>{const p=$("checkPerson").value,d=$("checkDate").value||today();_sv();const x=xpFor(p,d),need=threshold(p,d),n=esc(name(p));
 if(x>=need)showCard(`<div class="confetti">🎉✨🎊💛🎉✨🎊</div><h2>${n} nailed it!</h2><p><b>${x} XP</b> today — above the ${need} XP you needed. Day won. Keep that glow going!</p>`,"win");
 else showCard(`<h2>Not quite today, ${n}</h2><p>${x} of ${need} XP. That's okay — one day doesn't define you. ₹${S().penalty} goes into your piggy bank and tomorrow is a fresh start. You've got this. 🌱</p>`,"try")};
/* insights */
const L=n=>dateRange(shift(today(),-(n-1)),today());
const NAMES={sleep:"Sleep",water:"Water",steps:"Steps",protein:"Protein",fibre:"Fibre",food:"Food"};
const met=(e,k)=>!e?null:k==="gym"?(e.gym?.rest?null:!!(e.gym?.duration&&e.gym?.activities?.length)):k==="food"?(["sugar","maida","junk"].every(f=>e.food?.[f]==="not_today")?null:["sugar","maida","junk"].every(f=>e.food?.[f]==="yes")):e[k]==="not_today"?null:["target","above","yes"].includes(e[k]);
const mins=(p,d)=>{const e=entry(p,d);return e&&!e.gym?.rest&&e.gym?.duration?Number(e.gym.duration):0};
const svgB=(lab,val,max,o={})=>{const w=360,h=150,bw=w/lab.length;return `<svg viewBox="0 0 ${w} ${h+22}" class="chart">${[0,.5,1].map(f=>`<line x1="0" x2="${w}" y1="${h-f*h}" y2="${h-f*h}" class="grid"/><text x="0" y="${h-f*h-2}" class="axis">${(max*f).toFixed(max<5?1:0)}${o.unit||""}</text>`).join("")}${val.map((v,i)=>{const bh=Math.max(1,v/max*h);return `<rect x="${i*bw+bw*.18}" y="${h-bh}" width="${bw*.64}" height="${bh}" rx="6" class="${o.warn&&o.warn[i]?"bar warn":"bar"}"/><text x="${i*bw+bw/2}" y="${h+14}" text-anchor="middle" class="axis">${lab[i]}</text>`}).join("")}${o.goal!=null?`<line x1="0" x2="${w}" y1="${h-o.goal/max*h}" y2="${h-o.goal/max*h}" class="goal"/>`:""}</svg>`};
const svgL=(lab,series,max,unit="")=>{const w=360,h=150,st=w/(lab.length-1||1);return `<svg viewBox="0 0 ${w+20} ${h+22}" class="chart">${[0,.5,1].map(f=>`<line x1="10" x2="${w+10}" y1="${h-f*h}" y2="${h-f*h}" class="grid"/><text x="10" y="${h-f*h-2}" class="axis">${Math.round(max*f)}${unit}</text>`).join("")}${series.map((s,k)=>`<polyline fill="none" class="ln l${k}" points="${s.vals.map((v,i)=>`${10+i*st},${h-(v/max)*h}`).join(" ")}"/>${s.vals.map((v,i)=>`<circle cx="${10+i*st}" cy="${h-(v/max)*h}" r="3.5" class="dot l${k}"/>`).join("")}`).join("")}${lab.map((t,i)=>`<text x="${10+i*st}" y="${h+14}" text-anchor="middle" class="axis">${t}</text>`).join("")}</svg><div class="legend">${series.map((s,k)=>`<span><i class="sw l${k}"></i>${s.name}</span>`).join("")}</div>`};
const streakG=(p,k)=>{let n=0,miss=[],d=today(),e0=entry(p,d)?null:1;for(let i=0;i<120;i++){const m=met(entry(p,d),k);if(m===true)n++;else if(m===false){miss.push(i);if(miss.length>1&&miss[miss.length-1]-miss[miss.length-2]<7)break}d=shift(d,-1)}return n};
const best=(p,k)=>{let b=0,r=0;Object.keys(state.entries[p]).sort().forEach(d=>{const m=met(entry(p,d),k);if(m===true){r++;b=Math.max(b,r)}else if(m===false)r=0});return b};
function buildIns(p){const s=S(),days=L(7),prev=dateRange(shift(today(),-13),shift(today(),-7)).slice(0,7),wd=["Su","Mo","Tu","We","Th","Fr","Sa"],lab=days.map(d=>wd[day(d).getDay()]),E=d=>entry(p,d);
 const acts=s.activities,cnt=acts.map(a=>days.filter(d=>E(d)&&!E(d).gym?.rest&&(E(d).gym?.activities||[]).includes(a)).length);
 const since=a=>{for(let i=0;i<60;i++){const e=E(shift(today(),-i));if(e&&!e.gym?.rest&&(e.gym?.activities||[]).includes(a))return i}return 99},stale=acts.map(a=>since(a)>=s.muscleDays);
 const gm=days.map(d=>mins(p,d)),tot=gm.reduce((a,b)=>a+b,0),sess=gm.filter(Boolean).length,rest=days.filter(d=>E(d)?.gym?.rest).length;
 const cntMet=(k,ds=days)=>ds.filter(d=>met(E(d),k)===true).length,den=(k,ds=days)=>ds.filter(d=>met(E(d),k)!==null).length;
 const sleepLv=days.map(d=>{const e=E(d);return !e||e.sleep==="not_today"||!e.sleep?0:({below:40,target:80,above:100})[e.sleep]||0}),perf=days.map(d=>E(d)?Math.round(xpFor(p,d)/Math.max(1,dayMax(p,d))*100):0);
 const stepLv=days.map(d=>{const e=E(d);return !e?0:({below:60,target:100,above:125})[e.steps]||0});
 const nut=["protein","fibre"].map(k=>[NAMES[k],Math.round(cntMet(k)/Math.max(1,den(k))*100)]).concat(["sugar","maida","junk"].map(f=>[{sugar:"No sugar",maida:"No maida",junk:"No junk"}[f],Math.round(days.filter(d=>E(d)?.food?.[f]==="yes").length/Math.max(1,days.filter(d=>E(d)&&E(d).food?.[f]&&E(d).food[f]!=="not_today").length)*100)]));
 const card=(t,sub,body,foot="")=>`<div class="panel ins"><h2>${t}</h2><p class="muted">${sub}</p>${body}${foot?`<p class="ins-foot">${foot}</p>`:""}</div>`;
 const wk=(ds)=>({gym:ds.reduce((n,d)=>n+mins(p,d),0),steps:cntMet("steps",ds),sleep:cntMet("sleep",ds),nut:ds.filter(d=>["protein","fibre","food"].every(k=>met(E(d),k)!==false)&&E(d)).length}),A=wk(days),B=wk(prev);
 const row=(t,a,b,u="")=>{const dl=a-b;return `<tr><td>${t}</td><td><b>${a}${u}</b></td><td>${b}${u}</td><td class="${dl>0?"up":dl<0?"down":""}">${dl>0?"▲ +":dl<0?"▼ ":"＝ "}${dl||""}${u}</td></tr>`};
 const shortSleep=days.filter(d=>E(d)?.sleep==="below").length,l3=L(3),perf3=l3.filter(E).map(d=>xpFor(p,d)/Math.max(1,dayMax(p,d))),perf7=days.filter(E).map(d=>xpFor(p,d)/Math.max(1,dayMax(p,d))),avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
 const warn=[];if(shortSleep>=3)warn.push(`Short sleep on ${shortSleep} of the last 7 days.`);if(l3.every(d=>E(d)?.sleep==="below")&&l3.every(E))warn.push("Short sleep 3 days in a row.");if(perf3.length>=2&&perf7.length>=4&&avg(perf3)<avg(perf7)*.7)warn.push(`Last ${perf3.length} days scored ${Math.round(avg(perf3)*100)}% of max XP vs ${Math.round(avg(perf7)*100)}% this week.`);
 const [y,mo]=($("insMonth").value||today().slice(0,7)).split("-").map(Number),first=new Date(y,mo-1,1),nd=new Date(y,mo,0).getDate(),off=(first.getDay()+6)%7;let cal=["Mo","Tu","We","Th","Fr","Sa","Su"].map(x=>`<b class="cal-h">${x}</b>`).join("")+'<i></i>'.repeat(off);
 for(let i=1;i<=nd;i++){const d=`${y}-${String(mo).padStart(2,"0")}-${String(i).padStart(2,"0")}`,e=E(d),dot=(k,ic)=>{const m=met(e,k);return `<span class="cd ${m===true?"ok":m===false?"no":""}" title="${NAMES[k]||"Gym"}">${ic}</span>`};cal+=`<div class="cal-d ${d===today()?"today":""}"><small>${i}</small>${e?dot("gym","🏋")+dot("sleep","😴")+dot("food","🥗")+dot("steps","👟"):""}</div>`}
 return [`<div class="panel ins"><h2>${esc(name(p))} · last 7 days</h2><p class="muted">🏋 gym · 😴 sleep · 🥗 food · 👟 steps — green met, red missed, grey skipped/rest.</p></div>`,
 card("Muscle balance","Groups not trained in the last "+s.muscleDays+"+ days are flagged.",`<div class="chips">${acts.map((a,i)=>`<span class="chip ${stale[i]?"warn":"ok"}">${esc(a)} · ${since(a)>=99?"not logged recently":since(a)===0?"today":since(a)+"d ago"}</span>`).join("")}</div>`,stale.some(Boolean)?"Consider adding: "+acts.filter((a,i)=>stale[i]).join(", ")+" to your next sessions.":"Nice — every group in your split was trained recently."),
 card("1. Muscle-group training frequency","Sessions per group in the last 7 days.",svgB(acts.map(a=>a.slice(0,6)),cnt,Math.max(3,...cnt),{warn:cnt.map(c=>c===0)}),"Frequency alone doesn't tell the full story — also track hard sets, exercise quality and recovery."),
 card("2. Gym duration — daily and weekly","Minutes per session.",svgB(lab,gm,Math.max(60,...gm),{unit:""}),`Total ${tot} min · ${sess} sessions · average ${sess?Math.round(tot/sess):0} min (rest days excluded; ${rest} rest day${rest==1?"":"s"}).`),
 card("3. Weekly fitness scorecard","Counted from your answers.",`<div class="score">${[["🏋",`${sess}/${days.length-rest||0}`,"Gym sessions"],["😴",`${cntMet("sleep")}/${den("sleep")}`,"Sleep target met"],["👟",`${cntMet("steps")}/${den("steps")}`,"Steps target met"],["🥚",`${cntMet("protein")}/${den("protein")}`,"Protein met"],["🥦",`${cntMet("fibre")}/${den("fibre")}`,"Fibre met"],["🍓",`${cntMet("food")}/${den("food")}`,"Clean-food days"]].map(([i,v,t])=>`<div><span>${i}</span><strong>${v}</strong><small>${t}</small></div>`).join("")}</div>`),
 card("Weekly comparison","This week vs the previous 7 days.",`<table class="cmp"><tr><th></th><th>This week</th><th>Last week</th><th>Change</th></tr>${row("Gym time",A.gym,B.gym," min")}${row("Steps days met",A.steps,B.steps)}${row("Sleep days met",A.sleep,B.sleep)}${row("Full nutrition days",A.nut,B.nut)}</table>`),
 card("4. Sleep vs performance","Sleep: below 40 / target 80 / above 100. Performance = % of the day's max XP. A pattern, not proof of cause.",svgL(lab,[{name:"Sleep",vals:sleepLv},{name:"Performance %",vals:perf}],100),""),
 card("5. Daily steps and consistency","Relative to your goal of "+Number(s.targets.steps).toLocaleString()+" steps (100 = goal; only target/above/below is logged).",svgB(lab,stepLv,125,{goal:100}),`${cntMet("steps")} of ${den("steps")} logged days met the goal.`),
 card("6. Nutrition habit adherence","% of logged days each habit was met.",svgB(nut.map(n=>n[0]),nut.map(n=>n[1]),100,{unit:"%"}),"A habit counts only when you answer Yes; Not today days are left out."),
 card("Habit streaks","Forgiving streaks: one missed day in any 7 doesn't break them. Not-today days are skipped.",`<table class="cmp"><tr><th></th><th>Current</th><th>Best strict</th></tr>${["protein","fibre","food"].map(k=>`<tr><td>${NAMES[k]}</td><td><b>${streakG(p,k)} 🔥</b></td><td>${best(p,k)}</td></tr>`).join("")}</table>`),
 card("Recovery check","Looks at repeated short sleep and a sudden drop in daily XP.",warn.length?`<div class="warnbox">⚠️ ${warn.join("<br>")}<br><b>Consider a lighter session or an extra rest day.</b></div>`:`<div class="okbox">✓ No recovery warnings right now.</div>`),
 card("Consistency calendar","Pick a month above.",`<div class="cal">${cal}</div>`)]}
function renderInsights(){const host=$("insightsBoard");if(!host)return;const p=window.activeProfile||"her";host.innerHTML=`<div class="ins-profile-label">Showing ${esc(name(p))}'s insights</div>`+buildIns(p).join("")}
document.addEventListener("change",e=>{if(e.target.id==="insPerson"||e.target.id==="insMonth")renderInsights()});
$("insMonth").value=today().slice(0,7);


// Insights views: personal insight dashboard + side-by-side comparison.
// Month view groups into week buckets. Week view shows each calendar day individually.
let insightMode="personal";
function insightDate(y,mo,d){return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
function insightGroups(){
 const val=$('insMonth')?.value||today().slice(0,7),parts=val.split('-').map(Number),y=parts[0],mo=parts[1],nd=new Date(y,mo,0).getDate(),view=$('insView')?.value||'month';
 if(view==='month'){
   const out=[];for(let start=1,n=1;start<=nd;start+=7,n++){const end=Math.min(nd,start+6);out.push({label:`W${n}`,short:`${start}–${end}`,days:Array.from({length:end-start+1},(_,i)=>insightDate(y,mo,start+i))})}return {val,y,mo,nd,view,groups:out};
 }
 const n=Number(view.replace('week',''))||1,start=1+(n-1)*7;
 if(start>nd)return {val,y,mo,nd,view,groups:[]};
 const end=n===5?nd:Math.min(nd,start+6);
 return {val,y,mo,nd,view,groups:[{label:`${start}–${end}`,short:`${start}–${end}`,days:Array.from({length:end-start+1},(_,i)=>insightDate(y,mo,start+i))}]};
}
function insightMetric(p,d,k){
 const e=entry(p,d);if(!e)return null;
 if(k==='gym')return e.gym?.rest?null:(e.gym?.duration&&e.gym?.activities?.length?100:0);
 if(k==='duration')return e.gym?.rest?null:(e.gym?.duration!==''&&e.gym?.duration!=null?Number(e.gym.duration):null);
 if(k==='activities')return e.gym?.rest?null:(e.gym?.activities?.length?e.gym.activities.join(', '):null);
 if(k==='food'){
   const vals=['sugar','maida','junk'].map(f=>e.food?.[f]);
   if(vals.every(v=>!v||v==='not_today'))return null;
   return vals.every(v=>v==='yes')?100:0;
 }
 const val=k==='sugar'||k==='maida'?e.food?.[k]:e[k];
 if(val==='not_today'||val==null||val==='')return null;
 if(['target','above','yes'].includes(val))return 100;
 if(['below','no'].includes(val))return 0;
 return null;
}
function metricValue(p,d,k){return insightMetric(p,d,k)}
function groupAverage(p,days,k){
 const a=days.map(d=>metricValue(p,d,k)).filter(v=>v!==null&&Number.isFinite(v));
 return a.length?Math.round(a.reduce((s,v)=>s+v,0)/a.length):null;
}
function svgDailyBars(title,desc,days,values,unit='%'){
 const w=Math.max(640,days.length*54),h=230,l=42,r=14,t=18,b=48,iw=w-l-r,ih=h-t-b,nums=values.filter(v=>v!==null&&Number.isFinite(v));
 const max=unit==='min'?Math.max(30,Math.ceil(Math.max(30,...nums)/15)*15):100;
 const step=iw/Math.max(1,days.length),barW=Math.min(34,step*.58),x=i=>l+step*i+step/2,y=v=>t+ih-(Math.max(0,Math.min(max,v))/max)*ih;
 let grid='';for(let i=0;i<=4;i++){const v=max*i/4,yy=y(v);grid+=`<line x1="${l}" x2="${w-r}" y1="${yy}" y2="${yy}" class="cmp-grid"/><text x="${l-7}" y="${yy+4}" text-anchor="end" class="cmp-axis">${Math.round(v)}${unit==='%'?'%':''}</text>`}
 let bars='',labels='',pts=[];days.forEach((d,i)=>{const v=values[i],cx=x(i);if(v!==null&&Number.isFinite(v)){bars+=`<rect class="personal-bar" x="${cx-barW/2}" y="${y(v)}" width="${barW}" height="${Math.max(2,t+ih-y(v))}" rx="5"><title>${d}: ${v}${unit}</title></rect>`;pts.push([cx,y(v),v])}labels+=`<text x="${cx}" y="${h-22}" text-anchor="middle" class="cmp-axis">${esc(String(Number(d.slice(-2))))}</text>`});
 let trend='';if(pts.length>=2){const n=pts.length,sx=pts.reduce((a,p)=>a+p[0],0),sy=pts.reduce((a,p)=>a+p[1],0),sxx=pts.reduce((a,p)=>a+p[0]*p[0],0),sxy=pts.reduce((a,p)=>a+p[0]*p[1],0),den=n*sxx-sx*sx;if(den){const m=(n*sxy-sx*sy)/den,c=(sy-m*sx)/n;trend=`<line class="personal-trend-line" x1="${pts[0][0]}" y1="${Math.max(t,Math.min(t+ih,m*pts[0][0]+c))}" x2="${pts[pts.length-1][0]}" y2="${Math.max(t,Math.min(t+ih,m*pts[pts.length-1][0]+c))}"/>`}}
 const avg=nums.length?Math.round(nums.reduce((s,v)=>s+v,0)/nums.length):null;
 return `<article class="panel personal-insight-card"><h2>${esc(title)}</h2><p class="muted">${esc(desc)}</p><div class="personal-summary">${avg===null?'No data yet':`Average: <b>${avg}${unit}</b>`} <span>${nums.length}/${days.length} recorded</span></div><div class="chart-scroll"><svg viewBox="0 0 ${w} ${h}" style="min-width:${Math.min(w,640)}px;width:100%;height:auto" class="comparison-line-chart" role="img" aria-label="${esc(title)} daily bars and trend line">${grid}${bars}${trend}${labels}<text x="${w-r}" y="${h-4}" text-anchor="end" class="cmp-axis">Trend line</text></svg></div>${nums.length?'':'<p class="muted small">Log check-ins to build this chart. Rest days are excluded from gym duration.</p>'}</article>`;
}
function personalHabitCard(title,desc,p,days,keys){
 const rows=keys.map(([k,label])=>{const vals=days.map(d=>metricValue(p,d,k)).filter(v=>v!==null);const rate=vals.length?Math.round(vals.filter(v=>v===100).length/vals.length*100):null;return `<div class="habit-progress-row"><div><span>${esc(label)}</span><b>${rate===null?'—':rate+'%'}</b></div><div class="habit-progress-track"><i style="width:${rate===null?0:rate}%"></i></div><small>${vals.filter(v=>v===100).length}/${vals.length} recorded days met target</small></div>`}).join('');
 return `<article class="panel personal-insight-card"><h2>${esc(title)}</h2><p class="muted">${esc(desc)}</p>${rows}</article>`;
}
function personalCalendar(p,days){
 return `<article class="panel personal-insight-card"><h2>Daily XP calendar</h2><p class="muted">Each day uses the same XP status rule as the shared calendar: green = daily XP threshold met, red = logged but below threshold, grey = no log. ${p==='her'?'♥ marks your days.':'● marks your days.'}</p><div class="personal-calendar">${days.map(d=>{const e=entry(p,d);const status=!e?'cal-empty':xpFor(p,d)>=threshold(p,d)?'cal-good':'cal-missed';const symbol=p==='her'?'<span class="personal-day-symbol heart-symbol">♥</span>':'<span class="personal-day-symbol ball-symbol" aria-label="Him"></span>';return `<div class="personal-day-cell" title="${esc(name(p))} · ${d} · ${e?xpFor(p,d)+' XP / '+threshold(p,d)+' XP required':'No log'}"><b>${Number(d.slice(-2))}</b>${symbol.replace('personal-day-symbol','personal-day-symbol '+status)}<small>${e?xpFor(p,d)+' XP':'No log'}</small></div>`}).join('')}</div><div class="bar-legend"><span><i class="legend-status-good"></i>XP target met</span><span><i class="legend-status-missed"></i>Below XP target</span><span><i class="legend-status-empty"></i>Not logged</span></div></article>`;
}
function renderPersonalInsights(info){
 const host=$('insightsBoard'),p=window.activeProfile||'her',nameP=esc(name(p)),days=info.groups.flatMap(g=>g.days);
 if(!days.length){host.innerHTML='<div class="panel">This week does not exist in the selected month. Choose another week.</div>';return}
 const dates=days;
 const gym=dates.map(d=>metricValue(p,d,'duration'));
 const sleep=dates.map(d=>metricValue(p,d,'sleep'));
 const steps=dates.map(d=>metricValue(p,d,'steps'));
 const header=`<div class="ins-period-summary"><div><b>${nameP} · ${new Date(info.y,info.mo-1,1).toLocaleString(undefined,{month:'long',year:'numeric'})}</b><p class="muted">${info.view==='month'?'Personal progress grouped by week.':'Personal daily progress for '+dates[0]+' to '+dates[dates.length-1]+'.'}</p></div><span class="personal-only-label">Personal view · not compared</span></div>`;
 const charts=info.view==='month'
   ? [
      svgDailyBars('Gym duration','Workout minutes per week; rest days excluded',info.groups.map(g=>g.days[0]),info.groups.map(g=>{const a=g.days.map(d=>metricValue(p,d,'duration')).filter(v=>v!==null);return a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):null}),'min'),
      svgDailyBars('Sleep consistency','Percent of logged days meeting sleep target',info.groups.map(g=>g.days[0]),info.groups.map(g=>groupAverage(p,g.days,'sleep')),'%'),
      svgDailyBars('Step-goal consistency','Percent of logged days meeting step target',info.groups.map(g=>g.days[0]),info.groups.map(g=>groupAverage(p,g.days,'steps')),'%')
    ].join('')
   : [
      svgDailyBars('Daily gym duration','Minutes per workout; rest days excluded',dates,gym,'min'),
      svgDailyBars('Sleep target','Target met = 100%, below target = 0%',dates,sleep,'%'),
      svgDailyBars('Steps target','Target met = 100%, below target = 0%',dates,steps,'%')
    ].join('');
 host.innerHTML=header+`<div class="personal-insight-grid">${charts}${personalHabitCard('Nutrition & habits','Percent of recorded days each target was met.',p,dates,[['protein','Protein'],['fibre','Fibre'],['food','No-sugar / no-maida / no-junk combined'],['sugar','No sugar'],['maida','No maida']])}${personalCalendar(p,dates)}</div>`;
}
function svgCompareLine(title,desc,labels,herVals,himVals,unit='%'){
 const w=Math.max(640,labels.length*62),h=230,l=42,r=14,t=18,b=48,iw=w-l-r,ih=h-t-b,all=[...herVals,...himVals].filter(v=>v!==null&&Number.isFinite(v));
 const max=unit==='min'?Math.max(30,Math.ceil(Math.max(30,...all)/15)*15):100,step=iw/Math.max(1,labels.length),x=i=>l+step*i+step/2,y=v=>t+ih-(Math.max(0,Math.min(max,v))/max)*ih,barW=Math.min(20,step*.28);
 let grid='';for(let i=0;i<=4;i++){const v=max*i/4,yy=y(v);grid+=`<line x1="${l}" x2="${w-r}" y1="${yy}" y2="${yy}" class="cmp-grid"/><text x="${l-7}" y="${yy+4}" text-anchor="end" class="cmp-axis">${Math.round(v)}${unit==='%'?'%':''}</text>`}
 let bars='',xlabels='';const hp=[],mp=[];labels.forEach((lab,i)=>{const cx=x(i),hv=herVals[i],mv=himVals[i];if(hv!==null&&Number.isFinite(hv)){bars+=`<rect class="compare-her-bar" x="${cx-barW-2}" y="${y(hv)}" width="${barW}" height="${Math.max(2,t+ih-y(hv))}" rx="3"><title>${esc(lab)} · Her: ${hv}${unit}</title></rect>`;hp.push([cx-barW/2-2,y(hv)])}if(mv!==null&&Number.isFinite(mv)){bars+=`<rect class="compare-him-bar" x="${cx+2}" y="${y(mv)}" width="${barW}" height="${Math.max(2,t+ih-y(mv))}" rx="3"><title>${esc(lab)} · Him: ${mv}${unit}</title></rect>`;mp.push([cx+barW/2+2,y(mv)])}xlabels+=`<text x="${cx}" y="${h-22}" text-anchor="middle" class="cmp-axis">${esc(lab)}</text>`});
 const trend=pts=>{if(pts.length<2)return '';const n=pts.length,sx=pts.reduce((a,p)=>a+p[0],0),sy=pts.reduce((a,p)=>a+p[1],0),sxx=pts.reduce((a,p)=>a+p[0]*p[0],0),sxy=pts.reduce((a,p)=>a+p[0]*p[1],0),den=n*sxx-sx*sx;if(!den)return '';const m=(n*sxy-sx*sy)/den,c=(sy-m*sx)/n;return `<line class="${pts===hp?'her-trend-line':'him-trend-line'}" x1="${pts[0][0]}" y1="${Math.max(t,Math.min(t+ih,m*pts[0][0]+c))}" x2="${pts[pts.length-1][0]}" y2="${Math.max(t,Math.min(t+ih,m*pts[pts.length-1][0]+c))}"/>`};
 const avg=vals=>{const a=vals.filter(v=>v!==null&&Number.isFinite(v));return a.length?Math.round(a.reduce((s,v)=>s+v,0)/a.length):null};
 return `<article class="panel insight-compare-card"><div class="insight-card-heading"><div><h2>${esc(title)}</h2><p class="muted">${esc(desc)}</p><div class="bar-legend"><span><i class="legend-her-bar"></i>Her</span><span><i class="legend-him-bar"></i>Him</span><span>Lines = trends</span></div></div><div class="insight-averages"><span class="avg-her">Her ${avg(herVals)===null?'—':avg(herVals)+unit}</span><span class="avg-him">Him ${avg(himVals)===null?'—':avg(himVals)+unit}</span></div></div><div class="chart-scroll"><svg viewBox="0 0 ${w} ${h}" style="min-width:${Math.min(w,640)}px;width:100%;height:auto" class="comparison-line-chart" role="img" aria-label="${esc(title)} paired bars and trend lines">${grid}${bars}${trend(hp)}${trend(mp)}${xlabels}</svg></div>${all.length?'':'<p class="muted small">No recorded data for this period yet.</p>'}</article>`;
}
function renderComparisonInsights(info){
 const host=$('insightsBoard'),groups=info.groups;
 if(!groups.length){host.innerHTML='<div class="panel">This week does not exist in the selected month. Choose another week.</div>';return}
 let labels,herVals,himVals;
 if(info.view==='month'){
   labels=groups.map(g=>g.label);
 }else{
   const days=groups.flatMap(g=>g.days);
   groups=days.map(d=>({label:String(Number(d.slice(-2))),days:[d]}));
   labels=groups.map(g=>g.label);
 }
 const dailyGroups=groups;
 const metrics=[
  ['Gym duration','Daily minutes per workout; rest days excluded','duration','min'],
  ['Sleep target met','Daily target attainment: met = 100%, below = 0%','sleep','%'],
  ['Step target met','Daily target attainment: met = 100%, below = 0%','steps','%'],
  ['Protein target met','Protein target recorded as yes = 100%, no = 0%','protein','%'],
  ['Fibre target met','Fibre target recorded as yes = 100%, no = 0%','fibre','%'],
  ['Water target met','Daily target attainment: met = 100%, below = 0%','water','%'],
  ['No-sugar habit','No sugar recorded = 100%, sugar taken = 0%','sugar','%'],
  ['No-maida habit','No maida recorded = 100%, maida taken = 0%','maida','%']
 ];
 const cards=metrics.map(([title,desc,k,unit])=>{
  const agg=(p,g)=>{const vals=g.days.map(d=>metricValue(p,d,k)).filter(v=>v!==null);return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):null};
  return svgCompareLine(title,desc,labels,dailyGroups.map(g=>agg('her',g)),dailyGroups.map(g=>agg('him',g)),unit);
 }).join('');
 const days=dailyGroups.flatMap(g=>g.days);
 const cal=`<article class="panel personal-insight-card"><h2>Shared log calendar</h2><p class="muted">♥ Heart = Her · solid circle = Him. Green means daily XP met the required threshold; red means the logged day fell below it; grey means no check-in was saved.</p><div class="shared-calendar">${days.map(d=>{const status=p=>{const e=entry(p,d);return !e?'cal-empty':xpFor(p,d)>=threshold(p,d)?'cal-good':'cal-missed'};return `<div class="shared-cal-day"><b>${Number(d.slice(-2))}</b><div class="shared-cal-symbols"><span class="cal-symbol ${status('her')}" title="Her · ${d} · ${entry('her',d)?xpFor('her',d)+' XP':'No log'}">♥</span><span class="cal-symbol ${status('him')}" title="Him · ${d} · ${entry('him',d)?xpFor('him',d)+' XP':'No log'}"><i class="ball-symbol"></i></span></div></div>`}).join('')}</div><div class="bar-legend"><span><b class="cal-legend-symbol cal-good">♥</b>Her</span><span><b class="cal-legend-symbol cal-good"><i class="ball-symbol"></i></b>Him</span><span><i class="legend-status-good"></i>Met XP threshold</span><span><i class="legend-status-missed"></i>Below XP threshold</span><span><i class="legend-status-empty"></i>No log</span></div></article>`;
 host.innerHTML=`<div class="ins-period-summary"><div><b>${new Date(info.y,info.mo-1,1).toLocaleString(undefined,{month:'long',year:'numeric'})}</b><p class="muted">${info.view==='month'?'Weekly comparison; paired bars show each week’s average.':`Daily comparison across ${days[0]} to ${days[days.length-1]}; each day has paired bars.`}</p></div><div class="ins-profile-key"><span class="key-her">● Her</span><span class="key-him">● Him</span></div></div><div class="insight-compare-grid">${cards}</div>${cal}`;
}
function renderInsights(){
 const host=$('insightsBoard');if(!host)return;
 const info=insightGroups();
 document.querySelectorAll('[data-insights-tab]').forEach(b=>b.classList.toggle('active',b.dataset.insightsTab===insightMode));
 if(insightMode==='personal')renderPersonalInsights(info);else renderComparisonInsights(info);
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-insights-tab]');if(!b)return;
 insightMode=b.dataset.insightsTab;
 document.querySelectorAll('[data-insights-tab]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',x===b?'true':'false')});
 renderInsights();
});
document.addEventListener('change',e=>{if(['insMonth','insView'].includes(e.target.id))renderInsights()});

const QUOTES=["Small steps done daily beat big plans that never start.", "Fact: adults are generally advised to aim for at least 150 minutes of moderate activity each week.", "Rest is part of training — your muscles adapt while you recover, not only while you lift.", "Fact: most adults do best with 7 or more hours of sleep a night.", "You don't need a perfect day. You need a day you showed up for.", "Fact: water makes up roughly 60% of an adult's body weight.", "Progress is quiet at first. Keep going — it's adding up.", "Fact: regular walking supports heart health, mood and sleep.", "Be kind to the person you are today and ambitious for the person you're becoming.", "Fact: protein helps your body repair and build muscle after exercise.", "A missed day is data, not a verdict. Tomorrow starts fresh.", "Fact: fibre from vegetables, fruit, pulses and whole grains supports digestion and keeps you fuller for longer.", "Motivation gets you started; routines keep you going. Protect the routine.", "Fact: even a 10-minute walk after a meal is a good habit to build.", "Strong is built one ordinary day at a time.", "Fact: stretching and gentle movement on rest days can help you feel less stiff.", "Compare yourself only with who you were last week.", "Fact: going to bed and waking at similar times helps your sleep settle into a rhythm.", "Celebrate effort, not just results — effort is the part you control.", "Fact: strength training for all major muscle groups on at least two days a week is a common health guideline.", "Your future self is watching what you do today. Make them proud.", "Fact: dehydration can make you feel more tired and less focused.", "Healthy isn't a diet or a deadline — it's how you treat yourself most days.", "Fact: sunlight in the morning can help set your body clock.", "Two people, one team. Cheer each other on today.", "Fact: laughing, hugging and time with loved ones are linked with lower stress.", "The best workout is the one you actually do.", "Fact: eating slowly gives your body time to notice it's full.", "Tired is a reason to go lighter, not always a reason to stop.", "Fact: building muscle also supports bone health as you age.", "Life gets lighter when you do the next small right thing.", "Fact: a short break from sitting every hour or so is good for your body."];
function renderBoost(){const b=$("dailyBoost");if(!b)return;const q=QUOTES[Math.floor(day(today())/864e5)%QUOTES.length],f=q.startsWith("Fact:");b.innerHTML=`<div class="boost"><span>${f?"💡 DID YOU KNOW":"🌟 TODAY'S BOOST"}</span><p>${esc(f?q.slice(5).trim():q)}</p></div>`}
const _rd=renderDashboard;renderDashboard=function(){_rd();renderBoost();renderRewards();renderSettingsExtras();renderInsights()};
/* report insights (unchanged from v7a) */
function extraInsights(){const host=$("reportInsights");if(!host)return;const end=$("reportEnd").value||today(),start=$("reportStart").value||end,dates=dateRange(start,end);let html='<div class="insight-grid">';
 for(const p of["her","him"]){const ds=dates.filter(d=>entry(p,d));if(!ds.length){html+=`<div class="insight-card"><b>${esc(name(p))}</b><p class="muted">No check-ins in this period.</p></div>`;continue}
  const rate=k=>{const c=ds.filter(d=>met(entry(p,d),k)!==null);return c.length?Math.round(c.filter(d=>met(entry(p,d),k)).length/c.length*100):null},ks=["sleep","water","steps","protein","fibre","gym","food"].filter(k=>rate(k)!==null).sort((a,b)=>rate(b)-rate(a)),nm={...NAMES,gym:"Gym"},gained=ds.reduce((n,d)=>n+xpFor(p,d),0),missed=ds.reduce((n,d)=>n+Math.max(0,dayMax(p,d)-xpFor(p,d)),0);
  html+=`<div class="insight-card ${p}"><b>${esc(name(p))}</b><ul><li>Check-ins: <b>${ds.length}/${dates.length}</b> days · lost days <b>${ds.filter(d=>xpFor(p,d)<threshold(p,d)).length}</b></li>${ks.length?`<li>Strongest: <b>${nm[ks[0]]}</b> (${rate(ks[0])}%) · needs love: <b>${nm[ks[ks.length-1]]}</b> (${rate(ks[ks.length-1])}%)</li>`:""}<li>XP <b>${gained}</b> of <b>${gained+missed}</b> possible</li><li>Piggy bank: <b>₹${piggy(p)}</b></li></ul></div>`}
 host.insertAdjacentHTML("afterbegin",html+"</div>")}
const _rp=report;report=function(){_rp();extraInsights()};
const _rs=renderSettings;renderSettings=function(){_rs();renderSettingsExtras()};
renderSettings();renderDashboard();report();
})();
