const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name = _csrf]").val();
}

const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

describe("Sports Scheduler Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {
      console.log("Started an Express application at port 4000");
    });
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Sign up as admin", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
      firstname: "tester",
      lastname: "lname",
      email: "tester@gmail.com",
      password: "123",
      role: "admin",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("Sign up as player", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
      firstname: "player",
      lastname: "lname",
      email: "playr@gmail.com",
      password: "123",
      role: "player",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("Sign Out", async () => {
    let res = await agent.get("/admin");
    const csrfToken = extractCsrfToken(res);
    res = await agent.get("/signout").send({
      _csrf: csrfToken
    })
    expect(res.statusCode).toBe(302);
  });

  test("Creates a sport", async () => {
    const agent = request.agent(server);
    await login(agent, "tester@gmail.com", "123");
    const res = await agent.get("/createsport");
    const csrfToken = extractCsrfToken(res);
    const response1 = await agent.post("/createsport").send({
      sport: "cricket",
      _csrf: csrfToken,
    });
    expect(response1.statusCode).toBe(200);
  });

  
  test("create a session", async () => {
    const agent = request.agent(server);
    await login(agent, "tester@gmail.com", "123");
    let res = await agent.get("/createsession/1");
    let csrfToken = extractCsrfToken(res);
    let today = new Date("2023-06-14");
    await agent.post("/createsession").send({
      sportname: 1,
      dateTime: today,
      venue: "stadium",
      playername: "playr1,playr2",
      numofplayers: 4,
      sessioncreated: true,
      _csrf: csrfToken,
    });
    const groupedsessionResponse = await agent
      .get("/session")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedsessionResponse.text);
    console.log(parsedGroupedResponse);
    const sessions = parsedGroupedResponse.allSessions.length;

    expect(sessions).toBe(1);
  });
});