/* =====================================================
   THINK OF YOU — App v2: Full interactivity
   ===================================================== */
(function () {
  'use strict';

  // ─── State ───────────────────────────────────────────
  const state = {
    uploadedPhotoUrl: null,
    title: '',
    titleColor: 'white',
    to: '',
    from: '',
    message: '',
    stamp: 'green',
    flower: 'white',
    isFlipped: false,
  };

  const STAMP_SRCS = {
    green:     'assets/stamps/stamp-green.png',
    blue:      'assets/stamps/stamp-blue.png',
    darkgreen: 'assets/stamps/stamp-darkgreen.png',
  };

  const FLOWER_SRCS = {
    white:     'assets/flowers/flower-white.png',
    meadow:    'assets/flowers/flower-meadow.png',
    blue:      'assets/flowers/flower-blue.png',
    botanical: 'assets/flowers/flower-botanical.png',
    yellow:    'assets/flowers/flower-yellow.png',
  };

  // ─── Shorthand ───────────────────────────────────────
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  // ═══════════════════════════════════════════════════
  //  ROUTER
  // ═══════════════════════════════════════════════════
  function getRoute() {
    const p = window.location.pathname;
    return (p === '/create' || p === '/create/') ? 'create' : 'home';
  }

  function navigate(path, push = true) {
    if (push) window.history.pushState({}, '', path);
    render();
  }

  function render() {
    const route = getRoute();
    const homeEl  = $('page-home');
    const createEl = $('page-create');

    if (route === 'create') {
      homeEl.style.display  = 'none';
      createEl.style.display = 'block';
      document.title = 'ThinkOfYou — Create';
      // Init create controls every time we show the page
      initCreate();
    } else {
      homeEl.style.display  = 'block';
      createEl.style.display = 'none';
      document.title = 'ThinkOfYou';
    }
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href && href.startsWith('/') && !href.startsWith('//')) {
      e.preventDefault();
      navigate(href);
    }
  });

  window.addEventListener('popstate', render);

  // ═══════════════════════════════════════════════════
  //  CREATE PAGE
  // ═══════════════════════════════════════════════════
  let createInited = false;

  function initCreate() {
    // Only bind events once; reactive updates happen via state
    if (createInited) { syncAll(); return; }
    createInited = true;

    // ── Element refs ──────────────────────────────────
    const flipCard      = $('flip-card');
    const flipBtn       = $('flip-btn');
    const flipHintBtn   = $('flip-hint-btn');
    const flipHintText  = $('flip-hint-text');

    const photoUpload   = $('photo-upload');
    const uploadPrompt  = $('upload-prompt');
    const uploadedPhoto = $('uploaded-photo');
    const postFront     = $('postcard-front');

    const titleInput    = $('title-input');
    const titleCount    = $('title-char-count');
    const titleOverlay  = $('front-title-overlay');
    const colorWhiteBtn = $('color-white');
    const colorBlackBtn = $('color-black');

    const controlsFront = $('controls-front');
    const controlsBack  = $('controls-back');

    const toInput       = $('to-input');
    const toCount       = $('to-char-count');
    const fromInput     = $('from-input');
    const fromCount     = $('from-char-count');
    const msgInput      = $('message-input');
    const msgCount      = $('msg-char-count');

    const pcToName      = $('pc-to-name');
    const pcFromName    = $('pc-from-name');
    const pcMsgPreview  = $('pc-message-preview');
    const pcStampImg    = $('pc-stamp-img');
    const pcFlowerImg   = $('pc-flower-img');

    const stampPicker   = $('stamp-picker');
    const flowerPicker  = $('flower-picker');

    const shareDesktop  = $('share-btn-desktop');
    const shareMobile   = $('share-btn-mobile');
    const shareModal    = $('share-modal');
    const modalCloseBtn = $('modal-close-btn');
    const copyLinkBtn   = $('copy-link-btn');
    const downloadBtn   = $('download-btn');

    // ── Flip ─────────────────────────────────────────
    function toggleFlip(e) {
      if (e) {
        // If clicking the upload area on the front, let the upload happen, don't flip
        const isUploadClick = e.target.closest('.upload-label') || e.target.closest('input[type="file"]');
        if (!state.isFlipped && isUploadClick) return;
      }
      state.isFlipped = !state.isFlipped;
      flipCard.classList.toggle('flipped', state.isFlipped);
      flipBtn.setAttribute('aria-pressed', String(state.isFlipped));
      flipHintText.textContent = state.isFlipped ? 'Click to flip back' : 'Click to flip';

      // Switch which control panel is shown
      if (state.isFlipped) {
        controlsFront.style.display = 'none';
        controlsBack.style.display  = 'block';
      } else {
        controlsFront.style.display = 'block';
        controlsBack.style.display  = 'none';
      }
    }

    flipBtn.addEventListener('click', toggleFlip);
    flipHintBtn.addEventListener('click', toggleFlip);

    // ── Photo Upload ──────────────────────────────────
    function applyPhoto(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        state.uploadedPhotoUrl = e.target.result;
        uploadedPhoto.src = e.target.result;
        uploadedPhoto.style.display = 'block';
        uploadPrompt.style.display = 'none';
        updateShareButtons();
      };
      reader.readAsDataURL(file);
    }

    photoUpload.addEventListener('change', e => applyPhoto(e.target.files[0]));

    // Drag & drop
    const uploadLabel = postFront.querySelector('.upload-label');
    uploadLabel.addEventListener('dragover', e => {
      e.preventDefault();
      postFront.classList.add('drag-over');
    });
    uploadLabel.addEventListener('dragleave', () => postFront.classList.remove('drag-over'));
    uploadLabel.addEventListener('drop', e => {
      e.preventDefault();
      postFront.classList.remove('drag-over');
      applyPhoto(e.dataTransfer.files[0]);
    });

    // ── Title (front) ─────────────────────────────────
    titleInput.addEventListener('input', () => {
      state.title = titleInput.value;
      titleCount.textContent = state.title.length;
      titleCount.parentElement.classList.toggle('at-limit', state.title.length >= 25);
      renderTitleOverlay();
    });

    function renderTitleOverlay() {
      titleOverlay.textContent = state.title;
      titleOverlay.style.color = state.titleColor === 'black' ? '#141414' : '#ffffff';
      titleOverlay.style.display = state.title.trim() && state.uploadedPhotoUrl ? 'block' : 'none';
    }

    // ── Color picker ──────────────────────────────────
    function setColor(color) {
      state.titleColor = color;
      colorWhiteBtn.setAttribute('aria-pressed', String(color === 'white'));
      colorBlackBtn.setAttribute('aria-pressed', String(color === 'black'));
      colorWhiteBtn.classList.toggle('selected', color === 'white');
      colorBlackBtn.classList.toggle('selected', color === 'black');
      renderTitleOverlay();
    }
    colorWhiteBtn.addEventListener('click', () => setColor('white'));
    colorBlackBtn.addEventListener('click', () => setColor('black'));

    // ── To ────────────────────────────────────────────
    toInput.addEventListener('input', () => {
      state.to = toInput.value;
      toCount.textContent = state.to.length;
      toCount.parentElement.classList.toggle('at-limit', state.to.length >= 25);
      pcToName.textContent = state.to;
      updateShareButtons();
    });

    // ── From ──────────────────────────────────────────
    fromInput.addEventListener('input', () => {
      state.from = fromInput.value;
      fromCount.textContent = state.from.length;
      fromCount.parentElement.classList.toggle('at-limit', state.from.length >= 25);
      pcFromName.textContent = state.from || '\u00A0';
      updateShareButtons();
    });

    // ── Message ───────────────────────────────────────
    msgInput.addEventListener('input', () => {
      state.message = msgInput.value;
      msgCount.textContent = state.message.length;
      msgCount.parentElement.classList.toggle('at-limit', state.message.length >= 1000);
      pcMsgPreview.textContent = state.message;
      updateShareButtons();
    });

    // ── Stamp Picker ──────────────────────────────────
    stampPicker.addEventListener('click', e => {
      const btn = e.target.closest('.stamp-btn');
      if (!btn) return;
      const stamp = btn.dataset.stamp;
      state.stamp = stamp;
      $$('.stamp-btn').forEach(b => {
        b.classList.toggle('selected', b.dataset.stamp === stamp);
        b.setAttribute('aria-pressed', String(b.dataset.stamp === stamp));
      });
      pcStampImg.src = STAMP_SRCS[stamp];
    });

    // ── Flower Picker ─────────────────────────────────
    flowerPicker.addEventListener('click', e => {
      const btn = e.target.closest('.flower-btn');
      if (!btn) return;
      const flower = btn.dataset.flower;
      state.flower = flower;
      $$('.flower-btn').forEach(b => {
        b.classList.toggle('selected', b.dataset.flower === flower);
        b.setAttribute('aria-pressed', String(b.dataset.flower === flower));
      });
      pcFlowerImg.src = FLOWER_SRCS[flower];
    });

    // ── Share Buttons ─────────────────────────────────
    function isReadyToShare() {
      // Must have: photo + to + from + message
      return !!(state.uploadedPhotoUrl && state.to.trim() && state.from.trim() && state.message.trim());
    }

    function updateShareButtons() {
      const ready = isReadyToShare();
      shareDesktop.disabled = !ready;
      shareMobile.disabled  = !ready;
    }

    function openShareModal() {
      if (!isReadyToShare()) return;
      const id = Math.random().toString(36).substr(2, 9);
      $('share-link-input').value = `https://think-of-you.vercel.app/p/${id}`;
      shareModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    shareDesktop.addEventListener('click', openShareModal);
    shareMobile.addEventListener('click', openShareModal);

    // ── Modal ─────────────────────────────────────────
    function closeModal() {
      shareModal.style.display = 'none';
      document.body.style.overflow = '';
    }
    modalCloseBtn.addEventListener('click', closeModal);
    shareModal.addEventListener('click', e => { if (e.target === shareModal) closeModal(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && shareModal.style.display === 'flex') closeModal();
    });

    // ── Copy Link ─────────────────────────────────────
    copyLinkBtn.addEventListener('click', () => {
      const val = $('share-link-input').value;
      navigator.clipboard.writeText(val).then(() => {
        copyLinkBtn.textContent = 'Copied!';
        setTimeout(() => { copyLinkBtn.textContent = 'Copy'; }, 2000);
      }).catch(() => {
        $('share-link-input').select();
        document.execCommand('copy');
        copyLinkBtn.textContent = 'Copied!';
        setTimeout(() => { copyLinkBtn.textContent = 'Copy'; }, 2000);
      });
    });

    // ── Download ──────────────────────────────────────
    downloadBtn.addEventListener('click', downloadPostcard);

    // Sync initial state to DOM
    syncAll();
  }

  // ── Sync full state to DOM (called on re-render) ───
  function syncAll() {
    // Stamp & flower images on back of postcard
    const pcStampImg  = $('pc-stamp-img');
    const pcFlowerImg = $('pc-flower-img');
    if (pcStampImg)  pcStampImg.src  = STAMP_SRCS[state.stamp];
    if (pcFlowerImg) pcFlowerImg.src = FLOWER_SRCS[state.flower];
  }

  // ═══════════════════════════════════════════════════
  //  DOWNLOAD via Canvas
  // ═══════════════════════════════════════════════════
  function downloadPostcard() {
    if (!state.uploadedPhotoUrl) return;

    const canvas = document.createElement('canvas');
    const W = 708, H = 500; // @2x
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const photoImg = new Image();
    photoImg.onload = () => {
      // Fill background
      ctx.fillStyle = '#f5f0e8';
      ctx.fillRect(0, 0, W, H);

      // Draw photo
      const scale = Math.max(W / photoImg.width, H / photoImg.height);
      const dw = photoImg.width * scale;
      const dh = photoImg.height * scale;
      ctx.drawImage(photoImg, (W - dw) / 2, (H - dh) / 2, dw, dh);

      // Vignette
      const grad = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.85);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.28)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Title
      if (state.title.trim()) {
        ctx.font = `600 72px 'Dancing Script', cursive`;
        ctx.fillStyle = state.titleColor === 'black' ? '#000000' : '#ffffff';
        ctx.shadowColor = state.titleColor === 'black' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.fillText(state.title, 40, 100);
        ctx.shadowColor = 'transparent';
      }

      const a = document.createElement('a');
      a.download = 'my-postcard.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    photoImg.src = state.uploadedPhotoUrl;
  }

  // ═══════════════════════════════════════════════════
  //  BOOTSTRAP
  // ═══════════════════════════════════════════════════
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

})();
