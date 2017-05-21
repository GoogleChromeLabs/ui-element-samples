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

class SCDial extends HTMLElement {
  static get SIZE () {
    return 256;
  }

  static get NINETY_DEGREES () {
    return Math.PI * 0.5;
  }

  static get TAU () {
    return Math.PI * 2;
  }

  constructor () {
    super();

    this._canvas = document.createElement('canvas');
    this._ctx = this._canvas.getContext('2d');

    this._canvas.width = SCDial.SIZE;
    this._canvas.height = SCDial.SIZE;

    this._percentage = 0;
  }

  set percentage (_percentage) {
    if (Number.isNaN(_percentage) || _percentage < 0 || _percentage > 1) {
      throw new Error('Percentage must be a number between 0 and 1.');
    }

    this._percentage = _percentage;
    this.draw();
  }

  get percentage () {
    return this._percentage;
  }

  draw () {
    const mid = SCDial.SIZE * 0.5;

    // Since the coordinate system is about to get changed,
    // save the context (and restore it when we're done later).
    this._ctx.save();

    // Clear everything.
    this._ctx.clearRect(0, 0, SCDial.SIZE, SCDial.SIZE);

    // Rotate the coordinate system.
    this._ctx.translate(mid, mid);
    this._ctx.rotate(-SCDial.NINETY_DEGREES);
    this._ctx.translate(-mid, -mid);

    // Outer arc.
    this._ctx.beginPath();
    this._ctx.moveTo(mid, mid);
    this._ctx.arc(mid, mid, mid, 0, this._percentage * SCDial.TAU);
    this._ctx.closePath();
    this._ctx.fillStyle = `rgb(${Math.round(this._percentage * 255)}, 0, 128)`;
    this._ctx.fill();

    // Inner arc.
    this._ctx.beginPath();
    this._ctx.moveTo(mid, mid);
    this._ctx.arc(mid, mid, mid * 0.8, 0, SCDial.TAU);
    this._ctx.closePath();
    this._ctx.fillStyle = '#FFF';
    this._ctx.fill();

    this._ctx.restore();

    // Number Label.
    this._ctx.fillStyle = '#333';
    this._ctx.font = `${SCDial.SIZE * 0.25}px Arial`;
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'middle';
    this._ctx.fillText(Math.round(this._percentage * 100), mid, mid - 14);

    // Text label.
    this._ctx.fillStyle = '#777';
    this._ctx.font = `${SCDial.SIZE * 0.06}px Arial`;
    this._ctx.fillText('PERCENT', mid, mid + 26);
  }

  connectedCallback () {
    this.appendChild(this._canvas);
    this.draw();
  }
}

customElements.define('sc-dial', SCDial);
