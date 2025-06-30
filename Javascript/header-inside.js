document.getElementById("headerFront").innerHTML = `
  <header id="headerFront">
    <div id="menuToggle">MENY</div>
    <nav id="topMenu">
      <a class="menyButton" href="../index.html">Hem</a>
      
      <div class="dropdown">
        <button class="dropbtn">Projekt</button>
        <div class="dropdown-content">
          <a href="projekt1.html">Projekt 1</a>
          <a href="projekt2.html">Projekt 2</a>
          <a href="projekt3.html">Projekt 3</a>
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
});
