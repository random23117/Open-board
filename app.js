(() => {
  const config = window.OPENBOARD_CONFIG || {};
  const configured = config.SUPABASE_URL &&
    config.SUPABASE_ANON_KEY &&
    !config.SUPABASE_URL.includes("YOUR_") &&
    !config.SUPABASE_ANON_KEY.includes("YOUR_");
  const client = configured && window.supabase
    ? window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY)
    : null;

  const form = document.querySelector("#post-form");
  const nickname = document.querySelector("#nickname");
  const content = document.querySelector("#post-content");
  const submit = document.querySelector("#submit-button");
  const status = document.querySelector("#form-status");
  const connection = document.querySelector("#connection-message");
  const feed = document.querySelector("#post-feed");
  const empty = document.querySelector("#empty-state");
  const total = document.querySelector("#post-total");
  const count = document.querySelector("#char-count");
  const refresh = document.querySelector("#refresh-button");
  const template = document.querySelector("#post-template");

  const bnDigits = n => String(n).replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);
  const say = (message, kind = "") => {
    status.textContent = message;
    status.className = `status ${kind}`;
  };
  const niceDate = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "এইমাত্র";
    return new Intl.DateTimeFormat("bn-BD", {
      dateStyle: "medium", timeStyle: "short"
    }).format(date);
  };

  content.addEventListener("input", () => {
    count.textContent = `${bnDigits(content.value.length)} / ১২০০`;
  });

  function showSetupMessage() {
    connection.className = "notice warning";
    connection.textContent = "সাইটটি চালু করতে এখনো Supabase সেটআপ করা হয়নি। ZIP-এর README.md অনুসরণ করে config.js ও database তৈরি করুন।";
  }

  function renderPosts(posts) {
    feed.replaceChildren();
    total.textContent = `${bnDigits(posts.length)}টি পোস্ট`;
    empty.hidden = posts.length !== 0;
    posts.forEach(post => {
      const node = template.content.firstElementChild.cloneNode(true);
      const author = (post.nickname || "").trim() || "অজ্ঞাত ব্যবহারকারী";
      node.querySelector(".post-author").textContent = author;
      node.querySelector(".post-time").textContent = niceDate(post.created_at);
      node.querySelector(".post-time").dateTime = post.created_at;
      node.querySelector(".post-body").textContent = post.content;
      node.querySelector(".avatar").textContent = [...author][0]?.toUpperCase() || "?";
      node.querySelector(".post-id").textContent = `পোস্ট #${String(post.id).slice(0, 8)}`;
      node.querySelector(".report-button").addEventListener("click", async () => {
        const reason = window.prompt("কেন এই পোস্টটি রিপোর্ট করছেন? (ঐচ্ছিক)");
        if (reason === null) return;
        if (!client) return;
        const { error } = await client.from("post_reports").insert({
          post_id: post.id,
          reason: reason.trim().slice(0, 300) || "কারণ উল্লেখ করা হয়নি"
        });
        if (error) {
          window.alert("রিপোর্ট পাঠানো যায়নি। পরে আবার চেষ্টা করুন।");
        } else {
          window.alert("রিপোর্ট পাঠানো হয়েছে। ধন্যবাদ।");
        }
      });
      feed.appendChild(node);
    });
  }

  async function loadPosts() {
    if (!client) { showSetupMessage(); return; }
    connection.hidden = false;
    connection.className = "notice";
    connection.textContent = "পোস্ট লোড হচ্ছে…";
    refresh.disabled = true;
    const { data, error } = await client.from("posts")
      .select("id, nickname, content, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    refresh.disabled = false;
    if (error) {
      connection.className = "notice error";
      connection.textContent = "পোস্ট লোড করা যায়নি। Supabase-এর URL/key, SQL ও RLS policy ঠিক আছে কি না README দেখে যাচাই করুন।";
      return;
    }
    connection.hidden = true;
    renderPosts(data || []);
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const text = content.value.trim();
    const name = nickname.value.trim();
    if (!text) { say("পোস্টের লেখা দিন।", "error"); return; }
    if (text.length > 1200 || name.length > 40) {
      say("নামের সর্বোচ্চ ৪০ এবং পোস্টের সর্বোচ্চ ১২০০ অক্ষর হতে পারে।", "error");
      return;
    }
    if (!client) { say("পোস্ট প্রকাশের আগে README অনুযায়ী Supabase সেটআপ করুন।", "error"); return; }
    submit.disabled = true;
    submit.querySelector("span").textContent = "প্রকাশ হচ্ছে…";
    say("");
    const { error } = await client.from("posts").insert({
      nickname: name || null,
      content: text
    });
    submit.disabled = false;
    submit.querySelector("span").textContent = "পোস্ট প্রকাশ করুন";
    if (error) {
      say("পোস্ট প্রকাশ করা যায়নি। ইন্টারনেট বা Supabase-এর database policy যাচাই করুন।", "error");
      return;
    }
    content.value = "";
    nickname.value = "";
    count.textContent = "০ / ১২০০";
    say("পোস্ট প্রকাশিত হয়েছে—ধন্যবাদ!", "success");
    await loadPosts();
  });

  refresh.addEventListener("click", loadPosts);

  if (client) {
    loadPosts();
    // নতুন পোস্ট এলে অন্য দর্শকদের ফিডও স্বয়ংক্রিয়ভাবে আপডেট হয়।
    client.channel("public-post-feed")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "posts"
      }, loadPosts)
      .subscribe();
  } else {
    showSetupMessage();
  }
})();
