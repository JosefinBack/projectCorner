var supabaseClient = window.supabase.createClient(
    "https://qciftuisfloydqxgrdrt.supabase.co",
    "sb_publishable_m1PZazpxmQepEPbktVMzZA_YusPeIWL"
);

let main = document.querySelector("main");
let backToBooks = document.getElementById("backToBooks");
let drawingSpace = document.getElementById("drawingSpace");

let buttonStatsDiv = document.getElementById("ButtonsStats");
let genreButton = document.getElementById("genreButton");
let monthButton = document.getElementById("monthButton");


genreButton.addEventListener("click", function () {
    diagramGenre();
});

monthButton.addEventListener("click", function () {
    diagramBooksPerMonth();
});


//Diagram för genre
function diagramGenre() {
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

        let allGenres = [];
        for (let genre of dataset) {
            if (!allGenres.includes(genre.genre)) {
                allGenres.push(genre.genre);
            };
        };

        let maxNumber = 0;
        for (let item of dataset) {
            if (item.count > maxNumber) {
                maxNumber = item.count;
            };
        };

        let svg = d3.select("#drawingSpace")
            .append("svg")
            .attr("height", hSvg)
            .attr("width", wSvg)

        let xScale = d3.scaleBand()
            .domain(allGenres)
            .range([wPad, wSvg - wPad])
            .paddingInner(0.2)
            .paddingOuter(0.1)

        let yScale = d3.scaleLinear()
            .domain([0, maxNumber + 5])
            .range([hSvg - hPad, hPad])

        let selction = svg.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("height", d => (hSvg - hPad) - yScale(d.count))
            .attr("width", xScale.bandwidth())
            .attr("x", d => xScale(d.genre))
            .attr("y", d => yScale(d.count))
            .attr("fill", "lightpink")
            ;

        svg.selectAll("text")
            .data(dataset)
            .enter()
            .append("text")
            .text(d => d.count)
            .attr("x", d => xScale(d.genre) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d.count) - 10)
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .attr("font-size", "20px")

        let xAxel = d3.axisBottom(xScale);
        let yAxel = d3.axisLeft(yScale);

        svg.append("g")
            .call(xAxel)
            .attr("transform", `translate(0, ${hSvg - hPad})`);

        svg.append("g")
            .call(yAxel)
            .attr("transform", `translate(${wPad}, 0)`);
    };
};


//diagram för böcker per månad
function diagramBooksPerMonth() {
    let h1 = document.createElement("h1");
    h1.innerHTML = `Avslutade böcker per månad`;
    drawingSpace.append(h1);

    let divYearsButton = document.createElement("div");
    let button2025 = document.createElement("button");
    button2025.textContent = "2025";
    divYearsButton.append(button2025);

    let button2026 = document.createElement("button");
    button2026.textContent = "2026";
    divYearsButton.append(button2026);

    drawingSpace.append(divYearsButton);

    button2025.addEventListener("click", function () {
        prepareData(2025);
    });

    button2026.addEventListener("click", function () {
        prepareData(2026);
    });

    async function getBooks() {
        let { data, error } = await supabaseClient
            .from("books")
            .select("title, finish");

        if (error) {
            console.error(error);
            return [];
        };
        return data;
    };

    async function prepareData() {
        let bookArray = await getBooks();
        drawChart(bookArray);
    };

    function drawChart(bookArray, year) {
        const hSvg = 400;
        const wSvg = 800;
        const hPad = 50;
        const wPad = 100;

        let yearFinish = new Date(book.finish).getFullYear();

        let books2025 = [];
        let books2026 = [];
        console.log(bookArray)

        for (let book of bookArray) {

            if (yearFinish === 2025) {
                books2025.push(book);
            } else if (yearFinish === 2026) {
                books2026.push(book);
            }
        };

        let booksInEachMonth = {};

        if (yearFinish === year) {
            let svg = d3.selectAll("#drawingspace")
                .append("svg")
                .attr("height", hSvg)
                .attr("width", wSvg)
        }


        console.log(books2025)
        console.log(books2026)
    }



};
diagramBooksPerMonth()

