document.addEventListener('DOMContentLoaded', function() {
    // Enable active state for current navigation item
    setActiveNavItem();
    
    // Enable smooth scrolling for anchor links
    enableSmoothScrolling();
    
    // Enhancement: Add a simple animation for skill bars (if they exist)
    animateSkillBars();
    
    // Enhancement: Add a simple reveal animation for sections when scrolling
    initScrollReveal();
    
    // Add accessibility enhancements
    enhanceAccessibility();
});

/**
 * Sets the active navigation item based on current page
 */
function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // Remove active class and aria-current from all links
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        
        // Check if this is the current page
        if (
            // Exact match
            currentPath === linkPath ||
            // Home page with index.html
            (currentPath.endsWith('/index.html') && linkPath === '#') ||
            // Root path with # link
            (currentPath === '/' && linkPath === '#')
        ) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

/**
 * Enables smooth scrolling for anchor links
 */
function enableSmoothScrolling() {
    // Only apply if the browser doesn't natively support smooth scrolling
    // or if the user hasn't set prefers-reduced-motion
    if ('scrollBehavior' in document.documentElement.style) return;
    
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Get element's position
                const rect = targetElement.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const targetPosition = rect.top + scrollTop - 80; // Adjust for fixed header
                
                // Smooth scroll to element
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without page jump
                history.pushState(null, null, targetId);
                
                // Set focus to the element for accessibility
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();
            }
        });
    });
}

/**
 * Animates skill bars if they exist
 */
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar');
    
    if (skillBars.length === 0) return;
    
    // Create an observer for skill bars
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillBar = entry.target;
                const percentage = skillBar.getAttribute('data-percentage');
                
                skillBar.style.width = percentage + '%';
                skillBar.classList.add('animated');
                
                // Unobserve after animation
                observer.unobserve(skillBar);
            }
        });
    }, { threshold: 0.1 });
    
    // Observe each skill bar
    skillBars.forEach(bar => {
        observer.observe(bar);
    });
}

/**
 * Initialize reveal animations for sections when scrolling
 */
function initScrollReveal() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) return;
    
    const sections = document.querySelectorAll('.section-container');
    
    // Create an observer for sections
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    // Observe each section
    sections.forEach(section => {
        observer.observe(section);
    });
}

/**
 * Add accessibility enhancements
 */
function enhanceAccessibility() {
    // Add appropriate ARIA attributes to the navbar toggle button
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.setAttribute('aria-haspopup', 'true');
    }
    
    // Ensure all external links have appropriate attributes
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach(link => {
        // Add rel="noopener noreferrer" if not present
        if (!link.getAttribute('rel') || !link.getAttribute('rel').includes('noopener')) {
            const currentRel = link.getAttribute('rel') || '';
            link.setAttribute('rel', (currentRel + ' noopener noreferrer').trim());
        }
        
        // Indicate that link opens in new window for screen readers if not already present
        if (!link.querySelector('.visually-hidden')) {
            const span = document.createElement('span');
            span.className = 'visually-hidden';
            span.textContent = ' (opens in new window)';
            link.appendChild(span);
        }
    });
}

/*contact form*/
// Contact form validation
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            if (!this.checkValidity()) {
                event.stopPropagation();
                this.classList.add('was-validated');
                return;
            }
            
            // If form is valid, show success message
            // In a real implementation, you would send the form data to a server here
            document.getElementById('formSuccess').style.display = 'block';
            this.reset();
            this.classList.remove('was-validated');
            
            // Hide success message after 5 seconds
            setTimeout(function() {
                document.getElementById('formSuccess').style.display = 'none';
            }, 5000);
        });
    }
});

// Back to top button functionality
document.addEventListener('DOMContentLoaded', function() {
    var backToTopButton = document.getElementById('back-to-top');
    
    // Show the button when scrolling down
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 100) { 
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    });
    
    // Smooth scroll back to top when clicked
    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

