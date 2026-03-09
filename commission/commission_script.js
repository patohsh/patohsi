// 언어 설정 함수
function setLanguage(lang) {
    // 1. 모든 lang-text 클래스를 가진 요소 찾기
    const elements = document.querySelectorAll('.lang-text');

    // 2. 각 요소의 텍스트를 해당 언어의 data 속성 값으로 교체
    elements.forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if (text) {
            el.innerText = text;
        }
    });

    // 3. 버튼 스타일 업데이트
    const buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(`'${lang}'`)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// 기존 네비게이션 관련 함수들
function toggleNav() {
    document.getElementById('main-nav').classList.toggle('active');
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', function (event) {
    const navWrapper = document.querySelector('.bottom-nav-wrapper');
    const navBar = document.getElementById('main-nav');

    if (navWrapper && !navWrapper.contains(event.target) && navBar.classList.contains('active')) {
        navBar.classList.remove('active');
    }
});