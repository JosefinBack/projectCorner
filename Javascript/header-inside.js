document.getElementById("header").innerHTML = `
  <header id="headerFront">
    <div id="menuToggle">MENY</div>
    <nav id="topMenu">
      <a class="menyButton" href="../index.html">Hem</a>
      <a class="menyButton" href="projekt1.html">Projekt 1</a>
      <a class="menyButton" href="projekt2.html">Projekt 2</a>
      <a class="menyButton" href="projekt3.html">Projekt 3</a>
      <a class="menyButton" href="memory.html">Memory</a>
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
