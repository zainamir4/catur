/*jshint esversion: 6 */

var crypto = require('crypto');
var path = require('path');
var express = require('express');
var app = express();

var util = require('util');

var multer = require('multer');
var upload = multer({ dest: 'uploads/'});

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var Datastore = require('nedb');
var images = new Datastore({ filename: 'db/images.db', autoload: true, timestampData : true});
var comments = new Datastore({ filename: 'db/comments.db', autoload: true, timestampData : true });
var users = new Datastore({ filename: 'db/users.db', autoload: true, timestampData : true});


// Image constructor
var Image = function(){
  this.username = null;
  this.title = null;
  this.urlPicture = null;
  this.filePicture = null;
};

// Comment contructor
var Comment = function(comment) {
  this.imageId = comment.imageId;
  this.content = comment.content;
  this.username = comment.username;
  this.date = comment.date;
};

// User contructor
var User = function(user){
  var salt = crypto.randomBytes(16).toString('base64');
  var hash = crypto.createHmac('sha512', salt);
  hash.update(user.password);
  this.username = user.username;
  this.salt = salt;
  this.saltedHash = hash.digest('base64');
};

//Authentication
var checkPassword = function(user, password){
  var hash = crypto.createHmac('sha512', user.salt);
  hash.update(password);
  var value = hash.digest('base64');
  return (user.saltedHash === value);
};

var session = require('express-session');
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, sameSite: true }
}));

app.use(function (req, res, next){
  console.log("HTTPS request", req.method, req.url, req.body);
  return next();
});

// sanitization and validation
var expressValidator = require('express-validator');
app.use(expressValidator({
  customValidators: {
    fail: function(value){
      return false;
    }
  }
}));

app.use(function(req, res, next){
  Object.keys(req.body).forEach(function(arg){
    switch(arg){
        case 'username':
          req.checkBody(arg, 'invalid username').isAlpha();
          break;
        case 'password':
          break;
        case 'content':
          req.sanitizeBody(arg).escape();
          break;
        case 'imageId':
          break;
        case 'date':
          break;
        default:
            req.checkBody(arg, 'unknown argument').fail();
    }
  });
  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) return res.status(400).send('Validation errors: ' + util.inspect(result.array()));
    else next();
  });
});

// serving the frontend

app.get('/', function (req, res, next) {
    if (!req.session.user) return res.redirect('/signin.html');
    return next();
});


app.get('/signout/', function (req, res, next) {
    req.session.destroy(function(err) {
        if (err) return res.status(500).end(err);
        return res.redirect('/signin.html');
    });
});

app.use(express.static('frontend'));

//signin and signout
app.get('/api/signout/', function (req, res, next) {
  req.session.destroy(function(err) {
    if (err) return res.status(500).end(err);
    return res.end();
  });
});

app.post('/api/signin/', function (req, res, next) {
  if (!req.body.username || ! req.body.password) return res.status(400).send("Bad Request");
  users.findOne({username: req.body.username}, function(err, user){
    if (err) return res.status(500).end(err);
    if (!user || !checkPassword(user, req.body.password)) return res.status(401).end("Unauthorized");
    req.session.user = user;
    res.cookie('username', user.username, {httpOnly: true, secure: true, sameSite: true});
    return res.json(user);
  });
});


// CREATE

app.put('/api/users/', function (req, res, next) {
  var data = new User(req.body);
  users.findOne({username: req.body.username}, function(err, user){
    if (err) return res.status(500).end(err);
    if (user) return res.status(409).end("Username " + req.body.username + " already exists");
    users.insert(data, function (err, user) {
      if (err) return res.status(500).end(err);
      return res.json(user);
    });
  });
});

app.post('/api/images/', upload.single('picture'), function (req, res, next) {
  Object.keys(req.body).forEach(function(arg){
    switch(arg){
        case 'title':
          req.sanitizeBody(arg).escape();
          break;
        case 'picture':
          break;
        default:
            req.checkBody(arg, 'unknown argument').fail();
    }
  });
  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) return res.status(400).send('Validation errors: ' + util.inspect(result.array()));
  });

  if (!req.session.user) return res.status(403).end("Forbidden");
  var image = new Image();

  if(req.file) image.filePicture = req.file;
  else image.urlPicture = req.body.picture;

  image.username = req.session.user.username;
  image.title = req.body.title;
  images.insert(image, function (err, data) {
    if(err){
      res.status(409).end("Request could not be processed");
      return next();
    }

    res.json(data);
    return next();
  });
});

app.post('/api/comments/', function (req, res, next) {
  if (!req.session.user) return res.status(403).end("Forbidden");

  req.body.username = req.session.user.username;
  var comment = new Comment(req.body);
  comments.insert(comment, function (err, data) {
    if(err){
      res.status(409).end("Request could not be processed");
      return next();
    }
    data.id = data._id;
    res.json(data);
    return next();
  });
});

//READ

app.get('/api/users/', function(req, res,next) {
  if (!req.session.user) return res.status(403).end("Forbidden");
  users.find({}).sort({createdAt: 1}).limit(10).exec(function(err, selectedUsers) {
    if(err){
      res.status(404).end("No Users Exists");
      return next();
    }
    res.json(selectedUsers);
    return next();
  });
});

app.get('/api/images/:id/picture/:user', function (req, res, next) {
  if (!req.session.user) return res.status(403).end("Forbidden");

  images.findOne({$and: [{_id: req.params.id}, {username: req.params.user}]}, function(err, image){
    if (err || image === null){
        res.status(404).end("Image with id:" + req.params.id + " does not exists");
        return next();
    }

    if (image.filePicture){
        res.setHeader('Content-Type', image.filePicture.mimetype);
        res.sendFile(image.filePicture.path, {"root": __dirname});
        return next();
    }

    res.redirect(image.urlPicture);
    return next();
  });
});

app.get('/api/images/:user', function(req, res, next){
  if (!req.session.user) return res.status(403).end("Forbidden");
  images.find({username: req.params.user}).sort({createdAt: 1}).limit(1).exec(function(err, selectedImage) {
    if (err){
      res.status(404).end("No Image Found");
      return next();
    }
    res.json(selectedImage);
    return next();
  });
});

app.get('/api/comments/:imageId', function(req, res, next) {
  if (!req.session.user) return res.status(403).end("Forbidden");
  comments.find({imageId: req.params.imageId}).sort({createdAt: -1}).limit(10).exec(function(err, selectedComments) {
    if(err){
      res.status(404).end("Image with id:" + req.params.imageId + " does not exists");
      return next();
    }
    res.json(selectedComments.reverse());
    return next();
  });
});

app.get('/api/images/next/:imageID/:user', function(req, res, next) {
  if (!req.session.user) return res.status(403).end("Forbidden");
  var created;

  images.findOne({_id: req.params.imageID}, function(err, currentImage) {
    if(err){
      res.status(404).end("Image with id:" + req.params.imageID + " does not exists");
      return next();
    }

    created = currentImage.createdAt;
    images.find({$and: [{username: req.params.user}, {createdAt: {$gt: created}}]}).sort({createdAt: 1}).limit(1).exec(function(err, selectedImages) {
      if(err){
        res.status(404).end("User:" + req.params.user + " does not exists");
        return next();
      }

      res.json(selectedImages);
      return next();
    });
  });
});

app.get('/api/images/previous/:imageID/:user', function(req, res, next) {
  if (!req.session.user) return res.status(403).end("Forbidden");
  var created;

  images.findOne({_id: req.params.imageID}, function(err, currentImage) {
    if(err){
      res.status(404).end("Image with id:" + req.params.imageID + " does not exists");
      return next();
    }

    created = currentImage.createdAt;
    images.find({$and: [{username: req.params.user}, {createdAt: {$lt: created}}]}).sort({createdAt: -1}).limit(1).exec(function(err, selectedImages) {
      if(err){
        res.status(404).end("User:" + req.params.user + " does not exists");
        return next();
      }

      res.json(selectedImages);
      return next();
    });
  });
});

app.get('/api/comments/next/:imageID/:commentId', function(req, res, next) {
  if (!req.session.user) return res.status(403).end("Forbidden");
  var created;

  comments.findOne({_id: req.params.commentId}, function(err,comment) {
    if(err){
      res.status(404).end("Comment with id:" + req.params.commentId + " does not exists");
      return next();
    }

    created = comment.createdAt;
    comments.find({$and: [{imageId: req.params.imageID}, {createdAt: {$gt: created}}]}).sort({createdAt: 1}).limit(10).exec(function(err, nextComments) {
      if(err){
        res.status(404).end("Image with id:" + req.params.imageID + " does not exists");
        return next();
      }

      res.json(nextComments);
      return next();
    });
  });
});

app.get('/api/comments/previous/:imageID/:commentId', function(req, res, next) {
  if (!req.session.user) return res.status(403).end("Forbidden");
  var created;

  comments.findOne({_id: req.params.commentId}, function(err,comment) {
    if(err){
      res.status(404).end("Comment with id:" + req.params.commentId + " does not exists");
      return next();
    }

    created = comment.createdAt;
    comments.find({$and: [{imageId: req.params.imageID}, {createdAt: {$lt: created}}]}).sort({createdAt: -1}).limit(10).exec(function(err, previousComments) {
      if(err){
        res.status(404).end("Image with id:" + req.params.imageID + " does not exists");
        return next();
      }

      res.json(previousComments.reverse());
      return next();
    });
  });
});


// DELETE

app.delete('/api/images/:id', function(req, res, next){
  if (!req.session.user) return res.status(403).end("Forbidden");

  images.findOne({_id: req.params.id}, function(err,image) {
    if(err){
      res.status(404).end("Image with id:" + req.params.id + " does not exists");
      return next();
    } else if(image.username !== req.session.user.username) {
      return res.status(403).end("Unauthorized");
    }
    images.remove({_id: req.params.id}, function(err, image) {
      if(err) return res.status(500).send("Database error");
      res.end();
      return next();
    });
  });
});

app.delete('/api/comments/:id', function(req, res, next) {
  if (!req.session.user) return res.status(403).end("Forbidden");

  comments.findOne({_id: req.params.id}, function(err,comment) {
    if(err || comment === null){
      res.status(404).end("Image with id:" + req.params.id + " does not exists");
      return next();
    } else if(comment.username !== req.session.user.username) {
      // check if the user is gallery owner else delete the comment
      images.findOne({_id: comment.imageId}, function(err,image) {
        if(err || image === null){
          return res.status(500).send("Database error");
        }
        if (image.username !==  req.session.user.username){
          return res.status(403).end("Unauthorized");
        } else {
          comments.remove({_id: req.params.id}, function(err, image) {
            if(err) return res.status(500).send("Database error");
            res.end();
            return next();
          });
        }
      });
    } else {
      comments.remove({_id: req.params.id}, function(err, image) {
        if(err) return res.status(500).send("Database error");
        res.end();
        return next();
      });
    }
  });
});


app.use(function (req, res, next){
  console.log("HTTPS Response", res.statusCode);
});

var fs = require('fs');
var https = require('https');
var privateKey = fs.readFileSync( 'server.key' );
var certificate = fs.readFileSync( 'server.crt' );
var config = {
        key: privateKey,
        cert: certificate
};
https.createServer(config, app).listen(3000, function () {
    console.log('HTTPS on port 3000');
});
