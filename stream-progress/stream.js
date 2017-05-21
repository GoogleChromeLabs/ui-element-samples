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

import {TransformStream} from './third_party/transformstream.js';

class JSONTransformer {
  constructor() {
    this.chunks = [];
    this.depth = 0;
    this.inString = false;
    this.skipNext = false;
    this.decoder = new TextDecoder();
  }

  start() {}
  flush() {}
  transform(chunk, controller) {
    for(let i = 0; i < chunk.length; i++) {
      if(this.skipNext) {
        this.skipNext = false;
        continue;
      }
      const byte = chunk[i];
      const char = String.fromCharCode(byte);
      switch(char) {
        case '{':
          if(this.inString) continue;
          this.depth++;
        break;
        case '}':
         if(this.inString) continue;
          this.depth--;
          if(this.depth === 0) {
            const tail = new Uint8Array(chunk.buffer, chunk.byteOffset, i + 1);
            chunk = new Uint8Array(chunk.buffer, chunk.byteOffset + i + 1);
            this.chunks.push(tail);

            const jsonStr = this.chunks.reduce((str, chunk) =>
              str + this.decoder.decode(chunk, {stream: true}), '');
            controller.enqueue(jsonStr);

            this.chunks.length = 0;
            i = -1;
          }
        break;
        case '"':
          this.inString = !this.inString;
        break;
        case '\\':
          this.skipNext = true;
        break;
      }
    }
    this.chunks.push(chunk);
  }
}

const dial = document.querySelector('sc-dial');
fetch('./tweets.json')
  .then(async resp => {

    if (resp.status != 200) {
      //Don't try to parse non JSON responses, such as a 404 error...
      return;
    }

    const bytesTotal = parseInt(resp.headers.get('Content-Length'), 10);
    const jsonStream = resp.body.pipeThrough(new TransformStream(new JSONTransformer()));
    const reader = jsonStream.getReader();

    let bytesCounted = 0;
    while(true) {
      const {value, done} = await reader.read();
      if(done) {
        dial.percentage = 1;
        return;
      }

      bytesCounted += value.length;
      dial.percentage = bytesCounted / bytesTotal;
    }
  });
