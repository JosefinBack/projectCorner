
const listOfActivites = [
    "Start a fire",
    "Complete the feather collection",
    "Sit on a grown oversized mushroom",
    "Bring back a sim to life",
]

const bingoBoard = document.getElementById("bingoBoard");
const shuffleButton = document.getElementById("shuffleButton");

function newBoard() {
    const activity = [...listOfActivites];
    bingoBoard.innerHTML = "";

    for (let i = 0; i < 20; i++) {
        const cell = document.createElement("div");
        cell.classList.add("bingoCell");

        let index = Math.floor(Math.random() * activity.length);
        let context = activity[index];
        cell.textContent = context;
        activity.splice(index, 1);

        bingoBoard.appendChild(cell);
    }
}

shuffleButton.addEventListener("click", function () {
    newBoard();
});


newBoard();