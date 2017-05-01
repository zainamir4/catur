/*jshint esversion: 6 */
var view = (function(e) {
  "use strict";

  //UI Events

  document.getElementById("signin").onsubmit = function(e) {
    e.preventDefault();
    var data = {};
    console.log("here inside SignIn JS");
    data.username = document.getElementById("username").value;
    data.password = document.getElementById("password").value;
    e.target.reset();
    document.dispatchEvent(new CustomEvent('SignIn', {'detail': data}));
  };

  //UI API
  var view = {};

  return view;
}());
