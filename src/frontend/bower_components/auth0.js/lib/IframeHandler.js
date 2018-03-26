/*!
governify-gateway 1.0.0, built on: 2018-03-27
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-gateway

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/

var IframeHandler = function (options) {
  this.auth0 = options.auth0;
  this.url = options.url;
  this.callback = options.callback;
  this.timeout = options.timeout || 60 * 1000;
  this.timeoutCallback = options.timeoutCallback || null;
  this.usePostMessage = options.usePostMessage || false;
  this.iframe = null;
  this.timeoutHandle = null;
  this._destroyTimeout = null;
  this.transientMessageEventListener = null;
  this.transientEventListener = null;
}

IframeHandler.prototype.init = function (url) {
  this.iframe = document.createElement('iframe');
  this.iframe.style.display = "none";
  this.iframe.src = this.url;

  var _this = this; 

  if (this.usePostMessage) {

    // Workaround to avoid using bind that does not work in IE8
    this.transientMessageEventListener = function(e) {
      _this.messageEventListener(e);
    };

    window.addEventListener("message", this.transientMessageEventListener, false);
  } 
  else {

    // Workaround to avoid using bind that does not work in IE8
    this.transientEventListener = function() {
      _this.loadEventListener();
    };

    this.iframe.addEventListener("load", this.transientEventListener, false);
  }

  document.body.appendChild(this.iframe);

  this.timeoutHandle = setTimeout(function() {
    _this.timeoutHandler();
  }, this.timeout);
}

IframeHandler.prototype.messageEventListener = function (e) { 
  this.callbackHandler(e.data);

  this.destroy()
}

IframeHandler.prototype.loadEventListener = function () { 
  var result = this.auth0.parseHash(this.iframe.contentWindow.location.hash);

  if (!result) return;

  this.callbackHandler(result);
  
  this.destroy();
}

IframeHandler.prototype.callbackHandler = function (result) {
  var error = null;

  if (result.error) {
    error = result;
    result = null;
  }

  this.callback(error, result);
}

IframeHandler.prototype.timeoutHandler = function () {
  if (this.timeoutCallback) {
    this.timeoutCallback();
  }
  this.destroy();
}
IframeHandler.prototype.destroy = function () {
  var _this = this;

  if (this.timeoutHandle) {
    clearTimeout(this.timeoutHandle);
  }

  this._destroyTimeout = setTimeout(function () {
    if (_this.usePostMessage) {
      window.removeEventListener("message", _this.transientMessageEventListener, false);
    }
    else {
      _this.iframe.removeEventListener("load", _this.transientEventListener, false);
    }
    document.body.removeChild(_this.iframe)
  }, 0);
} 


module.exports = IframeHandler;