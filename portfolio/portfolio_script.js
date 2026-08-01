const itemsPerPage = 10;
let currentPage = 1;
let currentYear = '2025';
let currentCategory = 'art';

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.gallery-card')) {
        renderGallery();
    }
});

function setFilter(value, type) {
    if (type === 'year') {
        currentYear = value;
        updateActiveButtons('.year-btn', value);
    } else if (type === 'category') {
        currentCategory = value;
        updateActiveButtons('.cat-btn', value);
    }

    currentPage = 1;
    renderGallery();
}

function updateActiveButtons(selector, value) {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach(button => {
        const buttonValue = (button.dataset.filter || '').toLowerCase();
        button.classList.toggle('active', buttonValue === value.toLowerCase());
    });
}

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

function renderGallery() {
    const allItems = document.querySelectorAll('.gallery-card');
    const prevButton = document.getElementById('prevBtn');
    const nextButton = document.getElementById('nextBtn');

    if (!allItems.length || !prevButton || !nextButton) {
        return;
    }

    const filteredItems = getFilteredItems();

    allItems.forEach(item => {
        item.style.display = 'none';
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredItems.slice(startIndex, endIndex);

    pageItems.forEach(item => {
        item.style.display = 'flex';
    });

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage >= totalPages || totalPages === 0;
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
