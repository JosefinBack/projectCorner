// ---------------- Variabler ----------------

let addBook = document.getElementById("addBook");
let closeBook = document.getElementById("close");
let createBook = document.getElementById("createBook");
let main = document.querySelector("main");
let author = document.getElementById("author");

// login/register
let openLoginBtn = document.getElementById("logInButton");
let openRegisterBtn = document.getElementById("register");
let closeLoginBtn = document.getElementById("closeLogIn");
let closeRegisterBtn = document.getElementById("closeReg");

let loginDiv = document.getElementById("logInDiv");
let registerDiv = document.getElementById("registration");

let loginBtn = document.getElementById("loginBtn");         // inne i login-formuläret
let registerBtn = document.getElementById("newUser");       // inne i register-formuläret
let logoutBtn = document.getElementById("logoutBtn");       // logga ut-knappen
let appLogout = document.getElementById("app");

let currentUser = null;


// ---------------- Hjälpfunktioner ----------------

function createABook() {
    createBook.style.display = "block";
}

function closeCreateBook() {
    createBook.style.display = "none";
}

async function loadBooks() {
    if (!currentUser) return;
    let res = await fetch("/books/" + currentUser);
    let books = await res.json();

    main.innerHTML = "";
    for (let i = 0; i < books.length; i++) {
        let div = document.createElement("div");
        div.textContent = books[i].title;
        div.dataset.id = books[i].id;
        div.addEventListener("click", function () {
            openBookForEdit(books[i].id);
        });
        main.appendChild(div);
    }
}

async function openBookForEdit(bookId) {
    let res = await fetch("/books/" + currentUser);
    let books = await res.json();
    let book = books.find((b) => b.id === bookId);
    if (!book) return;

    document.getElementById("bookTitle").value = book.title || "";
    document.getElementById("author").value = book.author || "";
    document.getElementById("pages").value = book.pages || "";
    document.getElementById("startdate").value = book.start || "";
    document.getElementById("finishdate").value = book.finish || "";

    // TODO: även sätt rating, bild, citat osv

    createABook();
}


// ---------------- Event Listeners ----------------

// öppna/stäng login/register
openLoginBtn.addEventListener("click", function () {
    loginDiv.style.display = "block";
    registerDiv.style.display = "none";
});

openRegisterBtn.addEventListener("click", function () {
    registerDiv.style.display = "block";
    loginDiv.style.display = "none";
});

closeLoginBtn.addEventListener("click", function () {
    loginDiv.style.display = "none";
});

closeRegisterBtn.addEventListener("click", function () {
    registerDiv.style.display = "none";
});


// logga in
loginBtn.addEventListener("click", async function () {
    let username = document.getElementById("loginUser").value;
    let password = document.getElementById("loginPass").value;

    let res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    let data = await res.json();
    if (data.success) {
        currentUser = username;
        document.getElementById("who").textContent = currentUser;
        loginDiv.style.display = "none"; // göm loginrutan
        loadBooks();
    } else {
        document.getElementById("loginMessage").textContent = data.error || "Invalid login";
    }

    appLogout.style.display = "block";
    openLoginBtn.style.display = "none";
    openRegisterBtn.style.display = "none";
});


// registrera användare
registerBtn.addEventListener("click", async function () {
    let username = document.getElementById("regUser").value;
    let password = document.getElementById("regPass").value;

    let res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    let data = await res.json();
    if (data.success) {
        document.getElementById("registerMessage").textContent = "User created! You can now log in.";
        document.getElementById("registerMessage").style.color = "green";
        registerDiv.style.display = "none"; // göm registerrutan
    } else {
        document.getElementById("registerMessage").textContent = data.error || "Error creating user";
        document.getElementById("registerMessage").style.color = "red";
    }
});


// logga ut
logoutBtn.addEventListener("click", function () {
    currentUser = null;
    main.innerHTML = "";
    document.getElementById("who").textContent = "";

    appLogout.style.display = "none";
});


// öppna skapa-bok-rutan
addBook.addEventListener("click", function () {
    if (!currentUser) {
        alert("You must log in first!");
        return;
    } else {
        createABook();
    }
});


// spara bok
closeBook.addEventListener("click", async function () {
    closeCreateBook();

    let authorName = author.value;
    let bookTitle = document.getElementById("bookTitle").value;
    let bookPages = document.getElementById("pages").value;
    let bookStart = document.getElementById("startdate").value;
    let bookFinish = document.getElementById("finishdate").value;

    let bookType = null;
    let selected = document.querySelector('input[name="booktype"]:checked');
    if (selected) {
        bookType = selected.value;
    }

    let img = document.querySelector("#pic img");
    let imgSrc = img ? img.src : null;

    let ratings = {};
    let starGroups = document.querySelectorAll("#ratingBox .stars");
    for (let i = 0; i < starGroups.length; i++) {
        let group = starGroups[i];
        let category = group.dataset.category;
        let filledStars = group.querySelectorAll(".filled").length;
        ratings[category] = filledStars;
    }

    let quotes = [];
    let quoteInputs = document.querySelectorAll("#quotes input");
    for (let i = 0; i < quoteInputs.length; i++) {
        let val = quoteInputs[i].value.trim();
        if (val !== "") {
            quotes.push(val);
        }
    }

    let book = {
        title: bookTitle,
        author: authorName,
        pages: bookPages,
        start: bookStart,
        finish: bookFinish,
        type: bookType,
        pic: imgSrc,
        ratings: ratings,
        quotes: quotes,
    };

    if (!currentUser) {
        alert("You must be logged in to save a book!");
        return;
    }

    let res = await fetch("/books/" + currentUser, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
    });

    let savedBook = await res.json();

    let divBook = document.createElement("div");
    divBook.textContent = savedBook.title;
    divBook.dataset.id = savedBook.id;
    divBook.addEventListener("click", function () {
        openBookForEdit(savedBook.id);
    });
    main.appendChild(divBook);

    // återställ formulär
    document.getElementById("bookTitle").value = "";
    document.getElementById("author").value = "";
    document.getElementById("pages").value = "";
    document.getElementById("startdate").value = "";
    document.getElementById("finishdate").value = "";
    document.getElementById("pic").innerHTML = "";
    for (let i = 0; i < quoteInputs.length; i++) {
        quoteInputs[i].value = "";
    }
    for (let j = 0; j < starGroups.length; j++) {
        let stars = starGroups[j].querySelectorAll("span");
        for (let k = 0; k < stars.length; k++) {
            stars[k].classList.remove("filled");
        }
    }
});
