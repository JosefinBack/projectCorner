// === HTML-element ===
let memoryContainer = document.getElementById("memoryContainer");
let newGameButton = document.getElementById("newGame");
let memoryGreta = document.getElementById("pig");
let memoryPaw = document.getElementById("paw");
let memorySpidy = document.getElementById("spidy");
let memoryPettson = document.getElementById("pettson");
let memoryBluey = document.getElementById("bluey");
let main = document.querySelector("main");
let numbers = document.getElementById("numbers");
let pairFour = document.getElementById("pairFour");
let pairSix = document.getElementById("pairSix");
let pairEight = document.getElementById("pairEight");


// === Alla teman ===
let allPicsMemoryGreta = [
    "../Bilder/george.jpg",
    "../Bilder/greta.jpg",
    "../Bilder/mom.jpg",
    "../Bilder/dad.jpg",
    "../Bilder/grandpa-pig.png",
    "../Bilder/granny.jpg",
    "../Bilder/bunny.png",
    "../Bilder/cat.jpg"
];

let allPicsMemoryPawPatrol = [
    "../Bilder/chase.jpg",
    "../Bilder/everest.jpg",
    "../Bilder/marshall.jpg",
    "../Bilder/rocky.jpg",
    "../Bilder/rubble.jpg",
    "../Bilder/sky.jpg",
    "../Bilder/tracker.png",
    "../Bilder/zuma.jpg"
];

let allPicsSpidy = [
    "../Bilder/gwen.jpg",
    "../Bilder/hulk.jpg",
    "../Bilder/friends.jpg",
    "../Bilder/spidy1.jpg",
    "../Bilder/spidy2.jpg",
    "../Bilder/spidy.jpg",
    "../Bilder/spidy3.jpg",
    "../Bilder/hulk1.jpg",
];

let allPicsPettson = [
    "../Bilder/pettson1.jpg",
    "../Bilder/pettson2.jpg",
    "../Bilder/pettson3.jpg",
    "../Bilder/pettson4.jpg",
    "../Bilder/pettson5.jpg",
    "../Bilder/pettson6.jpg",
    "../Bilder/pettson7.jpg",
    "../Bilder/findus.jpg",
];

let allPicsBluey = [
    "../Bilder/bluey2.png",
    "../Bilder/bluey3.jpg",
    "../Bilder/bluey4.jpg",
    "../Bilder/bluey5.png",
    "../Bilder/bluey6.jpg",
    "../Bilder/bluey7.jpg",
    "../Bilder/bluey8.png",
    "../Bilder/bluey9.png",
    "../Bilder/bluey10.png",
    "../Bilder/bluey11.png",
]

// === Speldata ===
let currentThemeImages = [];
let currentTheme = [];
let currentBackImage = "";
let flippedCards = [];
let lockBoard = false;
let pairCount = 4;

// === Funktion: Slumpa bilder ===
function pickRandomImages(imageArray, count) {
    let copy = [...imageArray];
    let picked = [];

    for (let i = 0; i < count && copy.length > 0; i++) {
        const index = Math.floor(Math.random() * copy.length);
        picked.push(copy[index]);
        copy.splice(index, 1);
    }

    return picked;
}

// === Funktion: Starta nytt spel ===
function startNewGame() {
    let memoryWrapper = document.getElementById("memoryWrapper");

    memoryContainer.innerHTML = "";
    flippedCards = [];
    lockBoard = false;

    currentTheme = pickRandomImages(currentThemeImages, pairCount);

    memoryWrapper.style.display = "flex";
    memoryContainer.style.border = "1px solid black";
    newGameButton.style.display = "flex";
    numbers.style.display = "flex";
    main.appendChild(memoryWrapper);
    memoryCards();
}

// === Funktion: välj antal par ===
pairFour.addEventListener("click", function () {
    pairCount = 4;
    if (currentThemeImages.length) {
        startNewGame();
    }
});

pairSix.addEventListener("click", function () {
    pairCount = 6;
    if (currentThemeImages.length) {
        startNewGame();
    }
});

pairEight.addEventListener("click", function () {
    pairCount = 8;
    if (currentThemeImages.length) {
        startNewGame();
    }
});

// === Event listeners för teman ===
memoryGreta.addEventListener("click", function () {
    currentBackImage = "../Bilder/house.jpg";
    currentThemeImages = allPicsMemoryGreta;
    startNewGame();
});

memoryPaw.addEventListener("click", function () {
    currentBackImage = "../Bilder/paw.png";
    currentThemeImages = allPicsMemoryPawPatrol;
    startNewGame();
});

memorySpidy.addEventListener("click", function () {
    currentBackImage = "../Bilder/spidyLogo.png";
    currentThemeImages = allPicsSpidy;
    startNewGame();
});

memoryPettson.addEventListener("click", function () {
    currentBackImage = "../Bilder/pettsonBakgrund.jpg";
    currentThemeImages = allPicsPettson;
    startNewGame();
});

memoryBluey.addEventListener("click", function () {
    currentBackImage = "../Bilder/BlueyLogo.jpg";
    currentThemeImages = allPicsBluey;
    startNewGame();
    numbers.style.display = "flex";
});

// === Event listener för Nytt spel ===
newGameButton.addEventListener("click", function () {
    let allCards = document.querySelectorAll(".card");

    // Vänta kort innan spelplanen nollställs
    setTimeout(() => {
        for (let memoryCard of allCards) {
            memoryCard.classList.remove("flipped");
        }

        setTimeout(() => {
            startNewGame();
        }, 500);

    }, 500);
});

// === Funktion: Bygg korten ===
function memoryCards() {
    // Skapa par
    let memoryPairs = [];
    for (let i = 0; i < currentTheme.length; i++) {
        memoryPairs.push(currentTheme[i]);
        memoryPairs.push(currentTheme[i]);
    }

    // Blanda
    let shuffledPics = [];
    while (memoryPairs.length > 0) {
        const index = Math.floor(Math.random() * memoryPairs.length);
        shuffledPics.push(memoryPairs[index]);
        memoryPairs.splice(index, 1);
    }

    // Skapa kort
    for (let i = 0; i < shuffledPics.length; i++) {
        let card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <div class="card-inner"> 
                <div class="card-front" style="background-image: url('${currentBackImage}');"></div>
                <div class="card-back" style="background-image: url('${shuffledPics[i]}');"></div>
            </div>
        `;
        card.dataset.image = shuffledPics[i];
        memoryContainer.appendChild(card);
    }

    // Lägg till klickhantering
    let allCards = document.querySelectorAll(".card");

    for (let i = 0; i < allCards.length; i++) {
        let card = allCards[i];

        card.addEventListener("click", function () {
            if (lockBoard || card.classList.contains("matched") || card.classList.contains("flipped")) {
                return;
            }

            card.classList.add("flipped");
            flippedCards.push(card);

            if (flippedCards.length === 2) {
                lockBoard = true;

                const [card1, card2] = flippedCards;
                const img1 = card1.dataset.image;
                const img2 = card2.dataset.image;

                if (img1 === img2) {
                    card1.classList.add("matched");
                    card2.classList.add("matched");
                    new Audio("../Ljud/win.wav").play();
                    flippedCards = [];
                    lockBoard = false;
                } else {
                    setTimeout(() => {
                        card1.classList.remove("flipped");
                        card2.classList.remove("flipped");
                        flippedCards = [];
                        lockBoard = false;
                    }, 1000);
                }
            }
        });
    }
}
