
const express = require("express");
const path = require("path");
const fs = require('fs');
const bodyParser = require("body-parser");
const axios = require('axios');
const dotenv = require('dotenv')

const app = express();
const admin = express();

console.log(path.resolve(__dirname, '.env'));
require("dotenv").config({ path: path.resolve(__dirname, '.env') })

dotenv.config();

const web_port = process.env.WEB_PORT;
const portal_port = process.env.PORTAL_PORT;
const envState = process.env.ENV;
console.log(process.env.ENV);

let backend = process.env.BACKEND_LOCAL;
let frontend = process.env.FRONTEND_LOCAL;
let portal = process.env.PORTAL_LOCAL;

if(envState=="dev"){
  backend = process.env.BACKEND_DEV;
  frontend = process.env.FRONTEND_DEV;
  portal = process.env.PORTAL_DEV;
}
if(envState=="live"){
  backend = process.env.BACKEND_LIVE;
  frontend = process.env.FRONTEND_LIVE;
  portal = process.env.PORTAL_LIVE;
}

console.log(backend);
console.log(frontend);
console.log(portal);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use("/site/assets", express.static(path.resolve(__dirname, "web", "assets")));
app.use("/pages", express.static(path.resolve(__dirname, "web", "pages")));
app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "web", "index.html"));
});

app.post('/api', function(request, res) {  

  request.body.referer = (request.body.action == 'login') ? portal : frontend;
  request.body.origin = request.headers.referer;

  axios.post(backend, '', {
    params: request.body,
    headers: { 'Content-Type': "multipart/form-data; charset=utf-8; boundary=" + Math.random().toString().substr(2) }
  })
  .then(response => {
      //response.outcome
      console.dir(response.data);
      if(typeof response.data.data === 'string'){
        response.data.data = JSON.parse(response.data.data) ?? null;
      }

      /*8if(Object.hasOwn(response.data, 'logout')){
        if(response.data.logout){
          localStorage.removeItem('csrf');
          localStorage.removeItem('acl');
          localStorage.removeItem('loggedData');
          location.redirect = frontend;
        }
      }*/
      res.send(response.data) // <= send data to the client
  })
  .catch(err => {
        console.log(err)
        res.send({ err }) // <= send error
  });

})

// parse application/x-www-form-urlencoded
admin.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
admin.use(bodyParser.json())

admin.use("/portal/assets", express.static(path.resolve(__dirname, "portal", "assets")));
admin.use("/layouts", express.static(path.resolve(__dirname, "portal", "layouts")));
admin.use("/src", express.static(path.resolve(__dirname, "portal", "src")));
admin.use("/scss", express.static(path.resolve(__dirname, "portal", "scss")));
admin.use("/static", express.static(path.resolve(__dirname, "admin", "static")));
admin.use("/pages", express.static(path.resolve(__dirname, "portal", "pages")));
admin.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "portal", "index.html"));
});

admin.post('/api', function(request, res) {  

  //request.body.referer = frontend;
  request.body.referer = (request.body.action != 'logout') ? portal : frontend;
  request.body.origin = request.headers.referer;

  console.log(request.body);

  axios.post(backend, '', {
    params: request.body,
    headers: { 'Content-Type': "multipart/form-data; charset=utf-8; boundary=" + Math.random().toString().substr(2) }
  })
  .then(response => {
      console.log(response);
      console.dir(response.data);
      if(typeof response.data.data === 'string'){
        response.data.data = JSON.parse(response.data.data) ?? null;
      }
      res.send(response.data) 
  })
  .catch(err => {
        console.log(err)
        res.send({ err }) 
  });

})

function prepareRequest(data){

  console.dir(data);
  var requestData = [];
  requestData['action'] = data.action;
  requestData['param'] = data;

  return requestData;

}

app.listen(process.env.web_port || 3000, () => console.log("Server running..."));
admin.listen(process.env.portal_port || 3001, () => console.log("Server running..."));
