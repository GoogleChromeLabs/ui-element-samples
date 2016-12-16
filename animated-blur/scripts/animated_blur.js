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

  var container = document.getElementById('animated-blur');
  var animatedBlur = false;
  var inOrOut = 0;
  var num = 4;

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

  function blurInOrOut(container, inOrOut) {
    if (!inOrOut) return;

    for (var i = 0; i < num; ++i) {
      var svg = inOrOut > 0 ? d3.select('#b' + (i + 1)).node()
          : d3.select('#b' + (num - i)).node();
      svg.style.animation = 'b' + (i + 1) + '-anim 2s forwards linear';
    }
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
        .html(d3.select('img').node().alt)
    div.append('p')
          .html(d3.select('#desc').node().innerText)
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

  function createObjects(num) {
    var img = d3.select('img').node();
    for (var i = 0; i < num; ++i) { 
      var svg = d3.select('#animated-blur')
            .append('svg')
            .attr({
              'id': 'b' + (i + 1),
              'width': img.width,
              'height': img.height 
              });
      svg.append('defs')
            .append('filter')
            .attr({
              'id': 'f' + (i + 1),
              'x': 0,
              'y': 0
              })
            .append('feGaussianBlur')
            .attr({
              'in': 'SourceGraphic',
              'stdDeviation': 4 * i
              });
      svg.append('image')
          .attr({
            'id': 'img',
            'xlink:href': img.currentSrc,
            'x': 0,
            'y': 0,
            'width': img.width,
            'height': img.height,
            'filter': 'url(#f' + (i + 1) + ')'
          });
      addKeyFrames('b' + (i + 1) + '-anim', i);
    }
  }

  document.getElementById("animated-blur").onclick = function() {
    if (!animatedBlur) {
      createObjects(num);
      inOrOut = 1;
      animatedBlur = true;
    } else {
      inOrOut *= -1;
    }
    blurInOrOut(container, inOrOut);
    displayToolTips(inOrOut);
  }

}


