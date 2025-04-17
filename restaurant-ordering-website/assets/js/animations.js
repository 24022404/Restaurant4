document.addEventListener('DOMContentLoaded', function() {
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');

    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const animateOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(animateOnScroll, options);

    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });

    const buttons = document.querySelectorAll('.button-animate');

    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.classList.add('scale-up');
        });

        button.addEventListener('mouseleave', () => {
            button.classList.remove('scale-up');
        });
    });
});