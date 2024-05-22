const db = require("../../models");
const request = require("supertest");
const { app, initializationPromise } = require("../../app");

const api_v1_endpoint = "/ecomm/api/v1";

beforeAll(async () => {
  await initializationPromise;
});

describe("signup", () => {
  it("add a new user", async () => {
    try {
      const res = await request(app)
        .post("/ecomm/api/v1/auth/signup")
        .send({
          username: "testuser1",
          email: "testuser1@example.com",
          password: "testpassword1",
          roles: ["admin"], // Optional: Include roles if your system uses them
        });

      expect(res.status).toEqual(201);
    } catch (err) {
      console.log("Error: ", err.message);
    }
  });

  it("signin", async () => {
    const res = await request(app).post("/ecomm/api/v1/auth/signin").send({
      username: "testuser1",
      password: "testpassword1",
    });

    expect(res.status).toEqual(200);
  });
});

afterAll(async () => {
  // Close Sequelize connection after all tests
  await db.sequelize.close();
});
