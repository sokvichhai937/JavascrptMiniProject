// Register
async function register() {
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const btn = document.getElementById("register-btn");
    const BASE_URL = "https://blogs.tt.linkpc.net/api/v1";

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        Swal.fire({ icon: "warning", title: "សូមបំពេញព័ត៌មានឱ្យអស់" });
        return;
    }

    if (password !== confirmPassword) {
        Swal.fire({ icon: "warning", title: "Password មិនដូចគ្នា" });
        return;
    }

    btn.disabled = true;
    const oldText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

    try {
        // 1️⃣ Register
        const registerRes = await fetch(
            `${BASE_URL}/auth/register`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                    confirmPassword,
                }),
            }
        );

        const registerData = await registerRes.json();

        if (!registerRes.ok) {
            throw new Error(registerData.message || "Register Failed");
        }

        // 2️⃣ Auto Login បន្ទាប់ពី Register
        const loginRes = await fetch(
            `${BASE_URL}/auth/login`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            }
        );

        const loginData = await loginRes.json();

        if (!loginRes.ok) {
            throw new Error(loginData.message || "Auto Login Failed");
        }

        const token = loginData?.data?.token;

        if (!token) {
            throw new Error("Token មិនបានទទួលពី Server");
        }

        // Save Token
        localStorage.setItem("token", token);

        await Swal.fire({
            icon: "success",
            title: "ចុះឈ្មោះជោគជ័យ 🎉",
            text: "កំពុងចូលទៅ Dashboard...",
            timer: 1500,
            showConfirmButton: false
        });

        window.location.href = "../pages/dashboard.html";

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message
        });
    } finally {
        btn.disabled = false;
        btn.innerHTML = oldText;
    }
}
/// ================== End function register ==============================