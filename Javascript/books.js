

const supabase = window.supabase.createClient(
    "DIN_SUPABASE_URL",
    "DIN_ANON_KEY"
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
let inputSeriesName = document.getElementById("seriesName");
let inputSeriesNumber = document.getElementById("seriesNumber");


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


    // Hämta alla böcker och hitta rätt
    let books = await loadBooks()();


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


    if (book.seriesName) {
        document.getElementById("isSeries").checked = true;
        setValue("seriesName", book.seriesName);
        setValue("seriesNumber", book.seriesNumber);
    } else {
        document.getElementById("isSeries").checked = false;
        setValue("seriesName", "");
        setValue("seriesNumber", "");
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
    if (!currentUser) return;

    let { data: books, error } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", currentUser);

    if (error) {
        console.error(error);
        return;
    }

    // sortering
    books.sort((a, b) => {
        if (a.seriesName && b.seriesName && a.seriesName === b.seriesName) {
            return (a.seriesNumber || 0) - (b.seriesNumber || 0);
        }

        if (a.seriesName && b.seriesName) {
            return a.seriesName.localeCompare(b.seriesName);
        }

        if (a.seriesName && !b.seriesName) return -1;
        if (!a.seriesName && b.seriesName) return 1;


        return a.title.localeCompare(b.title);
    });
    allBooks.innerHTML = "";

    for (let book of books) {
        createDivOfBook(book);
    }
};


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
        imgPic.style.width = "100px";
        imgPic.style.height = "150px";
        divOfBook.appendChild(imgPic);
    }


    // Lägg till titel
    let text = document.createElement("p");
    let textSerie = document.createElement("p");
    text.classList.add("book-title")
    text.textContent = book.title;
    divOfBook.appendChild(text);

    if (book.seriesName) {
        textSerie.textContent = `Series: ${book.seriesName} (Book ${book.seriesNumber})`;
        textSerie.classList.add("book-serie");
        divOfBook.appendChild(textSerie);
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
    divOfBook.appendChild(ratingDiv);
    allBooks.appendChild(divOfBook);
}


//gör om bilden till mindre så servern klarar av att spara dem
// function resizeImage(file, maxWidth, callback) {
//     const reader = new FileReader();
//     reader.onload = function (event) {
//         const img = new Image();

//         img.onload = function () {
//             const canvas = document.createElement("canvas");
//             const ctx = canvas.getContext("2d");

//             // Räkna ut ny storlek (proportionellt)
//             let scale = maxWidth / img.width;
//             let newWidth = img.width * scale;
//             let newHeight = img.height * scale;

//             canvas.width = newWidth;
//             canvas.height = newHeight;

//             // Rita om bilden på canvas
//             ctx.drawImage(img, 0, 0, newWidth, newHeight);

//             // Gör om till Base64 (JPEG med kvalitet 0.7)
//             let resizedBase64 = canvas.toDataURL("image/jpeg", 0.7);

//             // Skicka tillbaka via callback
//             callback(resizedBase64);
//         };
//         img.src = event.target.result;
//     };

//     reader.readAsDataURL(file);
// }


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




//Sortering
async function sortAuthors() {
    let books = await loadBooks()();
}






//Filter
async function filterAuthors() {
    let books = await loadBooks()();


    let allAuthors = [];
    for (let book of books) {
        if (!allAuthors.includes(book.author)) {
            allAuthors.push(book.author);
        }
    }
    let authorList = document.getElementById("authorsList");
    authorList.innerHTML = "";


    for (let author of allAuthors) {
        // skapa en container (div eller label)
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
}


async function filterByYear() {
    let books = await loadBooks()();


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


    // console.log(years); //kan använda denna för att bygga en lista med vilka år som finns att filtrera på


    // let booksFrom2024 = books.filter(book => book.finish.slice(0, 4) === "2024");


    // console.log(booksFrom2024);


}


async function filterByGenre() {
    let books = await loadBooks()();//ger en array av alla böcker


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
    let books = await loadBooks()();


    // Bara böcker som är avslutade
    const finishedBooks = books.filter(book => book.finish);


    // Totalt antal lästa böcker
    const totalBooks = finishedBooks.length;


    // Räkna per år
    const booksPerYear = {};


    for (let book of finishedBooks) {
        const year = book.finish.slice(0, 4); // "2025"


        if (!booksPerYear[year]) {
            booksPerYear[year] = 0;
        }


        booksPerYear[year]++;
    }


    const showBookNumber = document.getElementById("howManyBooks");
    showBookNumber.style.fontSize = "18px";


    let html = `
       You have read <strong>${totalBooks}</strong> books in total
       <br><br>
   `;


    for (let year in booksPerYear) {
        html += `<strong>${year}:</strong> ${booksPerYear[year]} books<br>`;
    }


    showBookNumber.innerHTML = html;
}


allBooksByYear();




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


// --- REGISTER ---
createButton.addEventListener("click", async function () {


    let email = userReg.value;
    let password = passwordReg.value;


    const { data, error } = await supabase.auth.signUp({
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


    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });


    if (error) {
        loginMessage.textContent = error.message;
        loginMessage.style.color = "red";
        return;
    }


    // 🔥 HÄR ÄR SKILLNADEN
    currentUser = data.user.id;


    who.textContent = email;
    loginMessage.textContent = "Welcome!";
    loginMessage.style.color = "green";


    appDiv.style.display = "inline-block";
    loginDiv.style.display = "none";
    loginBtn.style.display = "none";
    registerButton.style.display = "none";
    loginButton.style.display = "none";


    loadBooks();
    filterAuthors();
});


// Logga ut
logoutBtn.addEventListener("click", async function () {
    await supabase.auth.signOut();


    currentUser = null;
    who.textContent = "";
    allBooks.innerHTML = "";
    loginMessage.innerHTML = "";


    appDiv.style.display = "none";
    loginButton.style.display = "block";
    loginBtn.style.display = "block";
    registerButton.style.display = "block";
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
    // console.log(choosenAuthors);


    let books = await loadBooks()();


    let choosenBooks = books.filter(book => choosenAuthors.includes(book.author));


    choosenBooks.sort((a, b) => {
        // Först sortera på författarnamn
        const authorCompare = a.author.localeCompare(b.author);
        if (authorCompare !== 0) {
            return authorCompare;
        }


        // Om samma författare → sortera på titel
        return a.title.localeCompare(b.title);
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


    let books = await loadBooks()();


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


    let books = await loadBooks()();


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


sortBtnInMeny.addEventListener("click", function () {
    allSort.classList.toggle("visible")
});






//Vy, lista eller kort


viewList.addEventListener("click", async function () {
    let books = await loadBooks()();


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


        if (book.seriesName === "The Empyrean series") {
            serie.textContent = `Book ${book.seriesNumber} in the ${book.seriesName}`
        } else {
            serie.textContent = `Book ${book.seriesNumber} in the ${book.seriesName}- series`
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
coverInput.addEventListener("change", function () {
    let file = coverInput.files[0];
    if (!file) return;

    // Skala ner till max 300px bred
    // resizeImage(file, 300, function (resizedBase64) {
    //     // Visa bilden i formuläret
    //     picDiv.innerHTML = "";
    //     let img = document.createElement("img");
    //     img.src = resizedBase64;
    //     img.style.width = "250px";
    //     img.style.height = "350px";
    //     picDiv.appendChild(img);


    //     // Spara Base64-strängen i en variabel
    //     // som du senare skickar till servern
    //     currentCover = resizedBase64;
    // });
});


//reload books
reloadBooks.addEventListener("click", async function () {
    filterUsed.innerHTML = "";
    await loadBooks(); // vänta tills böckerna laddats om


    // const thisYear = new Date().getFullYear();
    // allBooksThisyear(thisYear);


    reloadBooks.style.visibility = "hidden";
});


//Skapa en bok
addBook.addEventListener("click", function () {
    createABook();
    wipeForm();
});




closeBook.addEventListener("click", function () {
    closeCreateBook();
})


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
        let seriesName = null;
        let seriesNumber = null;
        if (inputIsSeries.checked) {
            seriesName = inputSeriesName.value.trim();
            let numberValue = inputSeriesNumber.value.trim();
            if (numberValue !== "") {
                seriesNumber = Number(numberValue);
                if (isNaN(seriesNumber)) {
                    alert("Series number must be a valid number.");
                    return;
                }
            }
        }

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
            imgsrc: imgUrl,
            summary: bookSummary.value,
            seriesName: seriesName,
            seriesNumber: seriesNumber,
        };

        // Skicka till servern
        let res, savedBook;
        if (window.currentEditingId) {
            // Uppdatera bok
            await supabase
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
            let { data, error } = await supabase
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
        await supabase
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
}


const thisYear = new Date().getFullYear();
allBooksByYear(thisYear);


//Skapa en json-fil av alla böcker, ifall om servern skulle försvinna så vill jag ha koll på mina böcker.


async function createFileOfAllBooks() {
    if (!currentUser) return;

    let books = await loadBooks()();

    const blob = new Blob(
        [JSON.stringify(books, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${currentUser}.json`;
    a.click();

    URL.revokeObjectURL(url);
}


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
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
        appDiv.style.display = "none";
    }

    if (data.user) {
        currentUser = data.user.id;
        who.textContent = data.user.email;
        appDiv.style.display = "inline-block";
        loginBtn.style.display = "none";
        registerButton.style.display = "none";
        loginButton.style.display = "none";
        loadBooks();
    }
}


checkUser();


//Kunna se böckerna i listformat
//två olika knapapr för listvy - en för lista och en för kort

