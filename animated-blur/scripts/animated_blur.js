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

function initializeAnimatedBlur(clip) {
  var container = document.getElementById('animated-blur');
  var animatedBlur = false;
  var inOrOut = 0;
  var num = 4;
  var blurURL = "";

  cloneElement(clip);

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

  function blurInOrOut(e, container, inOrOut) {
    if (!inOrOut) return;

    for (var i = 0; i < num; ++i) {
      var svg = inOrOut > 0 ? e.currentTarget.querySelector('#b' + (i + 1))
          : e.currentTarget.querySelector('#b' + (num - i));
      svg.style.animation = 'b' + (i + 1) + '-anim 2s forwards linear';
    }
  }

  function displayToolTips(e, inOrOut) {
    if (inOrOut == -1 ) {
      document.querySelector('#toolTip').remove();
      return;
    }
    var width =
        document.querySelector('#viewport').getBoundingClientRect().width;
    var height =
        document.querySelector('#viewport').getBoundingClientRect().height;
    var svg = document.createElementNS(svgns, 'svg');
    svg.id = 'toolTip';
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    document.querySelector('#viewport').appendChild(svg);

    var g = document.createElementNS(svgns, 'g');
    svg.appendChild(g);
    var foWidth = 300;
    var anchor = {'w': e.clientX, 'h': e.clientY};
    var t = 50, k = 15;
    var tip = {'w': (3/4 * t), 'h': k};
    var fo = document.createElementNS(svgns, 'foreignObject');
    fo.setAttribute('x', anchor.w - tip.w);
    fo.setAttribute('y', anchor.h + tip.h);
    fo.setAttribute('width', foWidth);
    fo.setAttribute('class', 'svg-tooltip');
    g.appendChild(fo);
    var div = document.createElementNS(xhtmlns, 'div');
    div.setAttribute('class', 'tooltip');
    fo.appendChild(div);
    var p = document.createElementNS(xhtmlns, 'p');
    p.setAttribute('class', 'lead');
    p.innerHTML = e.currentTarget.querySelector('img').alt;
    div.appendChild(p);
    p = document.createElementNS(xhtmlns, 'p');
    p.innerHTML = e.currentTarget.querySelector('#desc').innerText;
    div.appendChild(p);
    var foHeight = div.getBoundingClientRect().height;
    fo.setAttribute('height', foHeight);
    var polygon = document.createElementNS(svgns, 'polygon');
    polygon.setAttribute('points', "0,0 0," + foHeight + " " + foWidth + "," +
        foHeight + " " + foWidth + ",0 " + (t) + ",0 " + tip.w + "," + (-tip.h)
        + " " + (t/2) + ",0");
    polygon.setAttribute('height', foHeight + tip.h);
    polygon.style.height = foHeight + tip.h;
    polygon.setAttribute('width', foWidth);
    polygon.setAttribute('fill', '#D8D8D8');
    polygon.setAttribute('opacity', 0.75);
    polygon.setAttribute('transform', 'translate(' + (anchor.w - tip.w) + ',' +
          (anchor.h + tip.h) + ')');
    g.insertBefore(polygon, fo);
  }

  function createObjects(e, num) {
    var img = e.currentTarget.querySelector('img');
    for (var i = 0; i < num; ++i) {
      var svg = document.createElementNS(svgns, 'svg');
      svg.id = 'b' + (i + 1);
      svg.setAttribute('width', img.width);
      svg.setAttribute('height', img.height);
      e.currentTarget.appendChild(svg);
      var defs = document.createElementNS(svgns, 'defs');
      svg.appendChild(defs);
      var filter = document.createElementNS(svgns, 'filter');
      filter.id = 'f' + (i + 1);
      filter.setAttribute('x', 0);
      filter.setAttribute('y', 0);
      defs.append(filter)
      var feGaussianBlur = document.createElementNS(svgns, 'feGaussianBlur');
      feGaussianBlur.setAttribute('in', 'SourceGraphic');
      feGaussianBlur.setAttribute('stdDeviation', 4 * i);
      filter.append(feGaussianBlur);
      var image = document.createElementNS(svgns, 'image');
      image.id = 'img';
      image.setAttribute('src', blurURL);//img.currentSrc);
      image.setAttribute('x', 0);
      image.setAttribute('y', 0);
      image.setAttribute('width', img.width);
      image.setAttribute('height', img.height);
      image.setAttribute('filter', 'url(#f' + (i + 1) + ')');
      svg.append(image);
      addKeyFrames('b' + (i + 1) + '-anim', i);
    }
  }

  function cloneElement(element) {
    var svg = document.createElementNS(svgns, 'svg');
    svg.setAttribute('xmlns', svgns);
    svg.setAttribute('width', 200);
    svg.setAttribute('height', 200);
    var fo = document.createElementNS(svgns, 'foreignObject');
    fo.id = 'cloned-element';
    fo.setAttribute('width', '100%');
    fo.setAttribute('height', '100%');
    svg.appendChild(fo);

    var clonedElement = document.createElement('img');
    clonedElement.setAttribute('xmlns', xhtmlns);
    clonedElement.src = 'http://www.w3schools.com/css/trolltunga.jpg';
    clonedElement.innerHTML = 'fdsdfsdfdsfsdfdsfsfsdf';
    //var clonedElement = element.cloneNode(true);
    fo.appendChild(clonedElement);

    paintElementToCanvas(svg);
  }

  function paintElementToCanvas(data) {
    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var DOMURL = window.URL || window.webkitURL || window;
    data = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
           '<foreignObject width="100%" height="100%">' +
           '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
             'like ' +
             'cheese' +
           '</div>' +
           '</foreignObject>' +
           '</svg>';
    var img = new Image();
    var svg = new Blob([data], {type: 'image/svg+xml'});
    var url = DOMURL.createObjectURL(svg);

    img.onload = function () {
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(url);
    }

    img.src = url;
    blurURL = canvas.toDataURL('image/svg+xml');
  }

  document.getElementById("viewport").onclick = function(e) {
    if (!animatedBlur) {
      createObjects(e, num);
      inOrOut = 1;
      animatedBlur = true;
    } else {
      inOrOut *= -1;
    }
    blurInOrOut(e, container, inOrOut);
    displayToolTips(e, inOrOut);
  }

}


