
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

