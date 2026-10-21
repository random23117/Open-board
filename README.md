# OpenBoard — account-free public posting website

এই প্রজেক্টে যে কেউ অ্যাকাউন্ট তৈরি বা লগইন ছাড়াই পোস্ট করতে পারবে, আর অন্য দর্শকেরা একই পাবলিক ফিডে পোস্ট দেখতে পারবে। সাইটটি GitHub Pages-এ হোস্ট করা যাবে; পোস্টগুলো রাখার জন্য Supabase-এর ফ্রি-টিয়ার ডেটাবেস ব্যবহার করা হয়েছে।

## গুরুত্বপূর্ণ: ZIP আপলোড করলেই পোস্ট শেয়ারিং চালু হবে না

GitHub Pages শুধু static website হোস্ট করে। সব ব্যবহারকারীর পোস্ট একই ডেটাবেসে রাখতে একটি backend দরকার। নিচের Supabase সেটআপ একবার করে নিতে হবে। Supabase প্রকল্প সেটআপ না করা পর্যন্ত সাইটে নির্দেশনা দেখাবে এবং পোস্ট প্রকাশ হবে না।

## ১) Supabase ডেটাবেস তৈরি করুন

1. https://supabase.com/ এ যান এবং একটি project তৈরি করুন।
2. project তৈরি হলে Dashboard → **SQL Editor** → **New query** খুলুন।
3. এই ফোল্ডারের `supabase-schema.sql` ফাইলের সম্পূর্ণ কোড কপি করে SQL Editor-এ পেস্ট করে **Run** চাপুন।
4. Database → Publications-এ `supabase_realtime` publication-এর মধ্যে `posts` টেবিল আছে কি না দেখুন। না থাকলে `posts` যোগ করুন। এতে নতুন পোস্ট ফিডে স্বয়ংক্রিয়ভাবে আপডেট হতে পারবে।

## ২) ওয়েবসাইটের সঙ্গে ডেটাবেস যুক্ত করুন

1. Supabase Dashboard → Project Settings → API (কিছু dashboard-এ **Connect**) খুলুন।
2. **Project URL** এবং **publishable key** (বা legacy `anon` key) কপি করুন।
3. `config.js` ফাইল খুলুন এবং এই দুই placeholder বদলান:

```js
window.OPENBOARD_CONFIG = {
  SUPABASE_URL: "https://YOUR_PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "YOUR_PUBLIC_PUBLISHABLE_OR_ANON_KEY"
};
```

4. শুধু public publishable/anon key ব্যবহার করুন। **কখনো `service_role` বা secret key প্রকাশ করবেন না।** এই সাইটে key ব্রাউজারে থাকবে, তাই database-এর নিরাপত্তা Row Level Security (RLS) policies-এর ওপর নির্ভর করে। SQL ফাইলটি সেই policies তৈরি করে।

## ৩) GitHub Pages-এ প্রকাশ করুন

1. https://github.com/new এ নতুন repository তৈরি করুন, যেমন `openboard`।
2. ZIP extract করুন। ফোল্ডারের ভেতরের সব ফাইল repository-র root-এ আপলোড করুন—`index.html` যেন root-এ থাকে।
3. GitHub repository → **Settings → Pages** খুলুন।
4. **Build and deployment**-এ `Deploy from a branch` নির্বাচন করুন, branch হিসেবে `main` এবং folder হিসেবে `/(root)` বেছে **Save** করুন।
5. কয়েক মিনিট পর GitHub Pages-এর দেওয়া URL খুলুন। URL সাধারণত `https://YOUR-USERNAME.github.io/openboard/` ধরনের হবে।

প্রতিটি ব্যবহারকারী একই `config.js`-এর Supabase project ব্যবহার করলে একই পোস্ট দেখতে পাবে।

## সাইটে কী আছে

- বাংলা-ভিত্তিক responsive, mobile-friendly design
- নাম/ছদ্মনাম ঐচ্ছিক; অ্যাকাউন্ট বা login নেই
- পোস্টের সর্বোচ্চ দৈর্ঘ্য ১২০০ অক্ষর
- সর্বশেষ পোস্ট আগে, একবারে সর্বশেষ ১০০টি পোস্ট লোড
- নতুন পোস্টের realtime refresh (Supabase Realtime চালু থাকলে)
- পোস্ট রিপোর্ট করার ব্যবস্থা
- SQL-level validation এবং RLS policies
- GitHub Pages-এ static hosting উপযোগী

## নিরাপত্তা ও সীমাবদ্ধতা

এটি একটি starter project, বড় বা অপব্যবহার-ঝুঁকিপূর্ণ public social network-এর সম্পূর্ণ production moderation ব্যবস্থা নয়।

- অ্যাকাউন্টবিহীন পোস্টিংয়ে spam, harassment ও বেআইনি/ক্ষতিকর কনটেন্ট আসতে পারে। প্রকাশের আগে moderation, rate limiting, CAPTCHA/anti-bot এবং জরুরি রিপোর্ট পর্যালোচনার ব্যবস্থা যোগ করার পরামর্শ দেওয়া হচ্ছে।
- এই সংস্করণে public visitor পোস্ট মুছতে বা edit করতে পারে না। ডেটাবেস owner-কে Supabase Dashboard থেকে moderation করতে হবে; visitor reports `post_reports` টেবিলে জমা হবে।
- বর্তমান public-post policy ইচ্ছাকৃতভাবেই যে কাউকে পোস্ট করতে দেয়। abuse হলে policy বন্ধ/পরিবর্তন করুন।
- Supabase-এর free-tier quotas ও নীতিমালা পরিবর্তন হতে পারে; usage dashboard দেখুন।
- কোনো পোস্ট প্রকাশের পর তা সর্বজনীন—ব্যক্তিগত তথ্য পোস্ট করবেন না।
- GitHub Pages ও Supabase আলাদা সেবা; তাদের বর্তমান শর্তাবলি মেনে ব্যবহার করুন।

## সমস্যা হলে

- `config.js`-এর URL/key ঠিক আছে কি না দেখুন।
- SQL Editor-এ `supabase-schema.sql` সফলভাবে Run হয়েছে কি না যাচাই করুন।
- Supabase Table Editor-এ `posts` টেবিল তৈরি হয়েছে কি না দেখুন।
- RLS policies-এ `anon` role-এর SELECT/INSERT অনুমতি আছে কি না দেখুন।
- Realtime কাজ না করলেও রিফ্রেশ বোতামে নতুন পোস্ট লোড হওয়ার কথা।
