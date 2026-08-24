const CACHE_NAME = "nonogram-cyber-lab-v2";
const CORE_ASSETS = [
  "/manifest.webmanifest",
  "/usth-cybersecurity.webp",
  "/icon-192.png",
  "/icon-512.png",
];

async function precacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(CORE_ASSETS);

  const response = await fetch("/", { cache: "reload" });
  if (!response.ok) throw new Error("Unable to cache app shell");
  await cache.put("/", response.clone());

  const html = await response.text();
  const assetPaths = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((path) => path.startsWith("/") && !path.startsWith("//"));
  await Promise.allSettled([...new Set(assetPaths)].map((path) => cache.add(path)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    precacheAppShell()
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put("/", response.clone()));
          return response;
        })
        .catch(async () => (await caches.match("/")) || new Response("Offline", { status: 503 })),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      return response;
    })),
  );
});
