const APP_VERSION='2026.08.18-1';
const URL='https://uenmabnaknazurrtejpf.supabase.co';
const KEY='sb_publishable_NdKJrEYPpJlgD7nufdUjjw_k3niTPEj';
const CORRIDOR_IMG='';
const APP=document.getElementById('app');
let session=null,profile=null,currentProject=null,currentRlc=null,currentSegment=null;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function saveSession(s){session=s;if(s)localStorage.setItem('pp32_session',JSON.stringify(s));else localStorage.removeItem('pp32_session')}
function loadSession(){try{return JSON.parse(localStorage.getItem('pp32_session')||'null')}catch(e){return null}}
async function api(path,opt={}){const headers={...(opt.headers||{}),apikey:KEY};if(!(opt.body instanceof Blob)&&!(opt.body instanceof File))headers['Content-Type']=headers['Content-Type']||'application/json';if(session&&session.access_token)headers.Authorization='Bearer '+session.access_token;let r=await fetch(URL+path,{method:opt.method||'GET',headers,body:opt.body});if(r.status===401&&session&&session.refresh_token&&!opt._retry){try{const rr=await fetch(URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})});if(rr.ok){saveSession(await rr.json());return api(path,{...opt,_retry:true})}}catch(e){}}const t=await r.text();let d=null;try{d=t?JSON.parse(t):null}catch(e){d=t}if(!r.ok)throw new Error((d&&d.msg)||(d&&d.message)||(d&&d.error_description)||(d&&d.error)||('HTTP '+r.status));return d}
async function loadProfile(){if(!session?.user?.id)return null;const x=await api('/rest/v1/profiles?id=eq.'+encodeURIComponent(session.user.id)+'&select=*');profile=x?.[0]||null;return profile}
function isSuperAdmin(){return profile?.active&&profile.role==='admin'}function isAdmin(){return profile?.active&&['admin','leader'].includes(profile.role)}function canEdit(){return profile?.active&&['admin','leader','member'].includes(profile.role)}
function workPercent(status){return status==='done'?100:status==='prepared'?50:0}
function workAverage(elements){return elements?.length?Math.round(elements.reduce((sum,x)=>sum+workPercent(x.work_status??x.status),0)/elements.length*10)/10:0}

/* Highlight every screen's back control without changing its navigation handler. */
function enhanceBackNavigation(){
 const buttons=APP.querySelectorAll('.wrap button.back,button.cw-back,button.rp-back,button.pw-back,button.gd-breadcrumb,button.gd-secondary-back,button.il-back,button.lp-back,button.cb-back');
 buttons.forEach(button=>{
  if(button.classList.contains('app-back-enhanced'))return;
  button.classList.add('app-back-enhanced');
  const first=button.firstChild;
  if(first?.nodeType===3 && /^\s*←/.test(first.nodeValue)){
   first.nodeValue=first.nodeValue.replace(/^\s*←\s*/, '');
   const arrow=document.createElement('span');
   arrow.className='app-back-arrow';
   arrow.setAttribute('aria-hidden','true');
   arrow.textContent='←';
   button.insertBefore(arrow,button.firstChild);
  }else{
   const nested=button.querySelector(':scope > span:first-child');
   if(nested&&nested.textContent.trim()==='←')nested.classList.add('app-back-arrow');
  }
 });
}
function shell(body){APP.innerHTML='<div class="top"><div class="brand">Evidencija radova na pruzi</div><div class="topright"><button class="nav-home" id="navHome" type="button" title="Početna strana" aria-label="Početna strana"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Home</span></button><span class="role">'+(isSuperAdmin()?'ADMIN':profile?.role==='leader'?'LIDER':profile?.role==='guest_pp32'?'GOST · 32 PP':profile?.role==='viewer'?'PREGLED':'KORISNIK')+'</span><button class="btn sec small" id="out">Odjavi se</button></div></div>'+body;enhanceBackNavigation();document.getElementById('navHome').onclick=()=>{if(profile?.active)home()};document.getElementById('out').onclick=()=>{saveSession(null);profile=null;auth()}}
function auth(){APP.innerHTML='<div class="login"><div class="box"><h1 style="margin:0 0 6px">Evidencija radova</h1><p class="sub">Centralna aplikacija</p><div class="tabs"><button class="tab active" id="tin">Prijava</button><button class="tab" id="tup">Novi nalog</button></div><div id="nameWrap" class="field hidden"><label>Ime i prezime</label><input id="fn"></div><div class="field"><label id="loginIdLabel">Email ili korisničko ime</label><input id="em" type="text" autocomplete="username" autocapitalize="none" spellcheck="false"></div><div class="field"><label>Lozinka</label><input id="pw" type="password"></div><button class="btn" id="go" style="width:100%;margin-top:8px">Prijavi se</button><div id="msg" class="msg"></div></div></div>';let mode='in';const setMode=m=>{mode=m;tin.className='tab'+(m==='in'?' active':'');tup.className='tab'+(m==='up'?' active':'');nameWrap.className='field'+(m==='up'?'':' hidden');loginIdLabel.textContent=m==='in'?'Email ili korisničko ime':'Email';em.type=m==='in'?'text':'email';go.textContent=m==='in'?'Prijavi se':'Napravi nalog';msg.textContent=''};tin.onclick=()=>setMode('in');tup.onclick=()=>setMode('up');go.onclick=async()=>{msg.textContent='Povezivanje...';try{const entered=em.value.trim(),email=mode==='in'&&entered.toLowerCase()==='gost32'?'gost32@gmail.com':entered,pwv=pw.value;if(mode==='in'){const d=await api('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password:pwv})});saveSession(d);await afterLogin()}else{const d=await api('/auth/v1/signup?redirect_to='+encodeURIComponent(location.origin+'/'),{method:'POST',body:JSON.stringify({email,password:pwv,data:{full_name:fn.value.trim()}})});msg.textContent=d?.access_token?'Nalog napravljen.':'Nalog napravljen. Potvrdi email pa se prijavi.';msg.className='msg ok'}}catch(e){msg.textContent=e.message;msg.className='msg err'}}}
async function afterLogin(){await loadProfile();if(!profile||!profile.active){shell('<div class="wrap"><div class="notice">Nalog čeka odobrenje administratora.</div></div>');return}home()}
