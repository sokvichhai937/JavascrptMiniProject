// --------------------------------------------------------
// ផ្នែកទី ១: Configuration
// - កំណត់ API URL, Token, និង Headers សម្រាប់ Request ទៅ Server
// --------------------------------------------------------
const API_BASE_URL = 'https://blogs.tt.linkpc.net/api/v1';
const Token = localStorage.getItem("token");
const headers = {
    'Authorization': `Bearer ${Token}`,
    'Accept': 'application/json'
};


// --------------------------------------------------------
// ផ្នែកទី ២: ចាប់យក DOM Elements ទុកជា Global Variables
// - ដើម្បីឱ្យ Functions ផ្សេងៗប្រើបានភ្លាម មិនចាំបាច់ getElementById ម្តងទៀត
// --------------------------------------------------------
const avatarImg = document.getElementById("avatarImg");
const avatarInput = document.getElementById("avatarInput");
const displayName = document.getElementById("displayName");   // TopBar Name
const displayEmail = document.getElementById("displayEmail"); // TopBar Email
const profileForm = document.getElementById("profileForm");


// --------------------------------------------------------
// ផ្នែកទី ៣: Function updateUI(user)
// - ទទួល Object "user" រួចបង្ហាញ ឈ្មោះ, Email លើ TopBar
// - បំពេញតម្លៃចូល Input Fields នៅក្នុង Form
// - បង្ហាញ Avatar បើ user.avatar មាន
// --------------------------------------------------------
function updateUI(user) {
    // ប្តូរនៅ TopBar
    if (displayName) displayName.textContent = `${user.firstName} ${user.lastName}`;
    if (displayEmail) displayEmail.textContent = user.email;

    // បំពេញក្នុង Form
    if (document.getElementById('firstName')) document.getElementById('firstName').value = user.firstName;
    if (document.getElementById('lastName')) document.getElementById('lastName').value = user.lastName;
    if (document.getElementById('email')) document.getElementById('email').value = user.email;

    // បង្ហាញរូបភាព
    if (user.avatar && avatarImg) avatarImg.src = user.avatar;
}


// --------------------------------------------------------
// ផ្នែកទី ៤: DOMContentLoaded Event
// - ក្បួនទី១: Load Cache ពី LocalStorage បង្ហាញភ្លាមៗ (0ms)
//   ដើម្បីជៀសវាង UI ទទេ ពេលរង់ចាំ Server
// - ក្បួនទី២: Fetch Profile ថ្មីពី Server នៅខាងក្រោយ (Background Sync)
// --------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
    const cachedUser = localStorage.getItem("user_profile");
    if (cachedUser) {
        updateUI(JSON.parse(cachedUser));
    }
    fetchProfile();
});


// --------------------------------------------------------
// ផ្នែកទី ៥: Function fetchProfile()
// - ហៅ API ទៅ Server ដើម្បីទាញ Profile ថ្មីបំផុត
// - បើ Server ឆ្លើយតប OK: Update UI និង Cache ក្នុង LocalStorage
// - បើ Request បរាជ័យ: បង្ហាញ Error ក្នុង Console
// --------------------------------------------------------
async function fetchProfile() {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, { method: 'GET', headers: headers });
        const result = await res.json();
        if (res.ok && result.data) {
            updateUI(result.data);
            localStorage.setItem("user_profile", JSON.stringify(result.data));
        }
    } catch (err) { console.error("Fetch Error:", err); }
}


// --------------------------------------------------------
// ផ្នែកទី ៦: Avatar Upload
// - ពេលអ្នកប្រើជ្រើសរូបភាព: Preview រូបភ្លាមៗ (Optimistic Update)
//   ដោយប្រើ FileReader អានរូបពី Device មុន Upload
// - Upload រូបភាពទៅ Server
// - បើ Upload បរាជ័យ: Fetch Profile ដើម្បីបង្ហាញ Avatar ចាស់វិញ
// --------------------------------------------------------
avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files[0];
    if (!file) return;

    // OPTIMISTIC UPDATE: បង្ហាញរូបថ្មីភ្លាម មិនចាំ Server
    const reader = new FileReader();
    reader.onload = (e) => {
        if (avatarImg) avatarImg.src = e.target.result;
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("avatar", file);    try {
        const res = await fetch(`${API_BASE_URL}/profile/avatar`, {
            method: "POST",
            headers: { 'Authorization': `Bearer ${Token}` },
            body: formData
        });
        if (!res.ok) throw new Error();
        Swal.fire({ icon: 'success', title: 'Updated!', timer: 800, showConfirmButton: false });
    } catch (err) {
        fetchProfile(); // បើ Error ឱ្យវាបង្ហាញរូបចាស់វិញ
    }
});


// --------------------------------------------------------
// ផ្នែកទី ៧: Profile Form Submit
// - ប្រមូល Input ពី Form រួច Update TopBar ភ្លាមៗ (Optimistic Update)
// - បិទ Edit Mode ភ្លាម រួចផ្ញើ Request កែប្រែ Profile ទៅ Server
// - បើ Server យល់ព្រម: រក្សា Profile ថ្មីក្នុង LocalStorage
// - បើ Server បដិសេធ: បង្ហាញ Error និង Rollback ទៅទិន្នន័យដើមវិញ
// --------------------------------------------------------
profileForm.onsubmit = async (e) => {
    e.preventDefault();

    // ប្រមូលទិន្នន័យថ្មីពី Input Fields
    const newUser = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        avatar: avatarImg.src // រក្សារូបដដែល
    };

    // >>> ជំហានសំខាន់: UPDATE TOPBAR ភ្លាមៗតែម្តង <
    updateUI(newUser);
    btnedit(); // បិទ Mode Edit ភ្លាម

    try {
        const res = await fetch(`${API_BASE_URL}/profile`, {
            method: "PUT",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email
            })
        });

        if (res.ok) {
            localStorage.setItem("user_profile", JSON.stringify(newUser));
            Swal.fire({ icon: 'success', title: 'រក្សាទុកជោគជ័យ', timer: 600, showConfirmButton: false });
        } else {
            throw new Error();
        }
    } catch (err) {
        Swal.fire('Error', 'Update បរាជ័យ', 'error');
        fetchProfile(); // Rollback ទៅទិន្នន័យដើមវិញបើ API Error
    }
};


// --------------------------------------------------------
// ផ្នែកទី ៨: UI Helper Functions
// --------------------------------------------------------

// btnedit(): Toggle បើក/បិទ Edit Mode
// - បើ Edit Mode បើក: Enable Inputs, បង្ហាញ Save/Cancel Buttons, លាក់ Edit Button
// - បើ Edit Mode បិទ: Disable Inputs, លាក់ Save/Cancel Buttons, បង្ហាញ Edit Button
window.btnedit = function() {
    const inputs = document.querySelectorAll(".field-input");  // ← ប្ដូរពី .formP
    const saveRow = document.getElementById("saveRow");
    const btnEdit = document.getElementById("btnEdit");

    const isEditing = (saveRow.style.display === "none" || saveRow.style.display === "");

    if (isEditing) {
        saveRow.style.display = "flex";
        btnEdit.style.display = "none";
        inputs.forEach(input => { input.disabled = false; input.classList.add("is-edit"); });
    } else {
        saveRow.style.display = "none";
        btnEdit.style.display = "inline-block";
        inputs.forEach(input => { input.disabled = true; input.classList.remove("is-edit"); });
    }
};

// btnCancel: ចុច Cancel ដើម្បីបិទ Edit Mode ដោយមិនរក្សាទុក
document.getElementById("btnCancel").onclick = () => btnedit();

// btnDelAvatar: ចុចដើម្បីលុប Avatar
// - បង្ហាញ Confirm Dialog មុនលុប
// - បើ Confirm: ផ្ញើ DELETE Request ទៅ Server រួច Fetch Profile វិញ
// - បើ Request បរាជ័យ: បង្ហាញ Error ក្នុង Console
document.getElementById("btnDelAvatar").onclick = async () => {
    if ((await Swal.fire({ title: 'លុបរូប?', icon: 'warning', showCancelButton: true })).isConfirmed) {
        try {
            const res = await fetch(`${API_BASE_URL}/profile/avatar`, { method: "DELETE", headers: headers });
            if (res.ok) {
                fetchProfile();
                Swal.fire('Deleted!', '', 'success');
            }
        } catch (err) { console.error(err); }
    }
};