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

var svgns = "http://www.w3.org/2000/svg";
var xhtmlns = "http://www.w3.org/1999/xhtml";

function initializeAnimatedBlur(element) {
  var animatedBlur = false;
  var inOrOut = 0;
  var num = 4;
  var currentTooltip;
  var currentImg;
  var currentBlurEvent;

  function addKeyFrames(name, id) {
    var keyframes = '@keyframes ' + name + ' {';
    for (var i = 0; i <= num; ++i) {
      var opacity = (i == id || i == id + 1) ? 1 : 0;
      keyframes += (i * 100 / num) + '% { opacity: ' + opacity + '; }';
    }
    keyframes += '}';

    if( document.styleSheets && document.styleSheets.length) {
        document.styleSheets[0].insertRule(keyframes, 0);
    } else {
      var s = document.createElement('style');
      s.innerHTML = keyframes;
      document.getElementsByTagName('head')[0].appendChild(s);
    }
  }

  // inOrOut:
  //   1 : blur out
  //  -1 : blur in
  //   0 : do nothing
  function startBlur(e, inOrOut) {
    if (!inOrOut) return;
    for (var i = 0; i < num; ++i) {
      var svg = inOrOut > 0 ? document.body.querySelector('#b' + (i + 1))
          : document.body.querySelector('#b' + (num - i));
      svg.style.animation = 'b' + (i + 1) + '-anim 2s forwards linear';
    }
    // Tooltip and temporary img blur out
    if (inOrOut == -1) {
      if (currentImg) {
        currentImg.style.animation = 'b1-anim 2s forwards linear';
      }
      if (currentTooltip) {
        currentTooltip.style.animation = 'b1-anim 2s forwards linear';
      }
      document.getElementById('animated-blur').style.animation =
          'b4-anim 2s forwards linear';
    } else {
      document.getElementById('animated-blur').style.animation =
          'b1-anim 2s forwards linear';
    }
  }

  function displayToolTips(e, inOrOut) {
    if (!inOrOut) return;
    if (e.target.nextElementSibling.localName != 'figcaption') return;
    var width = element.clientWidth;
    var height = element.clientHeight;

    var svg = document.createElementNS(svgns, 'svg');
    svg.id = 'toolTip';
    svg.style.top = element.offsetTop + 'px';
    svg.style.left = element.offsetLeft + 'px';
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    document.body.appendChild(svg);
    currentTooltip = svg;

    var g = document.createElementNS(svgns, 'g');
    svg.appendChild(g);
    var foWidth = 300;
    var anchor = {'w': e.clientX, 'h': e.clientY};
    var t = 50, k = 15;
    var tip = {'w': (3/4 * t), 'h': k};
    var fo = document.createElementNS(svgns, 'foreignObject');
    var tooltipX = anchor.w - tip.w + foWidth > element.clientWidth ?
        element.clientWidth - foWidth - tip.w : anchor.w - tip.w;

    fo.setAttribute('x', tooltipX);
    fo.setAttribute('width', foWidth);
    fo.setAttribute('class', 'svg-tooltip');
    g.appendChild(fo);
    var div = document.createElementNS(xhtmlns, 'div');
    div.setAttribute('class', 'tooltip');
    fo.appendChild(div);
    var p = document.createElementNS(xhtmlns, 'p');
    p.setAttribute('class', 'lead');
    p.innerHTML = e.target.alt;
    div.appendChild(p);
    p = document.createElementNS(xhtmlns, 'p');

    p.innerHTML = e.target.nextElementSibling.innerText;
    div.appendChild(p);
    var foHeight = div.getBoundingClientRect().height;
    fo.setAttribute('height', foHeight);
    var tooltipY = anchor.h + tip.h + foHeight > element.clientHeight ?
    element.clientHeight - foHeight - tip.h : anchor.h + tip.h;
    fo.setAttribute('y', tooltipY);
    var polygon = document.createElementNS(svgns, 'polygon');
    polygon.setAttribute('points', "0,0 0," + foHeight + " " + foWidth +
        "," + foHeight + " " + foWidth + ",0 " + (t) + ",0 " + tip.w +
        "," + (-tip.h) + " " + (t/2) + ",0");
    polygon.setAttribute('height', foHeight + tip.h);
    polygon.style.height = foHeight + tip.h;
    polygon.setAttribute('width', foWidth);
    polygon.setAttribute('fill', '#D8D8D8');
    polygon.setAttribute('opacity', 0.75);
    polygon.setAttribute('transform', 'translate(' + tooltipX + ',' +
          tooltipY + ')');
    g.insertBefore(polygon, fo);
  }

  function buildSVGs(num) {
    var width = element.clientWidth;
    var height = element.clientHeight;
    for (var i = 1; i <= num; ++i) {
      var svg = document.createElementNS(svgns, 'svg');
      svg.id = 'b' + i;
      svg.style.top = element.offsetTop + 'px';
      svg.style.left = element.offsetLeft + 'px';
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);

      var filter = document.createElementNS(svgns, 'filter');
      filter.id = 'f' + i;
      filter.setAttribute('width', width);
      filter.setAttribute('height', height);
      svg.append(filter);
      var feGaussianBlur = document.createElementNS(svgns, 'feGaussianBlur');
      feGaussianBlur.setAttribute('stdDeviation', 4 * (i - 1));
      filter.append(feGaussianBlur);

      var fo = document.createElementNS(svgns, 'foreignObject');
      fo.setAttribute('filter', 'url(#f' + i + ')');
      fo.setAttribute('width', width);
      fo.setAttribute('height', height);

      var container = document.createElementNS(xhtmlns, 'div');
      container.innerHTML = element.innerHTML;
      fo.appendChild(container);
      svg.appendChild(fo);

      document.body.appendChild(svg);
      addKeyFrames('b' + i + '-anim', i - 1);
    }
  }

  function reset() {
    var svgs = document.body.querySelectorAll('svg[id^="b"]');
    for (var i = 0; i < svgs.length; ++i) {
      svgs[i].remove();
    }
    if (currentTooltip) {
      currentTooltip.remove();
      currentTooltip = null;
    }
  }

  function displayCurrentImg(e) {
    currentImg = e.target.cloneNode(true);
    currentImg.setAttribute('class', 'selected');
    currentImg.style.left = e.target.x + 'px';
    currentImg.style.top = e.target.y + 'px';
    document.body.appendChild(currentImg);
  }

  function reset() {
    if (currentTooltip) {
      currentTooltip.remove();
      currentTooltip = null;
    }
    var svgs = document.body.querySelectorAll('svg[id^="b"]');
    for (var i = 0; i < svgs.length; ++i) {
      svgs[i].remove();
    }
    if (currentImg) {
      currentImg.remove();
      currentImg = null;
    }
  }

  function prepareToBlur() {
    buildSVGs(num);
    displayCurrentImg(currentBlurEvent);
    displayToolTips(currentBlurEvent, inOrOut);
  }

  window.onresize = function() {
    reset();
    if (!currentBlurEvent) return;
    prepareToBlur();
  }

  document.onclick = function(e) {
    if (!animatedBlur) {
      reset();
      if (e.target.localName == 'img') {
        inOrOut = 1;
        animatedBlur = true;
        currentBlurEvent = e;
        prepareToBlur();
      } else {
        inOrOut = 0;
      }
    } else {
      inOrOut *= -1;
      animatedBlur = false;
      currentBlurEvent = null;
    }
    startBlur(e, inOrOut);
  }

}
