/**
 * Copyright 2017 Google Inc. All rights reserved.
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

function initializeGallery() {
  var blurredGallery = document.querySelector('#gallery');
  blurredGallery.classList.add('animated-blur');
  var blurAnimation = new AnimatedBlur('view', blurredGallery,
      {steps: 5, duration: 500});
  blurAnimation.update();
  var mode = AnimatedBlur.BLUR_MODE.STANDBY;
  var animatedBlur = false;
  var currentBlurEvent = null;
  var currentTooltip = null;

  var svgns = 'http://www.w3.org/2000/svg';
  var xhtmlns = 'http://www.w3.org/1999/xhtml';

  createTooltipSVG();

  blurredGallery.onclick = function(e) {
    if (!animatedBlur) {
      reset();
      if (e.target.localName == 'img') {
        mode = AnimatedBlur.BLUR_MODE.BLUR;
        animatedBlur = true;
        currentBlurEvent = e;
      } else {
        mode = AnimatedBlur.BLUR_MODE.STANDBY;
      }
    } else {
      mode *= -1;
      animatedBlur = false;
      currentBlurEvent = null;
    }
    blurAnimation.play(mode);
    displayTooltip();
  };

  blurredGallery.resize = function() {
    blurAnimation.resize();
    if (!currentBlurEvent) return;
    var temporaries = document.body.querySelectorAll('.temporary');
    for (var i = 0; i < temporaries.length; ++i) {
      temporaries[i].style.left = currentBlurEvent.target.x + 'px';
      temporaries[i].style.top = currentBlurEvent.target.y + 'px';
    }
    if (currentTooltip) {
      document.getElementById('toolTip').remove();
      createTooltipSVG();
      displayTooltip(mode);
    }
  };

  function reset() {
    if (currentTooltip) {
      currentTooltip.remove();
      currentTooltip = null;
      document.getElementById('toolTip').style.animation = '';
    }
  }

  function createTooltipSVG() {
    var width = blurredGallery.clientWidth;
    var height = blurredGallery.clientHeight;

    var svg = document.createElementNS(svgns, 'svg');
    svg.id = 'toolTip';
    svg.style.top = blurredGallery.offsetTop + 'px';
    svg.style.left = blurredGallery.offsetLeft + 'px';
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('class', 'composited');
    document.body.appendChild(svg);
  }

  function displayTooltip() {
    var svg = document.body.querySelector('#toolTip');
    if (mode == AnimatedBlur.BLUR_MODE.UNBLUR) {
      svg.style.animation = 'view-b1-anim 1s linear forwards';
    }
    if (mode == AnimatedBlur.BLUR_MODE.STANDBY || !currentBlurEvent) return;
    if (currentBlurEvent.target.nextElementSibling.localName != 'figcaption') return;
    var g = document.createElementNS(svgns, 'g');
    currentTooltip = g;
    svg.appendChild(g);
    var foWidth = 300;
    // TODO: Doesn't work with window resize
    var anchor = {'w': currentBlurEvent.layerX, 'h': currentBlurEvent.layerY};
    var t = 50, k = 15;
    var tip = {'w': (3 / 4 * t), 'h': k};
    var fo = document.createElementNS(svgns, 'foreignObject');
    var tooltipX = anchor.w - tip.w + foWidth > blurredGallery.clientWidth ?
        blurredGallery.clientWidth - foWidth - tip.w : anchor.w - tip.w;

    fo.setAttribute('x', tooltipX);
    fo.setAttribute('width', foWidth);
    fo.setAttribute('class', 'svg-tooltip');
    g.appendChild(fo);
    var div = document.createElementNS(xhtmlns, 'div');
    div.setAttribute('class', 'tooltip');
    fo.appendChild(div);
    var p = document.createElement('p');
    p.setAttribute('class', 'lead');
    p.innerHTML = currentBlurEvent.target.alt;
    div.appendChild(p);
    p = document.createElement('p');

    p.innerHTML = currentBlurEvent.target.nextElementSibling.innerText;
    div.appendChild(p);
    //TODO: getBoundingClientRect doesn't work properly in Firefox
    //var foHeight = div.getBoundingClientRect().height;
    var foHeight = 150;
    fo.setAttribute('height', foHeight);
    var tooltipY = anchor.h + tip.h + foHeight > blurredGallery.clientHeight ?
    blurredGallery.clientHeight - foHeight - tip.h : anchor.h + tip.h;
    fo.setAttribute('y', tooltipY);
    var polygon = document.createElementNS(svgns, 'polygon');
    polygon.setAttribute('points', '0,0 0,' + foHeight + ' ' + foWidth +
        ',' + foHeight + ' ' + foWidth + ',0 ' + (t) + ',0 ' + tip.w +
        ',' + (-tip.h) + ' ' + (t / 2) + ',0');
    polygon.setAttribute('height', foHeight + tip.h);
    polygon.style.height = foHeight + tip.h;
    polygon.setAttribute('width', foWidth);
    polygon.setAttribute('fill', '#D8D8D8');
    polygon.setAttribute('opacity', 0.75);
    polygon.setAttribute('transform', 'translate(' + tooltipX + ',' +
          tooltipY + ')');
    g.insertBefore(polygon, fo);
  }
}
