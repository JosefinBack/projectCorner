let allBooks = document.getElementById("allBooks");


let loginButton = document.getElementById("logInButton");
let loginDiv = document.getElementById("logInDiv");
let closeLoginButton = document.getElementById("closeLogIn");
let loginBtn = document.getElementById("loginBtn");
let loginMessage = document.getElementById("loginMessage");
let who = document.getElementById("who");
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
let closeAndSave = document.getElementById("closeAndSave");
let starContainers = document.getElementsByClassName("stars");
let createBook = document.getElementById("createBook");
let main = document.querySelector("main");
let coverInput = document.getElementById("cover");
let picDiv = document.getElementById("pic");
let ratingBook = document.getElementById("ratingBook");
let deleteBook = document.getElementById("delete");

let currentCover = null;


//functions
function createABook() {
    createBook.style.display = "block";
}

function closeCreateBook() {
    createBook.style.display = "none";
}

async function openBookForEdit(bookId) {
    if (!currentUser) return;

    // Hämta alla böcker och hitta rätt
    let res = await fetch(BASE_URL + "/books/" + currentUser);
    let books = await res.json();

    let book = books.find(b => b.id === bookId);
    if (!book) {
        console.warn("Book not found:", bookId);
        return;
    }

    // Öppna formuläret
    createBook.style.display = "block";

    // Hjälpfunktion för att sätta value om elementet finns
    function setValue(id, value) {
        const el = document.getElementById(id);
        if (el) {
            el.value = value || "";
        } else {
            console.warn(`[openBookForEdit] Missing element #${id}`);
        }
    }

    // Fyll i textfält (utan att krascha om något saknas)
    setValue("bookTitle", book.title);
    setValue("genre", book.genre);
    setValue("author", book.author);
    setValue("pages", book.pages);
    setValue("startdate", book.start);
    setValue("finishdate", book.finish);
    setValue("summary", book.summary);

    // Boktyp (radio)
    let radios = document.querySelectorAll('input[name="booktype"]');
    for (let i = 0; i < radios.length; i++) {
        radios[i].checked = (book.type && radios[i].value === book.type);
    }

    // Bild
    picDiv.innerHTML = "";
    if (book.imgSrc) {
        let imgEl = document.createElement("img");
        imgEl.src = book.imgSrc;
        imgEl.style.width = "250px";
        imgEl.style.height = "350px";
        imgEl.style.display = "block";
        picDiv.appendChild(imgEl);

        currentCover = book.imgSrc;
    } else {
        currentCover = null;
    }

    //Stora rating (#ratingBook)
    let ratingBig = document.querySelector("#ratingBook");
    if (ratingBig) {
        let spansBig = ratingBig.querySelectorAll("span");
        spansBig.forEach(span => span.classList.remove("filled"));

        let bookRating = (book.ratings && typeof book.ratings.book === "number")
            ? book.ratings.book
            : 0;

        for (let i = 0; i < spansBig.length && i < bookRating; i++) {
            spansBig[i].classList.add("filled");
        }
    }

    // Alla små ratings i #ratingBox
    let starGroups = document.querySelectorAll("#ratingBox .stars");
    for (let g = 0; g < starGroups.length; g++) {
        let group = starGroups[g];
        let spans = group.querySelectorAll("span");
        spans.forEach(span => span.classList.remove("filled"));

        let category = group.dataset.category;
        if (book.ratings && typeof book.ratings[category] === "number") {
            let n = book.ratings[category];
            for (let i = 0; i < spans.length && i < n; i++) {
                spans[i].classList.add("filled");
            }
        }
    }

    // Citat
    let quoteInputs = document.querySelectorAll("#quotes .quote");
    for (let i = 0; i < quoteInputs.length; i++) {
        quoteInputs[i].value = "";
    }
    if (Array.isArray(book.quotes)) {
        for (let i = 0; i < quoteInputs.length && i < book.quotes.length; i++) {
            quoteInputs[i].value = book.quotes[i] || "";
        }
    }

    // Spara att vi redigerar denna bok
    window.currentEditingId = bookId;
}


async function loadBooks() {
    if (!currentUser) {
        return;
    }
    let result = await fetch(BASE_URL + "/books/" + currentUser);
    let books = await result.json();
    allBooks.innerHTML = "";
    for (let book of books) {
        createDivOfBook(book);
    }
}

async function uploadToCloudinary(file) {
    const CLOUD_NAME = "dhnlbcj9b";
    const UPLOAD_PRESET = "unsigned_books";

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    let res = await fetch(url, {
        method: "POST",
        body: formData
    });

    let data = await res.json();
    return data.secure_url; // här får du en https-länk till bilden
}


function createDivOfBook(book) {
    // Skapa en div i main
    let divOfBook = document.createElement("div");
    divOfBook.classList.add("book-card");
    divOfBook.dataset.id = book.id;

    // Spara id på diven
    divOfBook.dataset.id = book.id;


    //Klick → öppna redigering
    divOfBook.addEventListener("click", function () {
        openBookForEdit(book.id);
    });

    // Lägg till bild
    if (book.imgSrc) {
        let imgPic = document.createElement("img");
        imgPic.src = book.imgSrc;
        imgPic.style.width = "100px";
        imgPic.style.height = "150px";
        divOfBook.appendChild(imgPic);
    }

    // Lägg till titel
    let text = document.createElement("p");
    text.textContent = book.title;
    divOfBook.appendChild(text);

    //Lägg till rating
    let ratingDiv = document.createElement("div");
    ratingDiv.classList.add("stars");

    let bookRating = 0;
    if (book.ratings && typeof book.ratings.book === "number") {
        bookRating = book.ratings.book;
    }


    for (let i = 0; i < 5; i++) {
        let star = document.createElement("span");
        star.textContent = "★";
        if (i < bookRating) {
            star.style.color = "gold";
        }
        ratingDiv.appendChild(star);
    }
    divOfBook.appendChild(ratingDiv);

    // 🔘 Redigera-knapp
    let editBtn = document.createElement("button");
    editBtn.textContent = "Redigera";
    editBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // så att inte andra click triggas
        openBookForEdit(book.id);
    });
    divOfBook.appendChild(editBtn);
    allBooks.appendChild(divOfBook);
}

//gör om bilden till mindre så servern klarar av att spara dem
function resizeImage(file, maxWidth, callback) {
    const reader = new FileReader();

    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Räkna ut ny storlek (proportionellt)
            let scale = maxWidth / img.width;
            let newWidth = img.width * scale;
            let newHeight = img.height * scale;

            canvas.width = newWidth;
            canvas.height = newHeight;

            // Rita om bilden på canvas
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // Gör om till Base64 (JPEG med kvalitet 0.7)
            let resizedBase64 = canvas.toDataURL("image/jpeg", 0.7);

            // Skicka tillbaka via callback
            callback(resizedBase64);
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
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
        localStorage.setItem("currentUser", currentUser);
        who.textContent = currentUser;
        loginMessage.textContent = "Welcome " + currentUser + "!";
        loginMessage.style.color = "green";
        appDiv.style.display = "block";
        loginDiv.style.display = "none";
        loginBtn.style.display = "none";
        registerButton.style.display = "none";
        loginButton.style.display = "none";

        loadBooks();
    } else {
        loginMessage.textContent = data.error;
        loginMessage.style.color = "red";
    }
});

// Logga ut
logoutBtn.addEventListener("click", function () {
    currentUser = null;
    localStorage.removeItem("currentUser");
    who.textContent = "";
    main.innerHTML = "";
    loginMessage.innerHTML = "";
    appDiv.style.display = "none";   // göm appen
    loginButton.style.display = "block"; // visa login igen
    loginBtn.style.display = "block";
    registerButton.style.display = "block"; // visa register igen
});

//förminskar bilden
coverInput.addEventListener("change", function () {
    let file = coverInput.files[0];
    if (!file) return;

    // Skala ner till max 300px bred
    resizeImage(file, 300, function (resizedBase64) {
        // Visa bilden i formuläret
        picDiv.innerHTML = "";
        let img = document.createElement("img");
        img.src = resizedBase64;
        img.style.width = "250px";
        img.style.height = "350px";
        picDiv.appendChild(img);

        // Spara Base64-strängen i en variabel
        // som du senare skickar till servern
        currentCover = resizedBase64;
    });
});



//Skapa en bok
addBook.addEventListener("click", function () {
    createABook();
});


closeBook.addEventListener("click", function () {
    closeCreateBook();
})

closeAndSave.addEventListener("click", async function () {
    if (!currentUser) {
        alert("You must be logged in to save a book!");
        return;
    }

    // Hämta fält
    let bookTitle = document.getElementById("bookTitle");
    let bookGenre = document.getElementById("genre");
    let authorName = document.getElementById("author");
    let bookPages = document.getElementById("pages");
    let bookStart = document.getElementById("startdate");
    let bookFinish = document.getElementById("finishdate");
    let bookSummary = document.getElementById("summary");

    // Boktyp (radio)
    let bookType = null;
    let selected = document.querySelector('input[name="booktype"]:checked');
    if (selected) {
        bookType = selected.value;
    }

    // Bild
    let imgInput = document.getElementById("cover");
    let imgUrl = null;

    if (imgInput.files.length > 0) {
        let file = imgInput.files[0];
        imgUrl = await uploadToCloudinary(file);
    } else if (window.currentEditingId) {
        // Behåll gammal bild om vi redigerar
        let oldDiv = document.querySelector(`[data-id="${window.currentEditingId}"]`);
        if (oldDiv) {
            let oldImg = oldDiv.querySelector("img");
            if (oldImg) {
                imgUrl = oldImg.src;
            }
        }
    }

    // Rating (från formulärets stjärnor)
    let bookRating = ratingBook.querySelectorAll(".filled").length;

    // Validering
    if (!bookTitle.value.trim() || bookRating === 0 || !imgUrl) {
        alert("You must enter a title, select a book rating and upload a cover image before you can save.");
        return;
    }

    closeCreateBook();

    // Rating (alla kategorier i #ratingBox)
    let ratings = {};
    let starGroups = document.querySelectorAll("#ratingBox .stars");
    for (let i = 0; i < starGroups.length; i++) {
        let group = starGroups[i];
        let category = group.dataset.category;
        let filledStars = group.querySelectorAll(".filled").length;
        ratings[category] = filledStars;
    }
    ratings.book = bookRating;

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
        title: bookTitle.value,
        genre: bookGenre.value,
        author: authorName.value,
        pages: bookPages.value,
        start: bookStart.value,
        finish: bookFinish.value,
        type: bookType,
        ratings: ratings,
        quotes: quotes,
        imgSrc: imgUrl,
        summary: bookSummary.value
    };

    // Skicka till servern
    let res, savedBook;
    if (window.currentEditingId) {
        // Uppdatera bok
        res = await fetch(BASE_URL + "/books/" + currentUser + "/" + window.currentEditingId, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(book),
        });
        savedBook = await res.json();

        // 🔄 Uppdatera befintlig div
        let existingDiv = document.querySelector(`[data-id="${window.currentEditingId}"]`);
        if (existingDiv) {
            existingDiv.querySelector("p").textContent = savedBook.title;
            let imgEl = existingDiv.querySelector("img");
            if (imgEl) {
                imgEl.src = savedBook.imgSrc;
            }
            let starsDiv = existingDiv.querySelector(".stars");
            if (starsDiv) {
                starsDiv.innerHTML = "";
                for (let i = 0; i < 5; i++) {
                    let star = document.createElement("span");
                    star.textContent = "★";
                    if (i < savedBook.ratings.book) {
                        star.style.color = "gold";
                    }
                    starsDiv.appendChild(star);
                }
            }
        }
    } else {
        // Skapa ny bok
        res = await fetch(BASE_URL + "/books/" + currentUser, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(book),
        });
        savedBook = await res.json();

        createDivOfBook(savedBook);
    }

    window.currentEditingId = null;

    // Återställ formuläret
    bookTitle.value = "";
    bookGenre.value = "";
    authorName.value = "";
    bookPages.value = "";
    bookStart.value = "";
    bookFinish.value = "";
    picDiv.innerHTML = "";
    imgInput.value = "";
    bookSummary.value = "";

    for (let i = 0; i < quoteInputs.length; i++) {
        quoteInputs[i].value = "";
    }
    let radios = document.querySelectorAll('input[name="booktype"]');
    for (let i = 0; i < radios.length; i++) {
        radios[i].checked = false;
    }
    let allStarGroups = document.querySelectorAll(".stars");
    for (let j = 0; j < allStarGroups.length; j++) {
        let group = allStarGroups[j];
        let stars = group.querySelectorAll("span");
        for (let k = 0; k < stars.length; k++) {
            stars[k].classList.remove("filled");
        }
    }
});


deleteBook.addEventListener("click", async function () {
    let bookId = window.currentEditingId;
    if (!confirm("Are you sure you want to delete this book?")) {
        return;
    }

    let res = await fetch(BASE_URL + "/books/" + currentUser + "/" + bookId, {
        method: "DELETE",
    });
    let result = await res.json();

    if (result.success) {
        alert("Book deleted");
        loadBooks();
        closeCreateBook();
    } else {
        alert("Something went wrong when deleting")
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


//När sidan laddas om, fortsätter vara inloggad
let savedUser = localStorage.getItem("currentUser");
if (savedUser) {
    currentUser = savedUser;
    who.textContent = currentUser;
    appDiv.style.display = "block";
    loginBtn.style.display = "none";
    registerButton.style.display = "none";
    loginButton.style.display = "none";
    loadBooks(); // ✅ hämta böckerna direkt
}