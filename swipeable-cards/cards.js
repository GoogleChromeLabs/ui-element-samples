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

class Cards {
  constructor () {
    this.cards = document.querySelectorAll('.card');

    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.update = this.update.bind(this);
    this.targetBCR = null;
    this.target = null;
    this.startX = 0;
    this.currentX = 0;
    this.screenX = 0;
    this.targetX = 0;
    this.draggingCard = false;

    this.addEventListeners();

    requestAnimationFrame(this.update);
  }

  addEventListeners () {
    document.addEventListener('touchstart', this.onStart);
    document.addEventListener('touchmove', this.onMove);
    document.addEventListener('touchend', this.onEnd);

    document.addEventListener('mousedown', this.onStart);
    document.addEventListener('mousemove', this.onMove);
    document.addEventListener('mouseup', this.onEnd);
  }

  onStart (evt) {
    if (this.target)
      return;

    if (!evt.target.classList.contains('card'))
      return;

    this.target = evt.target;
    this.targetBCR = this.target.getBoundingClientRect();

    this.startX = evt.pageX || evt.touches[0].pageX;
    this.currentX = this.startX;

    this.draggingCard = true;
    this.target.style.willChange = 'transform';

    evt.preventDefault();
  }

  onMove (evt) {
    if (!this.target)
      return;

    this.currentX = evt.pageX || evt.touches[0].pageX;
  }

  onEnd (evt) {
    if (!this.target)
      return;

    this.targetX = 0;
    let screenX = this.currentX - this.startX;
    if (Math.abs(screenX) > this.targetBCR.width * 0.35) {
      this.targetX
          = (screenX > 0) ? this.targetBCR.width : -this.targetBCR.width;
    }

    this.draggingCard = false;
  }

  update () {

    requestAnimationFrame(this.update);

    if (!this.target)
      return;

    if (this.draggingCard) {
      this.screenX = this.currentX - this.startX;
    } else {
      this.screenX += (this.targetX - this.screenX) / 4;
    }

    const normalizedDragDistance =
        (Math.abs(this.screenX) / this.targetBCR.width);
    const opacity = 1 - Math.pow(normalizedDragDistance, 3);

    this.target.style.transform = `translateX(${this.screenX}px)`;
    this.target.style.opacity = opacity;

    // User is still dragging a card.
    if (this.draggingCard)
      return;

    const isNearlyAtStart = (Math.abs(this.screenX) < 0.1);
    const isNearlyInvisible = (opacity < 0.01);

    // If the card is nearly gone.
    if (isNearlyInvisible) {

      // Bail if there's no target or it's not attached to a parent anymore.
      if (!this.target || !this.target.parentNode)
        return;

      this.target.parentNode.removeChild(this.target);

      // Slide all the other cards.
      this.animateOtherCardsIntoPosition();

    } else if (isNearlyAtStart) {
      this.resetTarget();
    }
  }

  animateOtherCardsIntoPosition () {
    let isAfterCurrentTarget = false;

    const onTransitionEnd = evt => {
      this.resetTarget();

      evt.target.style.transition = 'none';
      evt.target.removeEventListener('transitionend', onTransitionEnd);
    };

    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];

      // Wait until we find the target card.
      if (card === this.target) {
        isAfterCurrentTarget = true;
        continue;
      }

      if (!isAfterCurrentTarget)
        continue;

      // Move the card, then wait a frame and then slide it up.
      card.style.transform = `translateY(${this.targetBCR.height + 20}px)`;
      requestAnimationFrame(_ => {
        card.style.transition = 'transform 0.15s cubic-bezier(0,0,0.31,1)';
        card.style.transform = 'none';
      });

      card.addEventListener('transitionend', onTransitionEnd);
    }

    // If we didn't find any cards to slide remove the target.
    this.resetTarget();
  }

  resetTarget () {
    if (!this.target)
      return;

    this.target.style.willChange = 'initial';
    this.target.style.transform = 'none';
    this.target = null;
  }
}

window.addEventListener('load', () => new Cards());
