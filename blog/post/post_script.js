// 네비게이션 토글
function toggleNav() {
    const navBar = document.getElementById('main-nav');
    navBar.classList.toggle('active');
}

// 스크롤 탑
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 외부 클릭 시 네비게이션 닫기
document.addEventListener('click', function (event) {
    const navWrapper = document.querySelector('.bottom-nav-wrapper');
    const navBar = document.getElementById('main-nav');

    // 네비게이션 바가 열려있고, 클릭한 곳이 네비게이션 내부가 아니라면 닫기
    if (navWrapper && !navWrapper.contains(event.target) && navBar.classList.contains('active')) {
        navBar.classList.remove('active');
    }
});