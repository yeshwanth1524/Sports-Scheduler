const express = require("express");
var csrf = require("csurf");
// var csrf = require("tiny-csrf");
const app = express();
const { sports,user,session} = require("./models");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const path = require("path");
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf({ cookie: true}));
const csrfProtection = csrf({ cookie: true });
// app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

const passport = require('passport') 
const ConnectEnsureLogin = require('connect-ensure-login'); 
const expresssession = require('express-session'); 
const LocalStrategy = require('passport-local');


const bcrypt = require('bcrypt');
const flash = require("connect-flash");
app.set("views", path.join(__dirname, "views"));
const salRounds = 10;


app.set("view engine", "ejs");
app.use(expresssession({
  secret: "mYsCrtkEy-@yEktrCsYm",
  cookie: {
    maxAge: 24*60*60*1000 //24 hrs
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(request, response, next) {
  response.locals.messages = request.flash();
  next();
});

const moment = require('moment-timezone');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, (username, password, done) => {
  user.findOne({ where: { email: username } })
    .then(async (users) => {
      if (!users) {
        return done(null, false, { message: 'Invalid email' });
      }
      const result = await bcrypt.compare(password, users.password);
      if (result) {
        return done(null, users);
      } else {
        return done(null, false, { message: 'Invalid password' });
      }
    }).catch((error) => {
      return done(error);
    });
}));

passport.serializeUser((users, done) => {
  console.log("Serializing user in session : ", users.id);
  done(null, users.id);
});

passport.deserializeUser((id, done) => {
  console.log("deserializing user from session: ", id);
  user
    .findByPk(id)
    .then((users) => {
      done(null, users);
    })
    .catch((err) => {
      done(err, null);
    });
});

// function requireAdmin(req, res, next) {
//   if (req.user && req.user.role === 'admin') {
//     return next();
//   } else {
//     res.redirect('/login');
//   }
// }

app.get("/", (request, response) => {
  if (request.isAuthenticated()) {
    if (request.user.role == "admin") {
      response.redirect("/admin");
    } else {
      response.redirect("/user");
    }
  } else {
    response.render("index", {
      failure: false,
      csrfToken: request.csrfToken(),
    });
  }
});
app.post("/users", async (request, response) => {
  const { firstname, lastname, email, password, role} = request.body;

  const errors = [];

  if (!firstname) {
    errors.push("Enter name");
  }

  if (!email) {
    errors.push("Enter email");
  }

  if (!password) {
    errors.push("Enter password");
  }

  if (errors.length > 0) {
    request.flash("error", errors);
    return response.redirect("/signup");
  }

  try {
    const hashPwd = await bcrypt.hash(password, salRounds);

    const User = await user.create({
      fname: firstname,
      lname: lastname,
      email: email,
      password: hashPwd,
      role: role,
      sessionId: [0],
    });

    request.login(User, (err) => {
      if (err) {
        console.log("Error logging in");
        response.redirect("/");
      }

      if (role == "admin") {
        response.redirect("/admin");
      }

      if (role == "player") {
        response.redirect("/user");
      }
    });
  } catch (error) {
    console.log("Email already registered!", error);
    response.render("signup", {
      failure: true,
      csrfToken: request.csrfToken(),
    });
  }
});

app.get("/login", (request, response) => {
  if (request.isAuthenticated()) {
    if (request.user.role == "admin") {
      response.redirect("/admin");
    } else {
      response.redirect("/user");
    }
  } else {
    response.render("signin", {
      csrfToken: request.csrfToken(),
    });
  }
});

app.get("/signout", (request, response, next) => {
  console.log("/signout is called");
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

app.post("/session",passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (request, response) => {
    console.log(request.user);
    console.log("/session is called");
    const loggedinUser = request.user.id;
    console.log(loggedinUser);

    if (request.user.role == "admin") {
      response.redirect("/admin");
    }
    if (request.user.role == "player") {
      response.redirect("/user");
    }
  }
);

app.get("/signup", (request, response) => {
  response.render("signup", {
    failure: false,
    csrfToken: request.csrfToken(),
  });
});

app.get("/admin",ConnectEnsureLogin.ensureLoggedIn(),async (request, response) => {
    const loggedinUser = request.user.id;
    console.log(loggedinUser);
    const allSports = await sports.getSports();
    const getUser = await user.getUser(loggedinUser);
    response.render("admin", {
      getUser,
      allSports,
      csrfToken: request.csrfToken(),
    });
  }
);

app.get("/user",ConnectEnsureLogin.ensureLoggedIn(),async (request, response) => {
    const loggedinUser = request.user.id;
    console.log(loggedinUser);
    const allSports = await sports.getSports();
    const getUser = await user.getUser(loggedinUser);
    response.render("player", {
      getUser,
      allSports,
      csrfToken: request.csrfToken(),
    });
  }
);

app.get("/createsport",ConnectEnsureLogin.ensureLoggedIn(),(request, response) => {
    response.render("createSport", {
      sportcreated: false,
      csrfToken: request.csrfToken(),
    });
  }
);

app.post("/createsport",ConnectEnsureLogin.ensureLoggedIn(), async (request, response) => {
    try {
      console.log(
        request.body,
        await sports.findSportByName(request.body.sport, request.user.id)
      );
      var sportName = await sports.findSportByName(
        request.body.sport,
        request.user.id
      );
      if (!sportName) {
        response.render("createSport", {
          sportcreated: true,
          csrfToken: request.csrfToken(),
        });
      } else {
        const sport = await sports.createsports({
          sport: request.body.sport,
          userId: request.user.id,
        });
        const allSessions = await session.getSession({
          sportname: sport.id,
          userId: request.user.id,
        });
        const getUser = await user.getUser(request.user.id);
        console.log(sport.id);
        response.render("sportsessions", {
          user: "admin",
          getUser,
          name: request.body.sport,
          sportID: sport.id,
          allSessions,
          csrfToken: request.csrfToken(),
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
);
app.get("/sportsession",ConnectEnsureLogin.ensureLoggedIn(),async (request, response) => {
    console.log(request.body.id);
    const getUser = await user.getUser(request.user.id);
    const sport = await sports.getSports();
    response.render("sportsessions", {
      getUser,
      name: sport.sport_name,
      sportID: sport.id,
      csrfToken: request.csrfToken(),
    });
  }
);

app.get("/sportsession/:id",ConnectEnsureLogin.ensureLoggedIn(),async (request, response) => {
    console.log(request.params.id);
    const sport = await sports.findSportById(
      request.params.id,
    );
    console.log(sport);
    const allSessions = await session.getAllSession({
      sportname: sport.id,
      userId: request.user.id,
    });
    console.log(allSessions);
    const getUser = await user.getUser(request.user.id);
    response.render("sportsessions", {
      getUser,
      name: sport.sport_name,
      sportID: sport.id,
      allSessions,
      csrfToken: request.csrfToken(),
    });
  }
);

app.delete(`/sportsession`,ConnectEnsureLogin.ensureLoggedIn(),async (request, response) => {
    console.log("delete a Sport with ID: ", request.body.id);
    try {
      const deleteSport = await sports.deleteSport(request.body.id);
      await session.deleteSession(request.body.id, request.user.id);
      console.log(deleteSport);
      return response.send(deleteSport ? true : false);
    } catch (error) {
      console.log(error, response.status);
      return response.status(422).send(error);
    }
  }
);

app.get("/session/:id", ConnectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const getUser = await user.getUser(request.user.id);
  const allSessions = await session.getSessionById(request.params.id);
  const sport = await sports.findSportById(allSessions.sportname);
  response.render("session", {
    getUser,
    allSessions,
    sport,
    previous: false,
    csrfToken: request.csrfToken(),
  });
});


app.get("/session",ConnectEnsureLogin.ensureLoggedIn(),async (request, response) => {
    const getUser = await user.getUser(request.user.id);
    const allSessions = await session.getAllSession({ sportname: 1 });
    if (request.accepts("HTML")) {
      response.render("session", {
        getUser,
        allSessions,
        previous: false,
        user: request.user.role,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        getUser,
        allSessions,
        user: request.user.role,
      });
    }
  }
);

app.put("/session/:playername/:id",ConnectEnsureLogin.ensureLoggedIn(),async (request, response) => {
    const sessions = await session.findByPk(request.params.id);
    console.log(sessions);
    try {
      const updatedplayer = await session.removePlayer(
        request.params.playername,
        request.params.id
      );
      if (
        request.user.sessionId.includes(sessions.id) &&
        request.user.fname == request.params.playername
      ) {
        await user.removeSessionId(sessions.id, request.user.id);
      }
      return response.json(updatedplayer);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.get("/createsession/:id",ConnectEnsureLogin.ensureLoggedIn(),async (request, response) => {
    const getUser = await user.getUser(request.user.id);
    const sport = await sports.findSportById(request.params.id);
    if (request.accepts("HTML")) {
      response.render("createsession", {
        sportId: sport,
        getUser,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        sportId: request.params.id,
        getUser,
        csrfToken: request.csrfToken(),
      });
    }
  }
);

app.post("/createsession",ConnectEnsureLogin.ensureLoggedIn(),async (request, response) => {
    var playerArray = request.body.playername.split(",");
    const sportname = await sports.findSportById(request.body.sportname);
    console.log(request.body.dateTime, new Date().toISOString());
    try {
      if (playerArray.length > request.body.numofplayers) {
        request.flash("error", "No. of PLayers Exceeded!");
        response.redirect(`/createsession/${sportname.id}`);
      }
      if (request.body.dateTime < new Date().toISOString()) {
        request.flash("error", "Date should not be less than today date!");
        response.redirect(`/createsession/${sportname.id}`);
      } else if (!(playerArray.length > request.body.numofplayers)) {
        await session.addSession({
          sportname: sportname.id,
          dateTime: request.body.dateTime,
          venue: request.body.venue,
          players: playerArray,
          userId: request.user.id,
          numofplayers: request.body.numofplayers,
          sessioncreated: true,
        });
        response.redirect(`/sportsession/${sportname.id}`);
      }
    } catch (error) {
      console.log(error);
    }
  }
);

app.get('/report', csrfProtection, (request, response) => {
  response.render('report-form', { csrfToken: request.csrfToken() });
});

app.post("/report", csrfProtection, async (request, response) => {
  const { startDate, endDate } = request.body;

  try {
    // Convert the start date and end date to moment objects
    const momentStartDate = moment(startDate);
    const momentEndDate = moment(endDate);

    // Get the number of sessions played in the time period
    const sessionsPlayed = await session.getSessionsCount(momentStartDate, momentEndDate);

    // Get the relative popularity of sports in the time period
    const sportsPopularity = await sports.getSportsPopularity(momentStartDate, momentEndDate);

    response.render("report", {
      startDate: momentStartDate.format("YYYY-MM-DD"),
      endDate: momentEndDate.format("YYYY-MM-DD"),
      sessionsPlayed: sessionsPlayed,
      sportsPopularity: sportsPopularity
    });
  } catch (error) {
    console.error("Error generating report:", error);
    response.status(500).send("Error generating report");
  }
});

app.put("/cancelsession", ConnectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  try {
    const { id, reason } = request.body;
    await session.cancelSession(id, request.user.id, reason);
    const allSessions = await session.getAllSession({
      sportname: sports.id,
      userId: request.user.id,
    });
    const allCanceledSessions = await session.getAllCanceledSessions(); // Fetch canceled sessions
    response.render("sportsessions", {
      allSessions: allSessions,
      allCanceledSessions: allCanceledSessions,
      getUser: request.user, 
    });
  } catch (error) {
    console.log(error);
  }
});


app.put("/addPlayer", ConnectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  try {
    const sessionData = await session.getSessionById(request.body.id);
    
    // Check if the session is in the future
    const currentTime = new Date();
    const sessionTime = new Date(sessionData.time);
    if (sessionTime < currentTime) {
      return response.status(400).send("Cannot join past sessions");
    }

    const addPlayer = await session.addPlayer(
      request.body.id,
      request.body.playername
    );
    await user.AddsessionIdinuser(
      request.body.id,
      request.user.id
    );
    response.send(addPlayer);
  } catch (error) {
    console.log(error);
    response.status(500).send("Error adding player to session");
  }
});

module.exports = app;