// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initSmoothScroll();
});

// Theme Toggle
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const icon = themeToggle.querySelector('i');

    // Check for saved theme
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

// Active Navigation Link
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    // Highlight active link based on current page
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');

        if (currentPath === 'publications.html') {
            if (href === 'publications.html') {
                link.classList.add('active');
            }
        } else {
            // For index.html, use scroll spy
            if (href.startsWith('#')) {
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

// Smooth Scroll
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