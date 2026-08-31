(function(){
let pendingVerifyEmail='';

function authErrorMessage(e){
  const m=String(e?.message||e||'Došlo je do greške.');
  if(/email not confirmed/i.test(m)) return 'Email još nije potvrđen. Otvori Novi nalog ili zatraži novi kod.';
  if(/invalid login credentials/i.test(m)) return 'Pogrešan email ili lozinka.';
  if(/rate limit/i.test(m)) return 'Previše pokušaja. Sačekaj malo pa pokušaj ponovo.';
  if(/token.*expired|expired.*token/i.test(m)) return 'Kod je istekao. Zatraži novi kod.';
  if(/token.*invalid|invalid.*token/i.test(m)) return 'Kod nije ispravan. Proveri 6 cifara i pokušaj ponovo.';
  return m;
}

function otpScreen(email){
  pendingVerifyEmail=email;
  APP.innerHTML='<div class="login"><div class="box">'+
    '<h1 style="margin:0 0 6px">Potvrda emaila</h1>'+
    '<p class="sub">Poslali smo 6-cifreni sigurnosni kod na</p>'+
    '<p style="font-weight:800;word-break:break-word;margin:8px 0 18px">'+esc(email)+'</p>'+
    '<div class="field"><label>Sigurnosni kod</label><input id="otpCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" style="font-size:26px;letter-spacing:8px;text-align:center;font-weight:800"></div>'+
    '<button class="btn" id="verifyOtpBtn" style="width:100%;margin-top:8px">Potvrdi email</button>'+
    '<button class="btn sec" id="resendOtpBtn" style="width:100%;margin-top:8px">Pošalji kod ponovo</button>'+
    '<button class="back" id="otpBack" style="margin-top:14px">← Nazad na prijavu</button>'+
    '<div id="otpMsg" class="msg"></div>'+
    '<p class="sub" style="margin-top:16px">Nakon potvrde emaila nalog i dalje mora da odobri administrator.</p>'+
  '</div></div>';
  const code=document.getElementById('otpCode');
  const msg=document.getElementById('otpMsg');
  code.oninput=()=>{code.value=code.value.replace(/\D/g,'').slice(0,6)};
  code.onkeydown=e=>{if(e.key==='Enter')document.getElementById('verifyOtpBtn').click()};
  setTimeout(()=>code.focus(),50);
  document.getElementById('otpBack').onclick=()=>auth();
  document.getElementById('verifyOtpBtn').onclick=async()=>{
    const token=code.value.trim();
    if(!/^\d{6}$/.test(token)){msg.className='msg err';msg.textContent='Unesi svih 6 cifara iz emaila.';return;}
    msg.className='msg';msg.textContent='Provera koda...';
    try{
      let d;
      try{
        d=await api('/auth/v1/verify',{method:'POST',body:JSON.stringify({type:'signup',email:pendingVerifyEmail,token})});
      }catch(first){
        d=await api('/auth/v1/verify',{method:'POST',body:JSON.stringify({type:'email',email:pendingVerifyEmail,token})});
      }
      if(d?.access_token){
        saveSession(d);
        await afterLogin();
      }else{
        msg.className='msg ok';
        msg.textContent='Email je potvrđen. Sada se prijavi svojim emailom i lozinkom.';
        setTimeout(()=>auth(),1600);
      }
    }catch(e){msg.className='msg err';msg.textContent=authErrorMessage(e)}
  };
  document.getElementById('resendOtpBtn').onclick=async()=>{
    msg.className='msg';msg.textContent='Slanje novog koda...';
    try{
      await api('/auth/v1/resend',{method:'POST',body:JSON.stringify({type:'signup',email:pendingVerifyEmail})});
      msg.className='msg ok';msg.textContent='Novi kod je poslat. Proveri email.';
    }catch(e){msg.className='msg err';msg.textContent=authErrorMessage(e)}
  };
}

window.auth=function(){
  APP.innerHTML='<div class="login"><div class="box"><h1 style="margin:0 0 6px">Evidencija radova</h1><p class="sub">Centralna aplikacija</p><div class="tabs"><button class="tab active" id="tin">Prijava</button><button class="tab" id="tup">Novi nalog</button></div><div id="nameWrap" class="field hidden"><label>Ime i prezime</label><input id="fn" autocomplete="name"></div><div class="field"><label>Email</label><input id="em" type="email" autocomplete="email"></div><div class="field"><label>Lozinka</label><input id="pw" type="password" autocomplete="current-password"></div><button class="btn" id="go" style="width:100%;margin-top:8px">Prijavi se</button><div id="msg" class="msg"></div></div></div>';
  let mode='in';
  const tin=document.getElementById('tin'),tup=document.getElementById('tup'),nameWrap=document.getElementById('nameWrap'),go=document.getElementById('go'),msg=document.getElementById('msg'),em=document.getElementById('em'),pw=document.getElementById('pw'),fn=document.getElementById('fn');
  const setMode=m=>{
    mode=m;
    tin.className='tab'+(m==='in'?' active':'');
    tup.className='tab'+(m==='up'?' active':'');
    nameWrap.className='field'+(m==='up'?'':' hidden');
    go.textContent=m==='in'?'Prijavi se':'Napravi nalog';
    pw.autocomplete=m==='in'?'current-password':'new-password';
    msg.textContent='';msg.className='msg';
  };
  tin.onclick=()=>setMode('in');
  tup.onclick=()=>setMode('up');
  [em,pw,fn].forEach(x=>x.onkeydown=e=>{if(e.key==='Enter')go.click()});
  go.onclick=async()=>{
    const email=em.value.trim().toLowerCase(),password=pw.value;
    if(!email||!password){msg.className='msg err';msg.textContent='Unesi email i lozinku.';return;}
    if(mode==='up'&&!fn.value.trim()){msg.className='msg err';msg.textContent='Unesi ime i prezime.';return;}
    msg.className='msg';msg.textContent='Povezivanje...';
    try{
      if(mode==='in'){
        const d=await api('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});
        saveSession(d);
        await afterLogin();
      }else{
        const d=await api('/auth/v1/signup?redirect_to='+encodeURIComponent(location.origin+location.pathname),{method:'POST',body:JSON.stringify({email,password,data:{full_name:fn.value.trim()}})});
        if(d?.access_token){
          saveSession(d);
          await afterLogin();
        }else{
          otpScreen(email);
        }
      }
    }catch(e){
      msg.className='msg err';
      msg.textContent=authErrorMessage(e);
      if(mode==='in'&&/nije potvrđen|not confirmed/i.test(msg.textContent)){
        const b=document.createElement('button');b.className='btn sec small';b.style.marginTop='10px';b.textContent='Unesi kod za potvrdu';b.onclick=()=>otpScreen(email);msg.appendChild(document.createElement('br'));msg.appendChild(b);
      }
    }
  };
};
})();
