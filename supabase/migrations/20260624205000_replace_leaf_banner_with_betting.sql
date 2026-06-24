-- Replace the leaf image banner with a proper betting/poker image
UPDATE public.banners
SET image_url = 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1600'
WHERE title_bn = 'অ্যাভিয়েটর ক্র্যাশ গেম' AND image_url = 'https://images.unsplash.com/photo-1596451190630-186aff535bf2?w=1600';
