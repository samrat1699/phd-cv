// =========================================
// INITIALIZE WHEN DOM IS LOADED
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initSmoothScroll();
    initMobileMenu();
    initSearchOverlay();
    initSearchFunctionality(); // <-- THIS IS THE NEW WORKING SEARCH LOGIC
    initScrollToTop();
});

// =========================================
// 1. THEME TOGGLE
// =========================================
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    if (!themeToggle) return;

    const icon = themeToggle.querySelector('i');
    const savedTheme = localStorage.getItem('theme') || 'dark';

    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme, icon);

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme, icon);
    });
}

function updateThemeIcon(theme, icon) {
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// =========================================
// 2. ACTIVE NAVIGATION LINK
// =========================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');

        if (currentPath === 'publications.html' && href === 'publications.html') {
            link.classList.add('active');
        } else if (currentPath === 'index.html' || currentPath === '') {
            if (href && href.startsWith('#')) {
                window.addEventListener('scroll', () => {
                    let current = '';
                    document.querySelectorAll('.content-section').forEach(section => {
                        const sectionTop = section.offsetTop;
                        if (window.scrollY >= (sectionTop - 150)) {
                            current = section.getAttribute('id');
                        }
                    });

                    navLinks.forEach(l => {
                        l.classList.remove('active');
                        if (l.getAttribute('href') === '#' + current) {
                            l.classList.add('active');
                        }
                    });
                });
            }
        }
    });
}

// =========================================
// 3. SMOOTH SCROLL
// =========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// =========================================
// 4. MOBILE MENU TOGGLE
// =========================================
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    if (!mobileMenuToggle || !navMenu) return;

    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileMenuToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

// =========================================
// 5. SEARCH OVERLAY (OPEN/CLOSE)
// =========================================
function initSearchOverlay() {
    const searchToggle = document.getElementById('search-toggle');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');

    if (!searchToggle || !searchOverlay) return;

    searchToggle.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        setTimeout(() => searchInput.focus(), 100);
    });

    searchClose.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        clearSearchResults();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            searchOverlay.classList.remove('active');
            searchInput.value = '';
            clearSearchResults();
        }
    });
}

// =========================================
// 6. SEARCH FUNCTIONALITY (THE MISSING PIECE!)
// =========================================
function initSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length >= 2) {
            performSearch(query);
        } else {
            clearSearchResults();
        }
    });
}

function performSearch(query) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;

    const results = [];

    // 1. Search in Publications
    document.querySelectorAll('.pub-item').forEach(item => {
        const title = item.querySelector('.pub-title, .pub-title-link')?.textContent?.toLowerCase() || '';
        const authors = item.querySelector('.pub-authors')?.textContent?.toLowerCase() || '';
        const venue = item.querySelector('.pub-venue')?.textContent?.toLowerCase() || '';

        if (title.includes(query) || authors.includes(query) || venue.includes(query)) {
            results.push({
                type: 'Publication',
                title: item.querySelector('.pub-title, .pub-title-link')?.textContent || 'Untitled',
                preview: venue || authors,
                targetId: 'publications'
            });
        }
    });

    // 2. Search in Skills
    document.querySelectorAll('.skill-tag').forEach(tag => {
        const skill = tag.textContent.toLowerCase();
        if (skill.includes(query)) {
            results.push({
                type: 'Skill',
                title: tag.textContent,
                preview: 'Technical Skill',
                targetId: 'academic'
            });
        }
    });

    // 3. Search in Research Interests & Education
    document.querySelectorAll('.interest-item-compact, .interest-item, .edu-degree, .edu-school').forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(query)) {
            results.push({
                type: 'Academic',
                title: item.textContent.trim(),
                preview: 'Education or Research Interest',
                targetId: 'academic'
            });
        }
    });

    // Display results
    if (results.length > 0) {
        // Remove duplicates based on title
        const uniqueResults = results.filter((v, i, a) => a.findIndex(t => (t.title === v.title)) === i);

        resultsContainer.innerHTML = uniqueResults.map(result => `
            <div class="search-result-item" onclick="handleSearchClick('${result.targetId}')">
                <div class="search-result-type">${result.type}</div>
                <div class="search-result-title">${highlightText(result.title, query)}</div>
                <div class="search-result-preview">${highlightText(result.preview, query)}</div>
            </div>
        `).join('');
    } else {
        resultsContainer.innerHTML = '<div class="no-results">No results found for "' + query + '"</div>';
    }
}

function highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function clearSearchResults() {
    const resultsContainer = document.getElementById('searchResults');
    if (resultsContainer) resultsContainer.innerHTML = '';
}

// Global function to be called from HTML onclick
window.handleSearchClick = function (targetId) {
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');

    if (searchOverlay) searchOverlay.classList.remove('active');
    if (searchInput) searchInput.value = '';
    clearSearchResults();

    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// =========================================
// 7. SCROLL TO TOP BUTTON
// =========================================
function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (!scrollToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}