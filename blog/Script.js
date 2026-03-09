// --- 전역 변수 설정 ---
const itemsPerPage = 5; // 페이지당 5개
let currentPage = 1;
let currentCategory = 'all';
let currentYear = 'all';
let allPostElements = []; // 모든 포스트 요소를 저장할 배열

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // DOM에서 모든 포스트 가져와서 배열로 저장
    allPostElements = Array.from(document.querySelectorAll('.post-item'));

    // 초기 렌더링
    renderPosts();
});

// --- 필터 설정 함수 ---
// type: 'category' 또는 'year'
function setFilter(value, type) {
    if (type === 'category') {
        currentCategory = value;
    } else if (type === 'year') {
        currentYear = value;
        // 연도 버튼 스타일 업데이트
        const yearBtns = document.querySelectorAll('.year-text');
        yearBtns.forEach(btn => btn.classList.remove('active'));
        const activeBtn = Array.from(yearBtns).find(b => b.textContent === value || (value === 'all' && b.textContent === 'ALL'));
        if (activeBtn) activeBtn.classList.add('active');
    }

    // 필터가 바뀌면 1페이지로 리셋하고 다시 렌더링
    currentPage = 1;
    renderPosts();
}
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
// --- 페이지 변경 함수 (< > 버튼 클릭 시) ---
function changePage(direction) {
    // 필터링된 목록의 총 개수 계산 필요
    const filteredList = getFilteredPosts();
    const totalPages = Math.ceil(filteredList.length / itemsPerPage);

    const nextPage = currentPage + direction;

    if (nextPage >= 1 && nextPage <= totalPages) {
        currentPage = nextPage;
        renderPosts();
        scrollToTop(); // 페이지 넘기면 맨 위로
    }
}

// --- 현재 필터 조건에 맞는 포스트만 반환하는 함수 ---
function getFilteredPosts() {
    return allPostElements.filter(item => {
        const itemCat = item.dataset.category;
        const itemYear = item.dataset.year;

        const catMatch = (currentCategory === 'all' || itemCat === currentCategory);
        const yearMatch = (currentYear === 'all' || itemYear === currentYear);

        return catMatch && yearMatch;
    });
}

// --- 실제 화면에 그리는 함수 ---
function renderPosts() {
    // 1. 현재 조건에 맞는 리스트 확보
    const filteredList = getFilteredPosts();

    // 2. 전체 포스트 일단 숨기기
    allPostElements.forEach(item => {
        item.style.display = 'none';
    });

    // 3. 현재 페이지에 해당하는 인덱스 계산
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // 4. 해당 구간의 포스트만 보이기
    const pageItems = filteredList.slice(startIndex, endIndex);
    pageItems.forEach(item => {
        item.style.display = 'flex';
    });

    // 5. 버튼 상태 업데이트
    updatePaginationButtons(filteredList.length);
}

// --- 페이지네이션 UI 업데이트 ---
function updatePaginationButtons(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicator = document.getElementById('pageIndicator');

    // 페이지 표시 (예: 1 / 2)
    if (totalPages === 0) {
        indicator.textContent = "0";
    } else {
        indicator.textContent = `${currentPage}`; // 혹은 `${currentPage} / ${totalPages}`
    }

    // 이전 버튼 활성/비활성
    if (currentPage === 1) {
        prevBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
    }

    // 다음 버튼 활성/비활성
    if (currentPage >= totalPages || totalPages === 0) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}

// --- 기존 네비게이션 및 기타 기능 ---
function toggleNav() {
    document.getElementById('main-nav').classList.toggle('active');
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', function (event) {
    const navWrapper = document.querySelector('.bottom-nav-wrapper');
    const navBar = document.getElementById('main-nav');
    if (!navWrapper.contains(event.target) && navBar.classList.contains('active')) {
        navBar.classList.remove('active');
    }
});