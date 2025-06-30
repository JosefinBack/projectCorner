document.getElementById("header").innerHTML = `
  <header id="headerFront">
    <div id="menuToggle">MENY</div>
    <nav id="topMenu">
      <a class="menyButton" href="index.html">Hem</a>
      <a class="menyButton" href="HTML/projekt1.html">Projekt 1</a>
      <a class="menyButton" href="HTML/projekt2.html">Projekt 2</a>
      <a class="menyButton" href="HTML/projekt3.html">Projekt 3</a>
      <a class="menyButton" href="HTML/memory.html">Memory</a>
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
});
