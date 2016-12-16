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

function initializeAnimatedBlur(clip) {

  var container = document.getElementById('container');
  var animatedBlur = false;
  var inOrOut = 0;

  function cloneObject(container, obj, num) {
    while (num--) {
      var cln = obj.cloneNode(true);
      container.appendChild(cln);
    }
  }

  function addKeyFrames(name, id, num) {
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

  function blurInOrOut(container, inOrOut) {
    if (!inOrOut) return;

    for (var i = 0; i < container.childElementCount; ++i) {
      var svg = inOrOut > 0 ? container.children[i]
          : container.children[container.childElementCount - i - 1];
      svg.style.animation = 'b' + (i + 1) + '-anim 2s forwards linear';
    }
  }

  function updateObject(container) {
    for (var i = 0; i < container.childElementCount; ++i) {
      addKeyFrames('b' + (i + 1) + '-anim', i, container.childElementCount);
      var svg = container.children[i];
      svg.id = 'b' + (i + 1);
      var filter = svg.querySelector('#filter');
      filter.id = 'f' + (i + 1);
      filter.firstElementChild.setAttribute('stdDeviation', 4 * i);
      var img = svg.querySelector('#img');
      img.setAttribute('filter', 'url(#' + filter.id + ')');
    }
  }

  function findKeyframesRule(rule) {
    var ss = document.styleSheets;
    for (var i = 0; i < ss.length; ++i) {
      for (var j = 0; j < ss[i].cssRules.length; ++j) {
        if (ss[i].cssRules[j].type == window.CSSRule.WEBKIT_KEYFRAMES_RULE
            && ss[i].cssRules[j].name == rule) {
          return ss[i].cssRules[j];
        }
      }
    }
    return null;
  }

  function displayToolTips(inOrOut) {
    if (inOrOut == -1 ) {
      d3.select('#viewport').selectAll('#toolTip').remove();
      return;
    }
    var margin = {top: 20, right: 10, bottom: 20, left: 10};
    var width = d3.select('#viewport').node().getBoundingClientRect().width - margin.left - margin.right;
    var height = d3.select('#viewport').node().getBoundingClientRect().height - margin.top - margin.bottom;
    var svg = d3.select('#viewport')
        .append('svg')
        .attr({
          'id': 'toolTip',
          'width': width + margin.left + margin.right,
          'height': height + margin.top + margin.bottom
          })
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    var foWidth = 300;
    var anchor = {'w': width/2, 'h': height/2};
    var t = 50, k = 15;
    var tip = {'w': (3/4 * t), 'h': k};
    var fo = svg.append('foreignObject')
        .attr({
          'x': anchor.w - tip.w,
          'y': anchor.h + tip.h,
          'width': foWidth,
          'class': 'svg-tooltip'
          });
    var div = fo.append('xhtml:div')
        .append('div')
        .attr({
          'class': 'tooltip'
          });
    div.append('p')
        .attr('class', 'lead')
        .html('Stanford bunny.');
    div.append('p')
        .html('The Stanford bunny is a computer graphics 3D test model developed by Greg Turk and Marc Levoy in 1994 at Stanford University. The bunny consists of data describing 69,451 triangles determined by 3D scanning a ceramic figurine of a rabbit. This model and others were scanned to test methods of range scanning physical objects.');
    var foHeight = div[0][0].getBoundingClientRect().height;
    fo.attr({
      'height': foHeight
      });
    svg.insert('polygon', '.svg-tooltip')
    .attr({
      'points': "0,0 0," + foHeight + " " + foWidth + "," + foHeight + " " + foWidth + ",0 " + (t) + ",0 " + tip.w + "," + (-tip.h) + " " + (t/2) + ",0",
      'height': foHeight + tip.h,
      'width': foWidth,
      'fill': '#D8D8D8', 
      'opacity': 0.75,
      'transform': 'translate(' + (anchor.w - tip.w) + ',' + (anchor.h + tip.h) + ')'
      });
  }

  document.getElementById("container").onclick = function() {
    if (!animatedBlur) {
      var object = document.getElementById('blur');
      cloneObject(container, object, 3);
      updateObject(container);
      inOrOut = 1;
      animatedBlur = true;
    } else {
      inOrOut *= -1;
    }
    blurInOrOut(container, inOrOut);
    displayToolTips(inOrOut);
  }

}


