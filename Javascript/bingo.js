
const listOfActivites = [
    "Start a fire",
    "Complete the feather collection",
    "Sit on a grown oversized mushroom",
    "Bring back a sim to life",
    "Become enemies with Nancy Landgraab",
    "Paint a maserpiece worth §1000 or more",
    "Catch a bathfish",
    "Become a plantSim",
    "Try to cheer up Tragic Clown",
    "Complete the Grilled Cheese Aspiration",
    "Have §50,000 at once",
    "Grow a cowplant",
    "Take a selfie with Bella Goth",
    "Grow and harvets a Deth flower",
    "Wtite and publish a playful book",
    "Play with the gaming mat",
    "Make 3 other Sims flirty at once",
    "Have WooHoo in a shower",
    "Drink essence from a Cowplant",
    "Make §1000 from a side hustle",
    "Plant and grow any tree",
    "Scare of a burgler by fighting",
    "Convince a Sim to leave their spouse",
    "WooHoo the Grim Raper",
    "Win 5 different fights",
    "Craft a dinning table and 4 chairs",
    "Find free food from a BBQ",
    "Drown a enemy in a pool",
    "Catch 10 unique fish and mount them",
    "Take an angry poop",
    "Fight with Katarina Caliente",
    "Trim the bonsai tree into every shape",
    "Write and publish a song",
]

const bingoBoard = document.getElementById("bingoBoard");
const shuffleButton = document.getElementById("shuffleButton");

function newBoard() {
    const activity = [...listOfActivites];
    bingoBoard.innerHTML = "";

    for (let i = 0; i < 20; i++) {
        const cell = document.createElement("div");
        const div1 = document.createElement("div");
        const div2 = document.createElement("div");

        cell.classList.add("bingoCell");

        let index = Math.floor(Math.random() * activity.length);
        let context = activity[index];
        div2.textContent = context;
        activity.splice(index, 1);

        if (div2.textContent.includes("song")) {
            const img = document.createElement("img");
            img.src = "../Bilder/plumbob.jpg";
            img.style.height = "80px";
            div1.appendChild(img);
        }

        cell.appendChild(div1);
        cell.appendChild(div2);
        bingoBoard.appendChild(cell);
    }
}

shuffleButton.addEventListener("click", function () {
    newBoard();
});


newBoard();