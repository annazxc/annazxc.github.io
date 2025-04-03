    document.addEventListener('DOMContentLoaded', () => {
        function debounce(func, delay) {
            let timeoutId;
            return function (...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            };
        }

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

  
        document.addEventListener('DOMContentLoaded', function() {
            // 1. Fix for navbar not closing when clicking any link (including Contact)
            const navLinks = document.querySelectorAll('#navbarNav .nav-link');
            const navbarCollapse = document.querySelector('.navbar-collapse');
            
            // Close navbar when any nav link is clicked
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    // Check if Bootstrap's collapse plugin is available
                    if (bootstrap && bootstrap.Collapse) {
                        const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                            toggle: false
                        });
                        bsCollapse.hide();
                    } else {
                        // Fallback for when bootstrap JS isn't fully loaded
                        navbarCollapse.classList.remove('show');
                    }
                });
            });
            
            // 2. Fix for anchor links (like #contact) - handle them properly
            const contactLink = document.querySelector('a[href="index.html#contact"]');
            if (contactLink) {
                contactLink.addEventListener('click', function(e) {
                    // Check if we're already on the index page
                    const isIndexPage = window.location.pathname.endsWith('index.html') || 
                                        window.location.pathname.endsWith('/') || 
                                        window.location.pathname === '';
                    
                    if (isIndexPage) {
                        e.preventDefault();
                        
                        // Get navbar height
                        const navbarHeight = document.querySelector('.navbar').offsetHeight;
                        
                        // Get the contact section
                        const contactSection = document.querySelector('#contact');
                        if (contactSection) {
                            // Calculate position with offset for fixed navbar
                            const targetPosition = contactSection.getBoundingClientRect().top + 
                                                window.pageYOffset - 
                                                navbarHeight - 
                                                10; // Extra padding
                            
                            // Scroll to the section smoothly
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                        }
                    }
                    // If not on index page, let default navigation happen
                });
            }
        });
        

    const setActiveNavItem = (() => {
        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop() || 'index.html';

        return () => {
            document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            });

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

    const enableSmoothScrolling = () => {
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

    const enhanceAccessibility = () => {
        const navbarToggler = document.querySelector('.navbar-toggler');
        if (navbarToggler) navbarToggler.setAttribute('aria-haspopup', 'true');

        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            if (!link.getAttribute('rel')?.includes('noopener')) {
                link.setAttribute('rel', (link.getAttribute('rel') || '') + ' noopener noreferrer');
            }

            if (!link.querySelector('.visually-hidden')) {
                const span = document.createElement('span');
                span.className = 'visually-hidden';
                span.textContent = ' (opens in new window)';
                link.appendChild(span);
            }
        });
    };

    const setupBackToTopButton = () => {
        const backToTopButton = document.getElementById('back-to-top');
        if (!backToTopButton) return;

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

    setActiveNavItem();
    enableSmoothScrolling();
    animateSkillBars();
    initScrollReveal();
    enhanceAccessibility();
    setupBackToTopButton();
});

