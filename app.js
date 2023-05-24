const express = require('express');
const app = express();
const path = require('path');
const { sports }= require("./models");
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.get('/',(request, response) =>{
    response.render('index');
});

app.get('/login',(request, response) => {
    response.render('login');
});
app.get('/signup',(request, response) => {
    response.render('signup');
});

app.get('/createsport', (request, response) => {
    response.render('createsport')
})

app.post('/createsport', async (request, response) => {
    try {
        console.log(request.body)
        const sport = await sports.createsports({sport: request.body.sport});
        console.log(sport.id);
        response.render('sportsessions',{
            user: "admin",
            name: request.body.sport,
            sportID : sport.id
        });
    } catch (error) {
        console.log(error);
    }
})

app.get('/sportsession/:id/:user', async (request, response) => {
    console.log(request.params.id);
    try {
        const sport = await sports.findSportById(request.params.id);
        response.render('sportsessions', {
            user: request.params.user,
            name: sport.sport_name,
            sportID: sport.id
        });
    } catch (error) {
        console.log(error);
        response.status(500).send('Internal Server Error');
    }
});

app.delete(`/sportsession/:id`, async (request, response) => {
    console.log("Deleting a Sport with ID: ", request.params.id);
    try {
        const deleteSport = await sports.destroy({
            where: {
                id: request.params.id,
            },
        });
        
        if (deleteSport === 1) {
            response.send(true);
        } else {
            response.send(false);
        }
    } catch (error) {
        console.log(error);
        response.status(422).send(error);
    }
});

module.exports = app