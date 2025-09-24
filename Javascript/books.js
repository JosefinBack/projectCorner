document.addEventListener("DOMContentLoaded", () => {
    // ---------------- Variabler ----------------
    const addBook = document.getElementById("addBook");
    const closeBook = document.getElementById("close");
    const createBookDiv = document.getElementById("createBook");
    const main = document.querySelector("main");
    const author = document.getElementById("author");

    // login/register
    const openLoginBtn = document.getElementById("logInButton");
    const openRegisterBtn = document.getElementById("register");
    const closeLoginBtn = document.getElementById("closeLogIn");
    const closeRegisterBtn = document.getElementById("closeReg");

    const loginDiv = document.getElementById("logInDiv");
    const registerDiv = document.getElementById("registration");

    const loginBtn = document.getElementById("loginBtn"); // inne i login-formuläret
    const registerBtn = document.getElementById("newUser"); // inne i register-formuläret
    const logoutBtn = document.getElementById("logoutBtn"); // logga ut-knappen
    const appLogout = document.getElementById("app");

    let currentUser = null;

    // ---------------- Hjälpfunktioner ----------------
    function showCreateBook() {
        createBookDiv.style.display = "block";
    }

    function hideCreateBook() {
        createBookDiv.style.display = "none";
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
        showCreateBook();
    }

    // ---------------- Event Listeners ----------------

    // öppna/stäng login/register
    openLoginBtn.addEventListener("click", () => {
        loginDiv.style.display = "block";
        registerDiv.style.display = "none";
    });

    openRegisterBtn.addEventListener("click", () => {
        registerDiv.style.display = "block";
        loginDiv.style.display = "none";
    });

    closeLoginBtn.addEventListener("click", () => {
        loginDiv.style.display = "none";
    });

    closeRegisterBtn.addEventListener("click", () => {
        registerDiv.style.display = "none";
    });

    // logga in
    loginBtn.addEventListener("click", async () => {
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
            document.getElementById("loginMessage").textContent =
                data.error || "Invalid login";
        }

        appLogout.style.display = "block";
        openLoginBtn.style.display = "none";
        openRegisterBtn.style.display = "none";
    });

    // registrera användare
    registerBtn.addEventListener("click", async () => {
        let username = document.getElementById("regUser").value;
        let password = document.getElementById("regPass").value;

        let res = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        let data = await res.json();
        if (data.success) {
            document.getElementById("registerMessage").textContent =
                "User created! You can now log in.";
            document.getElementById("registerMessage").style.color = "green";
            registerDiv.style.display = "none"; // göm registerrutan
        } else {
            document.getElementById("registerMessage").textContent =
                data.error || "Error creating user";
            document.getElementById("registerMessage").style.color = "red";
        }
    });

    // logga ut
    logoutBtn.addEventListener("click", () => {
        currentUser = null;
        main.innerHTML = "";
        document.getElementById("who").textContent = "";

        appLogout.style.display = "none";
    });

    // öppna skapa-bok-rutan
    addBook.addEventListener("click", () => {
        if (!currentUser) {
            alert("You must log in first!");
            return;
        } else {
            showCreateBook();
        }
    });

    // spara bok (close-knappen)
    closeBook.addEventListener("click", async () => {
        hideCreateBook();

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
});
