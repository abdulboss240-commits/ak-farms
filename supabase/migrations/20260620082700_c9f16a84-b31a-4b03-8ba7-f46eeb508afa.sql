
-- Restrict SECURITY DEFINER helpers to only the contexts that need them
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
-- has_role is used inside RLS policies → keep executable by authenticated only
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

-- Storage policies for goat-images bucket (private bucket, public read)
CREATE POLICY "Public read goat images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'goat-images');

CREATE POLICY "Admins upload goat images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'goat-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update goat images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'goat-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete goat images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'goat-images' AND public.has_role(auth.uid(), 'admin'));
