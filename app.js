/* =====================================================
   THINK OF YOU — App Router & Interactivity
   ===================================================== */

(function () {
  'use strict';

  // ─── State ──────────────────────────────────────────
  const state = {
    uploadedPhotoUrl: null,
    title: '',
    titleColor: 'white',
    fromName: '',
    isFlipped: false,
    currentPage: null,
  };

  // ─── DOM Refs ────────────────────────────────────────
  const $ = (id) => document.getElementById(id);

  // ─── Router ──────────────────────────────────────────
  function getRoute() {
    const path = window.location.pathname;
    if (path === '/create' || path === '/create/') return 'create';
    return 'home';
  }

  function navigate(path, push = true) {
    if (push) window.history.pushState({}, '', path);
    render();
  }

  function render() {
    const route = getRoute();
    const homeEl = $('page-home');
    const createEl = $('page-create');

    if (route === 'create') {
      homeEl.style.display = 'none';
      createEl.style.display = 'block';
      state.currentPage = 'create';
      document.title = 'ThinkOfYou — Create';
    } else {
      homeEl.style.display = 'block';
      createEl.style.display = 'none';
      state.currentPage = 'home';
      document.title = 'ThinkOfYou';
    }
  }

  // ─── Navigation Link Handling ─────────────────────────
  function handleLinkClick(e) {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (href && href.startsWith('/') && !href.startsWith('//')) {
      e.preventDefault();
      navigate(href);
    }
  }

  document.addEventListener('click', handleLinkClick);
  window.addEventListener('popstate', render);

  // ─── Create Page Logic ────────────────────────────────
  function initCreatePage() {
    const flipCard = document.querySelector('.flip-card');
    const flipBtn = $('flip-btn');
    const flipHintBtn = $('flip-hint-btn');
    const photoUpload = $('photo-upload');
    const uploadPrompt = $('upload-prompt');
    const uploadedPhoto = $('uploaded-photo');
    const titleInput = $('title-input');
    const titleCharCount = $('title-char-count');
    const titleOverlay = $('postcard-title-overlay');
    const fromInput = $('from-input');
    const fromNameEl = $('from-name');
    const shareDesktop = $('share-btn-desktop');
    const shareMobile = $('share-btn-mobile');
    const colorWhite = $('color-white');
    const colorBlack = $('color-black');
    const shareModal = $('share-modal');
    const modalCloseBtn = $('modal-close-btn');
    const copyLinkBtn = $('copy-link-btn');
    const downloadBtn = $('download-btn');
    const postCardFront = document.querySelector('.postcard-front');

    if (!flipCard) return; // not ready yet

    // ── Flip ─────────────────────────────────
    function toggleFlip() {
      state.isFlipped = !state.isFlipped;
      flipCard.classList.toggle('flipped', state.isFlipped);
      const pressed = state.isFlipped ? 'true' : 'false';
      flipBtn.setAttribute('aria-pressed', pressed);
      // Update hint text
      const hintText = flipHintBtn.childNodes[flipHintBtn.childNodes.length - 1];
      if (hintText) {
        hintText.textContent = state.isFlipped ? 'Click to flip back' : 'Click to flip';
      }
    }

    flipBtn.addEventListener('click', toggleFlip);
    flipHintBtn.addEventListener('click', toggleFlip);

    // ── Photo Upload ──────────────────────────
    function handlePhotoFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        state.uploadedPhotoUrl = e.target.result;
        uploadedPhoto.src = e.target.result;
        uploadedPhoto.style.display = 'block';
        uploadPrompt.style.display = 'none';
        updateShareButtons();
      };
      reader.readAsDataURL(file);
    }

    photoUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handlePhotoFile(file);
    });

    // Drag and drop
    const uploadLabel = document.querySelector('.upload-label');
    if (uploadLabel) {
      uploadLabel.addEventListener('dragover', (e) => {
        e.preventDefault();
        postCardFront && postCardFront.classList.add('drag-highlight');
      });
      uploadLabel.addEventListener('dragleave', () => {
        postCardFront && postCardFront.classList.remove('drag-highlight');
      });
      uploadLabel.addEventListener('drop', (e) => {
        e.preventDefault();
        postCardFront && postCardFront.classList.remove('drag-highlight');
        const file = e.dataTransfer.files[0];
        if (file) handlePhotoFile(file);
      });
    }

    // ── Title ─────────────────────────────────
    titleInput.addEventListener('input', () => {
      const val = titleInput.value;
      state.title = val;
      titleCharCount.textContent = val.length;

      if (val.trim()) {
        titleOverlay.style.display = 'block';
        titleOverlay.textContent = val;
        titleOverlay.style.color = state.titleColor === 'white' ? '#ffffff' : '#141414';
      } else {
        titleOverlay.style.display = 'none';
      }
    });

    // ── From Name ─────────────────────────────
    fromInput.addEventListener('input', () => {
      state.fromName = fromInput.value;
      if (fromNameEl) fromNameEl.textContent = fromInput.value || '\u00A0';
    });

    // ── Color Picker ──────────────────────────
    function setTitleColor(color) {
      state.titleColor = color;
      colorWhite.setAttribute('aria-pressed', color === 'white' ? 'true' : 'false');
      colorBlack.setAttribute('aria-pressed', color === 'black' ? 'true' : 'false');
      colorWhite.classList.toggle('selected', color === 'white');
      colorBlack.classList.toggle('selected', color === 'black');

      if (titleOverlay && state.title.trim()) {
        titleOverlay.style.color = color === 'white' ? '#ffffff' : '#141414';
      }
    }

    colorWhite.addEventListener('click', () => setTitleColor('white'));
    colorBlack.addEventListener('click', () => setTitleColor('black'));

    // ── Share Buttons ─────────────────────────
    function updateShareButtons() {
      const enabled = !!state.uploadedPhotoUrl;
      if (shareDesktop) shareDesktop.disabled = !enabled;
      if (shareMobile) shareMobile.disabled = !enabled;
    }

    function openShareModal() {
      if (!state.uploadedPhotoUrl) return;
      // Generate a fake unique URL
      const id = Math.random().toString(36).substr(2, 9);
      const linkInput = $('share-link-input');
      if (linkInput) {
        linkInput.value = `https://think-of-you.vercel.app/p/${id}`;
      }
      shareModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    if (shareDesktop) shareDesktop.addEventListener('click', openShareModal);
    if (shareMobile) shareMobile.addEventListener('click', openShareModal);

    // ── Modal ─────────────────────────────────
    function closeModal() {
      shareModal.style.display = 'none';
      document.body.style.overflow = '';
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

    shareModal.addEventListener('click', (e) => {
      if (e.target === shareModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && shareModal.style.display === 'flex') closeModal();
    });

    // ── Copy Link ─────────────────────────────
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        const linkInput = $('share-link-input');
        if (!linkInput) return;
        navigator.clipboard.writeText(linkInput.value).then(() => {
          copyLinkBtn.textContent = 'Copied!';
          setTimeout(() => { copyLinkBtn.textContent = 'Copy'; }, 2000);
        }).catch(() => {
          linkInput.select();
          document.execCommand('copy');
          copyLinkBtn.textContent = 'Copied!';
          setTimeout(() => { copyLinkBtn.textContent = 'Copy'; }, 2000);
        });
      });
    }

    // ── Download ──────────────────────────────
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        downloadPostcard();
      });
    }

    updateShareButtons();
  }

  // ─── Download Postcard via Canvas ─────────────────────
  function downloadPostcard() {
    if (!state.uploadedPhotoUrl) return;

    const canvas = document.createElement('canvas');
    const W = 354 * 2; // @2x
    const H = 250 * 2;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(0, 0, W, H);

    // Load the uploaded photo
    const img = new Image();
    img.onload = () => {
      // Draw photo covering the card
      const scale = Math.max(W / img.width, H / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (W - dw) / 2;
      const dy = (H - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);

      // Draw title overlay
      if (state.title.trim()) {
        ctx.font = `600 72px 'Dancing Script', cursive`;
        ctx.fillStyle = state.titleColor === 'white' ? '#ffffff' : '#141414';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fillText(state.title, 40, 120);
        ctx.shadowColor = 'transparent';
      }

      // Download
      const link = document.createElement('a');
      link.download = 'my-postcard.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = state.uploadedPhotoUrl;
  }

  // ─── Bootstrap ───────────────────────────────────────
  function bootstrap() {
    render();
    // Init create page logic after render
    // Use MutationObserver pattern or just always init (idempotent checks inside)
    initCreatePage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

})();
