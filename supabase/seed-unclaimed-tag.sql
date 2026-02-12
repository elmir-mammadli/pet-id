-- Example: insert one unclaimed tag for manufacturing.
-- Run in Supabase SQL Editor. Replace YOUR_ACTIVATION_TOKEN with the token
-- you will write to the NFC tag (e.g. 7Hf92KxQ).
--
-- URL to write to tag: https://yourdomain.com/activate/YOUR_ACTIVATION_TOKEN

insert into public.tags (activation_token, status)
values ('YOUR_ACTIVATION_TOKEN', 'unclaimed')
on conflict (activation_token) do nothing;
