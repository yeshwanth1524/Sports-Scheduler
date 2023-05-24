const express = require('express');
const app = express();
const path = require('path')
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.get('/',(request, response) =>{
    response.render('index');
});

app.get('/login',(request, response) => {
    response.render('signin');
});
app.get('/signup',(request, response) => {
    response.render('signup');
});

module.exports = app