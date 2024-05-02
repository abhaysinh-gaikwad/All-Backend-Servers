function toggleSignup(){
    document.getElementById("login-toggle").style.backgroundColor="#fff";
     document.getElementById("login-toggle").style.color="#222";
     document.getElementById("signup-toggle").style.backgroundColor="#57b846";
     document.getElementById("signup-toggle").style.color="#fff";
     document.getElementById("login-form").style.display="none";
     document.getElementById("signup-form").style.display="block";
 }
 
 function toggleLogin(){
     document.getElementById("login-toggle").style.backgroundColor="#57B846";
     document.getElementById("login-toggle").style.color="#fff";
     document.getElementById("signup-toggle").style.backgroundColor="#fff";
     document.getElementById("signup-toggle").style.color="#222";
     document.getElementById("signup-form").style.display="none";
     document.getElementById("login-form").style.display="block";
 }


const emailLogin = document.getElementById("email-login");
const passwordLogin = document.getElementById("password-login");
const loginBtn = document.getElementById("login-btn");

const emailSignup = document.getElementById("email-signup");
const passwordSignup = document.getElementById("password-signup");
const repasswordSignup = document.getElementById("repassword-signup");
const signupBtn = document.getElementById("signup-btn");

async function signup(){
    try{
        const response = await fetch("https://all-backend-servers.onrender.com/users/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: emailSignup.value,
                password: passwordSignup.value,
                confirmPassword: repasswordSignup.value
            })
        })
        const data = await response.json();
        console.log(data);
    }
    catch(err){
        console.log(err);
    }
}

async function login(){
    try{
        const response = await fetch("https://all-backend-servers.onrender.com/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: emailLogin.value,
                password: passwordLogin.value
            })
        })

        const data = await response.json();
        const token = data.token;

        localStorage.setItem("token", token);
        window.location.href = "empDashbord.html";
        console.log(data);
    }
    catch(err){
        console.log(err);
    }
}

signupBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (emailSignup.value === "" || passwordSignup.value === "" || repasswordSignup.value === "") {
        alert("Please fill all details");
    } else {
        signup();
    }
})
loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (emailLogin.value === "" || passwordLogin.value === "") {
        alert("Please fill all details");
    } else {
        login();
    }
})

 