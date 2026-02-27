const form = document.getElementById("articleForm");
const titleEl = document.getElementById("title");
const catEl = document.getElementById("categorySelect");
const contentEl = document.getElementById("content");
const thumbEl = document.getElementById("thumbnail"); // ✅ add input file

const token = localStorage.getItem("token") || sessionStorage.getItem("token");
const BASE_URL = "https://blogs.tt.linkpc.net/api/v1";

let isSubmitting = false;

async function onSubmit(e) {
  e.preventDefault();
  if (isSubmitting) return;
  isSubmitting = true;

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;

  try {
    const payload = {
      title: titleEl.value.trim(),
      categoryId: Number(catEl.value),
      content: contentEl.value.trim(),
    };

    // 1) create article
    const res = await fetch(`${BASE_URL}/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(payload),
    });
//message content Tesxt 100 characters 
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Create failed");

    // ✅ IMPORTANT: get new article id
    const newId = data?.data?.id ?? data?.data?.item?.id ?? data?.id;

    // 2) upload thumbnail (optional)
    if (thumbEl && thumbEl.files && thumbEl.files.length > 0) {
      const file = thumbEl.files[0];

      const fd = new FormData();
      fd.append("thumbnail", file); // ✅ field name should match API

      const up = await fetch(`${BASE_URL}/articles/${newId}/thumbnail`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: fd,
      });

      // server sometimes returns empty body, so don't force json()
      if (!up.ok) {
        const errText = await up.text().catch(() => "");
        throw new Error("Thumbnail upload failed: " + up.status + " " + errText);
      }
    }

    // success
    window.location.href = "all-article.html";
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
    isSubmitting = false;
  }
}

form.addEventListener("submit", onSubmit);