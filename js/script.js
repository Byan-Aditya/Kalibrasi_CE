// === JAM & TANGGAL ===
function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  };
  const datetimeEl = document.getElementById('datetime');
  if (datetimeEl) {
    datetimeEl.textContent = now.toLocaleString('id-ID', options);
  }
}
setInterval(updateDateTime, 1000);
updateDateTime();

// === DARK MODE ===
(function(){
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const metaTheme = document.querySelector('meta[name=theme-color]');
  const header = document.getElementById('header');

  function syncThemeColor() {
    if (!header || !metaTheme) return;
    const bg = getComputedStyle(header).backgroundColor;
    metaTheme.setAttribute('content', bg);
  }

  const saved = localStorage.getItem('site-theme');
  if(saved==='dark') root.setAttribute('data-theme','dark');
  if(saved==='light') root.removeAttribute('data-theme');
  syncThemeColor();

  function setDark(dark){
    if(dark){
      root.setAttribute('data-theme','dark');
      localStorage.setItem('site-theme','dark');
      metaTheme.setAttribute('content', '#000000'); // ireng pas dark
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('site-theme','light');
      metaTheme.setAttribute('content', '#ffffff'); // putih pas light
    }
  }

  if (toggle) {
    toggle.addEventListener('click',()=>{
      const isDark = root.getAttribute('data-theme')==='dark';
      setDark(!isDark);
    });
  }

  if (header) {
    const observer = new MutationObserver(syncThemeColor);
    observer.observe(header, { attributes: true, attributeFilter: ["class","style"] });
  }
})();

// === SAFETY COPY & PASTE + SAFETY CTRL ===
  // Mateni klik kanan global
  document.addEventListener("contextmenu", e => e.preventDefault());

  // Fungsi cek shortcut terlarang
  function blockKeys(e) {
    const k = e.key.toLowerCase();

    if (
      (e.ctrlKey && ["c","x","v","u","s","a","p"].includes(k)) || // Ctrl+...
      (e.ctrlKey && e.shiftKey && ["i","j"].includes(k)) ||       // Ctrl+Shift+...
      (e.key && e.key.startsWith("F"))                            // F1-F12
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }

  // Pasang ke semua event keyboard
  document.addEventListener("keydown", blockKeys, true);
  document.addEventListener("keyup", blockKeys, true);
  document.addEventListener("keypress", blockKeys, true);

  // Mateni event copy/paste drag-drop
  document.addEventListener("copy", e => e.preventDefault());
  document.addEventListener("cut", e => e.preventDefault());
  document.addEventListener("paste", e => e.preventDefault());
  document.addEventListener("dragstart", e => e.preventDefault());
  document.addEventListener("drop", e => e.preventDefault());

// === aplikasi===
const CACHE_NAME = "Arisan-cache-auto";

// file inti supaya offline bisa jalan
const PRECACHE_FILES = [
  "/index.html",
  "/css/style.css",
  "/css/dark_mode.css",
  "/js/script.js"
  // bisa tambah file inti lainnya
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cachedRes => {
      if (cachedRes) return cachedRes;

      // dynamic caching: file baru otomatis masuk cache
      return fetch(event.request)
        .then(fetchRes => {
          if (event.request.url.startsWith("http") && fetchRes && fetchRes.status === 200 && fetchRes.type === "basic") {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, fetchRes.clone()));
          }
          return fetchRes;
        })
        .catch(() => caches.match("/index.html")) // fallback offline
    })
  );
});
