var supabaseClient = window.supabase.createClient(
    "https://qciftuisfloydqxgrdrt.supabase.co",
    "sb_publishable_m1PZazpxmQepEPbktVMzZA_YusPeIWL"
);

let main = document.querySelector("main");
let backToBooks = document.getElementById("backToBooks");
let drawingSpace = document.getElementById("drawingSpace");

//Diagram för genre

let h1 = document.createElement("h1");
h1.innerHTML = `Hur många böcker inom varje genre`;
drawingSpace.append(h1);

async function getBooksAndGenre() {
    let { data, error } = await supabaseClient
        .from("books")
        .select("genre, title");

    if (error) {
        console.error(error);
        return [];
    }
    return data;
}

function prepareData(bookArray) {
    return bookArray.map(function (book) {
        return book.genre.split(",")[0].trim();
    });
};

async function start() {
    let bookArray = await getBooksAndGenre();
    let genres = prepareData(bookArray);
    drawChart(genres);
};
start();

function drawChart(genres) {
    const hSvg = 400;
    const wSvg = 800;
    const hPad = 50;
    const wPad = 100;

    let genreCount = {};

    for (let genre of genres) {
        if (!genreCount[genre]) {
            genreCount[genre] = 0;
        }
        genreCount[genre]++;
    }

    let dataset = [];

    for (let genre in genreCount) {
        let count = genreCount[genre];

        dataset.push({
            genre: genre,
            count: count
        });
    }

    let svg = d3.select("#drawingSpace")
        .append("svg")
        .attr("height", hSvg)
        .attr("width", wSvg)




};



//Hämta info från databasen för att skapa data