alter table public.diary_entries add column if not exists form_data jsonb;
alter table public.project_diary_entries add column if not exists form_data jsonb;
comment on column public.diary_entries.form_data is 'A4 landscape construction diary editable fields';
comment on column public.project_diary_entries.form_data is 'A4 landscape construction diary editable fields';