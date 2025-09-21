// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', {
      scope: './'
    })
      .then(registration => {
        console.log('ServiceWorker registration successful with scope:', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed:', err);
      });
  });
}

let deferredPrompt;
const installBtn = document.getElementById('pwa-install');

// Make sure button is visible initially
if (installBtn) {
  installBtn.style.display = 'none';
}

// Show install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Make the install button visible
  if (installBtn) {
    installBtn.style.display = 'block';
  }
});

// Handle install button click
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        console.log('PWA installation accepted');
      }
      deferredPrompt = null;
      installBtn.style.display = 'none';
    }
  });
}

// Handle successful installation
window.addEventListener('appinstalled', (event) => {
  console.log('PWA installed successfully');
  if (installBtn) {
    installBtn.style.display = 'none';
  }
});
