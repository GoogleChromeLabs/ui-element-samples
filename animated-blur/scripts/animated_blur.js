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
      svg.style.animation = 'b' + (i + 1) + '-anim 2s alternate linear';
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

  document.getElementById("container").onclick = function() {
    if (!container.classList.contains('animated')) {
      //container.classList.add('animated');
      if (!animatedBlur) {
        var object = document.getElementById('blur');
        cloneObject(container, object, 3);
        updateObject(container);
        inOrOut = 1;
        animatedBlur = true;
      }
    } else {
      //container.classList.remove('animated');
    }
    inOrOut *= -1;
    blurInOrOut(container, inOrOut);
  }

}


