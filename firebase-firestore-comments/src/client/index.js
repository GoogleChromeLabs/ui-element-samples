/**
 *
 * Copyright 2018 Google Inc. All rights reserved.
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
import { LoginButton } from './components/sc-login.js';
import { CommentForm } from './components/sc-comment-form.js';
import { CommentList } from './components/sc-comment-list.js';
import { Comment } from './components/sc-comment.js';

customElements.define('sc-login', LoginButton);
customElements.define('sc-comment-form', CommentForm);
customElements.define('sc-comment-list', CommentList);
customElements.define('sc-comment', Comment);

const scLogin = document.querySelector('sc-login');
const scForm = document.querySelector('sc-comment-form');

scForm.addEventListener('comment-sent', e => {
  const commentsRef = firebase.firestore().collection('comments');
  commentsRef.add({
    text: e.detail.text,
    uid: scLogin.user.uid,
    photoUrl: scLogin.user.photoURL,
    authorName: scLogin.user.displayName,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
});

scLogin.addEventListener('on-auth', e => {
  if(e.detail) {
    scLogin.classList.add('sc-hidden');
  } else {
    scLogin.classList.remove('sc-hidden');
  }
});
