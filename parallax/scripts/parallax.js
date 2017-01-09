/**
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
 *
 */

function initializeParallax(clip) {
  var parallax = clip.querySelectorAll('*[parallax]');
  var parallaxDetails = [];
  var sticky = false;

  // Edge requires a transform on the document body and a fixed position element
  // in order for it to properly render the parallax effect as you scroll.
  // See https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/5084491/
  if (getComputedStyle(document.body).transform == 'none')
    document.body.style.transform = 'translateZ(0)';
  var fixedPos = document.createElement('div');
  fixedPos.style.position = 'fixed';
  fixedPos.style.top = '0';
  fixedPos.style.width = '1px';
  fixedPos.style.height = '1px';
  fixedPos.style.zIndex = 1;
  document.body.insertBefore(fixedPos, document.body.firstChild);

  for (var i = 0; i < parallax.length; i++) {
    var elem = parallax[i];
    var container = elem.parentNode;
    if (getComputedStyle(container).overflow != 'visible') {
      console.error('Need non-scrollable container to apply perspective for', elem);
      continue;
    }
    if (clip && container.parentNode != clip) {
      console.warn('Currently we only track a single overflow clip, but elements from multiple clips found.', elem);
    }
    var clip = container.parentNode;
    if (getComputedStyle(clip).overflow == 'visible') {
      console.error('Parent of sticky container should be scrollable element', elem);
    }
    // TODO(flackr): optimize to not redo this for the same clip/container.
    var perspectiveElement;
    if (sticky || getComputedStyle(clip).webkitOverflowScrolling) {
      sticky = true;
      perspectiveElement = container;
    } else {
      perspectiveElement = clip;
      container.style.transformStyle = 'preserve-3d';
    }
    perspectiveElement.style.perspectiveOrigin = 'bottom right';
    perspectiveElement.style.perspective = '1px';
    if (sticky)
      elem.style.position = '-webkit-sticky';
    if (sticky)
      elem.style.top = '0';
    elem.style.transformOrigin = 'bottom right';

    // Find the previous and next elements to parallax between.
    var previousCover = parallax[i].previousElementSibling;
    while (previousCover && previousCover.hasAttribute('parallax'))
      previousCover = previousCover.previousElementSibling;
    var nextCover = parallax[i].nextElementSibling;
    while (nextCover && !nextCover.hasAttribute('parallax-cover'))
      nextCover = nextCover.nextElementSibling;

    parallaxDetails.push({'node': parallax[i],
                          'top': parallax[i].offsetTop,
                          'sticky': !!sticky,
                          'nextCover': nextCover,
                          'previousCover': previousCover});
  }

  // Add a scroll listener to hide perspective elements when they should no
  // longer be visible.
  clip.addEventListener('scroll', function() {
    for (var i = 0; i < parallaxDetails.length; i++) {
      var container = parallaxDetails[i].node.parentNode;
      var previousCover = parallaxDetails[i].previousCover;
      var nextCover = parallaxDetails[i].nextCover;
      var parallaxStart = previousCover ? (previousCover.offsetTop + previousCover.offsetHeight) : 0;
      var parallaxEnd = nextCover ? nextCover.offsetTop : container.offsetHeight;
      var threshold = 200;
      var visible = parallaxStart - threshold - clip.clientHeight < clip.scrollTop &&
                    parallaxEnd + threshold > clip.scrollTop;
      // FIXME: Repainting the images while scrolling can cause jank.
      // For now, keep them all.
      // var display = visible ? 'block' : 'none'
      var display = 'block';
      if (parallaxDetails[i].node.style.display != display)
        parallaxDetails[i].node.style.display = display;
    }
  });
  window.addEventListener('resize', onResize.bind(null, parallaxDetails));
  onResize(parallaxDetails);
  for (var i = 0; i < parallax.length; i++) {
    parallax[i].parentNode.insertBefore(parallax[i], parallax[i].parentNode.firstChild);
  }
}

function onResize(details) {
  for (var i = 0; i < details.length; i++) {
    var container = details[i].node.parentNode;

    var clip = container.parentNode;
    var previousCover = details[i].previousCover;
    var nextCover = details[i].nextCover;
    var rate = details[i].node.getAttribute('parallax');

    var parallaxStart = previousCover ? (previousCover.offsetTop + previousCover.offsetHeight) : 0;
    var scrollbarWidth = details[i].sticky ? 0 : clip.offsetWidth - clip.clientWidth;
    var parallaxElem = details[i].sticky ? container : clip;
    var height = details[i].node.offsetHeight;
    var depth = 0;
    if (rate) {
      depth = 1 - (1 / rate);
    } else {
      var parallaxEnd = nextCover ? nextCover.offsetTop : container.offsetHeight;
      depth = (height - parallaxEnd + parallaxStart) / (height - clip.clientHeight);
    }
    if (details[i].sticky)
      depth = 1.0 / depth;

    var scale = 1.0 / (1.0 - depth);

    // The scrollbar is included in the 'bottom right' perspective origin.
    var dx = scrollbarWidth * (scale - 1);
    // Offset for the position within the container.
    var dy = details[i].sticky ?
        -(clip.scrollHeight - parallaxStart - height) * (1 - scale) :
        (parallaxStart - depth * (height - clip.clientHeight)) * scale;

    details[i].node.style.transform = 'scale(' + (1 - depth) + ') translate3d(' + dx + 'px, ' + dy + 'px, ' + depth + 'px)';
  }
}
