(function(){
function fmtDiaryDate(v){
 if(!v)return '';
 const p=String(v).split('-');
 return p.length===3?p[2]+'.'+p[1]+'.'+p[0]+'.':String(v);
}
function mailLine(lines,label,value){
 if(value!==null&&value!==undefined&&String(value).trim()!=='')lines.push(label+': '+String(value).trim());
}
function openDiaryMail(d,ctx){
 const date=fmtDiaryDate(d.entry_date);
 const subject='Građevinski dnevnik – '+ctx+' – '+date;
 const lines=[];
 lines.push('GRAĐEVINSKI DNEVNIK');
 lines.push('');
 mailLine(lines,'Projekat',d._project);
 mailLine(lines,'RLC',d._rlc);
 mailLine(lines,'Podfaza',d._segment);
 mailLine(lines,'Datum',date);
 mailLine(lines,'Broj zapisa',d.entry_no||'Dnevni zapis');
 mailLine(lines,'Ekipa / izvođač',d.team);
 mailLine(lines,'Odgovorno lice',d.responsible_person);
 mailLine(lines,'Vreme',d.weather);
 mailLine(lines,'Broj radnika',d.worker_count);
 lines.push('');
 mailLine(lines,'Izvedeni radovi',d.work_done);
 if(d.issues){lines.push('');mailLine(lines,'Problemi / zastoji',d.issues);}
 if(d.next_plan){lines.push('');mailLine(lines,'Plan za naredni dan',d.next_plan);}
 const url='mailto:?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(lines.join('\n'));
 window.location.href=url;
}
function diaryRow(d,idx,projectName,rlcCode){
 d._project=projectName||'';
 d._rlc=rlcCode||'';
 window.__pp32DiaryMailRows[idx]=d;
 return '<div class="row"><div style="flex:1"><b>'+esc(d.entry_no||'Dnevni zapis')+' · '+esc(d.entry_date)+'</b><small>'+esc(d.team||'')+'</small><p style="margin:6px 0 0">'+esc(d.work_done||'')+'</p><div style="margin-top:10px"><button class="btn sec small" data-dmail="'+idx+'">✉ Pošalji mejlom</button></div></div></div>';
}
function bindDiaryMail(){
 document.querySelectorAll('[data-dmail]').forEach(b=>b.onclick=e=>{
   e.stopPropagation();
   const d=window.__pp32DiaryMailRows?.[Number(b.dataset.dmail)];
   if(d)openDiaryMail(d,d._rlc||d._project||'Građevinski dnevnik');
 });
}

window.diary=async function(){
 const ds=await api('/rest/v1/diary_entries?rlc_id=eq.'+currentRlc.id+'&select=*&order=entry_date.desc');
 let projectName='';
 try{const p=(await api('/rest/v1/projects?id=eq.'+currentRlc.project_id+'&select=name&limit=1'))[0];projectName=p?.name||'';}catch(e){}
 window.__pp32DiaryMailRows=[];
 let h='<div class="wrap"><button class="back" id="br">← '+esc(currentRlc.code)+'</button><h1>Građevinski dnevnik · '+esc(currentRlc.code)+'</h1>'+
 (canEdit()?'<div class="form"><div class="fg"><div class="field"><label>Datum</label><input id="dd" type="date" value="'+new Date().toISOString().slice(0,10)+'"></div><div class="field"><label>Broj zapisa</label><input id="dn"></div><div class="field"><label>Ekipa</label><input id="team"></div><div class="field"><label>Odgovorno lice</label><input id="resp"></div><div class="field full"><label>Izvedeni radovi</label><textarea id="work"></textarea></div><div class="field full"><label>Problemi / zastoji</label><textarea id="issues"></textarea></div></div><button class="btn" id="ds">Sačuvaj zapis</button></div>':'')+
 '<h2 class="sectionTitle">Prethodni zapisi</h2><div class="rows">'+(ds.length?ds.map((d,i)=>diaryRow(d,i,projectName,currentRlc.code)).join(''):'<div class="notice">Još nema zapisa.</div>')+'</div></div>';
 shell(h);
 br.onclick=()=>rlc(currentRlc.id);
 if(document.getElementById('ds'))document.getElementById('ds').onclick=saveDiary;
 bindDiaryMail();
};

window.corridorDiary=async function(){
 const ds=await api('/rest/v1/project_diary_entries?project_id=eq.'+currentProject.id+'&select=*,project_segments(name)&order=entry_date.desc');
 const segs=await api('/rest/v1/project_segments?project_id=eq.'+currentProject.id+'&select=id,name&order=sort_order.asc');
 window.__pp32DiaryMailRows=[];
 let h='<div class="wrap"><button class="back" id="bp">← '+esc(currentProject.name)+'</button><div class="adminbar"><h1>Građevinski dnevnik · Cvetojevac–Sobovica</h1><p style="margin:0">Dnevni zapisi za ceo projekat ili izabranu podfazu.</p></div>'+
 (canEdit()?'<div class="form"><div class="fg"><div class="field"><label>Datum</label><input id="cdd" type="date" value="'+new Date().toISOString().slice(0,10)+'"></div><div class="field"><label>Podfaza</label><select id="cdseg"><option value="">Ceo projekat</option>'+segs.map(s=>'<option value="'+s.id+'">'+esc(s.name)+'</option>').join('')+'</select></div><div class="field"><label>Broj zapisa</label><input id="cdn"></div><div class="field"><label>Ekipa / izvođač</label><input id="cdteam"></div><div class="field"><label>Odgovorno lice</label><input id="cdresp"></div><div class="field"><label>Vreme</label><input id="cdweather"></div><div class="field"><label>Broj radnika</label><input id="cdworkers" type="number"></div><div class="field full"><label>Izvedeni radovi</label><textarea id="cdwork"></textarea></div><div class="field full"><label>Problemi / zastoji</label><textarea id="cdissues"></textarea></div><div class="field full"><label>Plan za naredni dan</label><textarea id="cdplan"></textarea></div></div><button class="btn" id="cdsave">Sačuvaj zapis</button></div>':'')+
 '<h2 class="sectionTitle">Prethodni zapisi</h2><div class="rows">'+(ds.length?ds.map((d,i)=>{d._project=currentProject.name||'Cvetojevac–Sobovica';d._segment=d.project_segments?.name||'Ceo projekat';window.__pp32DiaryMailRows[i]=d;return '<div class="row"><div style="flex:1"><b>'+esc(d.entry_no||'Dnevni zapis')+' · '+esc(d.entry_date)+'</b><small>'+(d.project_segments?.name?esc(d.project_segments.name)+' · ':'')+esc(d.team||'')+'</small><p style="margin:6px 0 0">'+esc(d.work_done||'')+'</p><div style="margin-top:10px"><button class="btn sec small" data-dmail="'+i+'">✉ Pošalji mejlom</button></div></div></div>';}).join(''):'<div class="notice">Još nema zapisa.</div>')+'</div></div>';
 shell(h);
 bp.onclick=corridorHome;
 if(document.getElementById('cdsave'))document.getElementById('cdsave').onclick=saveCorridorDiary;
 bindDiaryMail();
};
})();
