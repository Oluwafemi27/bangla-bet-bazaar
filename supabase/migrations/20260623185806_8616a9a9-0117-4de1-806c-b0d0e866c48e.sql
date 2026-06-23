
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mobile TEXT,
  balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  bonus_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  referral_code TEXT UNIQUE NOT NULL DEFAULT upper(substr(md5(random()::text),1,8)),
  referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  kyc_status TEXT NOT NULL DEFAULT 'unverified',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, mobile)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name','ব্যবহারকারী'), NEW.raw_user_meta_data->>'mobile');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Transactions (deposits/withdrawals/bonus/adjustment)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  method TEXT,
  reference TEXT,
  screenshot_url TEXT,
  account_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own tx" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "insert own tx" ON public.transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "admin update tx" ON public.transactions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Matches
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_home TEXT NOT NULL,
  team_away TEXT NOT NULL,
  tournament TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  score_home INTEGER,
  score_away INTEGER,
  result TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.matches TO authenticated, anon;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "admin manage matches" ON public.matches FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Odds markets
CREATE TABLE public.odds_markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  market_name TEXT NOT NULL,
  selections JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.odds_markets TO authenticated, anon;
GRANT ALL ON public.odds_markets TO service_role;
ALTER TABLE public.odds_markets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view odds" ON public.odds_markets FOR SELECT USING (true);
CREATE POLICY "admin manage odds" ON public.odds_markets FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Bets
CREATE TABLE public.bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  market TEXT,
  selection TEXT,
  odds NUMERIC(10,2) NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  potential_payout NUMERIC(14,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.bets TO authenticated;
GRANT ALL ON public.bets TO service_role;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own bets" ON public.bets FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "insert own bets" ON public.bets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin update bets" ON public.bets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Games catalog
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_bn TEXT NOT NULL,
  type TEXT NOT NULL,
  iframe_url TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  house_edge NUMERIC(5,2) DEFAULT 2.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.games TO authenticated, anon;
GRANT ALL ON public.games TO service_role;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view games" ON public.games FOR SELECT USING (true);
CREATE POLICY "admin manage games" ON public.games FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Promotions
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_bn TEXT NOT NULL,
  description_bn TEXT,
  type TEXT NOT NULL,
  value NUMERIC(10,2) NOT NULL,
  min_deposit NUMERIC(14,2) DEFAULT 0,
  max_bonus NUMERIC(14,2),
  terms_bn TEXT,
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promotions TO authenticated, anon;
GRANT ALL ON public.promotions TO service_role;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view promos" ON public.promotions FOR SELECT USING (true);
CREATE POLICY "admin manage promos" ON public.promotions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Aviator
CREATE TABLE public.aviator_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crash_multiplier NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.aviator_rounds TO authenticated, anon;
GRANT ALL ON public.aviator_rounds TO service_role;
ALTER TABLE public.aviator_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view rounds" ON public.aviator_rounds FOR SELECT USING (true);

CREATE TABLE public.aviator_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  round_id UUID REFERENCES public.aviator_rounds(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL,
  cashout_multiplier NUMERIC(10,2),
  payout NUMERIC(14,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.aviator_bets TO authenticated;
GRANT ALL ON public.aviator_bets TO service_role;
ALTER TABLE public.aviator_bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own avi bets" ON public.aviator_bets FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "insert own avi bets" ON public.aviator_bets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_bn TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own notifs" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "update own notifs" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Seed games
INSERT INTO public.games (name_bn, type, thumbnail_url) VALUES
  ('ব্যাকারেট', 'baccarat', null),
  ('রুলেট', 'roulette', null),
  ('তিন পাত্তি', 'teen_patti', null),
  ('আন্দার বাহার', 'andar_bahar', null),
  ('ড্রাগন টাইগার', 'dragon_tiger', null);

-- Seed sample matches
INSERT INTO public.matches (team_home, team_away, tournament, start_time, status) VALUES
  ('বাংলাদেশ', 'ভারত', 'এশিয়া কাপ', now() + interval '2 hours', 'upcoming'),
  ('পাকিস্তান', 'শ্রীলঙ্কা', 'এশিয়া কাপ', now() + interval '6 hours', 'upcoming'),
  ('অস্ট্রেলিয়া', 'ইংল্যান্ড', 'টেস্ট সিরিজ', now() + interval '1 day', 'upcoming'),
  ('দক্ষিণ আফ্রিকা', 'নিউজিল্যান্ড', 'টি২০ সিরিজ', now() - interval '30 minutes', 'live');

-- Seed odds for the matches
INSERT INTO public.odds_markets (match_id, market_name, selections)
SELECT id, 'ম্যাচ বিজয়ী', jsonb_build_array(
  jsonb_build_object('label', team_home, 'odds', 1.85),
  jsonb_build_object('label', 'ড্র', 'odds', 3.40),
  jsonb_build_object('label', team_away, 'odds', 2.10)
) FROM public.matches;

-- Seed promotions
INSERT INTO public.promotions (title_bn, description_bn, type, value, min_deposit, max_bonus, terms_bn) VALUES
  ('স্বাগতম বোনাস ১০০%', 'প্রথম জমায় ১০০% বোনাস পান!', 'percent', 100, 500, 5000, 'প্রথম ডিপোজিটে প্রযোজ্য। ১০x রোলওভার প্রয়োজন।'),
  ('রেফারেল বোনাস', 'প্রতি বন্ধু রেফার করলে ৳২০০', 'fixed', 200, 0, null, 'বন্ধুর প্রথম ডিপোজিট ৳৫০০+ হতে হবে।'),
  ('সাপ্তাহিক ক্যাশব্যাক', 'হারের ১০% ফেরত পান', 'percent', 10, 0, 2000, 'প্রতি সোমবার ক্রেডিট হয়।'),
  ('ক্রিকেট ফ্রি বেট', '৳১০০০+ বাজিতে ৳২০০ ফ্রি', 'fixed', 200, 1000, 200, 'শুধুমাত্র ক্রিকেট বেটে প্রযোজ্য।');
