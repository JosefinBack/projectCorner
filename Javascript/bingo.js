
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
    "Write and publish a playful book",
    "Play with the gaming mat",
    "Make 3 other Sims flirty at once",
    "Drink essence from a Cowplant",
    "Make §1000 from a side hustle",
    "Plant and grow any tree",
    "Scare of a burgler by fighting",
    "Convince a Sim to leave their spouse",
    "Win 5 different fights",
    "Craft a dinning table and 4 chairs",
    "Find free food from a BBQ",
    "Drown a enemy in a pool",
    "Catch 10 unique fish and mount them",
    "Take an angry poop",
    "Fight with Katarina Caliente",
    "Trim the bonsai tree into every shape",
    "Write and publish a song",
    "Catch a treefish",
    "Train a pat to learn all 8 skills",
    "Befriend a flock of birds",
    "Host a gold dinner party",
    "Complete a Henford-onBagley errand",
    "Transform into a Occult Sim",
    "Break into a sim's house",
    "Shower in the rain",
    "WooHoo in a dumpster",
    "Gift a homegrown lilly",
    "Complete any aspiration",
    "Mix 10 drinks",
    "Spend §10,000 on a renovation",
    "Plant and grow any tree",
    "Death by drowning",
    "Death by fire",
    "Death by anger",
    "Death by freezing",
    "Death by meteorite",
    "Death by Cowplant",
    "Death by old age",
    "Death by flies",
    "Death by hunger",
    "WooHoo the Grim Raper",
    "Have WooHoo in a shower",
    "WooHoo in space",
    "Woohoo in a tent",
    "WooHoo in a pile of leaves",
    "WooHoo in a hot tub",
    "Have WooHoo in a sauna",
    "Have WooHoo in a the lighthouse",
    "WooHoo in the Money vault",
    "Woohoo with a ghost",
]

const bingoBoard = document.getElementById("bingoBoard");
const shuffleButton = document.getElementById("shuffleButton");

const ROWS = 5;
const COLS = 5;
const completedLines = new Set(); // minne för redan utlösta bingos


bingoBoard.addEventListener("click", (e) => {
    // Hitta närmaste klickade element som är en bingoruta,
    // funkar även om man klickar på barn-element (div1/div2/img)
    const cell = e.target.closest(".bingoCell");
    if (!cell || !bingoBoard.contains(cell)) return;

    cell.classList.toggle("done");

    const row = cell.dataset.row;
    const col = cell.dataset.col;
    checkBingo(row, col);
});


function newBoard() {
    completedLines.clear();
    const activity = [...listOfActivites];
    bingoBoard.innerHTML = "";

    for (let i = 0; i < ROWS * COLS; i++) {
        const cell = document.createElement("div");
        const div1 = document.createElement("div");
        const div2 = document.createElement("div");

        cell.classList.add("bingoCell");

        const row = Math.floor(i / COLS);
        const col = i % COLS;
        cell.dataset.row = String(row);
        cell.dataset.col = String(col);


        let index = Math.floor(Math.random() * activity.length);
        let context = activity[index];
        div2.textContent = context;
        activity.splice(index, 1);

        if (div2.textContent.includes("song")) {
            const img = document.createElement("img");
            img.src = "../Bilder/sims/plumbob.jpg";
            img.style.height = "80px";
            div1.appendChild(img);
        }

        if (div2.textContent.includes("§")) {
            const img = document.createElement("img");
            img.src = "../Bilder/sims/simolion.jpg";
            img.style.height = "80px";
            div1.appendChild(img);
        }

        if (div2.textContent.includes("Death")) {
            const img = document.createElement("img");
            img.src = "../Bilder/sims/ghost.jpg";
            img.style.height = "80px";
            div1.appendChild(img);
        }

        if (div2.textContent.includes("WooHoo") || div2.textContent.toLowerCase().startsWith("woohoo")) {
            const img = document.createElement("img");
            img.src = "../Bilder/sims/heart.jpg";
            img.style.height = "80px";
            div1.appendChild(img);
        }

        if (div2.textContent.includes("cowplant")) {
            const img = document.createElement("img");
            img.src = "../Bilder/sims/cowplant.jpg";
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
    bingoBoard.style.display = "grid";
});

function checkBingo(row, col) {
    const cells = document.querySelectorAll(".bingoCell");
    const rNum = Number(row);
    const cNum = Number(col);

    // === Rad ===
    let rowFull = true;
    for (let i = 0; i < cells.length; i++) {
        if (Number(cells[i].dataset.row) === rNum) {
            if (!cells[i].classList.contains("done")) rowFull = false;
        }
    }
    if (rowFull) {
        const key = `R${rNum}`;
        if (!completedLines.has(key)) {
            completedLines.add(key);
            alert("BINGO på rad!");
        }
    }

    // === Kolumn ===
    let colFull = true;
    for (let i = 0; i < cells.length; i++) {
        if (Number(cells[i].dataset.col) === cNum) {
            if (!cells[i].classList.contains("done")) colFull = false;
        }
    }
    if (colFull) {
        const key = `C${cNum}`;
        if (!completedLines.has(key)) {
            completedLines.add(key);
            alert("BINGO på kolumn!");
        }
    }

    // === Diagonaler (alltid 5x5) — kolla bara om klicken ligger på diagonalen ===
    // Huvuddiagonal: r == c
    if (rNum === cNum) {
        let d1Full = true;
        for (let i = 0; i < ROWS; i++) {
            const el = document.querySelector(`.bingoCell[data-row="${i}"][data-col="${i}"]`);
            if (!el.classList.contains("done")) d1Full = false;
        }
        if (d1Full) {
            const key = `D0`;
            if (!completedLines.has(key)) {
                completedLines.add(key);
                alert("BINGO på diagonal!");
            }
        }
    }

    // Motdiagonal: r + c == COLS - 1 (dvs 4)
    if (rNum + cNum === COLS - 1) {
        let d2Full = true;
        for (let i = 0; i < ROWS; i++) {
            const j = COLS - 1 - i;
            const el = document.querySelector(`.bingoCell[data-row="${i}"][data-col="${j}"]`);
            if (!el.classList.contains("done")) d2Full = false;
        }
        if (d2Full) {
            const key = `D1`;
            if (!completedLines.has(key)) {
                completedLines.add(key);
                alert("BINGO på diagonal!");
            }
        }
    }
}
