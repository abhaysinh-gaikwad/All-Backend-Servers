function toggleSignup() {
  document.getElementById("login-toggle").style.backgroundColor = "#fff";
  document.getElementById("login-toggle").style.color = "#222";
  document.getElementById("signup-toggle").style.backgroundColor = "#57b846";
  document.getElementById("signup-toggle").style.color = "#fff";
  document.getElementById("login-form").style.display = "none";
  document.getElementById("signup-form").style.display = "block";
}

function toggleLogin() {
  document.getElementById("login-toggle").style.backgroundColor = "#57B846";
  document.getElementById("login-toggle").style.color = "#fff";
  document.getElementById("signup-toggle").style.backgroundColor = "#fff";
  document.getElementById("signup-toggle").style.color = "#222";
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
}

const emailLogin = document.getElementById("email-login");
const passwordLogin = document.getElementById("password-login");
const loginBtn = document.getElementById("login-btn");

const emailSignup = document.getElementById("email-signup");
const passwordSignup = document.getElementById("password-signup");
const repasswordSignup = document.getElementById("repassword-signup");
const signupBtn = document.getElementById("signup-btn");

async function signup() {
  try {
    const pass = passwordSignup.value;
    const repass = repasswordSignup.value;
    if (pass !== repass) {
      const toast = document.getElementById("toast");
      toast.classList.remove("hide");
      toast.innerText = "confirm password  does not match";
      toast.style.background = "red";
      return;
    }
    const response = await fetch(
      "https://all-backend-servers.onrender.com/users/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailSignup.value,
          password: passwordSignup.value,
          confirmPassword: repasswordSignup.value,
        }),
      }
    );
    const data = await response.json();
    console.log(data);
    if (response.ok) {
      const toast = document.getElementById("toast");
      toast.classList.remove("hide");
      if(data.msg=='user created'){
        toast.innerText = 'Successfully signed up kindly login';
      }else {
        toast.innerText = data.msg;
      }
      setTimeout(() => {
        toast.classList.add("hide");
        toggleLogin();
      }, 2000);
    }

    
  } catch (err) {
    console.log(err);
  }
}

function extractName(email) {
  const cleanedEmail = email.replace(/\d/g, '');
  const atIndex = cleanedEmail.indexOf("@");
  const userName = cleanedEmail.substring(0, atIndex);
  const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase();
  return formattedName;
}

async function login() {
  try {
    const response = await fetch("https://all-backend-servers.onrender.com/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailLogin.value,
        password: passwordLogin.value,
      }),
    });

    const userName = extractName(emailLogin.value);
    console.log(userName);
    localStorage.setItem("userName", userName);

    
    const data = await response.json();

    const token = data.token;
    
    localStorage.setItem("token", token);
    setTimeout(() => {
      window.location.href = "empDashbord.html";
    }, 1000);
    console.log(data);
  } catch (err) {
    console.log(err);
  }
}

signupBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (
    emailSignup.value === "" ||
    passwordSignup.value === "" ||
    repasswordSignup.value === ""
  ) {
    alert("Please fill all details");
  } else {
    signup();
  }
});
loginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (emailLogin.value === "" || passwordLogin.value === "") {
    alert("Please fill all details");
  } else {
    login();
  }
});
