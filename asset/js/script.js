let token = localStorage.getItem("token");
// ============ Get Profile ========================================
  const BASE_URL = "https://blogs.tt.linkpc.net/api/v1";
function getProfile(){
       fetch(`${BASE_URL}/auth/profile`,{
        method : 'GET',
        headers : {
          'Content-Type' : 'application/json',
          'Authorization' : `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
       // console.log(data);
        document.getElementById('avatarUser').src = data.data.avatar;
        document.getElementById('profileUser').textContent = data.data.firstName + " " + data.data.lastName;
      })
      .catch(err => {
        console.log(err);
      })
    }
    getProfile();


// ===================== LOGOUT MODAL (COMBINED) =====================
document.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("logoutModal");
  const confirmBtn = document.getElementById("confirmLogout");
  const customBackdrop = document.getElementById("backdrop"); // sidebar/backdrop of your UI

  // create modal instance once (avoid stacking backdrops)
  const logoutModal = modalEl ? new bootstrap.Modal(modalEl) : null;

  // open modal when click logout trigger (sidebar + dropdown)
  document.querySelectorAll(".logout-trigger").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      // if your custom backdrop is open, close it before showing modal
      if (customBackdrop) {
        customBackdrop.classList.remove("show", "active", "open");
        customBackdrop.style.display = "none";
      }

      logoutModal?.show();
    });
  });

  // confirm logout
  confirmBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    // close modal first
    logoutModal?.hide();

    // remove token
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    // redirect to login/index
    setTimeout(() => {
      window.location.href = "../index.html"; // <-- change path if needed
    }, 150);
  });

  // when modal is closed (Cancel / ESC / click outside) -> cleanup backdrops + body state
  modalEl?.addEventListener("hidden.bs.modal", () => {
    // remove any leftover bootstrap backdrops
    document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());

    // restore body scroll
    document.body.classList.remove("modal-open");
    document.body.style.removeProperty("padding-right");

    // also close custom backdrop if any
    if (customBackdrop) {
      customBackdrop.classList.remove("show", "active", "open");
      customBackdrop.style.display = "none";
    }
  });
});


///======= End of Logout Modal =====================


