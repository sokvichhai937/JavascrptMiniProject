//let token = localStorage.getItem("token") || sessionStorage.getItem("token");
let tableBody = document.getElementById("tbody");
//const BASE_URL = "https://blogs.tt.linkpc.net/api/v1";

fetch(`https://blogs.tt.linkpc.net/api/v1/articles/own?search=&_page=1&_per_page=100&sortBy=createdAt&sortDir=asc`, {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
  .then(res => res.json())
  .then(dataArticle => {
    let allArticles = dataArticle.data.items;
    if (!allArticles || allArticles.length === 0) {
      tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5">
                    <h5 class="m-0">No data found</h5>
                </td>
            </tr>
        `;
    }
    allArticles.forEach(allArt => {

      tableBody.innerHTML += `
            <tr>
                <td>${allArt.title}</td>
                <td>${allArt.category?.name || allArt.categoryId}</td>
                <td>${allArt.content}</td>
                <td><img src="${allArt.thumbnail}" alt="" width="100" height="100" class="rounded-3"></td>
                <td>
                    <button class="icon-btn border border-1 border-secondary rounded-5" 
                        onclick="editid(${allArt.id})">
                        <i class="fa-regular fa-pen-to-square text-secondary"></i>
                    </button>
                    <button class="icon-btn border border-1 border-danger rounded-5"
                        onclick="openDeleteModal(${allArt.id})">
                        <i class="fa-solid fa-trash-can text-danger fs-6"></i>
                    </button>
                </td>
            </tr>
        `;

    });
  })


//==============================delete====================================
function openDeleteModal(id) {
  articleIdToDelete = id;
  document.getElementById("deleteConfirmModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("deleteConfirmModal").style.display = "none";
}

function confirmDelete() {
  fetch(`https://blogs.tt.linkpc.net/api/v1/articles/${articleIdToDelete}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  })
    .then(async res => {
      if (res.ok) {
        location.reload();
      } else {
        alert("Failed to delete article");
      }
    })
    .catch(err => alert("Error: " + err.message));

  closeModal();
}

//==============================edit==============================
let tablecard = document.querySelector(".aTable-card");
let tablehead = document.querySelector(".aTable-head");
let formTitle = document.getElementById("formTitle");
let submitBtn = document.getElementById("submitBtn");
let articleForm = document.getElementById("articleForm");
let titleInput = document.getElementById("title");
let categorySelect = document.getElementById("categorySelect");
let contentInput = document.getElementById("content");

let articleId = null; 

function loadCategories() {
  fetch("https://blogs.tt.linkpc.net/api/v1/categories", {
    headers: { "Authorization": "Bearer " + token }
  })
    .then(res => res.json())
    .then(data => {
      const items = data.data.items;
      categorySelect.innerHTML = `<option value="">Select category</option>`;
      items.forEach(cat => {
        categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
      });
    })
    .catch(err => console.error("Category fetch error:", err));
}

//===========================Edit article==============================
let aTableFoot = document.querySelector(".aTable-foot");
function editid(id) {
  articleId = id;
  articleForm.classList.remove("d-none");
  tablecard.innerHTML = "";
  tablehead.innerHTML = "";
  formTitle.innerText = "Edit Article";
  submitBtn.innerHTML = `<i class="bi bi-save me-2"></i> Update Article`;  fetch(`https://blogs.tt.linkpc.net/api/v1/articles/${articleId}`, {
    headers: { "Authorization": "Bearer " + token }
  })
    .then(res => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(data => {
  const article = data.data || data;

  titleInput.value = article.title || "";
  contentInput.value = article.content || "";
  categorySelect.value = article.categoryId || "";
  aTableFoot.style.display = "none"; // លាក់ footer ពេល Edit

  // ⭐ show thumbnail when click Edit
  const preview = document.getElementById("thumbPreview");

  if (article.thumbnail) {
    preview.innerHTML = `
      <img src="${article.thumbnail}" alt="Thumbnail"
           style="max-height:100px; border-radius:12px;">
    `;
  } else {
    preview.innerHTML = `<p>No thumbnail available</p>`;
  }
})
    .catch(err => console.error("Fetch error:", err));
}

// ========================Show current thumbnail=========================
async function loadThumbnail(articleId) {
  try {
    const res = await fetch(`https://blogs.tt.linkpc.net/api/v1/articles/${articleId}/thumbnail`, {
      method: "GET",
      headers: { "Authorization": "Bearer " + token }
    });

    if (!res.ok) {
      document.getElementById("thumbPreview").innerHTML = `<p>No thumbnail available</p>`;
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    document.getElementById("thumbPreview").innerHTML =
      `<img src="${url}" alt="Thumbnail" style="max-height:100px;">`;
  } catch (err) {
    console.error("Thumbnail fetch error:", err);
  }
}

// =============================Handle form submit======================
articleForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  let url = "https://blogs.tt.linkpc.net/api/v1/articles";
  let method = "POST";

  if (articleId) {
    url = `https://blogs.tt.linkpc.net/api/v1/articles/${articleId}`;
    method = "PUT";
  }

  const edit = {
    title: titleInput.value.trim(),
    content: contentInput.value.trim(),
    categoryId: parseInt(categorySelect.value)
  };

  try {
    // =====================update text fields==============================
    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(edit)
    });

    if (!res.ok) throw new Error("Article update failed: " + res.status);
    await res.json();

    // ===================upload thumbnail if selected =============
    const fileInput = document.getElementById("thumbnail");
    if (fileInput.files.length > 0 && articleId) {
      const formData = new FormData();
      formData.append("thumbnail", fileInput.files[0]);

      const thumbRes = await fetch(
        `https://blogs.tt.linkpc.net/api/v1/articles/${articleId}/thumbnail`,
        {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + token
          },
          body: formData
        }
      );

      if (!thumbRes.ok) throw new Error("Thumbnail upload failed: " + thumbRes.status);
      await thumbRes.json();
    }

    //======================redirect===========================
    window.location.href = "../pages/all-article.html";
  } catch (err) {
    alert("Update failed: " + err.message);
  }
});

loadCategories();

// =======================Preview thumbnail before upload===============
document.getElementById("thumbnail").addEventListener("change", function () {
  const preview = document.getElementById("thumbPreview");
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Thumbnail" style="max-height:100px;">`;
    };
    reader.readAsDataURL(file);
  }
});

let btnBackToArticles = document.getElementById("btnBackToArticles");
btnBackToArticles.addEventListener("click", () => {
  window.location.href = "../pages/all-article.html";
});