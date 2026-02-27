// ===== GLOBAL CONFIG =====
window.BASE_URL = "https://blogs.tt.linkpc.net/api/v1";
window.token = localStorage.getItem("token") || sessionStorage.getItem("token");

if (!window.token) {
  alert("Session expired. Please login again.");
  window.location.href = "../../index.html";
}

// helper for headers
window.authHeaders = function (extra = {}) {
  return {
    Authorization: "Bearer " + window.token,
    ...extra
  };
};