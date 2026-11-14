document.addEventListener('DOMContentLoaded', function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Navbar style once the page is scrolled
    const nav = document.querySelector('.nav');
    if (nav) {
        const updateNav = () => nav.classList.toggle('scrolled', window.scrollY > 50);
        window.addEventListener('scroll', updateNav, { passive: true });
        updateNav();
    }

    // Reveal sections and list items as they scroll into view.
    // The CSS only hides them when <html> has the "js" class, so content
    // stays visible if this script does not run.
    const revealTargets = document.querySelectorAll('.section, .capability-item, .process-item');
    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealTargets.forEach(el => el.classList.add('visible'));
    } else {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    entry.target.style.transitionDelay = (index * 80) + 'ms';
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                    // Drop the delay afterwards so hover effects stay instant
                    setTimeout(() => { entry.target.style.transitionDelay = ''; }, 1200);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        revealTargets.forEach(el => observer.observe(el));
    }

    // Smooth scroll for in-page anchor links, leaving room for the fixed nav
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
            history.replaceState(null, '', href);
        });
    });

    // Contact form (sent through FormSubmit; see the privacy policy)
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formMessage = document.getElementById('formMessage');
        const submitButton = contactForm.querySelector('.btn-submit');
        const originalText = submitButton.textContent;

        const showMessage = (type, text) => {
            formMessage.className = 'form-message ' + type;
            formMessage.textContent = text;
            formMessage.style.display = 'block';
        };
        const resetButton = () => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        };

        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        formMessage.style.display = 'none';

        const formData = new FormData(contactForm);
        const data = {
            name: (formData.get('name') || '').trim(),
            email: (formData.get('email') || '').trim(),
            message: (formData.get('message') || '').trim()
        };

        if (!data.name || !data.email || !data.message) {
            showMessage('error', 'Please fill in all fields.');
            resetButton();
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            showMessage('error', 'Please enter a valid email address.');
            resetButton();
            return;
        }

        // Spam trap: bots fill the hidden field; pretend success and drop it
        if (formData.get('_honey')) {
            showMessage('success', 'Thank you. Your message has been sent.');
            contactForm.reset();
            resetButton();
            return;
        }

        try {
            const response = await fetch('https://formsubmit.co/ajax/contact@polymathsphere.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    message: data.message,
                    _subject: `Contact from ${data.name} — Polymath Sphere`,
                    _replyto: data.email,
                    _template: 'table'
                })
            });

            if (!response.ok) throw new Error('Form submission failed');

            showMessage('success', 'Thank you. Your message has been sent.');
            contactForm.reset();
            resetButton();
            setTimeout(() => { formMessage.style.display = 'none'; }, 5000);
        } catch (error) {
            const subject = encodeURIComponent(`Contact from ${data.name}`);
            const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`);
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Unable to send right now. ';
            const link = document.createElement('a');
            link.href = `mailto:contact@polymathsphere.com?subject=${subject}&body=${body}`;
            link.textContent = 'Email us directly';
            formMessage.append(link, '.');
            formMessage.style.display = 'block';
            resetButton();
        }
    });
});
