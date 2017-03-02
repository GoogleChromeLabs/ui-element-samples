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
  createTemplate();
  cloneElements(num);
  createToolTipSVG();

  // Create layer for the animated element, otherwise new layer would be
  // created onclick due to 'active animation' which causes repaint
  document.body.querySelector('.animated-blur').classList.add('composited');

  // Create template for shadow dom. It includes the element to be animated
  // and its style.
  function createTemplate() {
    var template = document.createElement('Template');
    template.id = 'animatedDoc';
    template.innerHTML = document.getElementsByTagName('style')[0].outerHTML;
    template.innerHTML += element.outerHTML;
    document.body.appendChild(template);
  }

  function getShadowRoot(element) {
    const supportsShadowDOMV1 = !!HTMLElement.prototype.attachShadow;
    if (supportsShadowDOMV1)
      return element.attachShadow({ mode: 'closed' });
    else
      return element.createShadowRoot();
  }

  function setupKeyFrames() {
    for (var id = 0; id < num; ++id) {
      var keyframes = '@keyframes b' + (id + 1)  + '-anim {';
      for (var i = 0; i <= num; ++i) {
        // Use 0.99 otherwise Safari would have repainting
        // at the end of animation
        var opacity = (i == id || i == id + 1) ? 0.99 : 0.01;
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
        document.getElementById('toolTip').style.animation = 'b1-anim 1s forwards linear';
        //currentTooltip.style.animation = 'b1-anim 1s forwards linear';
      }
      document.body.querySelector('.animated-blur').style.animation =
          'b' + num + '-anim 1s forwards linear';
    } else {
      document.body.querySelector('.animated-blur').style.animation =
          'b1-anim 1s forwards linear';

      // Update the correct location from offscreen
      document.body.querySelector('#clonedElement').style.left =
          element.offsetLeft + 'px';
    }
  }

  function createToolTipSVG() {
    var width = element.clientWidth;
    var height = element.clientHeight;

    var svg = document.createElementNS(svgns, 'svg');
    svg.id = 'toolTip';
    svg.style.top = element.offsetTop + 'px';
    svg.style.left = element.offsetLeft + 'px';
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('class', 'composited');
    document.body.appendChild(svg);
  }

  function displayToolTips(inOrOut) {
    if (!inOrOut) return;
    if (currentBlurEvent.target.nextElementSibling.localName != 'figcaption') return;
    var svg = document.body.querySelector('#toolTip');
    var g = document.createElementNS(svgns, 'g');
    currentTooltip = g;
    svg.appendChild(g);
    var foWidth = 300;
    // TODO: Doesn't work with window resize
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
    container.style.width = width + 'px';
    container.style.height = height + 'px';
    // Paint prepared elements offscreen
    // Note: on Safari this would cause repaint when moving
    // the element back to screen.
    container.style.left = '-9999px' ;

    // TODO: The following doesn't seem to have benefits with
    // respect to GPU and renderer.
    //container.classList.add('composited');
    container.classList.add('clonedElement');
    // cloned elements must be inserted before the animated
    // element, otherwise at the end of the animation where
    // will be a layer creating for .animated-blur due to
    // squashing contents which causes repaint
    document.body.insertBefore(container, document.body.querySelector('.animated-blur'));
    for (var i = 1; i <= num; ++i) {
      var div = document.createElement('div');
      div.id = 'b' + i;
      // Compositing individual div instead of the container
      // is necessary. Otherwise will cause repaint.
      div.classList.add('composited');
      div.classList.add('clonedElement');

      var shadowRoot = getShadowRoot(div);

      var template = document.querySelector('#animatedDoc');
      var clone = document.importNode(template.content, true);

      var filterStdDev = 4 * (i - 1);
      clone.querySelector('.animated-blur').style.filter =
          'blur(' + filterStdDev + 'px)';
      shadowRoot.appendChild(clone);

      // Without using template
      //var clonedElement = element.cloneNode(true);
      //clonedElement.style.filter = 'blur(' + filterStdDev + 'px)';
      //shadowRoot.appendChild(clonedElement);
      container.appendChild(div);
    }
  }

  function displayCurrentImg() {
    currentImg = currentBlurEvent.target.cloneNode(true);
    currentImg.setAttribute('class', 'selected temporary composited');
    currentImg.style.left = currentBlurEvent.target.x + 'px';
    currentImg.style.top = currentBlurEvent.target.y + 'px';
    document.body.insertBefore(currentImg,
        document.getElementById('toolTip'));
  }

  function reset() {
    if (currentTooltip) {
      currentTooltip.remove();
      currentTooltip = null;
      document.getElementById('toolTip').style.animation = '';
    }

    if (currentImg) {
      currentImg.remove();
      currentImg = null;
    }

    //var animatedElements = document.body.querySelectorAll('.animated-blur');
    //for (var i = 0; i < animatedElements.length; ++i) {
    //  animatedElements[i].removeAttribute('style');
    //}
  }

  function prepareToBlur() {
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
