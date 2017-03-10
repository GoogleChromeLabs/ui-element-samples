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

var blurMode = {
  BLUR : 1,
  STANDBY : 0,
  UNBLUR : -1
}

class AnimatedBlur {
  constructor(name, element, params) {
    this.name = name;
    this.element = element;
    this.num = params.steps;
    this.duration = params.duration;
    this.initialized = false;
  }

  // Create template for shadow dom. It includes the element to be animated
  // and its style.
  createTemplate() {
    var template = document.createElement('Template');
    template.id = this.name + '-template';
    template.innerHTML = document.getElementsByTagName('style')[0].outerHTML;
    template.innerHTML += this.element.outerHTML;
    document.body.appendChild(template);
  }

  setupKeyFrames() {
    for (var id = 0; id < this.num; ++id) {
      var keyframes = '@keyframes ' + this.name + '-b' + (id + 1)  + '-anim {';
      for (var i = 0; i <= this.num; ++i) {
        // Use 0.99 otherwise Safari would have repainting
        // at the end of animation
        var opacity = (i == id || i == id + 1) ? 0.99 : 0.01;
        keyframes += (i * 100 / this.num) + '% { opacity: ' + opacity + '; }';
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

  cloneElements() {
    var width = this.element.clientWidth;
    var height = this.element.clientHeight;
    var container = document.createElement('div');
    container.id = this.name + '-clonedElement';
    container.style.top = this.element.offsetTop + 'px';
    container.style.left = this.element.offsetLeft + 'px';
    container.style.width = width + 'px';
    container.style.height = height + 'px';
    container.classList.add('composited');
    container.classList.add('clonedElement');
    this.element.parentNode.insertBefore(container,
        this.element.nextSibling);

    var filterStdDev = 2;
    for (var i = 1; i <= this.num; ++i) {
      var div = document.createElement('div');
      div.id = this.name + '-b' + i;
      div.classList.add('composited');
      div.classList.add('clonedElement');
      div.style.opacity = 0.01;

      var template = document.querySelector('#' + this.name + '-template');
      var clone = document.importNode(template.content, true);

      if (i == 1) {
        clone.childNodes[1].style.filter = 'blur(0px)';
      } else {
        clone.childNodes[1].style.filter =
            'blur(' + filterStdDev + 'px)';
        filterStdDev *= 2;
      }

      const supportsShadowDOMV1 = !!HTMLElement.prototype.attachShadow;
      if (supportsShadowDOMV1) {
        var shadowRoot = div.attachShadow({ mode: 'closed' });
        shadowRoot.appendChild(clone);
      } else {
        div.appendChild(clone);
      }

      container.appendChild(div);
    }
  }

  update() {
    if (this.initialized)
      return;
    document.body.classList.add('bodyStyle');
    this.setupKeyFrames();
    this.createTemplate();
    this.cloneElements();
    // Create a compositing layer for the animated blur element after it
    // gets cloned.
    this.element.classList.add('composited');
    this.initialized = true;
  }

  play(mode) {
    if(mode == blurMode.STANDBY) return;
    for (var i = 0; i < this.num; ++i) {
      var div = mode > 0 ? document.body.querySelector('#' + this.name + '-b' + (i + 1))
          : document.body.querySelector('#' + this.name + '-b' + (this.num - i));
      div.style.animation = this.name + '-b' + (i + 1) + '-anim ' + this.duration + 'ms forwards linear';
      // opacity 1 would cause delay on Safari.
      div.style.opacity = 0.99;
    }
    if (mode == blurMode.UNBLUR) {
      this.element.style.animation =
          this.name + '-b' + this.num + '-anim ' + this.duration + 'ms forwards linear';
    } else {
      this.element.style.animation =
          this.name + '-b1-anim ' + this.duration + 'ms forwards linear';
    }
  }

  dispose() {
    document.getElementById(this.name + '-clonedElement').remove();
    document.getElementById(this.name + '-template').remove();
    this.element.classList.remove('composited');
    this.element.style.removeProperty('animation');
    if (this.element.style.length == 0) {
      this.element.removeAttribute('style');
    }
    this.initialized = false;
  }

  resize() {
    var elements = document.body.querySelectorAll('.clonedElement');
    for (var i = 0; i < elements.length; ++i) {
      elements[i].style.width = this.element.clientWidth + 'px';
      elements[i].style.height = this.element.clientHeight + 'px';
    }
  }
}
