document.getElementById("headerFront").innerHTML = `
  <header id="headerFront">
    <div id="menuToggle">MENY</div>
    <nav id="topMenu">
      <a class="menyButton" href="../index.html">Hem</a>
      
      <div class="dropdown">
        <div class="menyButton">Projekt</div>
        <div class="dropdown-content">
          <a href="projekt1.html">Projekt 1</a>
          <a href="books.html">Book journal</a>
          <a href="calender.html">Calender</a>
          <a href="memory.html">Memory</a>
        </div>
      </div>

      <a class="menyButton" href="about.html">Om mig</a>
    </nav>
  </header>
`;

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menuToggle");
  const menu = document.getElementById("topMenu");

  if (menuToggle && menu) {
    menuToggle.addEventListener("click", function () {
      menu.classList.toggle("show");
    });
  }

  const projektBtn = document.querySelector(".dropdown .menyButton");
  const dropdownContent = document.querySelector(".dropdown-content");

  if (projektBtn && dropdownContent) {
    projektBtn.addEventListener("click", function (event) {
      event.stopPropagation(); // Förhindra att klicket stängs av något annat
      dropdownContent.classList.toggle("show");
    });

    // Stäng dropdown när man klickar utanför
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".dropdown")) {
        dropdownContent.classList.remove("show");
      }
    });
  }
});
