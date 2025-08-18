(function(scope) {


/**
 * Construct a component which adds `data-focus` hint attributes to an element.
 *
 * @constructor
 * @param {Element} element The element which will be annotated with a
 *     data-focus attribute on interaction.
 */
scope.FocusAttributes = function(element) {
  this.element_ = element;
  this.bindMethods_();
  this.addEventListeners_();
};


scope.FocusAttributes.prototype = {
  /**
   * Add blur, focus and mousedown event listeners.
   * @private
   */
  addEventListeners_: function() {
    this.element_.addEventListener('blur', this.onBlur_.bind(this));
    this.element_.addEventListener('focus', this.onFocus_.bind(this));
    this.element_.addEventListener('mousedown', this.onMouseDown_.bind(this));
  },

  /**
   * Bind methods to this instance of FocusAttributes.
   * @private
   */
  bindMethods_: function() {
    this.onBlur_ = this.onBlur_.bind(this);
    this.onFocus_ = this.onFocus_.bind(this);
    this.onMouseDown_ = this.onMouseDown_.bind(this);
  },

  /**
   * Remove the data attr on blur.
   * @private
   */
  onBlur_: function() {
    this.element_.removeAttribute('data-focus');
  },

  /**
   * Set the data attr to `keyboard` on focus, if it doesn't exist already.
   * @private
   */
  onFocus_: function() {
    if (this.element_.hasAttribute('data-focus'))
      return;

    this.element_.setAttribute('data-focus', 'keyboard');
  },

  /**
   * Set the data attribute to `mouse` on mousedown.
   * @private
   */
  onMouseDown_: function() {
    this.element_.setAttribute('data-focus', 'mouse');
  }
};


})(self);
