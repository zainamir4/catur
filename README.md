---
layout: default
permalink: /assignments/3/
---

# Assignment 3: API Documentation

## Image API

## Authentication

#### description: To SignIn
- request: `POST /api/signin/`
    - content-type: `application/json`
    - body: object
      - username: (string) the username of the account
      - password: (string) the password of the account
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the comment id
      - user: (string) the username of the account
- response: 500
      - body: Message from the Database
-response: 401
      - body: message Unauthorized

```
curl -X POST -d "username=zain&password=hi" -c cookie.txt -k https://localhost:3000/api/signin/
````

#### description: To SignOut the user
- request: `GET /api/signout/`   
- response: 200
- response: 500
      - body: Error From the Session


```
 curl -X GET -b cookie.txt -k https://localhost:3000/api/signout/
```

## Create

#### description: create a new user
- request: `PUT /api/users/`
    - content-type: `application/json`
    - body: object
      - username: (string) the username of the account
      - password: (string) the password of the account
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the user id
      - username: (string) the username of the account
- response: 409
      - body: message Username .. already exists
-response: 500
      - body: message from the Database

```
curl -X PUT --header 'Content-Type: application/json' --data '{"username": "brain", "password": "hi"}' -k https://localhost:3000/api/users/
```

#### description: create a new comment
- request: `POST /api/comments/`
    - content-type: `application/json`
    - body: object
      - imageId: (string) the id of the image this picture is linked to
      - content: (string) the content of the comment
      - username: (string)the username of the comment
      - date: (string) the date the comment was posted
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the comment id
      - content: (string) the content of the message
      - username: (string) the username of the comment
      - date: (string) the date the comment was posted
      - imageId: (string) the id of the image this picture is linked to
- response: 409
      - body: message Request could not be processed

```
curl -X POST
      --header 'Content-Type: application/json'
      --data '{"imageID": 0, "content": "Hello World!", "date": "12/02/17"}'
      -b cookie.txt
      -k https://localhost:3000/api/comments/
```

#### description: Upload a new Image
- request: `POST /api/images/`
    - content-type: `application/json` or `multipart/form-data"`
    - body: object
      - title: (string) the title of the image
      - filePicture: (File) the file that is uploaded
      - urlPicture: (string) the path to the image
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the image id
      - title: (string) the title of the image
      - username: (string) the username of the image
      - filePicture: (File) the file that is uploaded
      - urlPicture: (string) the path to the image
- response: 409
      - body: message Request could not be processed


- Curl with URL
```
curl -X POST
      --header 'Content-Type: application/json'
      --data '{"title": "Hello World!", "picture": "https://i.ytimg.com/vi/tntOCGkgt98/maxresdefault.jpg"}'
      -b cookie.txt
      -k https://localhost:3000/api/images
```

-Curl with file
```
curl -X POST
    -H "Content-Type: multipart/form-data"
    -F "picture=@frontend/media/coolcat.jpg"
    -F "title=Hello World"
    -b cookie.txt
    -k https://localhost:3000/api/images
```

## Read

#### description: retrieve the first 10 users
- request: `GET /api/images/`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - _id: (string) the user id
      - username: (string) the username of the user
- response: 404
      - body: message No Users Exists


```
 curl -X GET -b cookie.txt -k https://localhost:3000/api/users/
```

#### description: retrieve the lastest Image in the database for a user gallery
- request: `GET /api/images/:user`   
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the image id
      - title: (string) the title of the image
      - username: (string) the username of the image
      - filePicture: (File) the file that is uploaded
      - urlPicture: (string) the path to the image
- response: 404
      - body: message No Images Found


```
 curl -X GET -b cookie.txt -k https://localhost:3000/api/images/zain
```

#### description: retrieve the Image from the Database given an imageId
- request: `GET /api/images/:id/picture/:user`   
- response: 200
    - content-type: `application/json`
    - body: image
- response: 404
    - body: message Image with id: ... does not exist


```
 curl -X GET -b cookie.txt -k https://localhost:3000/api/images/ZDGpGHTQSLtpPlgS/picture/zain
```


#### description: TO GET THE TEN LATEST COMMENTS FOR AN IMAGE
- request: `GET /api/comments/:imageId`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - _id: (string) the comment id
      - content: (string) the content of the message
      - username: (string) the username of the image
      - date: (string) the date the comment was posted
      - imageId: (string) the id of the image this picture is linked to
- response: 404
    - body: message Image with id: ... does not exist

```
curl -X GET -b cookie.txt -k https://localhost:3000/api/comments/ZDGpGHTQSLtpPlgS
```


#### description: retrieve the next Image in the gallery for the user given
- request: `GET /api/images/next/:imageID/:user`   
- response: 200
    - content-type: `application/json`
    - body: list of object
      - _id: (string) the image id of the next Image
      - title: (string) the title of the image
      - username: (string) the username of the image
      - filePicture: (File) the file that is uploaded
      - urlPicture: (string) the path to the image
- response: 404
    - body: message Image with id: ... does not exist OR User doesnot exist

```
 curl -X GET -b cookie.txt -k https://localhost:3000/api/images/next/ZDGpGHTQSLtpPlgS/zain
 ```

#### description: retrieve the previous Image in the gallery for the user given
- request: `GET /api/images/previous/:imageID/:user`   
- response: 200
   - content-type: `application/json`
   - body: list of object
     - _id: (string) the image id of the previous Image
     - title: (string) the title of the image
     - username: (string) the username of the image
     - filePicture: (File) the file that is uploaded
     - urlPicture: (string) the path to the image
- response: 404
   - body: message Image with id: ... does not exist

```
curl -X GET -b cookie.txt -k https://localhost:3000/api/images/previous/ZDGpGHTQSLtpPlgS/zain
```

#### description: retrieve the next ten comments in the Database
- request: `GET /api/images/next/:imageID/:commentId`   
- response: 200
   - content-type: `application/json`
   - body: list of objects
     - _id: (string) the comment id
     - content: (string) the content of the message
     - username: (string) the username of the image
     - imageId: (string) the id of the image this picture is linked to
 - response: 404
     - body: message Comment with id: ... does not exist

```
curl -X GET  -b cookie.txt -k https://localhost:3000/api/comments/next/:imageID/:commentId
```
#### description: retrieve the previous ten comments in the Database
- request: `GET /api/images/previous/:imageID/:commentId`   
- response: 200
   - content-type: `application/json`
   - body: list of objects
     - _id: (string) the comment id
     - content: (string) the content of the message
     - username: (string) the username of the message
     - date: (string) the date the comment was posted
     - imageId: (string) the id of the image this picture is linked to
 - response: 404
     - body: message Comment with id: ... does not exist

```
curl -X GET -b cookie.txt -k https://localhost:3000/api/comments/previous/:imageID/:commentId
```


## Delete

#### description: delete the comment id
- request: `DELETE /api/comments/:id`
- response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the comment id
        - content: (string) the content of the message
        - username: (string) the username of the comment
        - date: (string) the date the comment was posted
        - imageId: (string) the id of the image this picture is linked to
- response: 404
    - body: message :id does not exists

```
curl -X DELETE -b cookie.txt -k https://localhost:3000/api/comments/:id
```

#### description: delete the image id
- request: `DELETE /api/images/:id`
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the image id
      - title: (string) the title of the image
      - username: (string) the username of the image
      - filePicture: (File) the file that is uploaded
      - urlPicture: (string) the path to the image
- response: 404
    - body: message :id does not exists

```
curl -X DELETE -b cookie.txt -k https://localhost:3000/api/images/:id
```
