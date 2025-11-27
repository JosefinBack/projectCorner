// let calender = document.getElementById("calender");

// // let month = ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"]; 

// let month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
// let array = []

// //Skapa en div för varje dag
// function createDayDiv(monthIndex) {
//     let daysInMonth = month[monthIndex];
//     for (let i = 1; i <= daysInMonth; i++) {
//         let calenderDayDiv = document.createElement("div");
//         calenderDayDiv.classList.add("day");
//         calenderDayDiv.innerHTML = `${i}/ ${monthIndex + 1}`;
//         calender.appendChild(calenderDayDiv);
//     }
// };
// createDayDiv(4);
// console.log(array);




const calender = document.getElementById("calender");
const monthNameEl = document.getElementById("monthName");
const btnPrev = document.getElementById("prevMonth");
const btnNext = document.getElementById("nextMonth");

const months = [
    "Januari", "Februari", "Mars", "April", "Maj", "Juni",
    "Juli", "Augusti", "September", "Oktober", "November", "December"
];

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

function renderCalendar(year, monthIndex) {
    calender.innerHTML = ""; // töm kalendern
    monthNameEl.textContent = `${months[monthIndex]} ${year}`;

    // Hämta antal dagar i månaden
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    // Hämta veckodagen för första dagen (0=sön, 1=mån...)
    let firstDay = new Date(year, monthIndex, 1).getDay();
    if (firstDay === 0) firstDay = 7; // gör söndag till 7

    // Skapa tomma rutor innan första dagen (för att rätta uppstart)
    for (let i = 1; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.classList.add("day");
        empty.style.border = "none";
        calender.appendChild(empty);
    }

    // Skapa dagrutor
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");
        dayDiv.textContent = i;
        calender.appendChild(dayDiv);
    }
}

// Byt månad framåt
btnNext.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
});

// Byt månad bakåt
btnPrev.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
});

// Visa aktuell månad vid start
renderCalendar(currentYear, currentMonth);

