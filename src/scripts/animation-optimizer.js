/**
 * Optimiseur d'animations pour mobile
 * Améliore les performances des animations sur mobile/tablettes
 */

// Détection du type d'appareil
const isMobile = () => window.innerWidth <= 768;
const isVerySmall = () => window.innerWidth <= 480;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Configuration des animations selon l'appareil
const getAnimationConfig = () => {
  if (isVerySmall() || prefersReducedMotion()) {
    return {
      enabled: false,
      duration: 0,
      threshold: 0.1
    };
  }
  
  if (isMobile()) {
    return {
      enabled: true,
      duration: 0.5,
      threshold: 0.2
    };
  }
  
  return {
    enabled: true,
    duration: 0.8,
    threshold: 0.1
  };
};

// Optimisation des animations au scroll
class ScrollAnimationOptimizer {
  constructor() {
    this.config = getAnimationConfig();
    this.observers = new Map();
    this.animatedElements = new Set();
    this.isScrolling = false;
    this.scrollTimer = null;
    
    this.init();
  }
  
  init() {
    if (!this.config.enabled) {
      this.disableAllAnimations();
      return;
    }
    
    this.setupIntersectionObserver();
    this.setupScrollOptimization();
    this.setupResizeHandler();
    this.optimizeExistingAnimations();
  }
  
  setupIntersectionObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '50px',
      threshold: this.config.threshold
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activateAnimation(entry.target);
        }
      });
    }, observerOptions);
    
    // Observer tous les éléments animés
    this.observeAnimatedElements();
  }
  
  observeAnimatedElements() {
    const animatedElements = document.querySelectorAll(`
      .scroll-animate,
      .scroll-animate-left,
      .scroll-animate-right,
      .scroll-animate-scale,
      .text-blocks > .text-block
    `);
    
    animatedElements.forEach(element => {
      this.observer.observe(element);
    });
  }
  
  activateAnimation(element) {
    if (this.animatedElements.has(element)) return;
    
    // Ajouter will-change avant l'animation
    element.style.willChange = 'transform, opacity';
    
    // Activer l'animation
    element.classList.add('animate');
    this.animatedElements.add(element);
    
    // Nettoyer will-change après l'animation
    setTimeout(() => {
      element.style.willChange = 'auto';
      element.classList.add('animation-complete');
    }, this.config.duration * 1000 + 100);
    
    // Arrêter d'observer cet élément
    this.observer.unobserve(element);
  }
  
  setupScrollOptimization() {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.onScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
  
  onScroll() {
    this.isScrolling = true;
    
    // Réduire les animations pendant le scroll
    if (isMobile()) {
      document.body.classList.add('scrolling');
    }
    
    // Nettoyer le timer précédent
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
    }
    
    // Restaurer les animations après le scroll
    this.scrollTimer = setTimeout(() => {
      this.isScrolling = false;
      document.body.classList.remove('scrolling');
    }, 150);
  }
  
  setupResizeHandler() {
    let resizeTimer = null;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.config = getAnimationConfig();
        
        if (!this.config.enabled) {
          this.disableAllAnimations();
        }
      }, 250);
    });
  }
  
  optimizeExistingAnimations() {
    // Optimiser les animations infinies sur mobile
    if (isMobile()) {
      const infiniteAnimations = document.querySelectorAll(`
        .animate-bounce-gentle,
        .animate-float,
        .animate-pulse-slow,
        .animate-gradient
      `);
      
      infiniteAnimations.forEach(element => {
        element.style.willChange = 'transform';
        
        // Réduire la fréquence d'animation
        if (element.classList.contains('animate-bounce-gentle')) {
          element.style.animationDuration = '3s';
        } else if (element.classList.contains('animate-float')) {
          element.style.animationDuration = '4s';
        } else if (element.classList.contains('animate-gradient')) {
          element.style.animationDuration = '8s';
        }
      });
    }
  }
  
  disableAllAnimations() {
    // Désactiver toutes les animations
    const animatedElements = document.querySelectorAll(`
      .scroll-animate,
      .scroll-animate-left,
      .scroll-animate-right,
      .scroll-animate-scale,
      .animate-bounce-gentle,
      .animate-float,
      .animate-pulse-slow,
      .animate-gradient,
      .text-blocks > .text-block
    `);
    
    animatedElements.forEach(element => {
      element.style.animation = 'none';
      element.style.transition = 'none';
      element.style.transform = 'none';
      element.style.opacity = '1';
      element.style.willChange = 'auto';
    });
    
    // Activer immédiatement tous les éléments scroll-animate
    document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale').forEach(element => {
      element.classList.add('animate');
    });
  }
}

// Optimisation des performances pendant le scroll
const scrollPerformanceCSS = `
  .scrolling .hover-lift:hover {
    transform: none !important;
    transition: none !important;
  }
  
  .scrolling .animate-bounce-gentle,
  .scrolling .animate-float {
    animation-play-state: paused !important;
  }
`;

// Ajouter les styles d'optimisation
const styleSheet = document.createElement('style');
styleSheet.textContent = scrollPerformanceCSS;
document.head.appendChild(styleSheet);

// Initialiser l'optimiseur quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ScrollAnimationOptimizer();
  });
} else {
  new ScrollAnimationOptimizer();
}

// Réinitialiser l'optimiseur lors de la navigation
window.addEventListener('beforeunload', () => {
  // Nettoyer les will-change pour éviter les fuites mémoire
  document.querySelectorAll('*[style*="will-change"]').forEach(element => {
    element.style.willChange = 'auto';
  });
});