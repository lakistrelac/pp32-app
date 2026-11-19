-- Retire project-entry passwords and scope the guest role to documents and calculators.
-- Password/grant/attempt records are cleared; private tables remain for rollback.

DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.component_notes;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.component_tasks;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.component_type_tasks;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.component_types;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.components;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.diary_entries;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.documents;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.equipment_items;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.project_cable_plans;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.project_diary_entries;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.project_documents;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.project_element_tasks;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.project_elements;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.project_equipment_items;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.project_remarks;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.project_segments;
DROP POLICY IF EXISTS "pp32_project_password_delete" ON public.projects;
DROP POLICY IF EXISTS "pp32_project_password_update" ON public.projects;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.rlc_cable_items;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.rlc_line_items;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.rlcs;
DROP POLICY IF EXISTS "pp32_project_password_gate" ON public.task_history;
DROP POLICY IF EXISTS "pp32_project_password_gate_storage" ON storage.objects;

DROP POLICY IF EXISTS component_notes_guest_pp32_select ON public.component_notes;
DROP POLICY IF EXISTS component_tasks_guest_pp32_select ON public.component_tasks;
DROP POLICY IF EXISTS component_type_tasks_guest_pp32_select ON public.component_type_tasks;
DROP POLICY IF EXISTS component_types_guest_pp32_select ON public.component_types;
DROP POLICY IF EXISTS components_guest_pp32_select ON public.components;
DROP POLICY IF EXISTS diary_entries_guest_pp32_select ON public.diary_entries;
DROP POLICY IF EXISTS equipment_items_guest_pp32_select ON public.equipment_items;
DROP POLICY IF EXISTS project_cable_plans_guest_pp32_select ON public.project_cable_plans;
DROP POLICY IF EXISTS project_diary_entries_guest_pp32_select ON public.project_diary_entries;
DROP POLICY IF EXISTS project_element_tasks_guest_pp32_select ON public.project_element_tasks;
DROP POLICY IF EXISTS project_elements_guest_pp32_select ON public.project_elements;
DROP POLICY IF EXISTS project_equipment_items_guest_pp32_select ON public.project_equipment_items;
DROP POLICY IF EXISTS rlc_cable_items_guest_pp32_select ON public.rlc_cable_items;
DROP POLICY IF EXISTS rlc_line_items_guest_pp32_select ON public.rlc_line_items;
DROP POLICY IF EXISTS task_history_guest_pp32_select ON public.task_history;

DELETE FROM private.project_grants;
DELETE FROM private.project_password_attempts;
DELETE FROM private.project_passwords;
REVOKE EXECUTE ON FUNCTION public.project_password_set(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.project_password_unlock(uuid, text) FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS guide_sections_guest_select ON public.guide_sections;
CREATE POLICY guide_sections_guest_select ON public.guide_sections
  FOR SELECT TO authenticated
  USING (private.is_pp32_guest() AND slug IN ('ukljucne-tacke', 'pad-napona'));

DROP POLICY IF EXISTS guide_items_guest_select ON public.guide_items;
CREATE POLICY guide_items_guest_select ON public.guide_items
  FOR SELECT TO authenticated
  USING (
    private.is_pp32_guest()
    AND EXISTS (
      SELECT 1 FROM public.guide_sections s
      WHERE s.id = guide_items.section_id
        AND s.slug IN ('ukljucne-tacke', 'pad-napona')
    )
  );

DROP POLICY IF EXISTS pp32_guest_storage_read ON storage.objects;
CREATE POLICY pp32_guest_storage_read ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'pp32-documents'
    AND private.is_pp32_guest()
    AND (
      EXISTS (
        SELECT 1
        FROM public.documents d
        JOIN public.rlcs r ON r.id = d.rlc_id
        JOIN public.projects p ON p.id = r.project_id
        WHERE d.storage_path = objects.name AND p.code = 'pp32'
      )
      OR EXISTS (
        SELECT 1
        FROM public.project_documents d
        JOIN public.projects p ON p.id = d.project_id
        WHERE d.storage_path = objects.name AND p.code = 'pp32'
      )
      OR EXISTS (
        SELECT 1
        FROM public.rlcs r
        JOIN public.projects p ON p.id = r.project_id
        WHERE r.line_storage_path = objects.name AND p.code = 'pp32'
      )
    )
  );

DROP POLICY IF EXISTS project_remarks_guest_deny ON public.project_remarks;
CREATE POLICY project_remarks_guest_deny ON public.project_remarks
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (NOT private.is_pp32_guest())
  WITH CHECK (NOT private.is_pp32_guest());

