
    // Sidebar toggle: Desktop collapse + Mobile drawer
    const sidebar = document.getElementById("sidebar");
    const btnToggle = document.getElementById("btnToggleSidebar");
    const backdrop = document.getElementById("backdrop");

    const mq = window.matchMedia("(max-width: 992px)");
    const isMobile = () => mq.matches;

    function openMobileSidebar(){
      sidebar.classList.add("is-open");
      backdrop.classList.add("show");
      document.body.style.overflow = "hidden";
    }
    function closeMobileSidebar(){
      sidebar.classList.remove("is-open");
      backdrop.classList.remove("show");
      document.body.style.overflow = "";
    }
    function toggleDesktopSidebar(){
      sidebar.classList.toggle("is-collapsed");
    }

    btnToggle.addEventListener("click", () => {
      if (isMobile()) {
        sidebar.classList.contains("is-open") ? closeMobileSidebar() : openMobileSidebar();
      } else {
        toggleDesktopSidebar();
      }
    });

    backdrop.addEventListener("click", closeMobileSidebar);
    mq.addEventListener("change", closeMobileSidebar);

    // Caret rotate for collapse menu
    const articlesBtn = document.querySelector('[data-bs-target="#articlesMenu"]');
    const articlesMenu = document.getElementById("articlesMenu");
    if (articlesBtn && articlesMenu) {
      const caret = articlesBtn.querySelector(".bi-chevron-down");
      articlesMenu.addEventListener("shown.bs.collapse", () => caret?.classList.add("rotate-180"));
      articlesMenu.addEventListener("hidden.bs.collapse", () => caret?.classList.remove("rotate-180"));
      if (articlesMenu.classList.contains("show")) caret?.classList.add("rotate-180");
    }

    // Logout modal (Logout / Cancel)
    const logoutBtns = document.querySelectorAll(".logout-trigger");
    const logoutModalEl = document.getElementById("logoutModal");
    const logoutModal = logoutModalEl ? new bootstrap.Modal(logoutModalEl) : null;

    logoutBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        logoutModal?.show();
      });
    });

    document.getElementById("confirmLogout")?.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.href = "../index.html";
    });

 

    




