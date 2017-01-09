/**
 *
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

class App {
  constructor () {
    const router = document.querySelector('sc-router');
    const links = Array.from(document.querySelectorAll('a'));

    function onClick (evt) {
      evt.preventDefault();
      router.go(evt.target.href);
    }

    links.forEach(link => {
      link.addEventListener('click', onClick);
    });
  }
}

(_ => new App())();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', {scope: '/'});
}

function goOffline() {
  document.body.classList.add('offline');
  Array.from(document.querySelectorAll('nav a')).forEach(link => {
    const linkUrl = new URL(link.href);
    linkUrl.searchParams.set('partial', '');
    caches.match(linkUrl.toString())
      .then(resp => link.classList.toggle('cached', !!resp));
  });
}
window.addEventListener('offline', _ => goOffline());
window.addEventListener('online', _ => document.body.classList.remove('offline'));
navigator.onLine || goOffline();
