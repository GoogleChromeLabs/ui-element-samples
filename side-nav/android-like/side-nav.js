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

class SideNav {
  constructor () {
    this.showButtonEl = document.querySelector('.js-menu-show');
    this.hideButtonEl = document.querySelector('.js-menu-hide');
    this.sideNavEl = document.querySelector('.js-side-nav');
    this.sideNavContainerEl = document.querySelector('.js-side-nav-container');
    this.bodyEl = document.querySelector('.js-body');
    this.styleEl = document.head.appendChild(document.createElement('style'));

    this.showSideNav = this.showSideNav.bind(this);
    this.hideSideNav = this.hideSideNav.bind(this);
    this.blockClicks = this.blockClicks.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTransitionEnd = this.onTransitionEnd.bind(this);
    this.update = this.update.bind(this);

    this.startX = 0;
    this.currentX = 0;
    this.touchingSideNav = false;
    this.isHidden = true;

    this.addEventListeners();
  }

  addEventListeners () {
    this.showButtonEl.addEventListener('click', this.showSideNav);
    this.hideButtonEl.addEventListener('click', this.hideSideNav);
    this.sideNavEl.addEventListener('click', this.hideSideNav);
    this.sideNavContainerEl.addEventListener('click', this.blockClicks);

    this.sideNavEl.addEventListener('touchstart', this.onTouchStart);
    this.sideNavEl.addEventListener('touchmove', this.onTouchMove);
    this.sideNavEl.addEventListener('touchend', this.onTouchEnd);
    this.bodyEl.addEventListener('touchstart', this.onTouchStart);
    this.bodyEl.addEventListener('touchmove', this.onTouchMove);
    this.bodyEl.addEventListener('touchend', this.onTouchEnd);
  }

  onTouchStart (evt) {
    if (this.isHidden) {
      // 30px activation area
      if (evt.touches[0].pageX > 30) return;
    }
    this.sideNavBCR = this.sideNavContainerEl.getBoundingClientRect();
    this.startX = Math.min(evt.touches[0].pageX, this.sideNavBCR.right);
    this.currentX = this.startX;

    this.touchingSideNav = true;
    requestAnimationFrame(this.update);
  }

  onTouchMove (evt) {
    if (!this.touchingSideNav)
      return;

    this.currentX = evt.touches[0].pageX;
    if (!this.isHidden) {
      if (this.currentX > this.startX) this.startX = this.currentX;
      this.startX = Math.min(this.startX, this.sideNavBCR.right);
    }

    evt.preventDefault();
  }

  onTouchEnd (evt) {
    if (!this.touchingSideNav)
      return;

    this.touchingSideNav = false;

    const translateX = this.currentX - this.startX;
    this.sideNavContainerEl.style.transform = '';

    if (translateX < - this.sideNavBCR.width / 2) {
      this.hideSideNav();
    } else if (translateX > this.sideNavBCR.width / 2) {
      this.showSideNav();
    } else {
      this.sideNavEl.classList.add('side-nav--animatable');
      this.sideNavEl.addEventListener('transitionend', this.onTransitionEnd);
    }
    this.styleEl.innerHTML = '';
  }

  update () {
    if (!this.touchingSideNav)
      return;

    requestAnimationFrame(this.update);

    let translateX;
    if (this.isHidden) {
      // 102% translation
      translateX = this.currentX - this.startX - this.sideNavBCR.width * 1.02;
    } else {
      translateX = this.currentX - this.startX;
    }
    translateX = Math.min(0, translateX);
    const opacity = 1 - -translateX / this.sideNavBCR.width;
    this.styleEl.innerHTML = `.side-nav::before { opacity: ${opacity}; }`;
    this.sideNavContainerEl.style.transform = `translateX(${translateX}px)`;
  }

  blockClicks (evt) {
    evt.stopPropagation();
  }

  onTransitionEnd (evt) {
    this.sideNavEl.classList.remove('side-nav--animatable');
    this.sideNavEl.removeEventListener('transitionend', this.onTransitionEnd);
  }

  showSideNav () {
    this.sideNavEl.classList.add('side-nav--animatable');
    this.sideNavEl.classList.add('side-nav--visible');
    this.sideNavEl.addEventListener('transitionend', this.onTransitionEnd);
    this.isHidden = false;
  }

  hideSideNav () {
    this.sideNavEl.classList.add('side-nav--animatable');
    this.sideNavEl.classList.remove('side-nav--visible');
    this.sideNavEl.addEventListener('transitionend', this.onTransitionEnd);
    this.isHidden = true;
  }
}

new SideNav();
