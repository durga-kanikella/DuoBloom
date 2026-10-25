/* NEW ME · Awards Room + profile switch. Awards are collectibles, not XP deductions. */
(()=>{
 const $=id=>document.getElementById(id);
 const levels=[
  {id:'first-steps',xp:100,title:'First Steps',icon:'🌱',desc:'Your first 100 lifetime XP'},
  {id:'showing-up',xp:250,title:'Showing Up',icon:'✨',desc:'A quarter-thousand XP earned'},
  {id:'habit-builder',xp:500,title:'Habit Builder',icon:'🌷',desc:'500 lifetime XP earned'},
  {id:'steady-star',xp:1000,title:'Steady Star',icon:'⭐',desc:'1,000 lifetime XP earned'},
  {id:'glow-getter',xp:2000,title:'Glow Getter',icon:'🏅',desc:'2,000 lifetime XP earned'},
  {id:'power-duo',xp:3500,title:'Powerhouse',icon:'💎',desc:'3,500 lifetime XP earned'},
  {id:'legend',xp:5000,title:'Consistency Legend',icon:'👑',desc:'5,000 lifetime XP earned'},
  {id:'mythic',xp:10000,title:'Mythic Achiever',icon:'🏆',desc:'10,000 lifetime XP earned'}
 ];
 window.activeProfile=window.activeProfile||'her';window.activeRecentProfile='her';
 const lifetime=p=>Object.keys(state.entries[p]||{}).reduce((sum,d)=>sum+xpFor(p,d),0);
 const initAwards=()=>{state.awards||={her:[],him:[]};state.awards.her||=[];state.awards.him||=[]};
 function renderAwards(){const host=$('awardsRoom');if(!host)return;initAwards();const p=window.activeProfile,xp=lifetime(p),claimed=state.awards[p];
  const ready=levels.filter(a=>xp>=a.xp&&!claimed.includes(a.id));
  const collected=levels.filter(a=>claimed.includes(a.id));
  const next=levels.find(a=>xp<a.xp),progress=next?Math.min(100,xp/next.xp*100):100;
  host.innerHTML=`<div class="awards-person-head ${p}"><div class="award-person-avatar"><img src="assets/${p}-avatar.png" alt="${esc(name(p))}"></div><div class="award-person-copy"><span class="eyebrow">${esc(name(p))}'S COLLECTION</span><h2>${xp.toLocaleString()} lifetime XP</h2><p>${collected.length} of ${levels.length} awards collected · Spendable XP is not affected.</p><div class="award-progress"><span style="width:${progress}%"></span></div><small>${next?`${next.xp-xp} XP until ${next.title}`:'All awards unlocked — amazing work!'}</small></div></div>
  ${ready.length?`<section class="award-section"><div class="award-section-head"><div><h2>🎁 Ready to collect</h2><p>You've reached these XP milestones. Collect each award to add it to your gallery.</p></div><span class="award-count">${ready.length} ready</span></div><div class="award-grid">${ready.map(a=>`<article class="award-card ready"><div class="award-icon">${a.icon}</div><h3>${a.title}</h3><p>${a.desc}</p><span class="award-threshold">${a.xp.toLocaleString()} XP reached</span><button class="primary collect-award" data-collect-award="${a.id}" data-award-person="${p}">Collect award ✨</button></article>`).join('')}</div></section>`:`<div class="award-nudge">${xp===0?'Your first award is waiting! Complete a check-in to start earning lifetime XP.':'No new awards to collect yet — keep building your streak.'}</div>`}
  <section class="award-section"><div class="award-section-head"><div><h2>🏆 Award Gallery</h2><p>All collected awards stay here, together, for ${esc(name(p))}.</p></div><span class="award-count">${collected.length} collected</span></div>${collected.length?`<div class="award-grid">${collected.map(a=>`<article class="award-card collected"><div class="collected-ribbon">✓ COLLECTED</div><div class="award-icon">${a.icon}</div><h3>${a.title}</h3><p>${a.desc}</p><span class="award-threshold">Unlocked at ${a.xp.toLocaleString()} XP</span></article>`).join('')}</div>`:'<div class="award-empty"><div>🏆</div><b>Your gallery is ready for its first award.</b><p>Reach an XP milestone, then tap Collect to display your award here.</p></div>'}</section>
  <section class="award-section"><div class="award-section-head"><div><h2>🔒 Next milestones</h2><p>See what you're working toward.</p></div></div><div class="award-next-list">${levels.filter(a=>!claimed.includes(a.id)&&xp<a.xp).slice(0,4).map(a=>`<div class="award-next"><span>${a.icon}</span><div><b>${a.title}</b><small>${a.xp.toLocaleString()} XP · ${Math.max(0,a.xp-xp).toLocaleString()} XP to go</small></div><div class="award-mini-progress"><i style="width:${Math.min(100,xp/a.xp*100)}%"></i></div></div>`).join('')||'<p class="muted">Every milestone collected. You did it!</p>'}</div></section>`;
 }
 window.renderAwards=renderAwards;
 // Global profile selector. The selected profile drives dashboard, insights, check-in and awards.
 function setProfile(p){window.activeProfile=p;document.querySelectorAll('[data-profile]').forEach(b=>{if(b.classList.contains('profile-switch-btn'))b.classList.toggle('active',b.dataset.profile===p)});document.querySelectorAll('[data-profile-name]').forEach(el=>el.textContent=name(el.dataset.profileName));const cp=$('checkPerson');if(cp)cp.value=p;try{renderDashboard();if(typeof renderInsights==='function')renderInsights();renderAwards();if(typeof loadDraft==='function'&&$('page-checkin')?.classList.contains('active'))loadDraft();}catch(e){console.warn(e)} }
 document.querySelectorAll('[data-profile]').forEach(b=>b.addEventListener('click',()=>setProfile(b.dataset.profile)));
 document.querySelectorAll('[data-recent-person]').forEach(b=>b.addEventListener('click',()=>{window.activeRecentProfile=b.dataset.recentPerson;document.querySelectorAll('[data-recent-person]').forEach(x=>x.classList.toggle('active',x===b));const host=$('recentSplit');if(host){host.querySelectorAll('.recent-col').forEach(c=>c.style.display=c.classList.contains(window.activeRecentProfile)?'block':'none');}}));
 // Dashboard displays the selected person's complete overview, avoiding a long scroll between people.
 const oldDash=window.renderDashboard;window.renderDashboard=function(){oldDash();const host=$('compare');if(host&&typeof card==='function')host.innerHTML=card(window.activeProfile);document.querySelectorAll('[data-profile-name]').forEach(el=>el.textContent=name(el.dataset.profileName));};
 // Awards can be collected once; claim status persists in the existing backup/local state.
 $('awardsRoom')?.addEventListener('click',e=>{const b=e.target.closest('[data-collect-award]');if(!b)return;const p=b.dataset.awardPerson,id=b.dataset.collectAward;initAwards();const award=levels.find(a=>a.id===id);if(!award||lifetime(p)<award.xp||state.awards[p].includes(id)){toast('This award is not ready to collect.');return}state.awards[p].push(id);localStorage.setItem('newme_data',JSON.stringify(state));renderAwards();toast(`${award.title} collected! 🏆`)});
 // Same-browser tabs stay in sync. Cross-device sync requires a shared backend.
 window.addEventListener('storage',e=>{if(e.key!=='newme_data'||!e.newValue)return;try{const fresh=JSON.parse(e.newValue);if(fresh&&fresh.settings&&fresh.entries){state=fresh;renderSettings();renderDashboard();renderRecent();renderAwards();if(typeof renderInsights==='function')renderInsights();}}catch(_){}});
 const oldRenderRecent=window.renderRecent;window.renderRecent=function(){oldRenderRecent();const host=$('recentSplit');if(host)host.querySelectorAll('.recent-col').forEach(c=>c.style.display=c.classList.contains(window.activeRecentProfile)?'block':'none');};
 // Re-render awards after check-in saves and settings updates by wrapping shared save/render calls.
 const oldSave=window.save;if(typeof oldSave==='function')window.save=function(){oldSave();renderAwards()};
 document.addEventListener('DOMContentLoaded',()=>setProfile(window.activeProfile));
 setTimeout(()=>{setProfile(window.activeProfile);renderAwards();const host=$('recentSplit');if(host)host.querySelectorAll('.recent-col').forEach(c=>c.style.display=c.classList.contains(window.activeRecentProfile)?'block':'none')},0);
})();
