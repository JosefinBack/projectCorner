document.getElementById("headerFront").innerHTML = `
  <header id="headerFront">
    <div id="menuToggle">MENY</div>
    <nav id="topMenu">
      <a class="menyButton" href="index.html">Hem</a>

      <div class="dropdown">
        <div class="menyButton">Projekt</div>
        <div class="dropdown-content">
          <a href="HTML/projekt1.html">Projekt 1</a>
          <a href="HTML/projekt2.html">Projekt 2</a>
          <a href="HTML/projekt3.html">Projekt 3</a>
          <a href="HTML/memory.html">Memory</a>
        </div>
      </div>

      <a class="menyButton" href="HTML/about.html">Om mig</a>
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
