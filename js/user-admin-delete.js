(function(){
function deleteButtonFor(u){
  if(!isAdmin() || !session?.user?.id || u.id===session.user.id || u.role==='admin') return '';
  return '<button class="btn small" data-del-user="'+u.id+'" data-del-email="'+esc(u.email||'')+'" style="background:#8f1d1d;border-color:#8f1d1d">Ukloni</button>';
}

window.manageUsers=async function(){
  const us=await api('/rest/v1/profiles?select=id,email,full_name,role,active,created_at&order=created_at.asc');
  let h='<div class="wrap"><button class="back" id="bh">← Projekti</button><h1>Korisnici i prava</h1><p class="sub">Admin može da odobri nalog, promeni ulogu ili potpuno ukloni korisnika kako bi isti email mogao ponovo da se registruje.</p><div class="rows">';
  h+=us.map(u=>'<div class="row user-row"><div><b>'+esc(u.full_name||u.email||u.id)+'</b><small>'+esc(u.email||'')+'</small></div><div class="btnrow"><select data-role="'+u.id+'"><option value="admin" '+(u.role==='admin'?'selected':'')+'>admin</option><option value="member" '+(u.role==='member'?'selected':'')+'>member</option><option value="viewer" '+(u.role==='viewer'?'selected':'')+'>viewer</option></select><label><input type="checkbox" data-active="'+u.id+'" '+(u.active?'checked':'')+'> aktivan</label><button class="btn small" data-save-user="'+u.id+'">Sačuvaj</button>'+deleteButtonFor(u)+'</div></div>').join('');
  h+='</div><div class="notice" style="margin-top:14px">Uklanjanje briše nalog za prijavu, ali postojeća istorija radova ostaje sačuvana. Nakon toga isti email može napraviti novi nalog.</div></div>';
  shell(h);
  bh.onclick=home;
  document.querySelectorAll('[data-save-user]').forEach(b=>b.onclick=()=>saveUser(b.dataset.saveUser));
  document.querySelectorAll('[data-del-user]').forEach(b=>b.onclick=()=>removeUserAccount(b.dataset.delUser,b.dataset.delEmail));
};

window.removeUserAccount=async function(id,email){
  if(!isAdmin())return alert('Samo administrator može ukloniti korisnika.');
  if(id===session?.user?.id)return alert('Ne možeš ukloniti sopstveni administratorski nalog.');

  const first=confirm('Ukloniti korisnika '+(email||'')+'?\n\nNalog za prijavu će biti potpuno obrisan. Istorija radova ostaje sačuvana.');
  if(!first)return;

  const typed=prompt('Za potvrdu upiši UKLONI');
  if(typed!=='UKLONI')return alert('Uklanjanje je otkazano.');

  try{
    await api('/rest/v1/rpc/admin_delete_user',{
      method:'POST',
      headers:{Prefer:'return=representation'},
      body:JSON.stringify({target_user_id:id})
    });
    alert('Korisnik je uklonjen. Email '+(email||'')+' sada može ponovo da se registruje.');
    await manageUsers();
  }catch(e){
    alert('Uklanjanje nije uspelo: '+e.message);
  }
};
})();
