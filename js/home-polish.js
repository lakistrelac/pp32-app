(function(){
window.home=async function(){
 const ps=await api('/rest/v1/projects?select=*&order=name.asc');
 const count=ps.length;
 let h='<div class="wrap home-page">'+
  '<section class="home-masthead">'+
   '<div class="home-masthead-copy">'+
    '<div class="home-kicker">CENTRALNA EVIDENCIJA SS RADOVA</div>'+
    '<h1>Evidencija radova i tehnička dokumentacija</h1>'+
    '<p>Jedinstveno mesto za praćenje projekata, terenskih aktivnosti, dokumentacije i tehničkih uputstava.</p>'+
    '<div class="home-metrics">'+
     '<div><strong>'+count+'</strong><span>Aktivnih projekata</span></div>'+
     '<div><strong>1</strong><span>Centralno uputstvo</span></div>'+
    '</div>'+
   '</div>'+
   '<div class="home-system">'+
    '<div class="home-system-head"><span class="home-status-dot"></span><b>Sistem aktivan</b></div>'+
    '<div class="home-system-name">PP32 Central</div>'+
    '<div class="home-system-line"><span>Pristup</span><b>'+esc(profile?.role||'korisnik')+'</b></div>'+
    '<div class="home-system-line"><span>Verzija</span><b>'+esc(APP_VERSION)+'</b></div>'+
   '</div>'+
  '</section>';

 if(isAdmin())h+='<section class="home-admin"><div><span class="home-admin-label">ADMINISTRACIJA</span><b>Upravljanje sistemom</b></div><div class="home-admin-actions"><button class="btn small" id="newProjectBtn">＋ Novi projekat</button><button class="btn sec small" id="usersBtn">Korisnici i prava</button></div></section>';

 h+='<div class="home-section-head"><div><span class="home-section-kicker">PROJEKTI</span><h2>Aktivni projekti</h2></div><span class="home-section-count">'+count+' ukupno</span></div>'+
 '<div class="home-project-grid">';
 ps.forEach((p,idx)=>{
   const code=(p.code||('projekat-'+(idx+1))).toUpperCase();
   const no=String(idx+1).padStart(2,'0');
   h+='<article class="home-project-card tone-'+((idx%4)+1)+'" data-p="'+p.id+'">'+
    '<div class="home-project-top"><div class="home-project-index">P-'+no+'</div><span class="home-project-status"><i></i> Aktivan</span></div>'+
    '<div class="home-project-code">'+esc(code)+'</div>'+
    '<h3>'+esc(p.name)+'</h3>'+
    '<p>'+esc(p.description||'Centralna evidencija projekta')+'</p>'+
    '<div class="home-project-footer"><span>Otvori projekat</span><b>→</b></div>'+
   '</article>';
 });
 h+='</div>'+
 '<section class="home-guide-banner" id="guideBtn">'+
  '<div class="home-guide-mark">U</div>'+
  '<div class="home-guide-copy"><span>TEHNIČKA BIBLIOTEKA</span><h2>Uputstvo</h2><p>Pravilnici, stručni proračuni, ugradnja elemenata i interaktivni primeri za SS sisteme.</p></div>'+
  '<div class="home-guide-open"><span>Otvori Uputstvo</span><b>→</b></div>'+
 '</section>'+
 '<div class="home-footer-note">Interna aplikacija za centralnu evidenciju radova i tehničku podršku.</div>'+
 '</div>';
 shell(h);
 document.querySelectorAll('[data-p]').forEach(n=>n.onclick=()=>project(n.dataset.p));
 document.getElementById('guideBtn').onclick=guideHome;
 if(isAdmin()){
   document.getElementById('newProjectBtn').onclick=newProjectForm;
   document.getElementById('usersBtn').onclick=manageUsers;
 }
};
})();
