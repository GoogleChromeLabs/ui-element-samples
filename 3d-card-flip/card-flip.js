/**
 *
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
 */

'use strict';

class SCFlipCard extends HTMLElement {

  static get SIDES () {
    return {
      FRONT: 1,
      BACK: 2
    };
  }

  flip () {
    if (this._locked) {
      return;
    }

    this._locked = true;

    const scale = (500 + 200) / 500;

    const sideOne = [
      {transform: `translateZ(-200px) rotate${this._axis}(0deg) scale(${scale})`},
      {transform: `translateZ(-100px) rotate${this._axis}(0deg) scale(${scale})`, offset: 0.15},
      {transform: `translateZ(-100px) rotate${this._axis}(180deg) scale(${scale})`, offset: 0.65},
      {transform: `translateZ(-200px) rotate${this._axis}(180deg) scale(${scale})`}
    ];

    const sideTwo = [
      {transform: `translateZ(-200px) rotate${this._axis}(180deg) scale(${scale})`},
      {transform: `translateZ(-100px) rotate${this._axis}(180deg) scale(${scale})`, offset: 0.15},
      {transform: `translateZ(-100px) rotate${this._axis}(360deg) scale(${scale})`, offset: 0.65},
      {transform: `translateZ(-200px) rotate${this._axis}(360deg) scale(${scale})`}
    ];

    const umbra = [
      {opacity: 0.3, transform: `translateY(2px) rotate${this._axis}(0deg)`},
      {opacity: 0.0, transform: `translateY(62px) rotate${this._axis}(0deg)`, offset: 0.15},
      {opacity: 0.0, transform: `translateY(62px) rotate${this._axis}(180deg)`, offset: 0.65},
      {opacity: 0.3, transform: `translateY(2px) rotate${this._axis}(180deg)`}
    ];

    const penumbra = [
      {opacity: 0.0, transform: `translateY(2px) rotate${this._axis}(0deg)`},
      {opacity: 0.5, transform: `translateY(62px) rotate${this._axis}(0deg)`, offset: 0.15},
      {opacity: 0.5, transform: `translateY(62px) rotate${this._axis}(180deg)`, offset: 0.65},
      {opacity: 0.0, transform: `translateY(2px) rotate${this._axis}(180deg)`}
    ];

    const timing = {
      duration: this._duration,
      iterations: 1,
      easing: 'ease-in-out',
      fill: 'forwards'
    };

    switch (this._side) {
      case SCFlipCard.SIDES.FRONT:
        this._front.animate(sideOne, timing);
        this._back.animate(sideTwo, timing);

        this._back.focus();
        this._front.inert = true;
        this._back.inert = false;
        break;

      case SCFlipCard.SIDES.BACK:
        this._front.animate(sideTwo, timing);
        this._back.animate(sideOne, timing);

        this._front.focus();
        this._front.inert = false;
        this._back.inert = true;
        break;

      default:
        throw new Error('Unknown side');
    }

    this._umbra.animate(umbra, timing);
    this._penumbra.animate(penumbra, timing)
        .onfinish = _ => {
          this._locked = false;
          this._side = (this._side === SCFlipCard.SIDES.FRONT) ?
              SCFlipCard.SIDES.BACK :
              SCFlipCard.SIDES.FRONT;
        };
  }

  createdCallback () {
    this._locked = false;
    this._side = SCFlipCard.SIDES.FRONT;
    this._front = this.querySelector('.front');
    this._back = this.querySelector('.back');
    this._buttons = this.querySelectorAll('button');
    this._umbra = this.querySelector('.umbra');
    this._penumbra = this.querySelector('.penumbra');

    this._front.inert = false;
    this._back.inert = true;

    this._duration = parseInt(this.getAttribute('duration'), 10);
    if (isNaN(this._duration)) {
      this._duration = 800;
    }

    this._axis = this.getAttribute('axis') || 'X';
    if (this._axis.toUpperCase() === 'RANDOM') {
      this._axis = (Math.random() > 0.5 ? 'Y' : 'X');
    }
  }

  attachedCallback () {
    Array.from(this._buttons)
        .forEach(b => {
          b.addEventListener('click', _ => this.flip());
        });
  }

  detachedCallback () {

  }
}

customElements.define('sc-card', SCFlipCard);
