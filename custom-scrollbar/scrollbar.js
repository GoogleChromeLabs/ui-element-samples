(function(scope) {
  var dragging = false;
  var lastY = 0;

  function dragStart(event) {
    dragging = true;
    this.style.pointerEvents = 'none';
    this.style.userSelect = 'none';

    lastY = (event.clientY || event.clientY === 0) ? event.clientY : event.touches[0].clientY;
  }

  function dragMove(event) {
    if (!dragging) return;
    var clientY = (event.clientY || event.clientY === 0) ? event.clientY : event.touches[0].clientY;
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
  function updateSize(scrollable) {
    scrollable.style.width = '';
    scrollable.style.width = `calc(${getComputedStyle(scrollable).width} + 200px)`;

    var thumb = scrollable.thumb;
    var viewport = scrollable.getBoundingClientRect();
    var scrollHeight = scrollable.scrollHeight;
    var maxScrollTop = scrollHeight - viewport.height;
    var thumbHeight = Math.pow(viewport.height, 2)/scrollHeight;
    var maxTopOffset = viewport.height - thumbHeight;

    thumb.scaling = maxTopOffset / maxScrollTop;
    thumb.style.height = `${thumbHeight}px`;

    if(scrollable.isIOS) {
      thumb.nextElementSibling.style.marginTop = `-${thumbHeight}px`;
      var z = 1 - 1/(1+thumb.scaling);
      thumb.style.transform = `
        translateZ(${z}px)
        scale(${1-z})
        translateX(-200px)
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
         translateX(-200px)
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
    scrollable.style.transformStyle = 'preserve-3d';
    scrollable.style.perspective = '1px';

    var perspectiveCtr = document.createElement('div');
    perspectiveCtr.style.perspectiveOrigin = 'top right';
    perspectiveCtr.style.transformStyle = 'preserve-3d';
    perspectiveCtr.style.width = '100%';

    perspectiveCtr.style.position = 'absolute';
    perspectiveCtr.style.pointerEvents = 'none';
    perspectiveCtr.classList.add('perspective-ctr')

    while(scrollable.firstChild) perspectiveCtr.appendChild(scrollable.firstChild);

    scrollable.insertBefore(perspectiveCtr, scrollable.firstChild);
    var thumb = document.createElement('div');
    thumb.classList.add('thumb');
    thumb.style.pointerEvents = 'initial';
    thumb.style.position = 'absolute';
    thumb.style.transformOrigin = 'top right';
    thumb.style.top = '0';
    thumb.style.right = '0';
    perspectiveCtr.insertBefore(thumb, perspectiveCtr.firstChild);
    scrollable.thumb = thumb;
    scrollable.perspectiveCtr = perspectiveCtr;

    // We are on Safari, where we need to use the sticky trick!
    if (getComputedStyle(scrollable).webkitOverflowScrolling) {
      scrollable.isIOS = true;
      thumb.style.right = '';
      thumb.style.left = '100%';
      thumb.style.position = '-webkit-sticky';
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
      updateSize(scrollable);
    };
    requestAnimationFrame(f);
    window.addEventListener('resize', f);
    return f;
  }

  window.addEventListener('load', function () {
    Array.from(document.querySelectorAll('.overflow')).forEach(scrollable => {
      makeCustomScrollbar(scrollable);
      updateSize(scrollable);
    });
  });

})(self);
