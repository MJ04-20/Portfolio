 // Sticky header shrink on scroll
        const header = document.getElementById('header');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.classList.add('shrink');
            } else {
                header.classList.remove('shrink');
            }
        });

        // Scroll animation with zoom effect
        const sections = document.querySelectorAll('[data-section]');
        
        const observerOptions = {
            threshold: [0, 0.3, 0.5, 0.7, 1],
            rootMargin: '-10% 0px -10% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Calculate zoom based on intersection ratio
                    const ratio = entry.intersectionRatio;
                    if (ratio > 0.4 && ratio < 0.8) {
                        entry.target.classList.add('zoom');
                    } else {
                        entry.target.classList.remove('zoom');
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });

        // Enhanced scroll effect for sections
        window.addEventListener('scroll', () => {
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const sectionMiddle = rect.top + rect.height / 2;
                const windowMiddle = windowHeight / 2;
                
                const distance = Math.abs(sectionMiddle - windowMiddle);
                const maxDistance = windowHeight / 2;
                
                let scale = 1 - (distance / maxDistance) * 0.1;
                scale = Math.max(0.9, Math.min(1.05, scale));
                
                section.style.transform = `scale(${scale})`;
                
                // Adjust opacity based on position
                if (rect.top < -rect.height || rect.bottom > windowHeight + rect.height) {
                    section.style.opacity = '0.6';
                } else {
                    section.style.opacity = '1';
                }
            });
        });