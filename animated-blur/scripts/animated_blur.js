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
  setupKeyFrames();

  function setupKeyFrames() {
    for (var id = 0; id < num; ++id) {
      var keyframes = '@keyframes b' + (id + 1)  + '-anim {';
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
  }

  // inOrOut:
  //   1 : blur out
  //  -1 : blur in
  //   0 : do nothing
  function startBlur(inOrOut) {
    if (!inOrOut) return;
    for (var i = 0; i < num; ++i) {
      var div = inOrOut > 0 ? document.body.querySelector('#b' + (i + 1))
          : document.body.querySelector('#b' + (num - i));
      div.style.animation = 'b' + (i + 1) + '-anim 1s forwards linear';
    }
    // Tooltip and temporary img blur out
    if (inOrOut == -1) {
      if (currentImg) {
        currentImg.style.animation = 'b1-anim 4s forwards linear';
      }
      if (currentTooltip) {
        currentTooltip.style.animation = 'b1-anim 1.5s forwards linear';
      }
      document.body.querySelector('.animated-blur').style.animation =
          'b' + num + '-anim 1s forwards linear';
    } else {
      document.body.querySelector('.animated-blur').style.animation =
          'b1-anim 1s forwards linear';
    }
  }

  function displayToolTips(inOrOut) {
    if (!inOrOut) return;
    if (currentBlurEvent.target.nextElementSibling.localName != 'figcaption') return;
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
    var anchor = {'w': currentBlurEvent.pageX, 'h': currentBlurEvent.pageY};
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

  function cloneElements(num) {
    var width = element.clientWidth;
    var height = element.clientHeight;
    var container = document.createElement('div');
    container.id = 'clonedElement';
    container.style.top = element.offsetTop + 'px';
    container.style.left = element.offsetLeft + 'px';
    container.style.width = width + 'px';
    container.style.height = height + 'px';
    // TODO: The following doesn't seem to have benefits with
    // respect to GPU and renderer.
    //container.classList.add('composited');
    container.classList.add('clonedElement');
    document.body.appendChild(container);
    for (var i = 1; i <= num; ++i) {
      var div = document.createElement('div');
      div.id = 'b' + i;
      div.classList.add('clonedElement');

      var clonedElement = element.cloneNode(true);
      var filterStdDev = 4 * (i - 1);
      clonedElement.style.filter = 'blur(' + filterStdDev + 'px)';

      div.appendChild(clonedElement);
      container.appendChild(div);
    }
  }

  function displayCurrentImg() {
    currentImg = currentBlurEvent.target.cloneNode(true);
    currentImg.setAttribute('class', 'selected temporary');
    currentImg.style.left = currentBlurEvent.target.x + 'px';
    currentImg.style.top = currentBlurEvent.target.y + 'px';
    document.body.appendChild(currentImg);
  }

  function reset() {
    if (currentTooltip) {
      currentTooltip.remove();
      currentTooltip = null;
    }
    var clonedElements = document.body.querySelectorAll('.clonedElement');
    for (var i = 0; i < clonedElements.length; ++i) {
      clonedElements[i].remove();
    }
    if (currentImg) {
      currentImg.remove();
      currentImg = null;
    }
    var animatedElements = document.body.querySelectorAll('.animated-blur');
    for (var i = 0; i < animatedElements.length; ++i) {
      animatedElements[i].removeAttribute('style');
    }
  }

  function prepareToBlur() {
    cloneElements(num);
    displayCurrentImg();
    displayToolTips(inOrOut);
  }

  function updateOnResize() {
    var elements = document.body.querySelectorAll('.clonedElement');
    for (var i = 0; i < elements.length; ++i) {
      elements[i].style.width = element.clientWidth + 'px';
      elements[i].style.height = element.clientHeight + 'px';
    }

    // No need to proceed if there is no blur event
    if (!currentBlurEvent) return;

    var temporaries = document.body.querySelectorAll('.temporary');
    for (var i = 0; i < temporaries.length; ++i) {
      temporaries[i].style.left = currentBlurEvent.target.x + 'px';
      temporaries[i].style.top = currentBlurEvent.target.y + 'px';
    }
    if (currentTooltip) {
      currentTooltip.remove();
      currentTooltip = null;
      displayToolTips(inOrOut);
    }
  }

  window.onresize = function() {
    updateOnResize();
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
    startBlur(inOrOut);
  }

}
