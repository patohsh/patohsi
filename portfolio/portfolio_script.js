// --- 전역 변수 ---
const itemsPerPage = 8; // 한 페이지당 8개
let currentPage = 1;
let currentYear = '2025'; // 초기 연도
let currentCategory = 'all'; // 초기 카테고리

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    renderGallery();
});

// --- 필터 설정 함수 ---
// type: 'year' 또는 'category'
function setFilter(value, type) {
    if (type === 'year') {
        currentYear = value;
        // 연도 버튼 스타일 업데이트
        const btns = document.querySelectorAll('.year-btn');
        btns.forEach(btn => {
            if (btn.textContent.trim() === value) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    } else if (type === 'category') {
        currentCategory = value;
        // 카테고리 버튼 스타일 업데이트
        const btns = document.querySelectorAll('.cat-btn');
        btns.forEach(btn => {
            // 버튼 텍스트가 'WORK' 등 대문자이므로 대소문자 구분 없이 비교
            if (btn.textContent.trim().toUpperCase() === value.toUpperCase()) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        // 'ALL' 버튼 처리 (값이 all일 때)
        if (value === 'all') {
            btns.forEach(btn => {
                if (btn.textContent.trim() === 'ALL') btn.classList.add('active');
            });
        }
    }

    // 필터 변경 시 1페이지로
    currentPage = 1;
    renderGallery();
}

// --- 페이지 변경 ---
function changePage(direction) {
    const filteredItems = getFilteredItems();
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    const nextPage = currentPage + direction;
    if (nextPage >= 1 && nextPage <= totalPages) {
        currentPage = nextPage;
        renderGallery();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// --- 필터링된 아이템 가져오기 ---
function getFilteredItems() {
    const allItems = Array.from(document.querySelectorAll('.gallery-card'));

    return allItems.filter(item => {
        const itemYear = item.dataset.year;
        const itemCat = item.dataset.category; // html엔 소문자로 기입 권장

        const yearMatch = (itemYear === currentYear);
        const catMatch = (currentCategory === 'all' || itemCat === currentCategory);

        return yearMatch && catMatch;
    });
}

// --- 렌더링 ---
function renderGallery() {
    const allItems = document.querySelectorAll('.gallery-card');
    const filteredItems = getFilteredItems();

    // 1. 일단 모두 숨김
    allItems.forEach(item => item.style.display = 'none');

    // 2. 현재 페이지 아이템만 표시
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredItems.slice(startIndex, endIndex);

    pageItems.forEach(item => {
        item.style.display = 'flex'; // grid 안에서 flex로 보임 (CSS 참조)
    });

    // 3. 버튼 상태 업데이트
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    document.getElementById('prevBtn').disabled = (currentPage === 1);
    document.getElementById('nextBtn').disabled = (currentPage >= totalPages || totalPages === 0);
}

// --- 네비게이션 ---
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