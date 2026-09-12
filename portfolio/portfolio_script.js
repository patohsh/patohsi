const GALLERY_STATE_KEY = 'patohsi_gallery_state';

let currentYear = null; // 저장된 상태가 없으면 가장 최근 연도로 자동 설정됨
let currentCategory = 'all';
let currentView = 'grid'; // 'masonry'(모아보기) | 'grid'(목록보기) — 기본값: 목록보기

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.gallery-card')) {
        restoreGalleryState();
        renderGallery();
        setupLightbox();
    }
});

// 목록으로 돌아왔을 때(뒤로가기) 또는 새로고침해도 직전에 보던 연도/카테고리/뷰를 유지한다.
function restoreGalleryState() {
    let saved = null;
    try {
        saved = JSON.parse(sessionStorage.getItem(GALLERY_STATE_KEY));
    } catch (e) {
        saved = null;
    }

    const yearButtons = document.querySelectorAll('.year-btn');
    const availableYears = Array.from(yearButtons).map(b => b.dataset.filter);

    if (saved && saved.year && availableYears.includes(saved.year)) {
        currentYear = saved.year;
        currentCategory = saved.category || 'all';
        currentView = saved.view || 'grid';
    } else {
        // 저장된 값이 없거나(첫 방문) 더 이상 존재하지 않는 연도라면 최신 연도를 기본값으로
        currentYear = getLatestYear(yearButtons);
        currentCategory = 'all';
        currentView = 'grid';
    }

    updateActiveButtons('.year-btn', currentYear);

    const categoryBtn = document.querySelector(`.cat-btn[data-filter="${currentCategory}"]`);
    const group = categoryBtn ? categoryBtn.closest('.focus-filter, .category-filter') : null;
    if (group) {
        updateActiveButtons(group.querySelectorAll('.cat-btn'), currentCategory);
    }

    const galleryGrid = document.getElementById('gallery-grid');
    galleryGrid.classList.toggle('view-masonry', currentView === 'masonry');
    galleryGrid.classList.toggle('view-grid', currentView === 'grid');
    document.getElementById('viewMasonryBtn').classList.toggle('active', currentView === 'masonry');
    document.getElementById('viewGridBtn').classList.toggle('active', currentView === 'grid');
}

function getLatestYear(yearButtons) {
    let latestYear = null;
    yearButtons.forEach(button => {
        const year = button.dataset.filter;
        if (latestYear === null || year > latestYear) {
            latestYear = year;
        }
    });
    return latestYear;
}

function saveGalleryState() {
    try {
        sessionStorage.setItem(GALLERY_STATE_KEY, JSON.stringify({
            year: currentYear,
            category: currentCategory,
            view: currentView,
        }));
    } catch (e) {
        // sessionStorage를 쓸 수 없는 환경(프라이빗 모드 등)이면 조용히 무시
    }
}

function setViewMode(mode) {
    currentView = mode;
    const galleryGrid = document.getElementById('gallery-grid');
    galleryGrid.classList.toggle('view-masonry', mode === 'masonry');
    galleryGrid.classList.toggle('view-grid', mode === 'grid');

    document.getElementById('viewMasonryBtn').classList.toggle('active', mode === 'masonry');
    document.getElementById('viewGridBtn').classList.toggle('active', mode === 'grid');

    saveGalleryState();
}

function setFilter(value, type) {
    if (type === 'year') {
        currentYear = value;
        updateActiveButtons('.year-btn', value);
    } else if (type === 'category') {
        currentCategory = value;
        // 그림/3D(focus-filter)와 ALL/WORK/UNREAL/부스(category-filter)는
        // 버튼 그룹이 다르므로 각 그룹 안에서만 active를 토글한다.
        const group = document.querySelector(`.cat-btn[data-filter="${value}"]`)?.closest('.focus-filter, .category-filter');
        if (group) {
            updateActiveButtons(group.querySelectorAll('.cat-btn'), value);
        }
    }

    saveGalleryState();
    renderGallery();
}

function updateActiveButtons(selectorOrElements, value) {
    const buttons = typeof selectorOrElements === 'string'
        ? document.querySelectorAll(selectorOrElements)
        : selectorOrElements;
    buttons.forEach(button => {
        const buttonValue = (button.dataset.filter || '').toLowerCase();
        button.classList.toggle('active', buttonValue === value.toLowerCase());
    });
}

function getFilteredItems() {
    const allItems = Array.from(document.querySelectorAll('.gallery-card'));

    return allItems.filter(item => {
        const itemYear = item.dataset.year;
        const itemCategory = (item.dataset.category || '').toLowerCase();
        const yearMatch = itemYear === currentYear;
        const categoryMatch = currentCategory === 'all' || itemCategory === currentCategory.toLowerCase();

        return yearMatch && categoryMatch;
    });
}

// 필터에 맞는 카드를 전부 표시한다(페이지 제한 없음) — 필터를 바꿨을 때
// 일부 카드가 다음 페이지에 가려져 안 보이는 문제를 막기 위함.
function renderGallery() {
    const allItems = document.querySelectorAll('.gallery-card');
    if (!allItems.length) {
        return;
    }

    const filteredItems = new Set(getFilteredItems());

    allItems.forEach(item => {
        item.style.display = filteredItems.has(item) ? 'flex' : 'none';
    });
}

/* --- 라이트박스: 모아보기(masonry) 뷰에서 카드를 클릭하면 이미지를 전체로 보여줌 --- */
let lightboxItems = [];
let lightboxIndex = 0;

function setupLightbox() {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <button class="lightbox-close" aria-label="닫기"><i class="fa-solid fa-xmark"></i></button>
        <button class="lightbox-nav prev" aria-label="이전"><i class="fa-solid fa-chevron-left"></i></button>
        <button class="lightbox-nav next" aria-label="다음"><i class="fa-solid fa-chevron-right"></i></button>
        <figure class="lightbox-figure">
            <img src="" alt="">
            <figcaption class="lightbox-caption">
                <div class="lb-title"></div>
                <div class="lb-date"></div>
            </figcaption>
        </figure>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeLightbox();
    });
    overlay.querySelector('.lightbox-nav.prev').addEventListener('click', () => stepLightbox(-1));
    overlay.querySelector('.lightbox-nav.next').addEventListener('click', () => stepLightbox(1));

    document.addEventListener('keydown', (e) => {
        if (!overlay.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') stepLightbox(-1);
        if (e.key === 'ArrowRight') stepLightbox(1);
    });

    document.getElementById('gallery-grid').addEventListener('click', (e) => {
        if (currentView !== 'masonry') return;
        const card = e.target.closest('.gallery-card');
        if (!card) return;

        e.preventDefault();
        lightboxItems = Array.from(document.querySelectorAll('.gallery-card'))
            .filter(item => item.style.display !== 'none');
        lightboxIndex = lightboxItems.indexOf(card);
        openLightbox();
    });
}

function openLightbox() {
    const overlay = document.querySelector('.lightbox-overlay');
    renderLightboxItem();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const overlay = document.querySelector('.lightbox-overlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function stepLightbox(direction) {
    if (!lightboxItems.length) return;
    lightboxIndex = (lightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
    renderLightboxItem();
}

function renderLightboxItem() {
    const card = lightboxItems[lightboxIndex];
    if (!card) return;

    const overlay = document.querySelector('.lightbox-overlay');
    const img = card.querySelector('.card-img-box img');
    const date = card.querySelector('.card-date');
    const title = card.dataset.title || '';

    overlay.querySelector('.lightbox-figure img').src = img ? img.src : '';
    overlay.querySelector('.lb-title').textContent = title;
    overlay.querySelector('.lb-date').textContent = date ? date.textContent : '';
}

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
