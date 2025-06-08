
let memoryContainer = document.getElementById("memoryContainer")

let allPicsMemory = [
    "../Bilder/george.jpg",
    "../Bilder/greta.jpg",
    "../Bilder/mom.jpg",
    "../Bilder/dad.jpg"
]

//skapa par av alla bilder
let memoryPairs = [];
for (let i = 0; i < allPicsMemory.length; i++) {
    memoryPairs.push(allPicsMemory[i]);
    memoryPairs.push(allPicsMemory[i]);
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
    card.style.backgroundImage = `url(${shuffledPics[i]})`;
    memoryContainer.appendChild(card);
}