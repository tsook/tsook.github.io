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
    var element = document.getElementById('mode-toggle');
    element.classList.toggle("fa-moon");
    element.classList.toggle("fa-sun");
}

// if check prefered scheme
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    var element = document.getElementById('mode-toggle');
    element.classList.toggle("fa-moon");
    element.classList.toggle("fa-sun");
}