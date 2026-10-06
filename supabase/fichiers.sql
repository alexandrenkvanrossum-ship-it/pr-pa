-- Fichiers déposés dans l'app (cours, TD, DM, corrigés…) : espace privé « fichiers ».
-- Chaque fichier est rangé dans un dossier à ton identifiant ; toi seul peux le lire, l'ajouter ou le supprimer.
-- À coller une seule fois dans Supabase → SQL Editor → Run. Le script peut être relancé sans risque.

insert into storage.buckets (id, name, public, file_size_limit)
values ('fichiers', 'fichiers', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

drop policy if exists "fichiers lecture" on storage.objects;
create policy "fichiers lecture" on storage.objects for select to authenticated
  using (bucket_id = 'fichiers' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "fichiers ajout" on storage.objects;
create policy "fichiers ajout" on storage.objects for insert to authenticated
  with check (bucket_id = 'fichiers' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "fichiers modification" on storage.objects;
create policy "fichiers modification" on storage.objects for update to authenticated
  using (bucket_id = 'fichiers' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "fichiers suppression" on storage.objects;
create policy "fichiers suppression" on storage.objects for delete to authenticated
  using (bucket_id = 'fichiers' and (storage.foldername(name))[1] = auth.uid()::text);

select 'Espace fichiers prêt' as resultat;
