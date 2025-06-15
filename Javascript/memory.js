let memoryContainer = document.getElementById("memoryContainer");
let newGameButton = document.getElementById("newGame");
let memoryGreta = document.getElementById("pig");
let memoryPaw = document.getElementById("paw");
let chooseTheme = document.createElement("div");
let currentTheme = [];
let currentBackImage;

memoryGreta.addEventListener("click", function () {
    let memoryWrapper = document.getElementById("memoryWrapper");
    let memoryContainer = document.getElementById("memoryContainer");
    currentBackImage = "../Bilder/house.jpg";

    memoryContainer.innerHTML = "";
    flippedCards = [];
    lockBoard = false;

    currentTheme = allPicsMemoryGreta;
    memoryWrapper.style.display = "flex";
    memoryContainer.style.border = "1px solid black";
    newGameButton.style.display = "flex";
    memoryCards();
});

memoryPaw.addEventListener("click", function () {
    let memoryWrapper = document.getElementById("memoryWrapper");
    let memoryContainer = document.getElementById("memoryContainer");
    currentBackImage = "../Bilder/paw.png";

    memoryContainer.innerHTML = "";
    flippedCards = [];
    lockBoard = false;

    let pawCopy = [...allPicsMemoryPawPatrol];
    let picked = [];

    for (let i = 0; i < 4 && pawCopy.length > 0; i++) {
        const index = Math.floor(Math.random() * pawCopy.length);
        picked.push(pawCopy[index]);
        pawCopy.slice(index, 1);
    };

    currentTheme = picked;
    memoryWrapper.style.display = "flex";
    memoryContainer.style.border = "1px solid black";
    newGameButton.style.display = "flex";
    memoryCards();
});

newGameButton.addEventListener("click", function () {
    let allCards = document.querySelectorAll(".card");

    // Låt korten stå uppvända i 1 sekund (visuellt)
    setTimeout(() => {
        for (let memoryCard of allCards) {
            memoryCard.classList.remove("flipped");  // detta triggar flip-animationen tillbaka
        }

        // Efter ytterligare 0.5 sekunder, rensa spelplan och starta nytt spel
        setTimeout(() => {
            memoryContainer.innerHTML = ``;
            flippedCards = [];     // nollställ tidigare klickade kort
            lockBoard = false;
            memoryCards();         // skapa nytt spel
        }, 500); // matcha animationens varaktighet (0.5s i CSS)

    }, 500);
});

chooseTheme.classList.add("button");
chooseTheme.textContent = "Byta tema på memory";
memoryWrapper.appendChild(chooseTheme);

let allPicsMemoryGreta = [
    "../Bilder/george.jpg",
    "../Bilder/greta.jpg",
    "../Bilder/mom.jpg",
    "../Bilder/dad.jpg"
]

let allPicsMemoryPawPatrol = [
    "../Bilder/chase.jpg",
    "../Bilder/everest.jpg",
    "../Bilder/marshall.jpg",
    "../Bilder/rocky.jpg",
    "../Bilder/rubble.jpg",
    "../Bilder/sky.jpg",
    "../Bilder/tracker.png",
    "../Bilder/zuma.jpg"
]

function memoryCards() {
    //skapa par av alla bilder
    let memoryPairs = [];
    for (let i = 0; i < currentTheme.length; i++) {
        memoryPairs.push(currentTheme[i]);
        memoryPairs.push(currentTheme[i]);
    }

    //blanda alla kort
    let shuffledPics = [];
    while (memoryPairs.length > 0) {
        const index = Math.floor(Math.random() * memoryPairs.length);
        const pickedCard = memoryPairs[index];
        shuffledPics.push(pickedCard);
        memoryPairs.splice(index, 1);
    }

    for (let i = 0; i < shuffledPics.length; i++) {
        let card = document.createElement("div");
        card.classList.add("card");
        let backImage = currentBackImage;
        card.innerHTML = `
            <div class = "card-inner"> 
                <div class="card-front" style="background-image: url('${backImage}');"></div>
                <div class="card-back" style="background-image: url(${shuffledPics[i]});"></div>
        </div>
        `;
        card.dataset.image = shuffledPics[i];
        memoryContainer.appendChild(card);
    }


    //vänd på korten
    let flippedCards = [];
    let lockBoard = false;

    let allCards = document.querySelectorAll(".card");

    for (let i = 0; i < allCards.length; i++) {
        let card = allCards[i];

        card.addEventListener("click", function () {
            if (lockBoard ||
                card.classList.contains("matched") ||
                card.classList.contains("flipped")) { return; }

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


//functionsanrop

