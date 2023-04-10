function toggleMode() {
    var element = document.body;
    element.classList.toggle("body-dark");
    var elements = document.getElementsByTagName("a");
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.toggle("a-dark");
    }
    var elements = document.getElementsByTagName("b");
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.toggle("b-dark");
    }
    var elements = document.getElementsByTagName("strong");
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.toggle("strong-dark");
    }
    var elements = document.getElementsByClassName("award");
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.toggle("award-dark");
    }
    var elements = document.getElementsByClassName("icon");
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.toggle("icon-dark");
    }
    var element = document.getElementById('mode-toggle');
    element.classList.toggle("fa-moon");
    element.classList.toggle("fa-sun");
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    toggleMode();
}