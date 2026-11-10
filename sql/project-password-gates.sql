-- PP32 individual project password gating; run as privileged migration only after UI deployment.
-- Idempotent. Security in the database, NOT merely frontend. Costs no paid services.
create table if not exists private.project_passwords (
 project_id uuid primary key references public.projects(id) on delete cascade,
 password_hash text not null,
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id)
);
create table if not exists private.project_grants (
 project_id uuid not null references public.projects(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 token_digest bytea not null,
 expires_at timestamptz not null,
 primary key (project_id,user_id)
);
create table if not exists private.project_password_attempts (
 project_id uuid not null references public.projects(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 attempts integer not null default 0,
 window_started timestamptz not null default now(),
 locked_until timestamptz,
 primary key (project_id,user_id)
);
create index if not exists project_grants_expiry_idx on private.project_grants(expires_at);
revoke all on private.project_passwords, private.project_grants, private.project_password_attempts from public, anon, authenticated;

create or replace function private.project_from_rlc(p_rlc uuid)
returns uuid language sql stable security definer set search_path=''
as $$select project_id from public.rlcs where id=p_rlc$$;
create or replace function private.project_from_component(p_comp uuid)
returns uuid language sql stable security definer set search_path=''
as $$select r.project_id from public.components c join public.rlcs r on r.id=c.rlc_id where c.id=p_comp$$;
create or replace function private.project_from_component_type(p_ct uuid)
returns uuid language sql stable security definer set search_path=''
as $$select project_id from public.component_types where id=p_ct$$;
create or replace function private.project_from_segment(p_segment uuid)
returns uuid language sql stable security definer set search_path=''
as $$select project_id from public.project_segments where id=p_segment$$;
create or replace function private.project_from_element(p_element uuid)
returns uuid language sql stable security definer set search_path=''
as $$select s.project_id from public.project_elements e join public.project_segments s on s.id=e.segment_id where e.id=p_element$$;

-- x-client-info is already on Supabase's browser CORS allowlist.
-- It carries only opaque project unlock tokens (not user-chosen passwords).
-- On F5 token map is lost from browser memory and a new password is required.
create or replace function private.project_can_access(p_project uuid)
returns boolean language plpgsql stable security definer set search_path=''
as $$
declare raw_header text; token text;
begin
 if p_project is null then return false; end if;
 if private.is_super_admin() then return true; end if;
 if not exists (select 1 from private.project_passwords where project_id=p_project)
 then return true; end if; -- staged rollout: protection activates when admin sets password
 if auth.uid() is null then return false; end if;
 raw_header := nullif(current_setting('request.headers',true),'');
 if raw_header is null then return false; end if;
 begin
  token := ((raw_header::jsonb)->>'x-client-info')::jsonb ->> p_project::text;
 exception when others then
  return false;
 end;
 if token is null or token !~ '^[0-9a-f]{64}$' then return false; end if;
 return exists (
  select 1 from private.project_grants g
  where g.project_id=p_project and g.user_id=auth.uid()
   and g.token_digest=extensions.digest(token,'sha256')
   and g.expires_at > now()
 );
end $$;

create or replace function public.project_password_status(p_project uuid)
returns jsonb language plpgsql stable security definer set search_path=''
as $$
begin
 if auth.uid() is null then return jsonb_build_object('enabled',false); end if;
 if not (private.is_active_user() or private.is_pp32_guest()) then
  return jsonb_build_object('enabled',false);
 end if;
 return jsonb_build_object('enabled', exists(select 1 from private.project_passwords where project_id=p_project));
end $$;

create or replace function public.project_password_set(p_project uuid,p_password text)
returns jsonb language plpgsql security definer set search_path=''
as $$
begin
 if not private.is_super_admin() then
  return jsonb_build_object('ok',false,'error','Samo administrator može da menja šifre.');
 end if;
 if not exists(select 1 from public.projects where id=p_project) then
  return jsonb_build_object('ok',false,'error','Projekat ne postoji.');
 end if;
 if p_password is null or length(p_password)<12 or length(p_password)>128 then
  return jsonb_build_object('ok',false,'error','Šifra mora imati od 12 do 128 znakova.');
 end if;
 insert into private.project_passwords(project_id,password_hash,updated_by,updated_at)
 values(p_project,extensions.crypt(encode(extensions.digest(p_password,'sha256'),'hex'),extensions.gen_salt('bf',12)),auth.uid(),now())
 on conflict(project_id) do update set
  password_hash=excluded.password_hash,updated_by=excluded.updated_by,updated_at=excluded.updated_at;
 delete from private.project_grants where project_id=p_project;
 delete from private.project_password_attempts where project_id=p_project;
 return jsonb_build_object('ok',true);
end $$;

create or replace function public.project_password_unlock(p_project uuid,p_password text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare u uuid:=auth.uid(); pw_hash text; old_attempt private.project_password_attempts%rowtype; new_count int; token text;
begin
 if u is null or not (private.is_active_user() or private.is_pp32_guest()) then
  return jsonb_build_object('ok',false,'error','Prijavi se aktivnim nalogom.');
 end if;
 if private.is_pp32_guest() and not exists(
    select 1 from public.projects where id=p_project and code='pp32'
 ) then
  return jsonb_build_object('ok',false,'error','Nemate pristup ovom projektu.');
 end if;
 select password_hash into pw_hash from private.project_passwords where project_id=p_project;
 if pw_hash is null then return jsonb_build_object('ok',false,'error','Administrator još nije postavio šifru.'); end if;
 insert into private.project_password_attempts(project_id,user_id)
 values(p_project,u) on conflict do nothing;
 select * into old_attempt from private.project_password_attempts
 where project_id=p_project and user_id=u for update;
 if old_attempt.locked_until is not null and old_attempt.locked_until>now() then
   return jsonb_build_object('ok',false,'error','Previše pokušaja. Pokušaj ponovo za 15 minuta.');
 end if;
 if p_password is null or length(p_password)>256 or
    extensions.crypt(encode(extensions.digest(p_password,'sha256'),'hex'),pw_hash) is distinct from pw_hash then
   new_count:=case when old_attempt.window_started<now()-interval '15 minutes' then 1 else old_attempt.attempts+1 end;
   update private.project_password_attempts set attempts=new_count,
     window_started=case when old_attempt.window_started<now()-interval '15 minutes' then now() else old_attempt.window_started end,
     locked_until=case when new_count>=5 then now()+interval '15 minutes' else null end
    where project_id=p_project and user_id=u;
   return jsonb_build_object('ok',false,'error',
    case when new_count>=5 then 'Previše pokušaja. Pokušaj ponovo za 15 minuta.' else 'Pogrešna šifra.' end);
 end if;
 update private.project_password_attempts set attempts=0,window_started=now(),locked_until=null
 where project_id=p_project and user_id=u;
 token:=encode(extensions.gen_random_bytes(32),'hex');
 insert into private.project_grants(project_id,user_id,token_digest,expires_at)
 values(p_project,u,extensions.digest(token,'sha256'),now()+interval '12 hours')
 on conflict(project_id,user_id) do update set token_digest=excluded.token_digest,expires_at=excluded.expires_at;
 return jsonb_build_object('ok',true,'token',token);
end $$;
revoke all on function public.project_password_status(uuid),
 public.project_password_set(uuid,text),public.project_password_unlock(uuid,text)
 from public,anon;
grant execute on function public.project_password_status(uuid),
 public.project_password_set(uuid,text),public.project_password_unlock(uuid,text)
 to authenticated;

-- RESTRICTIVE policies are AND-ed with existing policies. Existing role privileges remain.
drop policy if exists pp32_project_password_gate on public.component_types;
create policy pp32_project_password_gate on public.component_types as restrictive for all to authenticated using (private.project_can_access(project_id)) with check (private.project_can_access(project_id));
drop policy if exists pp32_project_password_gate on public.component_type_tasks;
create policy pp32_project_password_gate on public.component_type_tasks as restrictive for all to authenticated using (private.project_can_access(private.project_from_component_type(component_type_id))) with check (private.project_can_access(private.project_from_component_type(component_type_id)));
drop policy if exists pp32_project_password_gate on public.components;
create policy pp32_project_password_gate on public.components as restrictive for all to authenticated using (private.project_can_access(private.project_from_rlc(rlc_id))) with check (private.project_can_access(private.project_from_rlc(rlc_id)));
drop policy if exists pp32_project_password_gate on public.component_tasks;
create policy pp32_project_password_gate on public.component_tasks as restrictive for all to authenticated using (private.project_can_access(private.project_from_component(component_id))) with check (private.project_can_access(private.project_from_component(component_id)));
drop policy if exists pp32_project_password_gate on public.component_notes;
create policy pp32_project_password_gate on public.component_notes as restrictive for all to authenticated using (private.project_can_access(private.project_from_component(component_id))) with check (private.project_can_access(private.project_from_component(component_id)));
drop policy if exists pp32_project_password_gate on public.task_history;
create policy pp32_project_password_gate on public.task_history as restrictive for all to authenticated using (private.project_can_access(private.project_from_component(component_id))) with check (private.project_can_access(private.project_from_component(component_id)));
drop policy if exists pp32_project_password_gate on public.diary_entries;
create policy pp32_project_password_gate on public.diary_entries as restrictive for all to authenticated using (private.project_can_access(private.project_from_rlc(rlc_id))) with check (private.project_can_access(private.project_from_rlc(rlc_id)));
drop policy if exists pp32_project_password_gate on public.documents;
create policy pp32_project_password_gate on public.documents as restrictive for all to authenticated using (private.project_can_access(private.project_from_rlc(rlc_id))) with check (private.project_can_access(private.project_from_rlc(rlc_id)));
drop policy if exists pp32_project_password_gate on public.equipment_items;
create policy pp32_project_password_gate on public.equipment_items as restrictive for all to authenticated using (private.project_can_access(private.project_from_rlc(rlc_id))) with check (private.project_can_access(private.project_from_rlc(rlc_id)));
drop policy if exists pp32_project_password_gate on public.rlcs;
create policy pp32_project_password_gate on public.rlcs as restrictive for all to authenticated using (private.project_can_access(project_id)) with check (private.project_can_access(project_id));
drop policy if exists pp32_project_password_gate on public.rlc_line_items;
create policy pp32_project_password_gate on public.rlc_line_items as restrictive for all to authenticated using (private.project_can_access(private.project_from_rlc(rlc_id))) with check (private.project_can_access(private.project_from_rlc(rlc_id)));
drop policy if exists pp32_project_password_gate on public.rlc_cable_items;
create policy pp32_project_password_gate on public.rlc_cable_items as restrictive for all to authenticated using (private.project_can_access(private.project_from_rlc(rlc_id))) with check (private.project_can_access(private.project_from_rlc(rlc_id)));
drop policy if exists pp32_project_password_gate on public.project_cable_plans;
create policy pp32_project_password_gate on public.project_cable_plans as restrictive for all to authenticated using (private.project_can_access(project_id)) with check (private.project_can_access(project_id));
drop policy if exists pp32_project_password_gate on public.project_diary_entries;
create policy pp32_project_password_gate on public.project_diary_entries as restrictive for all to authenticated using (private.project_can_access(project_id)) with check (private.project_can_access(project_id));
drop policy if exists pp32_project_password_gate on public.project_documents;
create policy pp32_project_password_gate on public.project_documents as restrictive for all to authenticated using (private.project_can_access(project_id)) with check (private.project_can_access(project_id));
drop policy if exists pp32_project_password_gate on public.project_equipment_items;
create policy pp32_project_password_gate on public.project_equipment_items as restrictive for all to authenticated using (private.project_can_access(project_id)) with check (private.project_can_access(project_id));
drop policy if exists pp32_project_password_gate on public.project_remarks;
create policy pp32_project_password_gate on public.project_remarks as restrictive for all to authenticated using (private.project_can_access(project_id)) with check (private.project_can_access(project_id));
drop policy if exists pp32_project_password_gate on public.project_segments;
create policy pp32_project_password_gate on public.project_segments as restrictive for all to authenticated using (private.project_can_access(project_id)) with check (private.project_can_access(project_id));
drop policy if exists pp32_project_password_gate on public.project_elements;
create policy pp32_project_password_gate on public.project_elements as restrictive for all to authenticated using (private.project_can_access(private.project_from_segment(segment_id))) with check (private.project_can_access(private.project_from_segment(segment_id)));
drop policy if exists pp32_project_password_gate on public.project_element_tasks;
create policy pp32_project_password_gate on public.project_element_tasks as restrictive for all to authenticated using (private.project_can_access(private.project_from_element(element_id))) with check (private.project_can_access(private.project_from_element(element_id)));

-- Resolve existing and future pp32-documents paths; unknown paths are denied to non-admins.
create or replace function private.storage_project_can_access(p_path text)
returns boolean language plpgsql stable security definer set search_path=''
as $$
declare key_text text:=split_part(p_path,'/',2); p_project uuid;
begin
 if private.is_super_admin() then return true; end if;
 select p.id into p_project from public.projects p where p.id::text=key_text limit 1;
 if p_project is null then
   select r.project_id into p_project from public.rlcs r where r.id::text=key_text limit 1;
 end if;
 if p_project is null then
   select d.project_id into p_project from public.project_documents d where d.storage_path=p_path limit 1;
 end if;
 if p_project is null then
   select r.project_id into p_project from public.documents d
   join public.rlcs r on r.id=d.rlc_id where d.storage_path=p_path limit 1;
 end if;
 if p_project is null then return false; end if;
 return private.project_can_access(p_project);
end $$;
drop policy if exists pp32_project_password_gate_storage on storage.objects;
create policy pp32_project_password_gate_storage on storage.objects
 as restrictive for all to authenticated
 using (bucket_id<>'pp32-documents' or private.storage_project_can_access(name))
 with check (bucket_id<>'pp32-documents' or private.storage_project_can_access(name));


-- Home page must be able to list project names, but modifications require an unlock.
drop policy if exists pp32_project_password_update on public.projects;
create policy pp32_project_password_update on public.projects as restrictive
 for update to authenticated using (private.project_can_access(id))
 with check (private.project_can_access(id));
drop policy if exists pp32_project_password_delete on public.projects;
create policy pp32_project_password_delete on public.projects as restrictive
 for delete to authenticated using (private.project_can_access(id));

-- SECURITY DEFINER work-status RPC functions bypass table RLS: explicitly gate them too.
create or replace function public.set_work_status(p_scope text,p_target uuid,p_status text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare n integer:=0; a integer:=0; b integer:=0; c integer:=0; v_project uuid;
begin
 if auth.uid() is null or not private.can_edit_work() then
  raise exception 'Nemaš pravo izmene radova.';
 end if;
 if p_target is null or p_status not in ('not_started','prepared','done') or p_status is null then
  raise exception 'Neispravan cilj ili status.';
 end if;
 case p_scope
  when 'line_item' then
    select private.project_from_rlc(rlc_id) into v_project from public.rlc_line_items where id=p_target;
  when 'component' then v_project:=private.project_from_component(p_target);
  when 'project_element' then v_project:=private.project_from_element(p_target);
  when 'rlc' then v_project:=private.project_from_rlc(p_target);
  when 'segment' then v_project:=private.project_from_segment(p_target);
  when 'project' then select id into v_project from public.projects where id=p_target;
  else raise exception 'Nepoznata grupa elemenata.';
 end case;
 if v_project is null or not private.project_can_access(v_project) then
  raise exception 'Prvo otključaj projekat njegovom šifrom.';
 end if;
 case p_scope
  when 'line_item' then
   update public.rlc_line_items set status=p_status,updated_at=now() where id=p_target;
   get diagnostics n=row_count;
  when 'component' then
   update public.components set work_status=p_status,updated_at=now() where id=p_target;
   get diagnostics n=row_count;
  when 'project_element' then
   update public.project_elements set work_status=p_status,updated_at=now() where id=p_target;
   get diagnostics n=row_count;
  when 'rlc' then
   update public.rlc_line_items set status=p_status,updated_at=now() where rlc_id=p_target;
   get diagnostics a=row_count;
   update public.components set work_status=p_status,updated_at=now() where rlc_id=p_target;
   get diagnostics b=row_count; n:=a+b;
  when 'segment' then
   update public.project_elements set work_status=p_status,updated_at=now() where segment_id=p_target;
   get diagnostics n=row_count;
  when 'project' then
   update public.project_elements set work_status=p_status,updated_at=now()
     where segment_id in (select id from public.project_segments where project_id=p_target);
   get diagnostics a=row_count;
   update public.components set work_status=p_status,updated_at=now()
     where rlc_id in (select id from public.rlcs where project_id=p_target);
   get diagnostics b=row_count;
   update public.rlc_line_items set status=p_status,updated_at=now()
     where rlc_id in (select id from public.rlcs where project_id=p_target);
   get diagnostics c=row_count; n:=a+b+c;
 end case;
 if n=0 then raise exception 'Za izabranu grupu nije pronađen nijedan element.'; end if;
 return jsonb_build_object('updated',n,'scope',p_scope,'status',p_status);
end $$;

create or replace function public.set_rlc_device_status(p_item uuid,p_status text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_rlc uuid;v_key text;n integer;n_components integer;
begin
 if auth.uid() is null or not private.can_edit_work() then
  raise exception 'Nemaš pravo izmene radova.';
 end if;
 if p_status is null or p_status not in ('not_started','prepared','done') then
  raise exception 'Neispravan status.';
 end if;
 select li.rlc_id,li.item_key into v_rlc,v_key
 from public.rlc_line_items li join public.rlcs r on r.id=li.rlc_id
 join public.projects p on p.id=r.project_id
 where li.id=p_item and p.code='pp32' and r.code in
 ('RLC18','RLC19','RLC20','RLC21','RLC22','RLC23','RLC24','RLC25');
 if v_rlc is null then raise exception 'Element nije pronađen.'; end if;
 if not private.project_can_access(private.project_from_rlc(v_rlc)) then
  raise exception 'Prvo otključaj projekat njegovom šifrom.';
 end if;
 update public.rlc_line_items set status=p_status,updated_at=now() where id=p_item;
 get diagnostics n=row_count;
 if v_key<>'trench' then
  update public.components set work_status=p_status,updated_at=now()
   where rlc_id=v_rlc and code=v_key;
  get diagnostics n_components=row_count;
 else n_components:=0;end if;
 return jsonb_build_object('line_items',n,'components',n_components,'status',p_status);
end $$;

create or replace function public.set_rlc_map_location(p_rlc_id uuid,p_lat double precision,p_lng double precision)
returns void language plpgsql security definer set search_path=''
as $$
begin
 if not exists(select 1 from public.profiles p where p.id=auth.uid()
   and p.active=true and p.role in ('admin','leader')) then
  raise exception 'Nemate pravo da menjate lokacije prelaza.';
 end if;
 if not private.project_can_access(private.project_from_rlc(p_rlc_id)) then
  raise exception 'Prvo otključaj projekat njegovom šifrom.';
 end if;
 if (p_lat is null) <> (p_lng is null) then
  raise exception 'Unesite obe koordinate ili obe ostavite prazne.';
 end if;
 if p_lat is not null and (p_lat< -90 or p_lat>90 or p_lng< -180 or p_lng>180) then
  raise exception 'Koordinate nisu ispravne.';
 end if;
 update public.rlcs set map_lat=p_lat,map_lng=p_lng,updated_at=now() where id=p_rlc_id;
 if not found then raise exception 'Prelaz nije pronađen.';end if;
end $$;
