(function(scope) {
  var dragging = false;
  var lastY = 0;

  function dragStart(event) {
    dragging = true;
    this.style.pointerEvents = 'none';
    this.style.userSelect = 'none';

    lastY = event.clientY || event.touches[0].clientY;
  }

  function dragMove(event) {
    if (!dragging) return;
    var clientY = event.clientY || event.touches[0].clientY;
    this.scrollTop += (clientY - lastY)/this.thumb.scaling;
    lastY = clientY;
    event.preventDefault();

  }

  function dragEnd(event) {
    dragging = false;
    this.style.pointerEvents = 'initial';
    this.style.userSelect = 'initial';
  }


  // The point of this function is to update the thumb's geometry to reflect
  // the amount of overflow.
  function updateThumbSize(scrollable) {
    var thumb = scrollable.thumb;
    scrollable.perspectiveCtr.style.height = scrollable.scrollHeight + "px";

    var viewport = scrollable.getBoundingClientRect();
    var scrollHeight = scrollable.scrollHeight;
    var maxScrollTop = scrollHeight - viewport.height;
    var thumbHeight = Math.pow(viewport.height, 2)/scrollHeight;
    var maxTopOffset = viewport.height - thumbHeight;

    thumb.scaling = maxTopOffset / maxScrollTop;
    thumb.style.height = `${thumbHeight}px`;

    if(scrollable.isSafari) {
      thumb.nextElementSibling.style.marginTop = `-${thumbHeight}px`;
      // thumb.scaling = 0.5;
      var z = 1 - 1/(1+thumb.scaling);
      thumb.style.transform = `
        translateZ(${z}px)
        scale(${1-z})
      `;
    } else {
      thumb.style.transform = `
         scale(${1/thumb.scaling})
         matrix3d(
           1, 0, 0, 0,
           0, 1, 0, 0,
           0, 0, 1, 0,
           0, 0, 0, -1
         )
         translateZ(${-2 + 1 - 1/thumb.scaling}px)
      `;
    }
  }

  function makeCustomScrollbar(scrollable) {
    // Edge requires a transform on the document body and a fixed position element
    // in order for it to properly render the parallax effect as you scroll.
    // See https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/5084491/
    if (getComputedStyle(document.body).transform == 'none')
      document.body.style.transform = 'translateZ(0)';
    var fixedPos = document.createElement('div');
    fixedPos.style.position = 'fixed';
    fixedPos.style.top = '0';
    fixedPos.style.width = '1px';
    fixedPos.style.height = '1px';
    fixedPos.style.zIndex = 1;
    document.body.insertBefore(fixedPos, document.body.firstChild);

    scrollable.style.perspectiveOrigin = 'top right';
    scrollable.style.transformStyle = "preserve-3d";
    scrollable.style.perspective = "1px";

    var perspectiveCtr = document.createElement('div');
    perspectiveCtr.style.perspectiveOrigin = "top right";
    perspectiveCtr.style.transformStyle = "preserve-3d";
    perspectiveCtr.style.width = "100%";
    // TODO: Put content into perspective container so that it automatically
    // gets the scrollable content height from its descendants, as right now it
    // will not detect changes to content size.
    perspectiveCtr.style.height = scrollable.scrollHeight + "px";
    perspectiveCtr.style.position = 'absolute';
    perspectiveCtr.style.pointerEvents = 'none';
    perspectiveCtr.classList.add('perspective-ctr')

    scrollable.insertBefore(perspectiveCtr, scrollable.firstChild);
    var thumb = document.createElement("div");
    thumb.classList.add('thumb');
    thumb.style.pointerEvents = 'initial';
    thumb.style.position = 'absolute';
    thumb.style.position = '-webkit-sticky';
    thumb.style.transformOrigin = 'top right';
    thumb.style.top = '0';
    thumb.style.right = '0';
    perspectiveCtr.insertBefore(thumb, perspectiveCtr.firstChild);
    scrollable.thumb = thumb;
    scrollable.perspectiveCtr = perspectiveCtr;

    // We are on Safari, where we need to use the sticky trick!
    if (getComputedStyle(thumb).position === '-webkit-sticky') {
      scrollable.isSafari = true;
      thumb.style.right = '';
      thumb.style.left = '100%';
      perspectiveCtr.style.perspective = '1px';
      perspectiveCtr.style.height = '';
      perspectiveCtr.style.width = '';
      perspectiveCtr.style.position = '';
      Array.from(scrollable.children)
        .filter(function (e) {return e !== perspectiveCtr;})
        .forEach(function (e) {perspectiveCtr.appendChild(e);});
    }

    scrollable.thumb.addEventListener('mousedown', dragStart.bind(scrollable), {passive: true});
    window.addEventListener('mousemove', dragMove.bind(scrollable));
    window.addEventListener('mouseup', dragEnd.bind(scrollable), {passive: true});
    scrollable.thumb.addEventListener('touchstart', dragStart.bind(scrollable), {passive: true});
    window.addEventListener('touchmove', dragMove.bind(scrollable));
    window.addEventListener('touchend', dragEnd.bind(scrollable), {passive: true});

    var f = function () {
      updateThumbSize(scrollable);
    };
    requestAnimationFrame(f);
    window.addEventListener('resize', f);
    return f;
  }

  window.addEventListener('load', function () {
    window.recalcScrollbar = makeCustomScrollbar(document.querySelector('.overflow'));
  });

})(self);
