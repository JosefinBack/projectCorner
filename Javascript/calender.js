let calender = document.getElementById("calender");

// let month = ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"]; 

let month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
let array = []

//Skapa en div för varje dag
function createDayDiv(monthIndex) {
    let daysInMonth = month[monthIndex];
    for (let i = 1; i <= daysInMonth; i++) {
        let calenderDayDiv = document.createElement("div");
        calenderDayDiv.classList.add("day");
        calenderDayDiv.innerHTML = `${i}/ ${monthIndex + 1}`;
        calender.appendChild(calenderDayDiv);
    }
};
createDayDiv(4);



console.log(array);


