
let addBook = document.getElementById("addBook");
let closeBook = document.getElementById("close");
let starContainers = document.getElementsByClassName("stars");
let createBook = document.getElementById("createBook");


//functions
function createABook() {
    createBook.style.display = "block";
}

function closeCreateook() {
    createBook.style.display = "none";
}

addBook.addEventListener("click", function () {
    createABook();
});

closeBook.addEventListener("click", function () {
    closeCreateook();
})

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

