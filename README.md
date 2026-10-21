# OpenBoard

OpenBoard হলো একটি বাংলা-ভিত্তিক পাবলিক পোস্ট বোর্ড। ব্যবহারকারীরা অ্যাকাউন্ট তৈরি বা লগইন না করেই পোস্ট প্রকাশ করতে পারেন এবং অন্যদের পোস্ট দেখতে পারেন। ওয়েবসাইটটি GitHub Pages-এ হোস্ট করা যায়; পোস্ট সংরক্ষণ ও রিপোর্টের জন্য Supabase ব্যবহার করা হয়।

## বৈশিষ্ট্য

- অ্যাকাউন্ট বা লগইন ছাড়াই পোস্ট করা যায়
- নাম বা ছদ্মনাম দেওয়া ঐচ্ছিক
- প্রতি পোস্টে সর্বোচ্চ ১,২০০ অক্ষর
- সর্বশেষ পোস্ট আগে দেখানো হয়
- পোস্ট ফিড ম্যানুয়ালি রিফ্রেশ করা যায়
- পোস্ট রিপোর্ট করার সুবিধা
- মোবাইল ও ডেস্কটপের উপযোগী responsive interface
- Supabase Row Level Security (RLS) policies

## প্রজেক্ট ফাইল

- `index.html` — ওয়েবসাইটের HTML কাঠামো
- `style.css` — ডিজাইন ও responsive layout
- `app.js` — পোস্ট প্রকাশ, ফিড লোড এবং রিপোর্টের কার্যক্রম
- `config.js` — Supabase project URL ও public key-এর সেটিংস
- `supabase-schema.sql` — ডেটাবেস টেবিল, index এবং RLS policies
- `README.md` — এই নির্দেশিকা

## প্রয়োজনীয় সেটআপ

GitHub Pages শুধু static website হোস্ট করে। সব দর্শকের পোস্ট একই জায়গায় সংরক্ষণ করতে Supabase project সেটআপ করতে হবে। নিচের ধাপগুলো অনুসরণ করুন।

### ১. Supabase project তৈরি করুন

1. [Supabase](https://supabase.com/) খুলে একটি project তৈরি করুন।
2. project-এর Dashboard থেকে **SQL Editor** খুলুন এবং **New query** নির্বাচন করুন।
3. এই repository-র `supabase-schema.sql` ফাইলের সম্পূর্ণ SQL কপি করে editor-এ পেস্ট করুন।
4. **Run** চাপুন। `posts` এবং `post_reports` টেবিল তৈরি হয়েছে কি না Table Editor-এ যাচাই করুন।
5. নতুন পোস্টের realtime update পেতে **Database → Publications**-এ `supabase_realtime` publication-এর মধ্যে `posts` টেবিল যুক্ত আছে কি না দেখুন।

### ২. Supabase credentials যোগ করুন

1. Supabase Dashboard-এর **Project Settings → API** বা **Connect** অংশ থেকে Project URL এবং public publishable key (অথবা legacy `anon` key) নিন।
2. প্রজেক্টের `config.js` ফাইল খুলুন।
3. placeholder-গুলো নিজের project-এর তথ্য দিয়ে প্রতিস্থাপন করুন:

```js
window.OPENBOARD_CONFIG = {
  SUPABASE_URL: "https://YOUR_PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "YOUR_PUBLIC_PUBLISHABLE_OR_ANON_KEY"
};
