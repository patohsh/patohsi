function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleNav() {
    const navBar = document.getElementById('main-nav');
    navBar.classList.toggle('active');
}

document.addEventListener('click', function (event) {
    const navWrapper = document.querySelector('.bottom-nav-wrapper');
    const navBar = document.getElementById('main-nav');
    if (!navWrapper.contains(event.target) && navBar.classList.contains('active')) {
        navBar.classList.remove('active');
    }
});

const slides = document.querySelectorAll('.slide');
const timerBar = document.querySelector('.timer-bar');
let currentSlide = 0;
const slideInterval = 5000;

function startSlideshow() {
    timerBar.classList.add('timer-animate');
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');

        timerBar.classList.remove('timer-animate');
        void timerBar.offsetWidth;
        timerBar.classList.add('timer-animate');
    }, slideInterval);
}
window.onload = startSlideshow;