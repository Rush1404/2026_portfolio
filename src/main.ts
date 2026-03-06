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

  // --- Qualities Swapper ---
  const qualityElement = document.getElementById('quality-swap');
  const qualities = ['creative', 'modest', 'outgoing', 'hard-working', 'pragmatic', 'driven'];
  let currentQualityIndex = 0;

  if (qualityElement) {
    setInterval(() => {
      // Fade out
      qualityElement.classList.remove('fade-in');
      qualityElement.classList.add('fade-out');

      // Wait for fade out to complete, then change text and fade back in
      setTimeout(() => {
        currentQualityIndex = (currentQualityIndex + 1) % qualities.length;
        qualityElement.innerText = qualities[currentQualityIndex];
        
        qualityElement.classList.remove('fade-out');
        qualityElement.classList.add('fade-in');
      }, 500); // 500ms matches the CSS transition time
      
    }, 3000); // Swap every 3 seconds
  }

  // --- Flying Stars Generator ---
  const starField = document.getElementById('star-field');
  const starSymbols = ['✦', '✧', '⋆', '✶'];

  if (starField) {
    const createStar = () => {
      const star = document.createElement('span');
      star.classList.add('flying-star');
      
      // Randomize the star symbol
      star.innerText = starSymbols[Math.floor(Math.random() * starSymbols.length)];
      
      // Randomize vertical position (0% to 100% of the container height)
      const topPos = Math.random() * 100;
      star.style.top = `${topPos}%`;
      
      // Randomize speed (between 1.5s and 3s)
      const duration = 1.5 + Math.random() * 1.5;
      star.style.animationDuration = `${duration}s`;
      
      starField.appendChild(star);

      // Clean up the star after it finishes flying past
      setTimeout(() => {
        star.remove();
      }, duration * 1000);
    };

    // Spawn a new star every 800ms
    setInterval(createStar, 800);
  }

  // --- Modal Logic ---
  const modal = document.getElementById('letter-modal');
  const openBtn = document.querySelector('.letter-btn');
  const closeBtns = document.querySelectorAll('.close-modal, .cancel-btn');
  const glowWrapper = document.getElementById('glow-wrapper');

  if (modal && openBtn) {
    // Open modal
    openBtn.addEventListener('click', () => {
      modal.classList.add('active');
    });

    // Close modal on specific buttons
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    });

    // Close modal when clicking the dark overlay background
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  // --- Spotlight Glow Logic ---
  if (glowWrapper) {
    glowWrapper.addEventListener('mousemove', (e: MouseEvent) => {
      // Get the current position and size of the text box wrapper
      const rect = glowWrapper.getBoundingClientRect();
      
      // Calculate mouse coordinates relative to the element
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Pass those exact coordinates to CSS
      glowWrapper.style.setProperty('--mouse-x', `${x}px`);
      glowWrapper.style.setProperty('--mouse-y', `${y}px`);
    });
  }

  const bballCard = document.getElementById('bball-card') as HTMLElement | null;
  const wembyPopup = document.getElementById('wemby-popup') as HTMLElement | null;

  if (bballCard && wembyPopup) {
    bballCard.addEventListener('mousemove', (e: MouseEvent) => {
      // Get the card's position relative to the viewport
      const rect = bballCard.getBoundingClientRect();
      
      // Calculate mouse position relative to the top-left of the card
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // We want Wemby to center around the cursor, 
      // so subtract half his width (90px) from the coordinates.
      // We also add a subtle rotation based on horizontal movement.
      const moveX = x - 90;
      const moveY = y - 90;
      const rotation = (x / rect.width - 0.5) * 20; // Rotates -10 to 10 deg

      // Use transform instead of left/top for high performance
      wembyPopup.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotation}deg)`;
    });
  }

  // --- Interactive Checklist ---
  const checklistItems = document.querySelectorAll('#interactive-checklist li');
  checklistItems.forEach(item => {
    // 1. Switched to an arrow function () => { ... }
    item.addEventListener('click', () => {
      
      // 2. Replaced 'this' with 'item'
      item.classList.toggle('completed');
      
      // 3. Replaced 'this' with 'item'
      const icon = item.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-regular');
        icon.classList.toggle('fa-solid');
        icon.classList.toggle('fa-circle-check');
        icon.classList.toggle('fa-circle');
      }
    });
  });

  const audioPlayer = document.getElementById('audio-player') as HTMLAudioElement | null;
  const playBtn = document.getElementById('play-btn');
  const albumArtWrapper = document.querySelector('.album-art-wrapper');
  const eqBars = document.getElementById('eq-bars');

  if (audioPlayer && playBtn) {
    playBtn.addEventListener('click', () => {
      const icon = playBtn.querySelector('i');
      
      if (audioPlayer.paused) {
        audioPlayer.play();
        // Update UI to "Playing" state
        if (icon) {
          icon.classList.remove('fa-play');
          icon.classList.add('fa-pause');
        }
        albumArtWrapper?.classList.add('playing');
        eqBars?.classList.add('active');
      } else {
        audioPlayer.pause();
        // Update UI to "Paused" state
        if (icon) {
          icon.classList.remove('fa-pause');
          icon.classList.add('fa-play');
        }
        albumArtWrapper?.classList.remove('playing');
        eqBars?.classList.remove('active');
      }
    });

    // Auto-reset UI when song ends
    audioPlayer.addEventListener('ended', () => {
      const icon = playBtn.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
      }
      albumArtWrapper?.classList.remove('playing');
      eqBars?.classList.remove('active');
    });
  }

  // --- Copy to Clipboard Logic ---
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const copyIcon = document.getElementById('copy-icon');

  if (copyEmailBtn && copyIcon) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = 'rushabh1404@gmail.com';
      
      try {
        // Write to clipboard
        await navigator.clipboard.writeText(email);
        
        // Visual feedback
        copyIcon.innerHTML = '<i class="fa-solid fa-check" style="color: #28a745;"></i> Copied!';
        copyEmailBtn.style.borderColor = '#28a745';
        
        // Reset after 2 seconds
        setTimeout(() => {
          copyIcon.innerHTML = '<i class="fa-regular fa-copy"></i>';
          copyEmailBtn.style.borderColor = 'var(--border-color)';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy email: ', err);
      }
    });
  }

  // --- CV Modal Logic ---
  const cvModal = document.getElementById('cv-modal');
  const viewCvBtn = document.getElementById('view-cv-btn');
  // Grabs the specific close button for the CV modal
  const closeCvBtns = document.querySelectorAll('.close-cv');

  if (cvModal && viewCvBtn) {
    // Open modal
    viewCvBtn.addEventListener('click', () => {
      cvModal.classList.add('active');
      // Optional: Prevent scrolling on the body while modal is open
      document.body.style.overflow = 'hidden'; 
    });

    // Close modal on the X button
    closeCvBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        cvModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
      });
    });

    // Close modal when clicking the dark overlay background outside the modal
    cvModal.addEventListener('click', (e) => {
      if (e.target === cvModal) {
        cvModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
      }
    });
  }
});