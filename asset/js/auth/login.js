/// get token
    // const token = localStorage.getItem("token");
    const BASE_URL = "https://blogs.tt.linkpc.net/api/v1";

  // 1) ការពារកុំឱ្យចូលមកទំព័រ Login បើមាន token រួច
  // (បន្ថែម trim ដើម្បីកុំឱ្យ token = "undefined" ឬ "")
  if (token && token !== "undefined" && token.trim() !== "") {
    window.location.href = "pages/dashboard.html";
  }

  // 2) មុខងារបិទ/បើកមើលលេខកូដ
  function togglePassword() {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.getElementById("toggleIcon");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.classList.replace("bi-eye-slash", "bi-eye");
    } else {
      passwordInput.type = "password";
      toggleIcon.classList.replace("bi-eye", "bi-eye-slash");
    }
  }

  // 3) មុខងារ Login
  async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const loginBtn = document.getElementById("login-btn");

    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "សូមបំពេញព័ត៌មាន",
        text: "សូមបញ្ចូលអ៊ីមែល និងលេខកូដសម្ងាត់របស់អ្នក!",
        confirmButtonColor: "#198754",
      });
      return;
    }

    const originalText = loginBtn.innerText;
    loginBtn.disabled = true;
    loginBtn.innerHTML =
      `<span class="spinner-border spinner-border-sm" role="status"></span> កំពុងផ្ទៀងផ្ទាត់...`;

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "អ៊ីមែល ឬលេខកូដសម្ងាត់មិនត្រឹមត្រូវ!");
      }

      const accessToken = data?.data?.token;

      if (!accessToken) {
        throw new Error("Server មិនបានផ្តល់ Token មកវិញ!");
      }

      localStorage.setItem("token", accessToken);

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });

      await Toast.fire({ icon: "success", title: "ចូលប្រើប្រាស់ជោគជ័យ" });

      window.location.href = "pages/dashboard.html";
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "បរាជ័យ",
        text: error.message,
        confirmButtonColor: "#d33",
      });
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = originalText;
    }
  }
