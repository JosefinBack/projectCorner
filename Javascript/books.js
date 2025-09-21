let loginButton = document.getElementById("logInButton");
let loginDiv = document.getElementById("logInDiv");
let closeLoginButton = document.getElementById("closeLogIn");
let loginBtn = document.getElementById("loginBtn");
let loginMessage = document.getElementById("loginMessage");
let userLogIn = document.getElementById("loginUser");
let passwordLogIn = document.getElementById("loginPass");

let logoutBtn = document.getElementById("logoutBtn");
let appDiv = document.getElementById("app");

let regDiv = document.getElementById("registration");
let registerButton = document.getElementById("register");
let createButton = document.getElementById("newUser");
let closeRegButton = document.getElementById("closeReg");
let regMessage = document.getElementById("registerMessage");
let userReg = document.getElementById("regUser");
let passwordReg = document.getElementById("regPass");

let addBook = document.getElementById("addBook");
let closeBook = document.getElementById("close");
let starContainers = document.getElementsByClassName("stars");
let createBook = document.getElementById("createBook");
let main = document.querySelector("main");
let author = document.getElementById("author");
let coverInput = document.getElementById("cover");
let picDiv = document.getElementById("pic");
let ratingBook = document.getElementById("ratingBook");


//functions
function createABook() {
    createBook.style.display = "block";
}

function closeCreateBook() {
    createBook.style.display = "none";
}


//addEventListeners

//register
registerButton.addEventListener("click", function () {
    regMessage.innerHTML = "";
    regDiv.style.display = "block";
    loginDiv.style.display = "none";
    userReg.value = "";
    passwordReg.value = "";
});

closeRegButton.addEventListener("click", function () {
    regDiv.style.display = "none";
});

createButton.addEventListener("click", function () {
    regDiv.appendChild(regMessage);
});


//log in
loginButton.addEventListener("click", function () {
    loginDiv.style.display = "block";
    regDiv.style.display = "none";
    userLogIn.value = "";
    passwordLogIn.value = "";
});

closeLoginButton.addEventListener("click", function () {
    loginDiv.style.display = "none";
});


//Register and log in
const BASE_URL = "https://josefinbck-projectcorn-23.deno.dev";
let currentUser = null;

// --- REGISTER ---
createButton.addEventListener("click", async function () {
    let result = await fetch(BASE_URL + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userReg.value, password: passwordReg.value })
    });

    let data = await result.json();
    if (data.success) {
        regMessage.textContent = "Account created! You can now log in.";
        regMessage.style.color = "green";
    } else {
        regMessage.textContent = data.error;
        regMessage.style.color = "red";
    }
});

// --- LOGIN ---
loginBtn.addEventListener("click", async function () {
    let res = await fetch(BASE_URL + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userLogIn.value, password: passwordLogIn.value })
    });

    let data = await res.json();
    if (data.success) {
        currentUser = userLogIn.value;
        who.textContent = currentUser;
        loginMessage.textContent = "Welcome " + currentUser + "!";
        loginMessage.style.color = "green";
        appDiv.style.display = "block";
        loginDiv.style.display = "none";
        loginBtn.style.display = "none";
        registerButton.style.display = "none";

        // här kan du nu anropa loadBooks() för att hämta användarens böcker
    } else {
        loginMessage.textContent = data.error;
        loginMessage.style.color = "red";
    }
});

// Logga ut
logoutBtn.addEventListener("click", function () {
    currentUser = null;
    who.textContent = "";
    main.innerHTML = "";
    appDiv.style.display = "none";   // göm appen
    loginDiv.style.display = "block"; // visa login igen
    regDiv.style.display = "block"; // visa register igen
});


//create a book
addBook.addEventListener("click", function () {
    createABook();
});


closeBook.addEventListener("click", function () {
    closeCreateBook();
    let authorName = author.value;

    let div = document.createElement("div");
    div.style.height = "auto";
    div.style.width = "150px";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "center";
    div.style.backgroundColor = "white";
    div.style.padding = "10px";
    div.style.border = "1px solid #ccc";
    div.style.margin = "10px";


    //Lägg till rating
    // Hämta rating från formuläret
    let stars = document.querySelectorAll("#ratingBook span");
    let rating = 0;
    for (let i = 0; i < stars.length; i++) {
        if (stars[i].classList.contains("filled")) {
            rating++;
        }
    }
    let ratingDiv = document.createElement("div");
    ratingDiv.classList.add("stars");
    for (let i = 1; i <= 5; i++) {
        let star = document.createElement("span");
        star.textContent = "★";
        if (i <= rating) {
            star.classList.add("filled");
        }
        ratingDiv.appendChild(star);
    }

    //Lägg till bilden
    let img = picDiv.querySelector("img");
    if (img) {
        let imgCopy = img.cloneNode(true);   // kopiera bilden
        imgCopy.style.width = "100px";       // ändra storleken
        imgCopy.style.height = "150px";
        div.appendChild(imgCopy);
    }

    //Lägg till author
    let text = document.createElement("p");
    text.textContent = authorName;

    div.appendChild(text);
    div.appendChild(ratingDiv);
    main.appendChild(div);

    author.value = "";
    picDiv.innerHTML = "";
});


//färga stjärnorna 
for (let i = 0; i < starContainers.length; i++) {
    let container = starContainers[i];
    let stars = container.getElementsByTagName("span");

    // gör varje stjärna klickbar
    for (let j = 0; j < stars.length; j++) {
        stars[j].addEventListener("click", function () {

            for (let k = 0; k < stars.length; k++) {
                if (k <= j) {
                    stars[k].classList.add("filled");
                } else {
                    stars[k].classList.remove("filled");
                }
            }
        });
    }
}


//Ladda upp en bild på bokomslaget
coverInput.addEventListener("change", function () {
    let file = coverInput.files[0];   // ta första vald fil
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function (e) {
        // rensa ev. gammal bild
        picDiv.innerHTML = "";

        // skapa img och visa bilden
        let img = document.createElement("img");
        img.src = e.target.result;
        img.style.width = "250px";
        img.style.height = "350px";
        img.style.display = "block";

        picDiv.appendChild(img);
    };

    reader.readAsDataURL(file); // läs filen som data-URL
});