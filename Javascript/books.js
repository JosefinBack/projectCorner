var supabaseClient = window.supabase.createClient(
    "https://qciftuisfloydqxgrdrt.supabase.co",
    "sb_publishable_m1PZazpxmQepEPbktVMzZA_YusPeIWL"
);
let currentUser = null;

let allBooks = document.getElementById("allBooks");
let reloadBooks = document.getElementById("reload");

let loginButton = document.getElementById("logInButton");
let loginDiv = document.getElementById("logInDiv");
let closeLoginButton = document.getElementById("closeLogIn");
let loginBtn = document.getElementById("loginBtn");
let loginMessage = document.getElementById("loginMessage");
let who = document.getElementById("who");
let userLogIn = document.getElementById("loginUser");
let passwordLogIn = document.getElementById("loginPass");
let topDIV = document.getElementById("topDIV");

let logoutBtn = document.getElementById("logoutBtn");
let welcomeLogedOut = document.getElementById("welcomeLogedOut");
let appDiv = document.getElementById("app");
let latestReadBook = document.getElementById("latestReadBook");

let regDiv = document.getElementById("registration");
let registerButton = document.getElementById("register");
let createButton = document.getElementById("newUser");
let closeRegButton = document.getElementById("closeReg");
let regMessage = document.getElementById("registerMessage");
let userReg = document.getElementById("regUser");
let passwordReg = document.getElementById("regPass");

let addBook = document.getElementById("addBook");
let closeAndSave = document.getElementById("closeAndSave");
let starContainers = document.getElementsByClassName("stars");
let createBook = document.getElementById("createBook");
let main = document.querySelector("main");
let coverInput = document.getElementById("cover");
let picDiv = document.getElementById("pic");
let ratingBook = document.getElementById("ratingBook");
let deleteBook = document.getElementById("delete");

let currentCover = null;

let viewList = document.getElementById("list");
let viewCard = document.getElementById("ruta");

// Hämta inputfält
let bookTitle = document.getElementById("bookTitle");
let bookGenre = document.getElementById("genre");
let authorName = document.getElementById("author");
let bookPages = document.getElementById("pages");
let bookStart = document.getElementById("startdate");
let bookFinish = document.getElementById("finishdate");
let bookSummary = document.getElementById("summary");
let inputIsSeries = document.getElementById("isSeries");
let inputSeriesName = document.getElementById("seriesname");
let inputSeriesNumber = document.getElementById("seriesnumber");


// Bild
let imgInput = document.getElementById("cover");
let imgUrl = null;


//functions

function createABook() {
    document.getElementById("overlay").style.display = "block";
    createBook.style.display = "block";
}

function closeCreateBook() {
    document.getElementById("overlay").style.display = "none";
    createBook.style.display = "none";
}


async function openBookForEdit(bookId) {
    if (!currentUser) return;

    let books = await loadBooks();

    let book = books.find(b => b.id === bookId);
    if (!book) {
        console.warn("Book not found:", bookId);
        return;
    }

    // Öppna formuläret
    document.getElementById("overlay").style.display = "block";
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

    // Fyll i textfält
    setValue("bookTitle", book.title);
    setValue("genre", book.genre);
    setValue("author", book.author);
    setValue("pages", book.pages);
    setValue("startdate", book.start);
    setValue("finishdate", book.finish);
    setValue("summary", book.summary);

    if (book.seriesname) {
        document.getElementById("isSeries").checked = true;
        setValue("seriesname", book.seriesname);
        setValue("seriesnumber", book.seriesnumber);
    } else {
        document.getElementById("isSeries").checked = false;
        setValue("seriesname", "");
        setValue("seriesnumber", "");
    }

    // Boktyp (radio)
    let radios = document.querySelectorAll('input[name="booktype"]');
    for (let i = 0; i < radios.length; i++) {
        radios[i].checked = (book.type && radios[i].value === book.type);
    }

    // Bild
    picDiv.innerHTML = "";
    if (book.imgsrc) {
        let imgEl = document.createElement("img");
        imgEl.src = book.imgsrc;
        imgEl.style.width = "250px";
        imgEl.style.height = "350px";
        imgEl.style.display = "block";
        picDiv.appendChild(imgEl);

        currentCover = book.imgsrc;
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



// LOAD BOOKS
async function loadBooks() {
    if (!currentUser) {
        console.log("No user yet");
        return [];
    }

    let { data: books, error } = await supabaseClient
        .from("books")
        .select("*")
        .eq("user_id", currentUser);

    if (error) {
        console.error(error);
        return [];
    }

    // Hjälpfunktion för datum
    function getTime(date) {
        if (date === null || date === undefined || date === "") {
            return 0;
        }
        return new Date(date).getTime();
    }

    // 1. Skapa latestSeriesDate
    let latestSeriesDate = {};
    for (let book of books) {
        if (book.seriesname) {
            let time = getTime(book.finish);

            if (!latestSeriesDate[book.seriesname]) {
                latestSeriesDate[book.seriesname] = time;
            } else if (time > latestSeriesDate[book.seriesname]) {
                latestSeriesDate[book.seriesname] = time;
            }
        }
    }

    // 2. Sortering
    books.sort(function (a, b) {
        function getGroupTime(book) {
            if (book.seriesname) {
                return latestSeriesDate[book.seriesname] || 0;
            }
            return getTime(book.finish);
        }
        let timeA = getGroupTime(a);
        let timeB = getGroupTime(b);
        // 1. Sortera på senaste aktivitet (serie + fristående blandat)
        if (timeA !== timeB) {
            return timeB - timeA;
        }
        // 2. Samma serie → rätt ordning
        if (a.seriesname && b.seriesname && a.seriesname === b.seriesname) {
            return (a.seriesnumber || 0) - (b.seriesnumber || 0);
        }
        // 3. fallback
        return (a.title || "").localeCompare(b.title || "", "sv");
    });


    allBooks.innerHTML = "";
    for (let book of books) {
        createDivOfBook(book);
    }
    return books;
}

async function latestBook() {
    const { data: userData } = await supabaseClient.auth.getUser();

    if (!userData.user) {
        console.log("No user logged in");
        return null;
    }
    let userId = userData.user.id;

    let { data: books, error } = await supabaseClient
        .from("books")
        .select("*")
        .eq("user_id", userId);

    if (error) {
        console.error(error);
        return null;
    }

    let finished = books.filter(function (book) {
        return book.finish;
    });

    finished.sort(function (a, b) {
        return new Date(b.finish) - new Date(a.finish);
    });

    let latestBook = finished[0];
    // console.log(latestBook)

    //Skapa en div med info om boken som ska synas i topDIV

    let divBook = document.createElement("div");
    divBook.classList.add("divBook")
    let pTitle = document.createElement("h4");
    pTitle.textContent = latestBook.title;
    pTitle.style.fontSize = "20px";
    pTitle.style.margin = "0px";

    let pInfo = null;

    if (latestBook.seriesname) {
        pInfo = document.createElement("p");
        pInfo.style.margin = "0px";
        pInfo.textContent = `${latestBook.seriesname} (${latestBook.seriesnumber})`;
    }

    let pImg = document.createElement("img");
    pImg.src = latestBook.imgsrc;
    pImg.style.height = "150px";
    pImg.style.width = "100px";

    let pRating = document.createElement("p");
    pRating.style.margin = "0px";
    pRating.style.fontSize = "18px";
    pRating.style.fontWeight = "bold";
    let text = document.createElement("span");
    text.textContent = `${latestBook.ratings.book}/10 `;

    let star = document.createElement("span");
    star.textContent = "★";
    star.style.color = "gold";
    pRating.append(text, star);

    latestReadBook.innerHTML = "";
    divBook.innerHTML = "";
    divBook.append(pImg);
    divBook.append(pTitle);

    if (pInfo) {
        divBook.append(pInfo);
    }

    divBook.append(pRating);
    latestReadBook.append(divBook);

};
latestBook();





async function uploadToCloudinary(file) {
    //inlogg med google (ny)
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
    // Skapa en div i allBooks
    let divOfBook = document.createElement("div");
    divOfBook.classList.add("book-card");
    divOfBook.dataset.id = book.id;

    let divedit = document.createElement("div");
    divedit.classList.add("editPic");

    divOfBook.appendChild(divedit);

    divedit.addEventListener("click", function () {
        openBookForEdit(book.id)
    });

    // Lägg till bild
    if (book.imgsrc) {
        let imgPic = document.createElement("img");
        imgPic.src = book.imgsrc;
        divOfBook.appendChild(imgPic);
    }

    //Div för titel, serie, rating
    let bottomDiv = document.createElement("div");
    let titleAndSerie = document.createElement("div");

    // Lägg till titel
    let text = document.createElement("p");
    let textSerie = document.createElement("p");
    text.classList.add("book-title")
    text.textContent = book.title;
    titleAndSerie.appendChild(text);

    if (book.seriesname) {
        textSerie.textContent = `Series: ${book.seriesname} (Book ${book.seriesnumber})`;
        textSerie.classList.add("book-serie");
        titleAndSerie.appendChild(textSerie);
    }

    //Lägg till rating
    let ratingDiv = document.createElement("div");
    ratingDiv.classList.add("stars");

    let bookRating = 0;
    if (book.ratings && typeof book.ratings.book === "number") {
        bookRating = book.ratings.book;
    }

    for (let i = 0; i < 10; i++) {
        let star = document.createElement("span");
        star.textContent = "★";
        if (i < bookRating) {
            star.style.color = "gold";
        }
        ratingDiv.appendChild(star);
    }

    bottomDiv.append(titleAndSerie);
    bottomDiv.append(ratingDiv);
    divOfBook.append(bottomDiv);
    allBooks.append(divOfBook);
}

function wipeForm() {
    // textfält
    bookTitle.value = "";
    bookGenre.value = "";
    authorName.value = "";
    bookPages.value = "";
    bookStart.value = "";
    bookFinish.value = "";
    picDiv.innerHTML = "";
    imgInput.value = "";
    bookSummary.value = "";

    // serie
    inputIsSeries.checked = false;
    inputSeriesName.value = "";
    inputSeriesNumber.value = "";

    // citat
    let quoteInputs = document.querySelectorAll("#quotes .quote");
    for (let i = 0; i < quoteInputs.length; i++) {
        quoteInputs[i].value = "";
    }

    // radioknappar
    let radios = document.querySelectorAll('input[name="booktype"]');
    for (let i = 0; i < radios.length; i++) {
        radios[i].checked = false;
    }

    // rating – bara i formuläret
    let ratingBig = document.querySelector("#ratingBook");
    if (ratingBig) {
        let spansBig = ratingBig.querySelectorAll("span");
        for (let i = 0; i < spansBig.length; i++) {
            spansBig[i].classList.remove("filled");
        }
    }

    let starGroups = document.querySelectorAll("#ratingBox .stars");
    for (let g = 0; g < starGroups.length; g++) {
        let stars = starGroups[g].querySelectorAll("span");
        for (let s = 0; s < stars.length; s++) {
            stars[s].classList.remove("filled");
        }
    }
}


//Filter
async function filterAuthors() {
    let books = await loadBooks();

    let allAuthors = [];
    for (let book of books) {
        if (!allAuthors.includes(book.author)) {
            allAuthors.push(book.author);
        }
    }
    let authorList = document.getElementById("authorsList");
    authorList.innerHTML = "";


    for (let author of allAuthors) {
        let container = document.createElement("div");
        container.classList.add("filterPart");

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.style.border = "1px solid black";
        checkbox.style.width = "20px";
        checkbox.style.height = "20px";
        checkbox.style.flexShrink = "0";
        checkbox.value = author;
        checkbox.name = "authorFilter";

        let p = document.createElement("p");
        p.textContent = author;

        container.appendChild(checkbox);
        container.appendChild(p);
        authorList.appendChild(container);
    }
};

async function filterByYear() {
    let books = await loadBooks();

    let allYears = [];
    for (let book of books) {
        let year = book.finish.slice(0, 4);
        if (!allYears.includes(year)) {
            allYears.push(year);
        }
    }

    let yearList = document.getElementById("allYearList");
    yearList.innerHTML = "";
    let years = allYears.sort();

    for (let year of years) {
        let container = document.createElement("div");
        container.classList.add("filterPart");

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.style.border = "1px solid black";
        checkbox.style.width = "20px";
        checkbox.style.height = "20px";
        checkbox.value = year;
        checkbox.name = "yearFilter";

        let p = document.createElement("p");
        p.textContent = year;
        container.appendChild(checkbox);
        container.appendChild(p);
        yearList.appendChild(container);
    }
};

async function filterByGenre() {
    let books = await loadBooks();
    let allGenres = [];

    for (let book of books) {
        if (!book.genre) continue;
        // Splitta strängen till en array (Fantasy, Dark romance → ["Fantasy", "Dark romance"])
        let genreParts = book.genre.split(",").map(g => g.trim());

        // Lägg till varje individuell genre
        for (let g of genreParts) {
            if (!allGenres.includes(g)) {
                allGenres.push(g);
            }
        }
    }

    let genreList = document.getElementById("allGenreList");
    genreList.innerHTML = "";

    for (let genre of allGenres) {
        let container = document.createElement("div");
        container.classList.add("filterPart");

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.style.border = "1px solid black";
        checkbox.style.width = "20px";
        checkbox.style.height = "20px";
        checkbox.value = genre;
        checkbox.name = "genreFilter";

        let p = document.createElement("p");
        p.textContent = genre;
        container.appendChild(checkbox);
        container.appendChild(p);
        genreList.appendChild(container);
    }
}

async function allBooksByYear() {
    if (!currentUser) {
        console.log("No user yet");
        return [];
    }
    let books = await supabaseClient
        .from("books")
        .select("*")
        .eq("user_id", currentUser);

    books = books.data || [];
    // Bara böcker som är avslutade
    const finishedBooks = books.filter(book => book.finish);

    // Totalt antal lästa böcker
    const totalBooks = finishedBooks.length;

    // Räkna per år
    const booksPerYear = {};

    for (let book of finishedBooks) {
        const year = book.finish.slice(0, 4);
        if (!booksPerYear[year]) {
            booksPerYear[year] = 0;
        }
        booksPerYear[year]++;
    }

    const showBookNumber = document.getElementById("howManyBooks");

    let pTotal = document.createElement("p");
    pTotal.innerHTML = `
       You have read <strong>${totalBooks}</strong> books in total
       <br><br>
   `;

    let pBooksYear = document.createElement("p");
    let html = "";

    for (let year in booksPerYear) {
        html += `<strong>${year}:</strong> ${booksPerYear[year]} books<br>`;
    }
    pBooksYear.innerHTML = html;

    showBookNumber.append(pTotal, pBooksYear);

};

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


// --- REGISTER ---
createButton.addEventListener("click", async function () {
    let email = userReg.value;
    let password = passwordReg.value;

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        regMessage.textContent = error.message;
        regMessage.style.color = "red";
        return;
    }
    regMessage.textContent = "Account created! You can now log in.";
    regMessage.style.color = "green";
});


// --- LOGIN ---
loginBtn.addEventListener("click", async function () {
    let email = userLogIn.value;
    let password = passwordLogIn.value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        loginMessage.textContent = error.message;
        loginMessage.style.color = "red";
        return;
    }
    currentUser = data.user.id;

    who.textContent = email;
    loginMessage.textContent = "Welcome!";
    loginMessage.style.color = "green";

    appDiv.style.display = "flex";
    loginDiv.style.display = "none";
    loginBtn.style.display = "none";
    registerButton.style.display = "none";
    loginButton.style.display = "none";
    topDIV.style.display = "flex";
    logoutBtn.style.display = "flex";
    welcomeLogedOut.style.display = "none";

    loadBooks();
    allBooksByYear();
});



// Logga ut
logoutBtn.addEventListener("click", async function () {
    await supabaseClient.auth.signOut();
    currentUser = null;
    who.textContent = "";
    allBooks.innerHTML = "";
    loginMessage.innerHTML = "";
    appDiv.style.display = "none";
    loginButton.style.display = "block";
    loginBtn.style.display = "block";
    registerButton.style.display = "block";
    welcomeLogedOut.style.display = "flex";
});


//filter
let filterUsed = document.getElementById("usedFilter");
let filterButton = document.getElementById("filtering");

let authorDIV = document.getElementById("authorDIV");
let allAuthorsNames = document.getElementById("authors");
allAuthorsNames.classList.add("listInDiv");
allAuthorsNames.style.paddingBottom = "30px";
let authorList = document.getElementById("authorsList");
let allFilters = document.getElementById("allFilters");
let searchButtonAuthor = document.getElementById("searchButtonAuthor");

let yearDiv = document.getElementById("yearDiv");
let yearFilter = document.getElementById("allYears");
yearFilter.classList.add("listInDiv");
let allYearList = document.getElementById("allYearList");
let searchButtonYear = document.getElementById("searchButtonYear");

let genreDiv = document.getElementById("genreDiv");
let allGenres = document.getElementById("allGenre");
allGenres.classList.add("listInDiv");
let listWithAllGenres = document.getElementById("allGenreList");
let searchButtonGenre = document.getElementById("searchButtonGenre");

filterButton.addEventListener("click", function () {
    allFilters.classList.toggle("visible");
});

searchButtonAuthor.addEventListener("click", async function () {
    const checkedBoxes = document.querySelectorAll('input[name="authorFilter"]:checked');
    let choosenAuthors = [];
    for (let authos of checkedBoxes) {
        choosenAuthors.push(authos.value);
    }

    let books = await loadBooks();
    let choosenBooks = books.filter(book => choosenAuthors.includes(book.author));

    choosenBooks.sort((a, b) => {
        // 1. Sortera på author
        const authorCompare = (a.author || "").localeCompare(b.author || "");
        if (authorCompare !== 0) {
            return authorCompare;
        }

        // 2. Samma author → hantera serie
        // Om båda har serie
        if (a.seriesname && b.seriesname) {

            // 2a. Sortera på serienamn
            const seriesCompare = a.seriesname.localeCompare(b.seriesname);
            if (seriesCompare !== 0) {
                return seriesCompare;
            }

            // 2b. Samma serie → sortera på serienummer
            return (a.seriesnumber || 0) - (b.seriesnumber || 0);
        }

        // 3. Om bara en har serie → den med serie först
        if (a.seriesname && !b.seriesname) return -1;
        if (!a.seriesname && b.seriesname) return 1;

        // 4. Ingen serie → sortera på titel
        return (a.title || "").localeCompare(b.title || "");
    });


    allBooks.innerHTML = "";
    for (let book of choosenBooks) {
        createDivOfBook(book);
    };

    let divAuthors = document.getElementById("authors");
    divAuthors.classList.remove("visible");
    allFilters.classList.remove("visible");
    filterUsed.style.visibility = "visible"
    filterUsed.innerHTML = "";
    let authorArray = choosenAuthors.join(", ");
    filterUsed.innerHTML = `Filter/ Authors/ ${authorArray}`;
    filterUsed.style.fontWeight = "bold";
    reloadBooks.style.visibility = "visible"
});


searchButtonYear.addEventListener("click", async function () {
    let checkBoxes = document.querySelectorAll('input[name="yearFilter"]:checked');

    let choosenYear = [];
    for (let year of checkBoxes) {
        choosenYear.push(year.value);
    }

    let books = await loadBooks();
    let yearChecked = books.filter(book => choosenYear.includes(book.finish.slice(0, 4)));

    allBooks.innerHTML = "";
    for (let book of yearChecked) {
        createDivOfBook(book);
    }

    let divYears = document.getElementById("allYears");
    divYears.classList.remove("visible");
    allFilters.classList.remove("visible");
    filterUsed.style.visibility = "visible"
    filterUsed.innerHTML = "";
    let yearArray = choosenYear.join(", ");
    filterUsed.innerHTML = `Filter/ Genre/ ${yearArray}`;
    reloadBooks.style.visibility = "visible"
});


searchButtonGenre.addEventListener("click", async function () {
    let checkBoxes = document.querySelectorAll('input[name="genreFilter"]:checked');
    let choosenGenre = [];
    for (let genre of checkBoxes) {
        choosenGenre.push(genre.value);
    }

    let books = await loadBooks();
    let genreChecked = books.filter(book => {
        if (!book.genre) return false;

        let bookGenres = book.genre
            .split(",")
            .map(g => g.trim());

        return bookGenres.some(g => choosenGenre.includes(g));
    });

    allBooks.innerHTML = "";
    for (let book of genreChecked) {
        createDivOfBook(book);
    }

    let divGenre = document.getElementById("allGenre");
    divGenre.classList.remove("visible");
    allFilters.classList.remove("visible");
    filterUsed.style.visibility = "visible"
    filterUsed.innerHTML = "";
    let genreArray = choosenGenre.join(", ");
    filterUsed.innerHTML = `Filter/ Genre/ ${genreArray}`;
    reloadBooks.style.visibility = "visible"
});


// fyll listan när man klickar
authorDIV.addEventListener("click", async function (event) {
    event.stopPropagation();
    if (window.innerWidth >= 768) {
        authorList.innerHTML = "";
        await filterAuthors();
        allAuthorsNames.classList.add("visible");

        //stäng de andra
        yearFilter.classList.remove("visible");
        allGenres.classList.remove("visible");
    }
});

yearDiv.addEventListener("click", async function (event) {
    event.stopPropagation();
    if (window.innerWidth >= 768) {
        allYearList.innerHTML = "";
        await filterByYear();
        yearFilter.classList.add("visible");

        //Stäng de andra
        allAuthorsNames.classList.remove("visible");
        allGenres.classList.remove("visible");
    }
});


genreDiv.addEventListener("click", async function (event) {
    event.stopPropagation();
    listWithAllGenres.innerHTML = "";
    await filterByGenre();
    allGenres.classList.add("visible");

    //Stäng de andra
    allAuthorsNames.classList.remove("visible");
    yearFilter.classList.remove("visible");
})


//stäng
document.addEventListener("click", function (event) {
    // Kolla om klicket inte är inne i authorDIV, yearDiv eller genreDiv, samt deras respektive listor
    if (
        !authorDIV.contains(event.target) &&
        !allAuthorsNames.contains(event.target) &&
        !yearDiv.contains(event.target) &&
        !yearFilter.contains(event.target) &&
        !genreDiv.contains(event.target) &&
        !allGenres.contains(event.target)
    ) {
        allAuthorsNames.classList.remove("visible");
        yearFilter.classList.remove("visible");
        allGenres.classList.remove("visible");
    }
});


allAuthorsNames.addEventListener("click", function (event) {
    event.stopPropagation();
});


yearFilter.addEventListener("click", function (event) {
    event.stopPropagation();
});

allGenres.addEventListener("click", function (event) {
    event.stopPropagation();
});


//Sortering
let sortBtnInMeny = document.getElementById("sort");
let allSort = document.getElementById("allSort");
let sortSearchButton = document.getElementById("sortSearch");

sortBtnInMeny.addEventListener("click", function () {
    allSort.classList.toggle("visible");
});

sortSearch.addEventListener("click", function () {
    let selected = document.querySelector('input[name="sorting"]:checked');

    if (!selected) return;

    if (selected.value === "Author_A_Z") {
        sortAuthorsAtoZ();
    } else if (selected.value === "Author_Z_A") {
        sortAuthorsZtoA();
    } else if (selected.value === "Title_A_Z") {
        sortTitleAtoZ();
    } else if (selected.value === "Title_Z_A") {
        sortTitleZtoA();
    }
});

//Sortering
async function sortAuthorsAtoZ() {
    let books = await loadBooks();
    let sortedBooks = books.sort(function (a, b) {
        return a.author.localeCompare(b.author, "sv");
    });

    allBooks.innerHTML = "";

    for (let book of sortedBooks) {
        createDivOfBook(book);
    }
    allSort.classList.remove("visible");
    filterUsed.style.visibility = "visible"
    filterUsed.innerHTML = "";
    filterUsed.innerHTML = `Sort/ Authors A to Z`;
    filterUsed.style.fontWeight = "bold";
    reloadBooks.style.visibility = "visible"
};

async function sortAuthorsZtoA() {
    let books = await loadBooks();
    let sortedBooks = books.sort(function (a, b) {
        return b.author.localeCompare(a.author, "sv");
    });

    allBooks.innerHTML = "";

    for (let book of sortedBooks) {
        createDivOfBook(book);
    };
    allSort.classList.remove("visible");
    filterUsed.style.visibility = "visible"
    filterUsed.innerHTML = "";
    filterUsed.innerHTML = `Sort/ Authors Z to A`;
    filterUsed.style.fontWeight = "bold";
    reloadBooks.style.visibility = "visible"
};

async function sortTitleAtoZ() {
    let books = await loadBooks();
    let sortedBooks = books.sort(function (a, b) {
        return a.title.localeCompare(b.title, "sv");
    });

    allBooks.innerHTML = "";

    for (let book of sortedBooks) {
        createDivOfBook(book);
    };
    allSort.classList.remove("visible");
    filterUsed.style.visibility = "visible"
    filterUsed.innerHTML = "";
    filterUsed.innerHTML = `Sort/ Title A to Z`;
    filterUsed.style.fontWeight = "bold";
    reloadBooks.style.visibility = "visible"
};

async function sortTitleZtoA() {
    let books = await loadBooks();
    let sortedBooks = books.sort(function (a, b) {
        return b.title.localeCompare(a.title, "sv");
    });

    allBooks.innerHTML = "";

    for (let book of sortedBooks) {
        createDivOfBook(book);
    };
    allSort.classList.remove("visible");
    filterUsed.style.visibility = "visible"
    filterUsed.innerHTML = "";
    filterUsed.innerHTML = `Sort/ Title Z to A`;
    filterUsed.style.fontWeight = "bold";
    reloadBooks.style.visibility = "visible"
}



//Vy, lista eller kort

viewList.addEventListener("click", async function () {
    let books = await loadBooks();
    allBooks.innerHTML = "";
    allBooks.classList.add("listView")

    for (let book of books) {
        let div = document.createElement("div");
        div.classList.add("divInListview")

        let img = document.createElement("img");
        img.src = book.imgsrc;
        img.style.width = "60px";
        img.style.height = "90px";
        img.style.objectFit = "cover";

        let textWrapper = document.createElement("div");
        textWrapper.classList.add("textWrapper");

        let title = document.createElement("p");
        title.textContent = book.title;

        let serie = document.createElement("p");

        if (book.seriesname === "The Empyrean series") {
            serie.textContent = `Book ${book.seriesnumber} in the ${book.seriesname}`
        } else {
            serie.textContent = `Book ${book.seriesnumber} in the ${book.seriesname}- series`
        }

        let rating = document.createElement("p");
        rating.textContent = `Rating: ${book.ratings.book} / 10`;

        textWrapper.appendChild(title);
        textWrapper.appendChild(serie);

        div.appendChild(img);
        div.appendChild(rating)
        div.appendChild(textWrapper);
        allBooks.appendChild(div);
    };
    console.log(books);
});

viewCard.addEventListener("click", function () {
    allBooks.innerHTML = "";
    allBooks.classList.remove("listView")
    allBooks.classList.add("gridView")
    loadBooks();
});


//förminskar bilden
coverInput.addEventListener("change", async function () {
    let file = coverInput.files[0];
    if (!file) return;

    try {
        // Visa loading (valfri men nice UX)
        picDiv.innerHTML = "Uploading image...";
        let url = await uploadToCloudinary(file);

        // Visa bilden
        picDiv.innerHTML = "";
        let img = document.createElement("img");
        img.src = url;
        img.style.width = "250px";
        img.style.height = "350px";
        picDiv.appendChild(img);
        currentCover = url;

    } catch (err) {
        console.error(err);
        alert("Image upload failed");
        currentCover = null;
    }
});


//reload books
reloadBooks.addEventListener("click", async function () {
    filterUsed.innerHTML = "";
    await loadBooks();
    reloadBooks.style.visibility = "hidden";
});


//Skapa en bok
addBook.addEventListener("click", function () {
    createABook();
    wipeForm();
});

closeAndSave.addEventListener("click", async function () {
    if (!currentUser) {
        alert("You must be logged in to save a book!");
        return;
    }

    try {
        // Boktyp (radio)
        let bookType = null;
        let selected = document.querySelector('input[name="booktype"]:checked');
        if (selected) {
            bookType = selected.value;
        }

        // Serie-fält
        let seriesname = null;
        let seriesnumber = null;
        if (inputIsSeries.checked) {
            seriesname = inputSeriesName.value.trim();
            let numberValue = inputSeriesNumber.value.trim();
            if (numberValue !== "") {
                seriesnumber = Number(numberValue);
                if (isNaN(seriesnumber)) {
                    alert("Series number must be a valid number.");
                    return;
                }
            }
        }

        // Rating (från formulärets stjärnor)
        let bookRating = ratingBook.querySelectorAll(".filled").length;

        // Validering
        if (!bookTitle.value.trim() || bookRating === 0 || !currentCover) {
            alert("You must enter a title, select a book rating and upload a cover image before you can save.");
            return;
        }

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
            imgsrc: currentCover,
            summary: bookSummary.value,
            seriesname: seriesname,
            seriesnumber: seriesnumber,
        };

        // Skicka till servern
        let res, savedBook;
        if (window.currentEditingId) {
            // Uppdatera bok
            await supabaseClient
                .from("books")
                .update(book)
                .eq("id", window.currentEditingId)
                .eq("user_id", currentUser);


            savedBook = { ...book, id: window.currentEditingId };

            // 🔄 Uppdatera befintlig div
            let existingDiv = document.querySelector(`[data-id="${window.currentEditingId}"]`);
            if (existingDiv) {
                existingDiv.querySelector("p").textContent = savedBook.title;
                let imgEl = existingDiv.querySelector("img");
                if (imgEl) {
                    imgEl.src = savedBook.imgsrc;
                }
                let starsDiv = existingDiv.querySelector(".stars");
                if (starsDiv) {
                    starsDiv.innerHTML = "";
                    for (let i = 0; i < 10; i++) {
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
            let { data, error } = await supabaseClient
                .from("books")
                .insert([{
                    ...book,
                    user_id: currentUser
                }])
                .select();
            if (error) {
                console.error(error);
                alert("Save failed");
                return;
            }

            savedBook = data[0];
            createDivOfBook(savedBook);

            await allBooksByYear();
        }
    } catch (err) {
        console.error("Save failed:", err);
        alert("Something went wrong while saving the book.");
    } finally {
        // 🔒 DENNA KÖRS ALLTID
        window.currentEditingId = null;
        wipeForm();
        closeCreateBook();
    }
});


deleteBook.addEventListener("click", async function () {
    let bookId = window.currentEditingId;
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
        await supabaseClient
            .from("books")
            .delete()
            .eq("id", bookId)
            .eq("user_id", currentUser);

        loadBooks();
        await allBooksByYear();
    } catch (err) {
        console.error("Delete failed:", err);
        alert("Something went wrong when deleting.");
    } finally {
        // 🔒 STÄNGS ALLTID
        window.currentEditingId = null;
        closeCreateBook();
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
};

// async function createFileOfAllBooks() {
//     if (!currentUser) return;

//     let books = await loadBooks();

//     const blob = new Blob(
//         [JSON.stringify(books, null, 2)],
//         { type: "application/json" }
//     );

//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `backup-${currentUser}.json`;
//     a.click();

//     URL.revokeObjectURL(url);
//     console.log("Json-fil uppdaterad")
// }

// createFileOfAllBooks();


// bookmenu i mobilversion
const bookMenuToggle = document.getElementById("bookMenuToggle");
const bookMenuDropdown = document.getElementById("bookMenuDropdown");


if (bookMenuToggle && bookMenuDropdown) {
    bookMenuToggle.addEventListener("click", function () {
        bookMenuDropdown.classList.toggle("show");
    });
}

bookMenuDropdown.addEventListener("click", function (event) {
    if (event.target.tagName === "BUTTON") {
        bookMenuDropdown.classList.remove("show");
    }
});

async function checkUser() {
    const { data } = await supabaseClient.auth.getUser();

    if (!data.user) {
        currentUser = null;

        // VISA rätt saker när utloggad
        welcomeLogedOut.style.display = "flex";
        loginButton.style.display = "block";
        registerButton.style.display = "block";
        logoutBtn.style.display = "none";
        appDiv.style.display = "none";

        return;
    }

    // OM inloggad
    currentUser = data.user.id;
    who.textContent = data.user.user_metadata.display_name || data.user.email;

    // console.log(currentUser);
    welcomeLogedOut.style.display = "none";
    loginButton.style.display = "none";
    registerButton.style.display = "none";
    logoutBtn.style.display = "flex";
    appDiv.style.display = "flex";

    loadBooks();
    allBooksByYear();
}

checkUser();


//API för goodreads (eller likande) så man kan skapa en TBR



// async function importBooksFromJSON() {
//         alert("You must be logged in!");
//         return;
//     }

//     let response = await fetch("../allBooks.json");
//     let books = await response.json();

//     for (let i = 0; i < books.length; i++) {
//         let book = books[i];

//         let newBook = {
//             title: book.title,
//             genre: book.genre,
//             author: book.author,
//             pages: book.pages,
//             start: book.start || null,
//             finish: book.finish || null,
//             summary: book.summary,
//             imgsrc: book.imgsrc,
//             ratings: book.ratings,
//             quotes: book.quotes,
//             seriesname: book.seriesname,
//             seriesnumber: book.seriesnumber,
//             type: book.type,
//             user_id: currentUser
//         };

//         let { error } = await supabaseClient
//             .from("books")
//             .insert([newBook]);

//         if (error) {
//             console.error("Error inserting:", book.title, error);
//         }
//     }

//     alert("All books imported!");
//     loadBooks();
// }

// let importBtn = document.getElementById("importBooks");

// importBtn.addEventListener("click", function () {
//     importBooksFromJSON();
// });

// async function setDisplayName(name) {
//     const { data, error } = await supabaseClient.auth.updateUser({
//         data: {
//             display_name: name
//         }
//     });

//     if (error) {
//         console.error(error);
//         return;
//     }
//     console.log("Updated user:", data);
// }

// setDisplayName("Josefin");