
-- Banners (homepage slideshow)
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title_bn text,
  link_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon, authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads active banners" ON public.banners FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage banners" ON public.banners FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Feature updates (admin announcements)
CREATE TABLE public.feature_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_bn text NOT NULL,
  body_bn text NOT NULL,
  image_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.feature_updates TO anon, authenticated;
GRANT ALL ON public.feature_updates TO service_role;
ALTER TABLE public.feature_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads published updates" ON public.feature_updates FOR SELECT USING (is_published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage feature updates" ON public.feature_updates FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Admin policies on existing tables
CREATE POLICY "admins manage all transactions" ON public.transactions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage user_roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins view all notifications" ON public.notifications FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete notifications" ON public.notifications FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins view all bets" ON public.bets FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Auto-promote specific email to admin
CREATE OR REPLACE FUNCTION public.promote_admin_email()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email = 'oluwafemiod7@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_promote_admin ON auth.users;
CREATE TRIGGER on_auth_user_promote_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.promote_admin_email();

-- Grant now if user already exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'oluwafemiod7@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Seed a few banners
INSERT INTO public.banners (image_url, title_bn, sort_order) VALUES
  ('https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=1600','৩৫০% স্বাগতম বোনাস',1),
  ('https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1600','লাইভ ক্যাসিনো — ২৪/৭',2),
  ('https://images.unsplash.com/photo-1596451190630-186aff535bf2?w=1600','অ্যাভিয়েটর ক্র্যাশ গেম',3);
