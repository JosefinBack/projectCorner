// books.js

let addBook = document.getElementById("addBook");
let closeBook = document.getElementById("close");
let createBook = document.getElementById("createBook");
let main = document.querySelector("main");
let author = document.getElementById("author");

let loginBtn = document.getElementById("loginBtn");
let registerBtn = document.getElementById("newUser");
let logoutBtn = document.getElementById("logoutBtn");

let currentUser = null;

// ----------- Hjälpfunktioner -----------

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

    // Fyll i formuläret igen
    document.getElementById("bookTitle").value = book.title || "";
    document.getElementById("author").value = book.author || "";
    document.getElementById("pages").value = book.pages || "";
    document.getElementById("startdate").value = book.start || "";
    document.getElementById("finishdate").value = book.finish || "";

    // TODO: även sätt rating, bild, citat osv

    createABook();
}

// ----------- Event Listeners -----------

addBook.addEventListener("click", function () {
    if (!currentUser) {
        alert("You must log in first!");
        return;
    }
    createABook();
});

closeBook.addEventListener("click", async function () {
    closeCreateBook();

    let authorName = author.value;
    let bookTitle = document.getElementById("bookTitle").value;
    let bookPages = document.getElementById("pages").value;
    let bookStart = document.getElementById("startdate").value;
    let bookFinish = document.getElementById("finishdate").value;

    // boktyp
    let bookType = null;
    let selected = document.querySelector('input[name="booktype"]:checked');
    if (selected) {
        bookType = selected.value;
    }

    // bild
    let img = document.querySelector("#pic img");
    let imgSrc = img ? img.src : null;

    // rating
    let ratings = {};
    let starGroups = document.querySelectorAll("#ratingBox .stars");
    for (let i = 0; i < starGroups.length; i++) {
        let group = starGroups[i];
        let category = group.dataset.category;
        let filledStars = group.querySelectorAll(".filled").length;
        ratings[category] = filledStars;
    }

    // citat
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

    // POST till servern
    let res = await fetch("/books/" + currentUser, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
    });

    let savedBook = await res.json();

    // Lägg till i main
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

// ----------- Auth -----------

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
        loadBooks();
    } else {
        alert("Invalid login");
    }
});

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
        alert("User created! You can now log in.");
    } else {
        alert(data.error || "Error creating user");
    }
});

logoutBtn.addEventListener("click", function () {
    currentUser = null;
    main.innerHTML = "";
    document.getElementById("who").textContent = "";
});
