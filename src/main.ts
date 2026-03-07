// /src/main.ts
document.addEventListener('DOMContentLoaded', () => {
  
  const loader: HTMLElement | null = document.getElementById('loader');
  
  setTimeout(() => {
    if (loader) loader.remove();
    document.body.classList.remove('loading');
    requestAnimationFrame(() => {
      document.body.classList.add('site-loaded');
    });
  }, 1300);

  // --- Scroll Observer for the Sidebar ---
  const sidebar = document.querySelector('.about-sidebar') as HTMLElement | null;
  const transitionThreshold = 400; 

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const progress = Math.min(scrollY / transitionThreshold, 1);
    if (sidebar) {
      sidebar.style.opacity = `${progress}`;
      sidebar.style.transform = `translateX(${(1 - progress) * -30}px)`; 
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); 

  // --- Qualities Swapper ---
  const qualityElement = document.getElementById('quality-swap');
  const qualities = ['creative', 'modest', 'outgoing', 'hard-working', 'pragmatic', 'driven'];
  let currentQualityIndex = 0;

  if (qualityElement) {
    setInterval(() => {
      qualityElement.classList.remove('fade-in');
      qualityElement.classList.add('fade-out');
      setTimeout(() => {
        currentQualityIndex = (currentQualityIndex + 1) % qualities.length;
        qualityElement.innerText = qualities[currentQualityIndex];
        qualityElement.classList.remove('fade-out');
        qualityElement.classList.add('fade-in');
      }, 500);
    }, 3000);
  }

  // --- Flying Stars Generator ---
  const starField = document.getElementById('star-field');
  const starSymbols = ['✦', '✧', '⋆', '✶'];

  if (starField) {
    const createStar = () => {
      const star = document.createElement('span');
      star.classList.add('flying-star');
      star.innerText = starSymbols[Math.floor(Math.random() * starSymbols.length)];
      const topPos = Math.random() * 100;
      star.style.top = `${topPos}%`;
      const duration = 1.5 + Math.random() * 1.5;
      star.style.animationDuration = `${duration}s`;
      starField.appendChild(star);
      setTimeout(() => star.remove(), duration * 1000);
    };
    setInterval(createStar, 800);
  }

  // ============================================================
  // --- SHARED SEND UTILITY ---
  // ============================================================
  async function sendToApi(payload: object): Promise<boolean> {
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  }

  // ============================================================
  // --- CONFIRMATION ANIMATION UTILITY ---
  // Shows a brutalist editorial "sent" confirmation overlay
  // inside any given container element.
  // ============================================================
  function showConfirmation(container: HTMLElement, onDone?: () => void) {
    // Build the overlay
    const overlay = document.createElement('div');
    overlay.className = 'send-confirmation';
    overlay.innerHTML = `
      <div class="confirm-inner">
        <div class="confirm-lines">
          <span></span><span></span><span></span>
        </div>
        <p class="confirm-label">// transmitted</p>
        <h2 class="confirm-title">SENT<span class="confirm-cursor">_</span></h2>
        <p class="confirm-sub">Message received.</p>
      </div>
    `;

    container.style.position = 'relative';
    container.appendChild(overlay);

    // Trigger entrance
    requestAnimationFrame(() => overlay.classList.add('visible'));

    // Auto-dismiss after 2.5s
    setTimeout(() => {
      overlay.classList.remove('visible');
      overlay.classList.add('exiting');
      setTimeout(() => {
        overlay.remove();
        onDone?.();
      }, 600);
    }, 2500);
  }

  // ============================================================
  // --- PERSONAL PAGE: "Write a Letter" Modal ---
  // ============================================================
  const modal = document.getElementById('letter-modal');
  const openBtn = document.querySelector('.letter-btn');
  const closeBtns = document.querySelectorAll('.close-modal, .cancel-btn');
  const glowWrapper = document.getElementById('glow-wrapper');
  const letterTextarea = modal?.querySelector('.letter-textarea') as HTMLTextAreaElement | null;
  const sendBtn = modal?.querySelector('.send-btn') as HTMLButtonElement | null;
  const modalContainer = modal?.querySelector('.modal-container') as HTMLElement | null;

  if (modal && openBtn) {
    openBtn.addEventListener('click', () => modal.classList.add('active'));

    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => modal.classList.remove('active'));
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  if (sendBtn && letterTextarea && modalContainer) {
    sendBtn.addEventListener('click', async () => {
      const message = letterTextarea.value.trim();
      if (!message) {
        letterTextarea.style.borderColor = '#e74c3c';
        letterTextarea.focus();
        setTimeout(() => letterTextarea.style.borderColor = '', 2000);
        return;
      }

      // Loading state
      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';

      const ok = await sendToApi({ type: 'letter', message });

      if (ok) {
        // Show confirmation inside the modal container
        showConfirmation(modalContainer, () => {
          // Reset form and close modal
          letterTextarea.value = '';
          modal?.classList.remove('active');
          sendBtn.disabled = false;
          sendBtn.textContent = 'Send';
        });
      } else {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
        showError(sendBtn, 'Failed to send. Try again.');
      }
    });
  }

  // --- Spotlight Glow Logic ---
  if (glowWrapper) {
    glowWrapper.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = glowWrapper.getBoundingClientRect();
      glowWrapper.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      glowWrapper.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  }

  // ============================================================
  // --- CONTACT PAGE: Contact Form ---
  // ============================================================
  const contactForm = document.getElementById('contact-form') as HTMLFormElement | null;
  const nameInput = document.getElementById('name') as HTMLInputElement | null;
  const emailInput = document.getElementById('email') as HTMLInputElement | null;
  const messageInput = document.getElementById('message') as HTMLTextAreaElement | null;
  const submitBtn = contactForm?.querySelector('.submit-btn') as HTMLButtonElement | null;
  const contactContainer = document.querySelector('.contact-container') as HTMLElement | null;

  if (contactForm && submitBtn && contactContainer) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = nameInput?.value.trim() ?? '';
      const email = emailInput?.value.trim() ?? '';
      const message = messageInput?.value.trim() ?? '';

      if (!name || !email || !message) return;

      // Loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';

      const ok = await sendToApi({ type: 'contact', name, email, message });

      if (ok) {
        showConfirmation(contactContainer, () => {
          // Reset form
          contactForm.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Send Email <i class="fa-solid fa-arrow-right"></i>';
        });
      } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Email <i class="fa-solid fa-arrow-right"></i>';
        showError(submitBtn, 'Failed to send. Try again.');
      }
    });
  }

  // ============================================================
  // --- HELPER: Inline error message ---
  // ============================================================
  function showError(anchor: HTMLElement, msg: string) {
    const err = document.createElement('p');
    err.textContent = msg;
    err.style.cssText = `
      font-family: var(--font-mono); font-size: 0.85rem;
      color: #e74c3c; margin-top: 0.5rem; text-align: center;
    `;
    anchor.parentNode?.insertBefore(err, anchor.nextSibling);
    setTimeout(() => err.remove(), 4000);
  }

  // ============================================================
  // --- Bball Card / Wemby Popup ---
  // ============================================================
  const bballCard = document.getElementById('bball-card') as HTMLElement | null;
  const wembyPopup = document.getElementById('wemby-popup') as HTMLElement | null;

  if (bballCard && wembyPopup) {
    bballCard.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = bballCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const moveX = x - 90;
      const moveY = y - 90;
      const rotation = (x / rect.width - 0.5) * 20;
      wembyPopup.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotation}deg)`;
    });
  }

  // --- Interactive Checklist ---
  const checklistItems = document.querySelectorAll('#interactive-checklist li');
  checklistItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('completed');
      const icon = item.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-regular');
        icon.classList.toggle('fa-solid');
        icon.classList.toggle('fa-circle-check');
        icon.classList.toggle('fa-circle');
      }
    });
  });

  // --- Music Player ---
  const audioPlayer = document.getElementById('audio-player') as HTMLAudioElement | null;
  const playBtn = document.getElementById('play-btn');
  const albumArtWrapper = document.querySelector('.album-art-wrapper');
  const eqBars = document.getElementById('eq-bars');

  if (audioPlayer && playBtn) {
    playBtn.addEventListener('click', () => {
      const icon = playBtn.querySelector('i');
      if (audioPlayer.paused) {
        audioPlayer.play();
        icon?.classList.replace('fa-play', 'fa-pause');
        albumArtWrapper?.classList.add('playing');
        eqBars?.classList.add('active');
      } else {
        audioPlayer.pause();
        icon?.classList.replace('fa-pause', 'fa-play');
        albumArtWrapper?.classList.remove('playing');
        eqBars?.classList.remove('active');
      }
    });

    audioPlayer.addEventListener('ended', () => {
      const icon = playBtn.querySelector('i');
      icon?.classList.replace('fa-pause', 'fa-play');
      albumArtWrapper?.classList.remove('playing');
      eqBars?.classList.remove('active');
    });
  }

  // --- Copy to Clipboard ---
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const copyIcon = document.getElementById('copy-icon');

  if (copyEmailBtn && copyIcon) {
    copyEmailBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('rushabh1404@gmail.com');
        copyIcon.innerHTML = '<i class="fa-solid fa-check" style="color: #28a745;"></i> Copied!';
        copyEmailBtn.style.borderColor = '#28a745';
        setTimeout(() => {
          copyIcon.innerHTML = '<i class="fa-regular fa-copy"></i>';
          copyEmailBtn.style.borderColor = 'var(--border-color)';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy email:', err);
      }
    });
  }

  // --- CV Modal ---
  const cvModal = document.getElementById('cv-modal');
  const viewCvBtn = document.getElementById('view-cv-btn');
  const closeCvBtns = document.querySelectorAll('.close-cv');

  if (cvModal && viewCvBtn) {
    viewCvBtn.addEventListener('click', () => {
      cvModal.classList.add('active');
      document.body.style.overflow = 'hidden'; 
    });

    closeCvBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        cvModal.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    cvModal.addEventListener('click', (e) => {
      if (e.target === cvModal) {
        cvModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
});