drop extension if exists "pg_net";

alter table "public"."boards" add column "user_id" uuid;

alter table "public"."boards" enable row level security;

alter table "public"."holds" enable row level security;

alter table "public"."route_holds" enable row level security;

alter table "public"."routes" add column "user_id" uuid;

alter table "public"."routes" enable row level security;

alter table "public"."boards" add constraint "boards_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."boards" validate constraint "boards_user_id_fkey";

alter table "public"."routes" add constraint "routes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."routes" validate constraint "routes_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;


  create policy "Allow public inserts for boards"
  on "public"."boards"
  as permissive
  for insert
  to public
with check (true);



  create policy "Allow public read access for boards"
  on "public"."boards"
  as permissive
  for select
  to public
using (true);



  create policy "Allow public inserts for holds"
  on "public"."holds"
  as permissive
  for insert
  to public
with check (true);



  create policy "Allow public read access for holds"
  on "public"."holds"
  as permissive
  for select
  to public
using (true);



  create policy "BoardImageInsert 1d6itdr_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'board-images'::text));



