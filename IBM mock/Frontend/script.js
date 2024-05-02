const transferLogin = document.getElementById("transferLogin");
const transferSignup = document.getElementById("transferSignup");
const signupbox = document.getElementById("signupbox");
const loginbox = document.getElementById("loginbox");
const RegisterEmail = document.getElementById("RegisterEmail");
const RegisterPassword = document.getElementById("RegisterPassword");
const registerButton = document.getElementById("registerButton");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginButton = document.getElementById("loginButton");
const google = document.getElementById("google");

transferLogin.addEventListener("click", () => {
  loginbox.classList.toggle("hid");
  signupbox.classList.toggle("hid");
});
transferSignup.addEventListener("click", () => {
  loginbox.classList.toggle("hid");
  signupbox.classList.toggle("hid");
});

const registerUser = async () => {
  try {
    const email = RegisterEmail.value;
    const password = RegisterPassword.value;

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    };

    const response = await fetch(
      "http://localhost:8080/register",
      requestOptions
    );
    if (!response.ok) {
      throw new Error("Failed to register user");
    }

    const data = await response.json();
    console.log(data); // Log the response data
  } catch (error) {
    console.error(error);
  }
};

registerButton.addEventListener("click", () => {
  registerUser();
});

const loginUser = async () => {
  try {
    const email = loginEmail.value;
    const password = loginPassword.value;

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    };

    const response = await fetch("http://localhost:8080/login", requestOptions);
    if (!response.ok) {
      throw new Error("Failed to login user");
    }

    const data = await response.json();
    const token = data.token; 
    localStorage.setItem('token', token);
    console.log("Token set in local storage:", token); // Log the token

    // Redirect to profile.html after the token is set in local storage
    redirectToProfilePage();
  } catch (error) {
    console.error("Error while logging in:", error);
  }
};

const redirectToProfilePage = () => {
  // Redirect to profile.html after 2 seconds (2000 milliseconds)
  setTimeout(() => {
    window.location.href = "profile.html";
  }, 6000); // Change the delay time as needed
};

loginButton.addEventListener("click", () => {
  loginUser();
});

google.addEventListener("click", function () {
  // Redirect to Google OAuth login endpoint
  window.location.href = "http://localhost:8080/auth/google";
});
