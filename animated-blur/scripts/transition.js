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

function initializeTransition() {
  var fadeOut = document.querySelector('#transition-fade-out');
  fadeOut.classList.add('animated-blur');
  var fadeOutAnimation = new AnimatedBlur('fadeOut', fadeOut,
      {steps: 4, duration: 500});
  fadeOutAnimation.update();

  var fadeIn = document.querySelector('#transition-fade-in');
  fadeIn.style.opacity = 0.01;
  fadeIn.classList.add('animated-blur');
  var fadeInAnimation = new AnimatedBlur('fadeIn', fadeIn,
      {steps: 4, duration: 500});
  fadeInAnimation.update();

  fadeOut.onmouseenter = function() {
    fadeOutAnimation.play(AnimatedBlur.BLUR_MODE.BLUR);
    fadeInAnimation.play(AnimatedBlur.BLUR_MODE.UNBLUR);
  };

  fadeOut.onmouseleave = function() {
    fadeInAnimation.play(AnimatedBlur.BLUR_MODE.BLUR);
    fadeOutAnimation.play(AnimatedBlur.BLUR_MODE.UNBLUR);
  };

  fadeOut.resize = function() {
    fadeOutAnimation.resize();
  };

  fadeIn.resize = function() {
    fadeInAnimation.resize();
  };
}
