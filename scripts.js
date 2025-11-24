// Header scroll effect with menu color change
// Add debouncing to optimize scroll performance
let scrollTimeout;
window.addEventListener('scroll', function() {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
            const header = document.getElementById('header');
            const navLinks = document.querySelectorAll('.nav-links a');
            const backToTop = document.getElementById('backToTop');
            
            // Get the current section to match header background
            const currentSection = getCurrentSection();
            
            // Highlight active menu item based on current section
            updateActiveMenuItem(currentSection);
            
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
                // When scrolled, force light theme with dark text
                navLinks.forEach(link => {
                    link.style.color = 'var(--dark)';
                });
                // Reset any section-specific background
                header.style.backgroundColor = '';
            } else {
                header.classList.remove('scrolled');
                
                // Sync header background with current section
                updateHeaderBackground(currentSection);
                
                // Check the current section's background to determine menu color
                if (currentSection && (currentSection.id === 'home' || 
                    currentSection.id === 'services' || 
                    currentSection.id === 'schedule' || 
                    currentSection.id === 'promos' ||
                    document.body.classList.contains('light-bg'))) {
                    // On light sections, keep text dark
                    navLinks.forEach(link => {
                        link.style.color = 'var(--dark)';
                    });
                } else {
                    // On dark sections, make text white
                    navLinks.forEach(link => {
                        link.style.color = 'var(--white)';
                    });
                }
            }
            
            if (window.scrollY > 300) { // Reduced scroll threshold
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
            
            scrollTimeout = null;
        }, 10); // Small timeout for smoother performance
    }
});

// RADICAL NEW APPROACH: Simple Fullscreen Modal System
document.addEventListener('DOMContentLoaded', function() {
    const concernsCard = document.getElementById('concerns-card');
    const servicesCard = document.getElementById('services-card');
    let currentModal = null;

    // Create modal container once
    function createModalContainer() {
        const modal = document.createElement('div');
        modal.className = 'fullscreen-modal';
        modal.innerHTML = `
            <div class="modal-header">
                <button class="modal-back-btn" aria-label="Go back">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <h2 class="modal-title"></h2>
            </div>
            <div class="modal-content"></div>
        `;
        return modal;
    }

    // Open modal with card content
    function openModal(card) {
        // Get card data
        const title = card.querySelector('.card-title').textContent;
        const content = card.querySelector('.card-content').innerHTML;
        
        // Create modal
        const modal = createModalContainer();
        modal.querySelector('.modal-title').textContent = title;
        modal.querySelector('.modal-content').innerHTML = content;
        
        // Store scroll position
        const scrollPos = window.scrollY;
        modal.dataset.scrollPos = scrollPos;
        
        // Add to body
        document.body.appendChild(modal);
        currentModal = modal;
        
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPos}px`;
        document.body.style.width = '100%';
        
        // Add close functionality
        const backBtn = modal.querySelector('.modal-back-btn');
        backBtn.addEventListener('click', closeModal);
        
        // Close on ESC key
        document.addEventListener('keydown', handleEscKey);
        
        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    }

    // Close modal
    function closeModal() {
        if (!currentModal) return;
        
        // Get scroll position
        const scrollPos = parseInt(currentModal.dataset.scrollPos) || 0;
        
        // Remove active class for animation
        currentModal.classList.remove('active');
        
        // Remove modal after animation
        setTimeout(() => {
            if (currentModal) {
                currentModal.remove();
                currentModal = null;
            }
            
            // Restore scrolling
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            
            // Restore scroll position
            window.scrollTo(0, scrollPos);
            
            // Remove ESC listener
            document.removeEventListener('keydown', handleEscKey);
        }, 300);
    }

    // Handle ESC key
    function handleEscKey(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    }

    // Add click handlers to cards
    concernsCard.addEventListener('click', function(e) {
        if (!e.target.closest('.card-content')) {
            openModal(this);
        }
    });

    servicesCard.addEventListener('click', function(e) {
        if (!e.target.closest('.card-content')) {
            openModal(this);
        }
    });
});

// Function to update header background based on current section
function updateHeaderBackground(currentSection) {
    const header = document.getElementById('header');
    
    if (!header.classList.contains('scrolled') && currentSection) {
        if (currentSection.id === 'hero') {
            // Make header completely transparent on hero section
            header.style.background = 'transparent';
            header.style.backdropFilter = 'none';
        } else if (currentSection.id === 'testimonials' || currentSection.id === 'contact') {
            // Other dark sections
            header.style.background = 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(42, 65, 65, 0.95) 100%)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            // Light sections - solid white background
            header.style.background = '#FFFFFF';
            header.style.backdropFilter = 'blur(10px)';
        }
    }
}

// Helper function to determine which section is currently in view
function getCurrentSection() {
    const sections = document.querySelectorAll('section');
    if (!sections.length) return null;
    
    let currentSection = null;
    let minDistance = Infinity;
    
    // Get the viewport height for better calculations
    const viewportHeight = window.innerHeight;
    const scrollPosition = window.scrollY;
    
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        
        // Skip sections that are completely out of view
        if ((rect.bottom < 0) || (rect.top > viewportHeight)) {
            return;
        }
        
        // Calculate how much of the section is visible in the viewport
        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        
        // If more than 30% of section height is visible, consider it
        if (visibleHeight > (rect.height * 0.3)) {
            // Priority to sections that are closer to the center of the viewport
            const distance = Math.abs(rect.top + rect.height / 2 - viewportHeight / 2);
            
            if (distance < minDistance) {
                minDistance = distance;
                currentSection = section;
            }
        }
    });
    
    return currentSection;
}

// Mobile menu toggle with proper class toggling for animation
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', function() {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    
    // Prevent body scrolling when menu is open
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a, .nav-menu .btn').forEach(item => {
    item.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Schedule tabs
const scheduleTabs = document.querySelectorAll('.schedule-tab');
const scheduleContents = document.querySelectorAll('.schedule-content');

scheduleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        
        // Remove active class from all tabs and contents
        scheduleTabs.forEach(tab => tab.classList.remove('active'));
        scheduleContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        
        if (target === 'plastic') {
            document.getElementById('plastic-tab').classList.add('active');
        } else if (target === 'dermatology') {
            document.getElementById('dermatology-tab').classList.add('active');
        } else if (target === 'outpatient') {
            document.getElementById('outpatient-tab').classList.add('active');
        }
    });
});

// Testimonial slider
const testimonialDots = document.querySelectorAll('.testimonial-dot');
const testimonialSlides = document.querySelectorAll('.testimonial-slide');

testimonialDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const slideIndex = dot.dataset.slide;
        
        // Remove active class from all dots and slides
        testimonialDots.forEach(dot => dot.classList.remove('active'));
        testimonialSlides.forEach(slide => slide.classList.remove('active'));
        
        // Add active class to clicked dot and corresponding slide
        dot.classList.add('active');
        testimonialSlides[slideIndex].classList.add('active');
    });
});

// Auto-rotate testimonials every 5 seconds
let currentSlide = 0;
function rotateTestimonials() {
    currentSlide = (currentSlide + 1) % testimonialSlides.length;
    
    testimonialDots.forEach(dot => dot.classList.remove('active'));
    testimonialSlides.forEach(slide => slide.classList.remove('active'));
    
    testimonialDots[currentSlide].classList.add('active');
    testimonialSlides[currentSlide].classList.add('active');
}

// Set interval for testimonial rotation
let testimonialInterval = setInterval(rotateTestimonials, 5000);

// Pause rotation when user interacts with testimonials
testimonialDots.forEach(dot => {
    dot.addEventListener('click', () => {
        clearInterval(testimonialInterval);
        currentSlide = parseInt(dot.dataset.slide);
        
        // Restart interval after user interaction
        setTimeout(() => {
            clearInterval(testimonialInterval); // Clear any existing interval to prevent multiple intervals
            testimonialInterval = setInterval(rotateTestimonials, 5000);
        }, 10000);
    });
});

// Enhanced smooth scrolling with transitions
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Early return if the href is just # (prevent unnecessary operations)
        if (this.getAttribute('href') === '#') return;
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            // Create smoother section transitions
            const sections = document.querySelectorAll('section');
            const targetSectionId = targetId.substring(1);
            
            sections.forEach(section => {
                if (section.id === targetSectionId) {
                    section.style.transition = 'opacity 0.6s ease';
                    section.style.opacity = '0';
                    
                    setTimeout(() => {
                        section.style.opacity = '1';
                    }, 300);
                }
            });
            
            // Get header height to use as offset
            const headerHeight = document.getElementById('header')?.offsetHeight || 0;
            
            // Scroll with exact header height offset to position titles at the top
            window.scrollTo({
                top: targetElement.offsetTop - headerHeight,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            const navMenu = document.getElementById('navMenu');
            const navToggle = document.getElementById('navToggle');
            
            if (navMenu && navToggle) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
});

// Back to top smooth scroll
document.getElementById('backToTop').addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Add scroll-triggered animations for sections and handle menu color changes
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            
            // Update menu colors based on section background
            const navLinks = document.querySelectorAll('.nav-links a');
            const header = document.getElementById('header');
            
            // Skip color change if header is in scrolled state (always dark text on white bg)
            if (header && header.classList.contains('scrolled')) return;
            
            // Update header background to match current section
            updateHeaderBackground(entry.target);
            
            // Determine if the section has a light or dark background
            if (entry.target.id === 'hero' || 
                entry.target.id === 'testimonials' || 
                entry.target.id === 'contact') {
                // Dark background sections - use white text
                navLinks.forEach(link => {
                    link.style.color = 'var(--white)';
                });
                document.body.classList.remove('light-bg');
                document.body.classList.add('dark-bg');
            } else {
                // Light background sections - use dark text
                navLinks.forEach(link => {
                    link.style.color = 'var(--dark)';
                });
                document.body.classList.remove('dark-bg');
                document.body.classList.add('light-bg');
            }
        }
    });
}, {
    threshold: 0.15, // Reduced threshold for better performance
    rootMargin: '0px 0px -100px 0px' // Trigger a bit earlier
});

document.querySelectorAll('section').forEach(section => {
    section.classList.add('section-transition');
    observer.observe(section);
});

// Create a beautiful notification system
function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                ${type === 'success' ? '✓' : '⚠'}
            </div>
            <div class="notification-message">${message}</div>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: ${type === 'success' ? 'linear-gradient(135deg, #2A7A7A, #4CAF50)' : 'linear-gradient(135deg, #ff6b6b, #ee5a24)'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        transform: translateX(400px);
        transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        max-width: 400px;
        font-family: 'Montserrat', sans-serif;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 15px;
    `;
    
    notification.querySelector('.notification-icon').style.cssText = `
        width: 30px;
        height: 30px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
    `;
    
    notification.querySelector('.notification-message').style.cssText = `
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
        transition: opacity 0.2s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Enhanced form submission with proper EmailJS configuration
document.getElementById('appointmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Show loading state
    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    
    // Use the correct EmailJS service and template IDs from the HTML
    emailjs.sendForm('third.camacho7', 'template_92m2vok', this)
        .then(function() {
            showNotification('Thank you! Your appointment request has been received. We will contact you shortly.', 'success');
            document.getElementById('appointmentForm').reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }, function(error) {
            showNotification('Sorry, there was a problem sending your request. Please try again or contact us directly.', 'error');
            console.error('EmailJS error:', error);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        });
});

// Fix for iOS Safari 100vh issue
function setVhVariable() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set the variable initially and on resize
setVhVariable();
window.addEventListener('resize', setVhVariable);

// Initial load - set body class based on first visible section
function setInitialBodyClass() {
    const currentSection = getCurrentSection();
    if (currentSection) {
        // Update header background to match initial section
        updateHeaderBackground(currentSection);
        
        if (currentSection.id === 'hero' || 
            currentSection.id === 'testimonials' || 
            currentSection.id === 'contact') {
            document.body.classList.remove('light-bg');
            document.body.classList.add('dark-bg');
        } else {
            document.body.classList.remove('dark-bg');
            document.body.classList.add('light-bg');
        }
    }
}

// Run on initial load
window.addEventListener('load', setInitialBodyClass);

// Function to update the active menu item
function updateActiveMenuItem(currentSection) {
    if (!currentSection) return;
    
    const navLinks = document.querySelectorAll('.nav-links a');
    const currentSectionId = currentSection.id;
    
    // Only proceed if we have a valid section ID
    if (!currentSectionId) return;
    
    navLinks.forEach(link => {
        // Remove active class from all links
        link.classList.remove('active');
        
        // Get the href attribute and extract the section ID
        const linkHref = link.getAttribute('href');
        
        // Skip if href is not properly formatted
        if (!linkHref || !linkHref.startsWith('#')) return;
        
        const sectionId = linkHref.substring(1); // Remove the # character
        
        // Add active class if the link points to the current section
        if (currentSectionId === sectionId) {
            link.classList.add('active');
        }
    });
}

// Set the initial active menu item on page load
document.addEventListener('DOMContentLoaded', function() {
    // Get current section and update active menu item
    const currentSection = getCurrentSection();
    updateActiveMenuItem(currentSection);
});

// Animate the credentials in the Who We Are section
document.addEventListener('DOMContentLoaded', function() {
  const credentialCards = document.querySelectorAll('.credential-card');
  
  if (credentialCards.length > 0) {
    credentialCards.forEach((card, index) => {
      // Add staggered animation delay
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      card.style.transitionDelay = `${0.1 * index}s`;
      
      // Set up intersection observer for animation
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, 100);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      
      observer.observe(card);
    });
  }
  
  // Add subtle hover effect for about commitment box
  const commitmentBox = document.querySelector('.commitment-box');
  if (commitmentBox) {
    commitmentBox.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.12)';
    });
    
    commitmentBox.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
    });
  }
});

// Mobile Hero Optimization
document.addEventListener('DOMContentLoaded', function() {
  // Detect iOS device
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  if (isIOS) {
    // Add iOS-specific class to hero section
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      heroSection.classList.add('ios-device');
    }
    
    // Add iOS class to body for global styles if needed
    document.body.classList.add('ios-device');
  }
  
  // Calculate and adjust hero subtitle font size to ensure single line
  function adjustHeroSubtitle() {
    // ONLY run on actual mobile devices, never on desktop
    if (window.innerWidth <= 992) { 
      const subtitleSpans = document.querySelectorAll('.hero-subtitle span');
      
      subtitleSpans.forEach(span => {
        // Start with current font size
        let currentSize = parseFloat(window.getComputedStyle(span).fontSize);
        span.style.whiteSpace = 'nowrap';
        
        // Check if span is wider than its container
        const container = span.parentElement;
        const containerWidth = container.clientWidth - 30; // Subtract padding
        
        // Gradually reduce font size until it fits in one line
        while (span.scrollWidth > containerWidth && currentSize > 11) { // Don't go below 11px
          currentSize -= 0.5;
          span.style.fontSize = currentSize + 'px';
        }
      });
    } else {
      // For desktop: REMOVE any inline styles that might have been set
      const subtitleSpans = document.querySelectorAll('.hero-subtitle span');
      subtitleSpans.forEach(span => {
        span.style.fontSize = '';
        span.style.whiteSpace = '';
      });
    }
  }
  
  // Run on load and resize
  adjustHeroSubtitle();
  
  // Use a debounced resize event to prevent performance issues
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      // Check if we crossed the mobile/desktop threshold
      const wasMobile = window.innerWidth <= 992;
      adjustHeroSubtitle();
      const isMobile = window.innerWidth <= 992;
      
      // If transitioning between mobile and desktop, ensure styles are properly reset
      if (wasMobile !== isMobile) {
        const subtitleSpans = document.querySelectorAll('.hero-subtitle span');
        if (!isMobile) {
          // Switching to desktop - remove all inline styles
          subtitleSpans.forEach(span => {
            span.removeAttribute('style');
          });
        }
      }
    }, 250);
  });
});