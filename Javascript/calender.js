function isMobile() {
    return window.matchMedia("(max-width: 800px)").matches;
}


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

    let todayDate = new Date();

    let today = todayDate.getDate();
    let todayMonth = todayDate.getMonth();
    let todayYear = todayDate.getFullYear();

    allDays = document.querySelectorAll(".day");
    allDaysArray = Array.from(allDays);

    dateOfToday.innerHTML = `Dagens datum: ${todayYear} - ${todayMonth + 1} - ${today}`;

    dateOfToday.style.fontSize = "20px";

    if (monthIndex === todayMonth && year === todayYear) {

        rightDay = allDaysArray.find(D => D.textContent == today);

        rightDay.classList.remove("day");
        rightDay.classList.add("rightDay");
    }
}



btnNext.addEventListener("click", function () {
    if (isMobile()) {
        currentDate.setDate(currentDate.getDate() + 7);
        renderWeek(currentDate);
    } else {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentYear, currentMonth);
    }
    test();
});

btnPrev.addEventListener("click", function () {
    if (isMobile()) {
        currentDate.setDate(currentDate.getDate() - 7);
        renderWeek(currentDate);
    } else {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentYear, currentMonth);
    }
    test();
});


// Visa aktuell månad vid start
renderCalendar(currentYear, currentMonth);



//Mobil


function renderCorrectView() {
    if (isMobile()) {
        renderWeek(currentDate);
    } else {
        renderCalendar(currentYear, currentMonth);
    }
}

let currentDate = new Date();

function getWeekDates(date) {
    const day = date.getDay() || 7; // söndag = 7
    const monday = new Date(date);
    monday.setDate(date.getDate() - day + 1);

    const week = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        week.push(d);
    }
    return week;
}

function renderWeek(date) {
    calender.innerHTML = "";

    const weekDates = getWeekDates(date);

    monthName.textContent = `${date.getFullYear()}`;

    weekDates.forEach(d => {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");

        dayDiv.innerHTML = `
            <strong>${d.toLocaleDateString("sv-SE", { weekday: "long" })}</strong>
            <div>${d.getDate()}/${d.getMonth() + 1}</div>
        `;

        calender.appendChild(dayDiv);
    });
}


renderCorrectView();



//Lägga till info i kalendern

let schedule = [];

async function loadSchedule() {
    try {
        const response = await fetch("../schemaHT26.json");
        schedule = await response.json();
        console.log("Schema laddat:", schedule);
    } catch (error) {
        console.error("Kunde inte ladda schema.json", error);
    }
}

loadSchedule();

// function getEventsForDate(date) {
//     const isoDate = date.toISOString().split("T")[0];

//     let hit = schedule.filter(event => event.date === isoDate);

//     console.log(hit)
// }


async function test() {
    const response = await fetch("../schemaHT26.json");
    let schedule = await response.json();

    let allDayDivs = document.querySelectorAll(".day, .rightDay");

    for (let day of schedule) {

        let eventDate = new Date(day.date);

        let dayNumber = eventDate.getDate();
        let monthNumber = eventDate.getMonth();
        let yearNumber = eventDate.getFullYear();

        if (monthNumber === currentMonth && yearNumber === currentYear) {

            for (let div of allDayDivs) {
                let divNumber = Number(div.textContent);

                if (dayNumber === divNumber) {

                    if (day.startTime !== undefined && day.endTime !== undefined) {
                        let time = document.createElement("p");
                        time.innerHTML = `${day.startTime} - ${day.endTime}`;
                        div.appendChild(time);
                    }

                    let course = document.createElement("p");
                    course.style.fontWeight = "bold";
                    course.innerHTML = `Kurs: ${day.course}`;

                    let moment = document.createElement("p");
                    moment.innerHTML = `${day.moment}`;

                    if (day.type) {
                        moment.style.color = "red";
                    }

                    div.appendChild(course);
                    div.appendChild(moment);
                }
            }
        }
    }
}
test();

//loopa igenom shcema.json och sen göra en loop inuti den där man loopat schemat, och om det finns en match så ska innehållet från objektet skrivas in i rutan. 