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

var carousel = document.querySelector('#carousel');
var counter = 1;
var animations = [];
var imgs = [];

for (var i = 0; i < carousel.children.length; ++i) {
  // Necessary break because cloned elements are appended to carousel.
  var img = carousel.children[i];
  if (img.classList.contains('clonedElement')) break;
  img.classList.add('animated-blur');
  imgs.push(img);
  var animation = new AnimatedBlur('carousel-' + counter++, img, {steps: 4, duration: 100});
  animation.update();
  animations.push(animation);
  animation.play(blurMode.BLUR);

  img.resize = function() {
    animations[imgs.indexOf(this)].resize();
  }

  img.onmouseenter = function() {
    animations[imgs.indexOf(this)].play(blurMode.UNBLUR);
  }
  img.onmouseleave = function() {
    animations[imgs.indexOf(this)].play(blurMode.BLUR);
  }
}
