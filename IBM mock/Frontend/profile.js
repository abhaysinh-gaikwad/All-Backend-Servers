const editbtn = document.getElementById("editButton");
const backbtn = document.getElementById("backbtn");
const editter = document.getElementById("editte");
const detail = document.getElementById("detail");
const nameInput = document.getElementById("nameInput");
const bioInput = document.getElementById("bio");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const saveButton = document.getElementById("saveButton");
const logoutButton = document.getElementById("logoutButton");

editbtn.addEventListener("click", () => {
    editter.classList.toggle("hid");
    detail.classList.toggle("hid");
    fetchUsersData();
});

backbtn.addEventListener("click", () => {
    editter.classList.toggle("hid");
    detail.classList.toggle("hid");
});

async function fetchUsersData() {
    try {
        const response = await fetch("http://localhost:8080/details", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
        });
        const data = await response.json();
        if (response.ok) {
            const user = data.user;
            nameInput.value = user.name;
            bioInput.value = user.bio;
            phoneInput.value = user.phone;
            emailInput.value = user.email;
        } else {
            console.error(data.error);
        }
    } catch (error) {
        console.error(error);
    }
}

saveButton.addEventListener("click", async () => {
    try {
        const userData = {
            name: nameInput.value,
            bio: bioInput.value,
            phone: phoneInput.value,
            email: emailInput.value,
            password: passwordInput.value,
        };

        const response = await fetch("http://localhost:8080/edit", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (response.ok) {
            console.log(data.message);
            // Redirect to profile page after successful save
            window.location.href = "./profile.html"; // Replace with the actual profile page URL
        } else {
            console.error(data.error);
        }
    } catch (error) {
        console.error(error);
    }
});



logoutButton.addEventListener("click", async () => {
    try {
        const response = await fetch("http://localhost:8080/logout", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to logout user");
        }

        localStorage.removeItem("token");
        window.location.href = "./index.html";
    } catch (error) {
        console.error(error);
    }
});


const nameElement = document.getElementById("name");
const bioElement = document.getElementById("bio");
const phoneElement = document.getElementById("phone");
const emailElement = document.getElementById("email");
const passwordElement = document.getElementById("password");

window.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("http://localhost:8080/details", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
        });
        const data = await response.json();
        if (response.ok) {
            const user = data.user;
            nameElement.textContent = user.name;
            bioElement.textContent = user.bio;
            phoneElement.textContent = user.phone;
            emailElement.textContent = user.email;
            passwordElement.textContent = "*".repeat(8); // Show placeholder for password
        } else {
            console.error(data.error);
        }
    } catch (error) {
        console.error(error);
    }
});

// Disable the save button to prevent editing
// const saveButton = document.getElementById("saveButton");
saveButton.disabled = true;