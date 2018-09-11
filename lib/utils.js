/**
 * JavaScript function prototype debouncer 2.0 - hnldesign.nl
 * Based on code by Paul Irish and the original debouncing function from John Hann
 * http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
 * Register debouncer as a function prototype.
 * Usage:
 * myfunction.deBounce(time, executeasap, caller);
 *
 * @param threshold - Integer. Time in ms to wait for repeated calls. If time passes without more requests, function is called
 * @param execAsap - Boolean. Reverses workings; call function on first request, stop subsequent calls within threshold
 * @param caller - String. Original event that requested the repeat, for usage in callback
 * @returns function {debounced}
 */
if (typeof Function.prototype.deBounce !== 'function') {
  Object.defineProperty(Function.prototype, 'deBounce', {
      value : function (threshold, execAsap, caller) {
          'use strict';
          var func = this;
          var timeout;
          return function debounced() {
              var obj = this;

              function delayed() {
                  if (!execAsap) {
                      func.apply(obj, [caller]);
                  }
                  timeout = null;
              }

              if (timeout) {
                  clearTimeout(timeout);
              } else {
                  if (execAsap) {
                      func.apply(obj, [caller]);
                  }
              }
              timeout = setTimeout(delayed, threshold || 100);
          };
      }
  });
}

Math.randomRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const Utils = {}


Utils.throttle = (delay, callback) => {
  let isThrottled = false, args, context;

  function wrapper() {
      if (isThrottled) {
      args = arguments;
      context = this;
      return;
      }

      isThrottled = true;
      callback.apply(this, arguments);
      
      setTimeout(() => {
      isThrottled = false;
      if (args) {
          wrapper.apply(context, args);
          args = context = null;
      }
      }, delay);
  }

  return wrapper;
}

Utils.debounced = (delay, fn) => {
  let timerId;
  return function (...args) {
      if (timerId) {
          clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
          fn(...args);
          timerId = null;
      }, delay);
  }
}

module.exports = Utils
