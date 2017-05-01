/*jshint esversion: 6 */

(function(model, view){
    "use strict";

    var showError = function(message){
        alert(message);
    };

    // user's gallery to show
    var username;

    //Listen for Events

    document.addEventListener('SignIn', function(e) {
      var data = e.detail;
      model.signIn(data);
    });

    document.addEventListener('SignUp', function(e) {
      var data = e.detail;
      model.signUp(data);
    });

    document.addEventListener('signOut', function(e) {
      model.signOut();
    });

    document.addEventListener('Error', function(e) {
      var error = e.detail;
      showError(error);
    });

    document.addEventListener('onFormUpload', function(e){
      var data = e.detail;
      model.createData(data);
    });

    document.addEventListener('onNewUpload', function(e){
      var data = e.detail;
      model.getImage(data);
    });

    document.addEventListener('uploadImage', function(e){
      var data = e.detail;
      view.showNewImage(data);
    });

    // document.addEventListener('redirectFromUrl', function(e){
    //   var id = e.detail;
    //   model.getById(id);
    // });

    document.addEventListener('allGalleries', function(e){
      model.allGalleries();
    });

    document.addEventListener('listUser', function(e){
      var data = e.detail;
      view.insertUser(data.username);
    });

    document.addEventListener('redirectToLatestImage', function(e){
      username = e.detail;
      model.getLatestImage(username);
    });

    document.addEventListener('nextImage', function(e){
      model.getNextImage(username);
    });


    document.addEventListener('previousImage', function(e){
      model.getPreviousImage(username);
    });


    document.addEventListener('deleteImage', function(e) {
      model.deleteImage();
    });

    document.addEventListener('insertComment', function(e) {
      var data = e.detail;
      model.createComment(data);
    });

    document.addEventListener('onNewComment', function(e) {
      var data = e.detail;
      view.insertComment(data);
    });

    document.addEventListener('deleteComment', function(e) {
      var id = e.detail;
      model.deleteComment(id);
    });

    document.addEventListener('deletedComment', function(e) {
      var id = e.detail;
      view.removeComment(id);
    });

    document.addEventListener('getlatestComments', function(e) {
      model.getLatestComments();
    });

    document.addEventListener('clearCommentSection', function(e) {
      view.clearCommentSection();
    });

    document.addEventListener('getPreviousComments', function(e) {
      var data = e.detail;
      model.getPreviousComments(data);
    });

    document.addEventListener('getNextComments', function(e){
      var data = e.detail;
      model.getNextComments(data);
    });


}(model, view));
