var model = (function() {
  "use strict";

  var activeImage;

  var doAjax = function (method, url, body, json, callback){
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function(e){
          switch(this.readyState){
               case (XMLHttpRequest.DONE):
                  if (this.status === 200) {
                      if (json) return callback(null, JSON.parse(this.responseText));
                      return callback(null, this.responseText);
                  }else{
                      return callback(this.responseText, null);
                  }
          }
      };
      xhttp.open(method, url, true);
      if (json && body){
          xhttp.setRequestHeader('Content-Type', 'application/json');
          xhttp.send(JSON.stringify(body));
      }else{
          xhttp.send(body);
      }
  };

  var model = {};

  //CREATE

  //sigin and signUp
  model.signIn = function(data){
    doAjax('POST', '/api/signin/', data, true, function(err, newData){
      if(err){
        console.error(err);
        document.dispatchEvent(new CustomEvent("Error", {'detail':  err}));
      }
      window.location = '/';
    });
  };

  model.signUp = function(data){
    doAjax('PUT', '/api/users/', data, true, function(err, newData){
      if(err){
        console.error(err);
        document.dispatchEvent(new CustomEvent("Error", {'detail':  err}));
      }
      window.location = '/';
    });
  };

  model.createData = function(data){
    var formdata = new FormData();

    formdata.append("picture", data.picture);
    formdata.append("title", data.title);

    doAjax('POST', '/api/images/', formdata, false, function(err, newData){
      if(err){
        console.error(err);
        document.dispatchEvent(new CustomEvent("Error", {'detail':  err}));
      }
      else document.dispatchEvent(new CustomEvent("onNewUpload", {'detail': newData}));
    });
  };

  model.createComment = function(data){
    data.imageId = JSON.parse(activeImage)._id;

    doAjax('POST', '/api/comments/', data, true, function(err, newData){
      if(err){
        console.error(err);
        document.dispatchEvent(new CustomEvent("Error", {'detail':  err}));
      }
      else document.dispatchEvent(new CustomEvent("onNewComment", {'detail': newData}));
    });
  };

  //READ

  model.getImage = function(data) {
    var newData = [];

    if (data !== 'null'){
      activeImage = data;

      var path, type;

      if (JSON.parse(activeImage).filePicture !== null) {
        path = 'api/images/'+JSON.parse(activeImage)._id+'/picture/'+JSON.parse(activeImage).username;
        type = JSON.parse(activeImage).filePicture.mimetype;
      }else {
        path = JSON.parse(activeImage).urlPicture;
        type = '';
      }

      newData[0] = JSON.parse(activeImage).title;
      newData[1] = JSON.parse(activeImage).username;
      newData[2] = path;
      newData[3] = type;
      newData[4] = JSON.parse(activeImage)._id;
    }

    document.dispatchEvent(new CustomEvent("uploadImage", {'detail': newData}));
  };

  //update

  model.signOut = function(){
    doAjax('GET', '/api/signout/', null, false, function(err) {
      if(err){
        console.error(err);
        document.dispatchEvent(new CustomEvent("Error", {'detail':  err}));
      }
      window.location = '/signout/';
    });
  };

  model.getLatestImage = function(username){
    doAjax('GET', '/api/images/' + username, null, true, function(err, data){
      if(err){
        console.error(err);
        document.dispatchEvent(new CustomEvent("Error", {'detail':  err}));
      }
      else {
        if (data.length === 0){
          document.dispatchEvent(new CustomEvent("uploadImage", {'detail': 'No images in this gallery'}));
        }
        data.forEach(function(latestImage){
          document.dispatchEvent(new CustomEvent("onNewUpload", {'detail': JSON.stringify(latestImage)}));
        });
      }
    });
  };

  model.allGalleries = function(){
    doAjax('GET', '/api/users/', null, true, function(err, data){
      if(err){
        console.error(err);
        document.dispatchEvent(new CustomEvent("Error", {'detail':  err}));
      }
      else {
        data.forEach(function(user){
          document.dispatchEvent(new CustomEvent("listUser", {'detail': user}));
        });
      }
    });
  };

  model.getLatestComments = function(){
    doAjax('GET', '/api/comments/'+JSON.parse(activeImage)._id, null, true, function(err, latestComments){
      if(err){
        console.error(err);
        document.dispatchEvent(new CustomEvent("Error", {'detail':  err}));
      } else {
        latestComments.forEach(function(latestComment){
          document.dispatchEvent(new CustomEvent("onNewComment", {'detail': latestComment}));
        });
      }
    });
  };

  model.getNextImage = function(username){
    doAjax('GET', '/api/images/next/'+JSON.parse(activeImage)._id+'/'+username, null, true, function(err, nextImage) {
      if(err){
        console.error(err);
        document.dispatchEvent(new CustomEvent("Error", {'detail':  err}));
      } else {
        if (nextImage.length === 0){
          document.dispatchEvent(new CustomEvent("Error", {'detail':  'No more images'}));
        } else{
          document.dispatchEvent(new CustomEvent("onNewUpload", {'detail': JSON.stringify(nextImage[0])}));
        }
      }
    });
  };

  model.getPreviousImage = function(username){
    doAjax('GET', '/api/images/previous/'+JSON.parse(activeImage)._id+'/'+username, null, true, function(err, previousImage) {
      if(err){
        console.error(err);
        document.dispatchEvent(new CustomEvent("Error", {'detail':  err}));
      }if (previousImage.length === 0){
        document.dispatchEvent(new CustomEvent("Error", {'detail':  'No more images'}));
      }else{
        document.dispatchEvent(new CustomEvent("onNewUpload", {'detail': JSON.stringify(previousImage[0])}));
      }
    });
  };

  model.getNextComments = function(data){
    doAjax('GET', '/api/comments/next/' +  JSON.parse(activeImage)._id + '/' + data, null, true, function(err, nextComments) {
      if(err){
        console.error(err);
        document.dispatchEvent(new CustomEvent("Error", {'detail':  err}));
      } else {
        if(nextComments.length !== 0) document.dispatchEvent(new CustomEvent("clearCommentSection"));
        nextComments.forEach(function(nextComment) {
          document.dispatchEvent(new CustomEvent("onNewComment", {'detail': nextComment}));
        });
      }
    });
  };

  model.getPreviousComments = function(data){
    doAjax('GET', '/api/comments/previous/' +  JSON.parse(activeImage)._id + '/' + data, null, true, function(err, previousComments) {
      if(err){
        console.error(err);
        document.dispatchEvent(new CustomEvent("Error", {'detail':  err}));
      } else {
        if(previousComments.length !== 0) document.dispatchEvent(new CustomEvent("clearCommentSection"));
        previousComments.forEach(function(previousComment) {
          document.dispatchEvent(new CustomEvent("onNewComment", {'detail': previousComment}));
        });
      }
    });
  };

  // DELETE

  model.deleteImage = function() {
    doAjax('DELETE', '/api/images/'+JSON.parse(activeImage)._id, null, false, function(err){
      if(err){
        console.error(err);
        document.dispatchEvent(new CustomEvent("Error", {'detail':  err}));
      } else document.dispatchEvent(new CustomEvent('redirectToLatestImage'));
    });
  };

  model.deleteComment = function(commentId){
    doAjax('DELETE', '/api/comments/'+commentId, null, false, function(err){
      if(err){
        console.error(err);
        document.dispatchEvent(new CustomEvent("Error", {'detail':  err}));
      } else document.dispatchEvent(new CustomEvent("deletedComment", {'detail': commentId}));
    });
  };

  return model;
}());
