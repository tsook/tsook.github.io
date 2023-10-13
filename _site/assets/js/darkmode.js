function toggleMode() {
    var element = document.body;
    element.classList.toggle("body-mode");
    var elements = document.getElementsByTagName("a");
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.toggle("a-mode");
    }
    var elements = document.getElementsByTagName("b");
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.toggle("b-mode");
    }
    var elements = document.getElementsByTagName("strong");
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.toggle("strong-mode");
    }
    var elements = document.getElementsByClassName("award");
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.toggle("award-mode");
    }
    var elements = document.getElementsByClassName("icon");
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.toggle("icon-mode");
    }
    var moon = document.getElementById('mode-toggle-moon');
    var moonDisplay = getComputedStyle(moon).display;
    moon.style.display = moonDisplay == "none" ? "inherit" : "none";
    var sun = document.getElementById('mode-toggle-sun');
    var sunDisplay = getComputedStyle(sun).display;
    sun.style.display = sunDisplay == "none" ? "inherit" : "none";
}

// if check prefered scheme
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    var moon = document.getElementById('mode-toggle-moon');
    moon.style.display = "inherit";
    var sun = document.getElementById('mode-toggle-sun');
    sun.style.display = "none";
}
