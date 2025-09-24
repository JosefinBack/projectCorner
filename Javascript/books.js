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
const BASE_URL = "https://josefinscorner-31.deno.dev";
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
        loginButton.style.display = "none";

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
    loginMessage.innerHTML = "";
    appDiv.style.display = "none";   // göm appen
    loginButton.style.display = "block"; // visa login igen
    registerButton.style.display = "block"; // visa register igen
});


//Skapa en bok
addBook.addEventListener("click", function () {
    createABook();
});


closeBook.addEventListener("click", async function () {
    closeCreateBook();

    // Hämta fält
    let bookTitle = document.getElementById("bookTitle");
    let bookGenre = document.getElementById("genre");
    let authorName = document.getElementById("author");
    let bookPages = document.getElementById("pages");
    let bookStart = document.getElementById("startdate");
    let bookFinish = document.getElementById("finishdate");

    // Boktyp (radio)
    let bookType = null;
    let selected = document.querySelector('input[name="booktype"]:checked');
    if (selected) {
        bookType = selected.value;
    }

    // Bild
    let img = picDiv.querySelector("img");
    let imgSrc = img ? img.src : null;

    // Rating
    let ratings = {};
    let starGroups = document.querySelectorAll("#ratingBox .stars");
    for (let i = 0; i < starGroups.length; i++) {
        let group = starGroups[i];
        let category = group.dataset.category;
        let filledStars = group.querySelectorAll(".filled").length;
        ratings[category] = filledStars;
    }

    // Citat
    let quotes = [];
    let quoteInputs = document.querySelectorAll("#quotes .quote");
    for (let i = 0; i < quoteInputs.length; i++) {
        let val = quoteInputs[i].value.trim();
        if (val !== "") {
            quotes.push(val);
        }
    }

    // Bygg bokobjekt
    let book = {
        pic: imgSrc,
        title: bookTitle.value,
        genre: bookGenre.value,
        author: authorName.value,
        pages: bookPages.value,
        start: bookStart.value,
        finish: bookFinish.value,
        type: bookType,
        ratings: ratings,
        quotes: quotes,
    };

    // Skicka till servern
    let res = await fetch(BASE_URL + "/books/" + currentUser, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
    });
    let savedBook = await res.json();

    // Skapa en div i main
    let div = document.createElement("div");
    div.style.width = "150px";
    div.style.margin = "10px";
    div.style.padding = "10px";
    div.style.border = "1px solid #ccc";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "center";

    // Spara id på diven
    div.dataset.id = savedBook.id;

    // Klick → öppna redigering
    div.addEventListener("click", function () {
        openBookForEdit(savedBook.id);
    });

    // Lägg till bild
    if (imgSrc) {
        let imgEl = document.createElement("img");
        imgEl.src = imgSrc;
        imgEl.style.width = "100px";
        imgEl.style.height = "150px";
        div.appendChild(imgEl);
    }

    // Lägg till titel och författare
    let text = document.createElement("p");
    text.textContent = savedBook.title + " – " + savedBook.author;
    div.appendChild(text);

    // Lägg till main
    main.appendChild(div);

    // Återställ formuläret
    bookTitle.value = "";
    bookGenre.value = "";
    authorName.value = "";
    bookPages.value = "";
    bookStart.value = "";
    bookFinish.value = "";
    picDiv.innerHTML = "";
    for (let i = 0; i < quoteInputs.length; i++) {
        quoteInputs[i].value = "";
    }

    let allStarGroups = document.querySelectorAll(".stars");
    for (let j = 0; j < allStarGroups.length; j++) {
        let group = allStarGroups[j];
        let stars = group.querySelectorAll("span");
        for (let k = 0; k < stars.length; k++) {
            stars[k].classList.remove("filled");
        }
    }

    if (!currentUser) {
        alert("You must be logged in to save a book!");
        return;
    }
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