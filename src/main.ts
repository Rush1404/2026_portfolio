// /src/main.ts
document.addEventListener('DOMContentLoaded', () => {
  
  const loader: HTMLElement | null = document.getElementById('loader');
  
  // Wait 1.3s for the dropping animation to finish completely
  setTimeout(() => {
    if (loader) {
      // Remove the white loader screen
      loader.remove(); 
    }
    
    // Re-enable scrolling on the body
    document.body.classList.remove('loading');
    
    // NEW: Add the class that triggers the CSS fade-in transitions
    // We add this a tiny fraction of a second later to ensure 
    // the browser paints the background first.
    requestAnimationFrame(() => {
      document.body.classList.add('site-loaded');
    });
    
  }, 1300);

  // --- Scroll Observer for the Sidebar ---
  const sidebar = document.querySelector('.about-sidebar') as HTMLElement | null;
  
  // The amount of pixels the user needs to scroll for the transition to complete
  const transitionThreshold = 400; 

  const handleScroll = () => {
    const scrollY = window.scrollY;
    
    // Calculate progress between 0 and 1
    const progress = Math.min(scrollY / transitionThreshold, 1);

    // 2. Animate Sidebar In (Slides right to 0 and fades in)
    if (sidebar) {
      sidebar.style.opacity = `${progress}`;
      // Slides from -30px to 0px
      sidebar.style.transform = `translateX(${(1 - progress) * -30}px)`; 
    }
  };

  // Attach the listener and fire it once on load in case the page is reloaded mid-scroll
  window.addEventListener('scroll', handleScroll);
  handleScroll(); 

});