/*jshint esversion: 6 */
var view = (function(e) {
  "use strict";

  // get the image_id from the url
  var urlId = function(){
    var url = window.location.href;
    var url_id = '';
    var index = url.indexOf('=') + 1;

    if (index === 0){
      url_id = '/';
    } else {
      url_id = url.substring(index, url.length);
    }
    return url_id;
  };

  // redirect to the latest image if no url is given o/w from the url
  window.onload = function(){

    var url_id = urlId();
    var event = '';
    if (url_id !== '/'){
      event = new CustomEvent('redirectFromUrl', {detail:parseInt(url_id)});
      document.dispatchEvent(event);
    } else {
      event = new CustomEvent('allGalleries');
      // event = new CustomEvent('redirectToLatestImage');
      document.dispatchEvent(event);
    }
  };

  //UI events
  document.getElementById('signout').onclick = function(e) {
    document.dispatchEvent( new CustomEvent('signOut'));
  };

  document.getElementById('gallery').onclick = function(e){
    e.preventDefault();

    var galleries = document.getElementById('galleries');
    var show_hide = galleries.style.display;

    if (show_hide === '' || show_hide === 'none') {
      galleries.style.display = 'flex';
    } else {
      galleries.style.display = 'none';
    }
  };

  //Form hide/show
  document.getElementById('show_hide_form').onclick = function(e) {
    e.preventDefault();

    var upload_form = document.getElementById('wrapper');
    var show_hide = upload_form.style.display;

    if (show_hide === '' || show_hide === 'none') {
      upload_form.style.display = 'flex';
    } else {
      upload_form.style.display = 'none';
    }
  };

  //Radio Buttons hide/show_hide for url
  document.getElementById('url_radio_button').onclick = function(e) {
    document.getElementById('file_radio_button').checked = false;

    var url = document.getElementById('url');
    var file = document.getElementById('file');
    var show_hide= url.style.display;

    if (show_hide === '' || show_hide === 'none') {
      url.style.display = 'block';
      file.style.display = 'none';
    }
  };

  //Radio Buttons hide/show_hide for file
  document.getElementById('file_radio_button').onclick = function(e) {
    document.getElementById('url_radio_button').checked = false;

    var file = document.getElementById('file');
    var url = document.getElementById('url');
    var show_hide= file.style.display;

    if (show_hide === '' || show_hide === 'none') {
      file.style.display = 'block';
      url.style.display = 'none';
    }
  };


  // uploading images
  document.getElementById('upload_image').onsubmit = function(e) {
    e.preventDefault();

    var title = document.getElementById('image_title').value;
    var data = {};
    var event;

    var url = document.getElementById('url_radio_button').checked;
    var file = document.getElementById('file_radio_button').checked;
    var image = '';

    if (!url && !file){
      alert('Please select a url or a file');
    } else if (url) {
      image = document.getElementById('url').value;
      data.title = title;
      data.picture = image;

      event = new CustomEvent('onFormUpload', {detail: data});
      document.dispatchEvent(event);
    } else {
      data.title = title;
      data.picture = document.getElementById("file").files[0];

      event = new CustomEvent('onFormUpload', {detail: data});
      document.dispatchEvent(event);
    }
  };

  // uploading comments
  document.getElementById('comment_form').onsubmit = function(e) {
    e.preventDefault();
    var data = {};

    data.content = document.getElementById('comment_content').value;
    data.date = new Date(Date.now()).toLocaleString().split(', ')[0];
    data.imageId = urlId();

    var event = new CustomEvent('insertComment', {detail:data});
    document.dispatchEvent(event);
  };

  //movement of the images
  document.getElementById('right_arrow').onclick = function(e){
    var event = new CustomEvent('nextImage');
    document.dispatchEvent(event);
  };

  document.getElementById('left_arrow').onclick = function(e){
    var event = new CustomEvent('previousImage');
    document.dispatchEvent(event);
  };

  // comment Navigation
  document.getElementById('previous_comment').onclick = function(e){
    var comments = document.getElementById('comments');
    var id = comments.lastChild.id;

    var data = id;

    var event = new CustomEvent('getPreviousComments', {detail:data});
    document.dispatchEvent(event);
  };

  document.getElementById('next_comment').onclick = function(e){
    var comments = document.getElementById('comments');
    var id = comments.childNodes[0].id;

    var data = id;

    var event = new CustomEvent('getNextComments', {detail:data});
    document.dispatchEvent(event);
  };

  // deleting an image
  document.getElementById('delete_picture').onclick = function(e){
    var event = new CustomEvent('deleteImage');
    document.dispatchEvent(event);
  };

  //UI API
  var view = {};

  var latestComments = function(){
    var comments = document.getElementById('comments');

    while (comments.hasChildNodes()){
      comments.removeChild(comments.lastChild);
    }
    event = new CustomEvent('getlatestComments');
    document.dispatchEvent(event);
  };

  view.showNewImage = function(data){
    var event;

    if (data.length === 0){
      alert('No more images');
    } else if (data === 'No images in this gallery'){
      alert(data);
    } else {

      // reset the form
      document.getElementById('upload_image').reset();

      //replace the image
      var oldImage = document.getElementById('current_image_uploaded');
      var newImage = document.createElement('object');
      newImage.data = `${data[2]}`;
      newImage.type = `${data[3]}`;
      var id = `${data[4]}`;

      newImage.innerHTML = `
        <img src = "https://i.imgflip.com/1ijjb1.jpg" alt="Image Error"/>`;
      oldImage.replaceChild(newImage, oldImage.childNodes[1]);

      //replace the title
      var title = document.getElementById('current_image_title');
      title.innerHTML= `${data[0]}`;

      //replace the author
      var author = document.getElementById('current_image_author');
      author.innerHTML = `By: ${data[1]}`;

      //use pushData to change the url
      history.pushState('', 'New Page Title', '/index.html?id='+id+'&user='+data[1]);

      // get the comments for the image and reset the div
      latestComments();
    }
  };

  view.clearCommentSection = function(){
    document.getElementById("comments").innerHTML= ``;
  };

  view.insertComment = function(data){
    document.getElementById("comment").reset();

    e = document.createElement('div');
    e.id = `${data._id}`;
    e.className = "comment";
    e.innerHTML = `
    <div class="comment_header">
      <div class="comment_author">${data.username}</div>
      <div  id="delete_comment" class="delete_comment"></div>
    </div>
    <div class="comment_content">${data.content}</div>
    <div class="comment_date">${data.date}</div>`;

    // make sure only ten comments are showing
    if (document.querySelectorAll('#comments .comment').length === 10){
      var oldestComment = document.getElementById('comments').lastElementChild;

      document.getElementById('comments').removeChild(oldestComment);
    }

    document.getElementById('comments').prepend(e);

    // deleting comments
    document.getElementById('delete_comment').onclick = function(e){
      var deleteComment = e.target.parentNode.parentNode.id;

      var event = new CustomEvent('deleteComment', {detail:deleteComment});
      document.dispatchEvent(event);
    };
  };

  view.removeComment = function(id){
    var comment = document.getElementById(id);
    comment.parentNode.removeChild(comment);

    // get the latest comments
    latestComments();
  };

  view.insertUser = function(username){
    e = document.createElement('div');
    e.className = "user";
    e.innerHTML = `
    <input type="radio" id=${username} class="form_element" name="users"/>
    <div>${username}</div>`;

    document.getElementById('galleries').prepend(e);
    document.getElementById(username).checked = false;

    document.getElementById(username).onclick = function(e) {
      var allRadioUsers = document.getElementsByName('users');

      for (var x=0; x < allRadioUsers.length; x++){
        if (allRadioUsers[x].id === username){
          document.getElementById(username).checked = true;
        }else{
          document.getElementById(allRadioUsers[x].id).checked = false;
        }
      }

      var event = new CustomEvent('redirectToLatestImage', {detail: username});
      document.dispatchEvent(event);
    };
  };

  return view;
}());
