document.addEventListener('DOMContentLoaded', () => {
    // Debounce function to limit the rate of function calls
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Throttle function to limit the number of times a function can be called
    function throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Optimized active navigation item setting
    const setActiveNavItem = (() => {
        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop() || 'index.html';

        return () => {
            // Clear previous active states
            document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            });

            // More efficient selector and matching
            const navLinks = document.querySelectorAll('.nav-link');
            for (const link of navLinks) {
                const linkPath = link.getAttribute('href');
                const isMatch = 
                    pageName === linkPath ||
                    (pageName === 'index.html' && linkPath === '#') ||
                    (linkPath === 'projects.html' && pageName === 'projects.html') ||
                    (linkPath === 'resume.html' && pageName === 'resume.html');

                if (isMatch) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            }

            // Handle homework pages dropdown
            if (pageName.startsWith('hw')) {
                const dropdownToggle = document.querySelector('.dropdown-toggle');
                if (dropdownToggle) dropdownToggle.classList.add('active');

                document.querySelectorAll('.dropdown-item').forEach(item => {
                    if (item.getAttribute('href') === pageName) {
                        item.classList.add('active');
                    }
                });
            }
        };
    })();

    // Optimized smooth scrolling
    const enableSmoothScrolling = () => {
        // Check for native smooth scroll support
        if ('scrollBehavior' in document.documentElement.style) return;

        const smoothScroll = (e) => {
            e.preventDefault();
            const targetElement = document.querySelector(e.currentTarget.getAttribute('href'));
            if (targetElement) {
                window.scrollTo({ 
                    top: targetElement.offsetTop - 80, 
                    behavior: 'smooth' 
                });
                history.pushState(null, null, e.currentTarget.getAttribute('href'));
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();
            }
        };

        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link => {
            link.addEventListener('click', smoothScroll);
        });
    };

    // Performance-optimized skill bar animation
    const animateSkillBars = () => {
        const skillBars = document.querySelectorAll('.skill-bar');
        if (!skillBars.length) return;

        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    // Use requestAnimationFrame for smoother animation
                    requestAnimationFrame(() => {
                        bar.style.width = bar.getAttribute('data-percentage') + '%';
                        bar.classList.add('animated');
                    });
                    observer.unobserve(bar);
                }
            });
        }, options);

        skillBars.forEach(bar => observer.observe(bar));
    };

    // Scroll reveal with reduced motion support
    const initScrollReveal = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.section-container').forEach(section => observer.observe(section));
    };

    // Enhanced accessibility 
    const enhanceAccessibility = () => {
        const navbarToggler = document.querySelector('.navbar-toggler');
        if (navbarToggler) navbarToggler.setAttribute('aria-haspopup', 'true');

        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            // Ensure security for external links
            if (!link.getAttribute('rel')?.includes('noopener')) {
                link.setAttribute('rel', (link.getAttribute('rel') || '') + ' noopener noreferrer');
            }

            // Add screen reader context
            if (!link.querySelector('.visually-hidden')) {
                const span = document.createElement('span');
                span.className = 'visually-hidden';
                span.textContent = ' (opens in new window)';
                link.appendChild(span);
            }
        });
    };

    // Optimized back to top button
    const setupBackToTopButton = () => {
        const backToTopButton = document.getElementById('back-to-top');
        if (!backToTopButton) return;

        // Use throttling to reduce scroll event performance impact
        const handleScroll = throttle(() => {
            backToTopButton.style.display = 
                window.pageYOffset > window.innerHeight * 0.5 ? 'block' : 'none';
        }, 200);

        window.addEventListener('scroll', handleScroll);

        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };

    // Initialize all functions
    setActiveNavItem();
    enableSmoothScrolling();
    animateSkillBars();
    initScrollReveal();
    enhanceAccessibility();
    setupBackToTopButton();
});