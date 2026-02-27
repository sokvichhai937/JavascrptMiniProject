// ===================== GLOBALS =====================
    // ✅ MUST exist (your script.js may already set it, but keep safe here)
   // let BASE_URL = "https://blogs.tt.linkpc.net/api/v1";
   // let token = localStorage.getItem("token") || sessionStorage.getItem("token");

    const tableBody = document.getElementById("tbody");
    const tableCard = document.querySelector(".aTable-card");
    const tableHead = document.querySelector(".aTable-head");
    const tableFoot = document.querySelector(".aTable-foot");

    const articleForm = document.getElementById("articleForm");
    const submitBtn = document.getElementById("submitBtn");

    const titleInput = document.getElementById("title");
    const categorySelect = document.getElementById("categorySelect");
    const contentInput = document.getElementById("content");
    const thumbPreview = document.getElementById("thumbPreview");
    const thumbnailInput = document.getElementById("thumbnail");

    let articleId = null;
    let articleIdToDelete = null;
    let isUpdating = false; // ✅ prevent double click / double submit

    // ===================== HELPERS =====================
    function authHeaders(extra = {}) {
      return { Authorization: "Bearer " + token, ...extra };
    }

    function escapeHTML(str = "") {
      return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function shortText(str = "", max = 120) {
      const s = String(str);
      return s.length > max ? s.slice(0, max) + "..." : s;
    }

    function isAllowedImage(file) {
      // ✅ server likely supports these only
      const okTypes = ["image/jpeg", "image/png", "image/webp"];
      return okTypes.includes(file.type);
    }

    function showDeleteModal() {
      document.getElementById("deleteConfirmModal").style.display = "flex";
    }

    function hideDeleteModal() {
      document.getElementById("deleteConfirmModal").style.display = "none";
    }

    function showForm() {
      articleForm.classList.remove("d-none");
      tableCard.classList.add("d-none");
      tableHead.classList.add("d-none");
      if (tableFoot) tableFoot.classList.add("d-none");
    }

    function showTable() {
      articleForm.classList.add("d-none");
      tableCard.classList.remove("d-none");
      tableHead.classList.remove("d-none");
      if (tableFoot) tableFoot.classList.remove("d-none");
    }

    // ===================== THUMB IN TABLE (FIX 404 / TOKEN) =====================
    async function setThumbImage(articleId) {
      const img = document.getElementById(`thumb-${articleId}`);
      if (!img) return;

      try {
        const BASE_URL = "https://blogs.tt.linkpc.net/api/v1";
        const res = await fetch(
          `${BASE_URL}/articles/${articleId}/thumbnail`,
          { headers: authHeaders() }
        );

        // no thumbnail
        if (res.status === 404) {
          img.replaceWith(Object.assign(document.createElement("span"), {
            className: "text-muted",
            textContent: "No image"
          }));
          return;
        }

        if (!res.ok) return;

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        img.src = url;
      } catch (e) {
        // ignore
      }
    }

    // ===================== LOAD ARTICLES =====================
    async function loadArticles() {
      try {
        const BASE_URL = "https://blogs.tt.linkpc.net/api/v1";
        const res = await fetch(
          `${BASE_URL}/articles/own?search=&_page=1&_per_page=100&sortBy=createdAt&sortDir=desc`,
          { headers: authHeaders() }
        );

        if (!res.ok) throw new Error("HTTP " + res.status);

        const data = await res.json();
        const items = data?.data?.items || [];

        tableBody.innerHTML = "";

        if (!items.length) {
          tableBody.innerHTML = `
            <tr>
              <td colspan="5" class="text-center py-5">
                <h5 class="m-0">No data found</h5>
              </td>
            </tr>
          `;
          return;
        }

        items.forEach((a) => {
          tableBody.innerHTML += `
            <tr>
              <td>${escapeHTML(a.title || "")}</td>
              <td>${escapeHTML(a.category?.name || String(a.categoryId || ""))}</td>
              <td>${escapeHTML(shortText(a.content || "", 120))}</td>
              <td>
                <img
                  id="thumb-${a.id}"
                  src=""
                  alt=""
                  width="100"
                  height="100"
                  class="rounded-3"
                  style="object-fit:cover; background:#f2f4f8;"
                />
              </td>
              <td>
                <button class="icon-btn border border-1 border-secondary rounded-5"
                  onclick="editArticle(${a.id})">
                  <i class="fa-regular fa-pen-to-square text-secondary"></i>
                </button>

                <button class="icon-btn border border-1 border-danger rounded-5"
                  onclick="openDeleteModal(${a.id})">
                  <i class="fa-solid fa-trash-can text-danger fs-6"></i>
                </button>
              </td>
            </tr>
          `;

          // load thumbnail (with token header)
          setThumbImage(a.id);
        });

      } catch (err) {
        console.error("Load article error:", err);
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center py-5 text-danger">
              Failed to load articles
            </td>
          </tr>
        `;
      }
    }

    // ===================== DELETE =====================
    window.openDeleteModal = function (id) {
      articleIdToDelete = id;
      showDeleteModal();
    };

    window.closeModal = function () {
      hideDeleteModal();
    };

    window.confirmDelete = async function () {
      if (!articleIdToDelete) return;

      try {
        const BASE_URL = "https://blogs.tt.linkpc.net/api/v1";
        const res = await fetch(
          `${BASE_URL}/articles/${articleIdToDelete}`,
          { method: "DELETE", headers: authHeaders({ "Content-Type": "application/json" }) }
        );

        if (!res.ok) {
          alert("Failed to delete article");
          return;
        }

        hideDeleteModal();
        await loadArticles();
      } catch (err) {
        alert("Error: " + err.message);
      } finally {
        articleIdToDelete = null;
      }
    };

    // ===================== LOAD CATEGORIES (FOR EDIT) =====================
    async function loadCategories(selectedId = "") {
      const BASE_URL = "https://blogs.tt.linkpc.net/api/v1";
      const res = await fetch(`${BASE_URL}/categories`, {
        headers: authHeaders()
      });
      const data = await res.json();
      const items = data?.data?.items || [];

      categorySelect.innerHTML = `<option value="">Select category</option>`;
      items.forEach((cat) => {
        categorySelect.innerHTML += `<option value="${cat.id}">${escapeHTML(cat.name)}</option>`;
      });

      if (selectedId) categorySelect.value = String(selectedId);
    }

    // ===================== EDIT =====================
    window.editArticle = async function (id) {
      articleId = id;
      submitBtn.innerHTML = `<i class="bi bi-save me-2"></i> Update Article`;
      showForm();

      // clear file each time open edit
      thumbnailInput.value = "";

      try {
        const BASE_URL = "https://blogs.tt.linkpc.net/api/v1";
        const res = await fetch(`${BASE_URL}/articles/${articleId}`, {
          headers: authHeaders()
        });
        if (!res.ok) throw new Error("HTTP " + res.status);

        const data = await res.json();
        const article = data?.data || data;

        titleInput.value = article?.title || "";
        contentInput.value = article?.content || "";

        await loadCategories(article?.categoryId || "");
        await loadThumbnail(articleId);
      } catch (err) {
        console.error("Fetch error:", err);
        alert("Failed to load article");
        showTable();
      }
    };

    async function loadThumbnail(id) {
      try {
        const BASE_URL = "https://blogs.tt.linkpc.net/api/v1";
        const res = await fetch(`${BASE_URL}/articles/${id}/thumbnail`, {
          headers: authHeaders()
        });

        if (res.status === 404) {
          thumbPreview.innerHTML = `<span class="text-muted">No thumbnail available</span>`;
          return;
        }

        if (!res.ok) {
          thumbPreview.innerHTML = `<span class="text-muted">No thumbnail available</span>`;
          return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        thumbPreview.innerHTML = `<img src="${url}" alt="Thumbnail" style="max-height:100px;">`;
      } catch (err) {
        console.error("Thumbnail fetch error:", err);
      }
    }

    // ===================== UPDATE SUBMIT =====================
    articleForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!articleId) return;

      // ✅ prevent double submit
      if (isUpdating) return;
      isUpdating = true;

      // disable button while updating
      submitBtn.disabled = true;

      const payload = {
        title: titleInput.value.trim(),
        content: contentInput.value.trim(),
        categoryId: Number(categorySelect.value)
      };

      try {
        const BASE_URL = "https://blogs.tt.linkpc.net/api/v1";
        // 1) update text
        const res = await fetch(`${BASE_URL}/articles/${articleId}`, {
          method: "PUT",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(payload)
        });

        const updateBody = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(updateBody?.message || updateBody?.details?.[0] || ("Update failed: " + res.status));
        }

        // 2) upload thumbnail (optional)
        if (thumbnailInput.files.length > 0) {
          const file = thumbnailInput.files[0];

          // ✅ block AVIF and others
          if (!isAllowedImage(file)) {
            throw new Error("Thumbnail must be JPG / PNG / WEBP (AVIF not supported).");
          }

          const formData = new FormData();
          // ✅ keep field name = "thumbnail" as you used
          formData.append("thumbnail", file);

          const thumbRes = await fetch(
            `${BASE_URL}/articles/${articleId}/thumbnail`,
            { method: "POST", headers: authHeaders(), body: formData }
          );

          const thumbBody = await thumbRes.json().catch(() => ({}));
          if (!thumbRes.ok) {
            throw new Error(thumbBody?.message || thumbBody?.details?.[0] || ("Thumbnail upload failed: " + thumbRes.status));
          }
        }

        showTable();
        await loadArticles();
      } catch (err) {
        alert("Update failed: " + err.message);
      } finally {
        isUpdating = false;
        submitBtn.disabled = false;
      }
    });

    // preview before upload (edit form)
    thumbnailInput.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;

      // ✅ prevent invalid file selection
      if (!isAllowedImage(file)) {
        alert("Please choose JPG / PNG / WEBP only (AVIF not supported).");
        this.value = "";
        thumbPreview.innerHTML = `<i class="bi bi-image"></i><span>Preview</span>`;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        thumbPreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-height:100px;">`;
      };
      reader.readAsDataURL(file);
    });

    // back to table
    document.getElementById("btnBackToArticles")?.addEventListener("click", () => {
      articleId = null;
      showTable();
    });
    loadArticles();

    // ===================== End of script for all-article ===========================//



//  ================= Start script of page create-article ============================
  // ===================== ELEMENTS =====================
  const form = document.getElementById("articleForm");
  const titleEl = document.getElementById("title");
  const catEl = document.getElementById("categorySelect");
  const contentEl = document.getElementById("content");

  const errTitle = document.getElementById("titleError");
  const errCat = document.getElementById("categoryError");
  const errContent = document.getElementById("contentError");

  const Token = localStorage.getItem("token") || sessionStorage.getItem("token");

  let isSubmitting = false; // prevent double click submit

  // ===================== VALIDATIONS =====================
  function validateTitle() {
    const v = titleEl.value.trim();
    if (!v) {
      titleEl.classList.add("is-invalid");
      titleEl.classList.remove("is-valid");
      errTitle.innerText = "Title is required!";
      return false;
    }
    titleEl.classList.add("is-valid");
    titleEl.classList.remove("is-invalid");
    errTitle.innerText = "";
    return true;
  }

  function validateCategory() {
    if (!catEl.value) {
      catEl.classList.add("is-invalid");
      catEl.classList.remove("is-valid");
      errCat.innerText = "Please select category!";
      return false;
    }
    catEl.classList.add("is-valid");
    catEl.classList.remove("is-invalid");
    errCat.innerText = "";
    return true;
  }

  function validateContent() {
    const v = contentEl.value.trim();
    if (!v) {
      contentEl.classList.add("is-invalid");
      contentEl.classList.remove("is-valid");
      errContent.innerText = "Content is required!";
      return false;
    }
    contentEl.classList.add("is-valid");
    contentEl.classList.remove("is-invalid");
    errContent.innerText = "";
    return true;
  }

  // ===================== LOAD CATEGORIES =====================
  async function loadCategories() {
    try {
      const res = await fetch(`${BASE_URL}/categories`, {
        headers: { Authorization: "Bearer " + token }
      });

      const data = await res.json();
      const items = data?.data?.items || [];

      catEl.innerHTML = `<option value="">Select category</option>`;
      items.forEach(c => {
        catEl.innerHTML += `<option value="${c.id}">${c.name}</option>`;
      });
    } catch (err) {
      console.error("Category load error:", err);
    }
  }

  // ===================== SUBMIT (CREATE) =====================
  async function onSubmit(e) {
    e.preventDefault();

    if (isSubmitting) return;
    isSubmitting = true;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;

    try {
      const ok1 = validateTitle();
      const ok2 = validateCategory();
      const ok3 = validateContent();
      if (!ok1 || !ok2 || !ok3) return;

      const payload = {
        title: titleEl.value.trim(),
        categoryId: Number(catEl.value),
        content: contentEl.value.trim()
      };

      const res = await fetch(`${BASE_URL}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      console.log("STATUS:", res.status, data);

      if (!res.ok) {
        alert(data?.message || "Create failed");
        return;
      }

      // success -> go to all articles
      window.location.href = "all-article.html";
    } catch (err) {
      console.error(err);
      alert("Create failed: " + err.message);
    } finally {
      btn.disabled = false;
      isSubmitting = false;
    }
  }

  // ===================== EVENTS =====================
  form.addEventListener("submit", onSubmit);

  // live validation
  titleEl.addEventListener("keyup", validateTitle);
  catEl.addEventListener("change", validateCategory);
  contentEl.addEventListener("keyup", validateContent);

  // init
  loadCategories();





    