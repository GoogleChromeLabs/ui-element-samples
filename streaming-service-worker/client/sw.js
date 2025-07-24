const toCache = require('static-to-cache')();
const version = require('static-version')();
const revGet = require('static-rev-get');

const staticCacheName = `static-${version}`;

addEventListener('install', event => {
  skipWaiting();

  event.waitUntil(async function () {
    const cache = await caches.open(staticCacheName);
    await cache.addAll(toCache);
  }());
});

addEventListener('activate', event => {
  event.waitUntil(async function () {
    const keys = await caches.keys();
    await Promise.all(
      keys.map(key => {
        if (key !== staticCacheName) return caches.delete(key);
      })
    );
  }());
});

class IdentityStream {
  constructor() {
    let readableController;
    let writableController;

    this.readable = new ReadableStream({
      start(controller) {
        readableController = controller;
      },
      cancel(reason) {
        writableController.error(reason);
      }
    });

    this.writable = new WritableStream({
      start(controller) {
        writableController = controller;
      },
      write(chunk) {
        readableController.enqueue(chunk);
      },
      close() {
        readableController.close();
      },
      abort(reason) {
        readableController.error(reason);
      }
    });
  }
}

async function streamArticle(event, url) {
  const includeUrl = new URL(url);
  includeUrl.pathname += 'include';

  const parts = [
    caches.match(revGet('/static/shell-start.html')),
    fetch(includeUrl).catch(() => caches.match(revGet('/static/offline-inc.html'))),
    caches.match(revGet('/static/shell-end.html'))
  ];

  const identity = new IdentityStream();

  event.waitUntil(async function() {
    for (const responsePromise of parts) {
      const response = await responsePromise;
      await response.body.pipeTo(identity.writable, { preventClose: true });
    }
    identity.writable.getWriter().close();
  }());

  return new Response(identity.readable, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  event.respondWith(async function () {
    if (url.origin === location.origin && /^\/\d{4}\/[\w-]+\/$/.test(url.pathname)) {
      return streamArticle(event, url);
    }

    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) return cachedResponse;

    return await fetch(event.request);
  }());
});