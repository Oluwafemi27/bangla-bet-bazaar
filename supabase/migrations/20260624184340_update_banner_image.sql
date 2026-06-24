-- Replace non-gaming images with proper betting/gaming images
UPDATE public.banners
SET image_url = 'https://images.unsplash.com/photo-1633356122544-f134324ef6be?w=1600'
WHERE title_bn = 'অ্যাভিয়েটর ক্র্যাশ গেম';

UPDATE public.banners
SET image_url = 'https://images.unsplash.com/photo-1627873649417-af36141e5b99?w=1600'
WHERE title_bn = 'লাইভ ক্যাসিনো — ২৪/৭';
