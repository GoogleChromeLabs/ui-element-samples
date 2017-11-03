/*
  Copyright 2017 Google Inc. All Rights Reserved.
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
      http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


/**
 * Handles incoming messages in the web worker.
 * In this case: increases each pixel's red color by 20%.
 * @param {!Object} d Incoming data.
 */
addEventListener('message', (d) => {
  const imageData = d.data;
  const w = imageData.width;
  const h = imageData.height;
  const data = imageData.data;

  // Iterate pixel rows and columns to change red color of each.
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let index = (x + (y * w)) * 4;
      data[index] = data[index] * 1.2;
    }
  }
  
  postMessage(imageData, [imageData.data.buffer])
});
