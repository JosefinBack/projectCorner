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


let main = document.querySelector("main");

const calender = document.getElementById("calender");
const monthName = document.getElementById("monthName");
const btnPrev = document.getElementById("prevMonth");
const btnNext = document.getElementById("nextMonth");
const dateOfToday = document.getElementById("dateToday");

const months = [
    "Januari", "Februari", "Mars", "April", "Maj", "Juni",
    "Juli", "Augusti", "September", "Oktober", "November", "December"
];

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

function renderCalendar(year, monthIndex) {
    calender.innerHTML = "";
    monthName.textContent = `${months[monthIndex]} ${year}`;

    // Hämta antal dagar i månaden
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    // Hämta veckodagen för första dagen (0=sön, 1=mån...)
    let firstDay = new Date(year, monthIndex, 1).getDay();
    if (firstDay === 0) firstDay = 7; // gör söndag till 7


    // Skapa tomma rutor innan första dagen (för att rätta uppstart)
    for (let i = 1; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.style.border = "1px solid lightgrey";
        calender.appendChild(empty);
    }

    // Skapa dagrutor
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");
        dayDiv.textContent = i;
        calender.appendChild(dayDiv);
    }

    let lastDay = new Date(year, monthIndex + 1, 0).getDay();
    if (lastDay === 0) lastDay = 7; // söndag = 7
    let emptyBoxes = 7 - lastDay;

    for (let i = 0; i < emptyBoxes; i++) {
        const empty = document.createElement("div");
        empty.style.border = "1px solid lightgrey";
        calender.appendChild(empty);
    }

    let today = new Date().getDate();
    allDays = document.querySelectorAll(".day");
    allDaysArray = Array.from(allDays);

    todayMonth = new Date().getMonth() + 1

    dateOfToday.innerHTML = `
    Dagens datum: ${currentYear} - ${todayMonth} - ${today}`
    dateOfToday.style.fontSize = "20px"

    for (let i = 1; i < daysInMonth; i++) {
        if (i == today) {
            rightDay = allDaysArray.find(D => D.textContent == i);
            rightDay.classList.remove("day")
            rightDay.classList.add("rightDay")
        }
    }
}


// Byt månad framåt
btnNext.addEventListener("click", function () {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
});

// Byt månad bakåt
btnPrev.addEventListener("click", function () {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
});

// Visa aktuell månad vid start
renderCalendar(currentYear, currentMonth);


async function getSchedualDate() {
    let result = await fetch("../schema.json");
    let events = await result.json();

    console.log(events)
}

getSchedualDate()


let edit = document.getElementById("edit");


edit.addEventListener("click", function () {
    window.location.href = "calenderEdit.html"
})
