// Enhanced interactions and animations
document.addEventListener('DOMContentLoaded', function() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
            }
        });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Observe capability items for staggered animation
    const capabilityItems = document.querySelectorAll('.capability-item');
    const capabilityObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }, index * 100);
            }
        });
    }, observerOptions);

    capabilityItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        capabilityObserver.observe(item);
    });

    // Observe process items
    const processItems = document.querySelectorAll('.process-item');
    const processObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 150);
            }
        });
    }, observerOptions);

    processItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        processObserver.observe(item);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = 100;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Parallax effect for hero background orbs
    let ticking = false;
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            const heroBefore = hero.querySelector('::before');
            const rate = scrolled * 0.3;
            hero.style.setProperty('--scroll', rate + 'px');
        }
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick);

    // Mouse move parallax for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { width, height, left, top } = hero.getBoundingClientRect();
            const x = ((clientX - left) / width - 0.5) * 20;
            const y = ((clientY - top) / height - 0.5) * 20;
            
            hero.style.setProperty('--mouse-x', x + 'px');
            hero.style.setProperty('--mouse-y', y + 'px');
        });
    }

    // Add cursor effect for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .capability-item, .process-item');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            document.body.style.cursor = 'pointer';
        });
        element.addEventListener('mouseleave', function() {
            document.body.style.cursor = 'default';
        });
    });

    // Navbar scroll effect
    let lastScroll = 0;
    const nav = document.querySelector('.nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 100) {
                nav.style.boxShadow = '0 4px 6px -1px rgba(10, 14, 39, 0.1), 0 2px 4px -1px rgba(10, 14, 39, 0.06)';
                nav.style.background = 'rgba(248, 247, 244, 0.9)';
            } else {
                nav.style.boxShadow = '0 1px 2px 0 rgba(10, 14, 39, 0.05)';
                nav.style.background = 'rgba(248, 247, 244, 0.75)';
            }
            lastScroll = currentScroll;
        });
    }

    // Text reveal animation for hero
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.innerHTML = text.split('').map((char, index) => 
            `<span style="animation-delay: ${index * 0.03}s">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('');
    }
});
