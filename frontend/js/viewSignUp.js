/*jshint esversion: 6 */
var view = (function(e) {
  "use strict";

  //UI Events
  document.getElementById("signup").onsubmit = function(e) {
    e.preventDefault();
    var data = {};

    data.username = document.getElementById("username").value;
    data.password = document.getElementById("password").value;
    e.target.reset();
    document.dispatchEvent(new CustomEvent('SignUp', {'detail': data}));
  };

  //UI API
  var view = {};

  return view;
}());
