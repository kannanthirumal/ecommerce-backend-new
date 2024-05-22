const db = require("../../models");
const request = require("supertest");
const { app, initializationPromise } = require("../../app");

const api_v1_endpoint = "/ecomm/api/v1";

let testData = {}; // Store the exported information

beforeAll(async () => {
  // Wait for the initialization to complete before setting up test data
  await initializationPromise;

  try {
    await request(app)
      .post("/ecomm/api/v1/auth/signup")
      .send({
        username: "testuser2",
        email: "testuser2@example.com",
        password: "testpassword2",
        roles: ["admin"], // Optional: Include roles if your system uses them
      });

    const response = await request(app).post("/ecomm/api/v1/auth/signin").send({
      username: "testuser2",
      password: "testpassword2",
    });

    const data = response.body;
    testData.username = data.username;
    testData.accessToken = data.accessToken;
  } catch (error) {
    console.log("Error during signup:", error.message);
  }
});

describe("Post details of products endpoint", () => {
  it("should add new category", async () => {
    // Access the user and accessToken from testData
    const { username, accessToken } = testData;

    const res = await request(app)
      .post(api_v1_endpoint + "/categories")
      .set("x-access-token", accessToken)
      .send({
        name: "Electronics",
        description: "Category on electronic items",
      });

    expect(res.status).toEqual(201);
  });

  it("should add new product", async () => {
    // Access the user and accessToken from testData
    const { username, accessToken } = testData;

    const res = await request(app)
      .post(api_v1_endpoint + "/products")
      .set("x-access-token", accessToken)
      .send({
        name: "Sony Bravia",
        description: "This is an amazing TV",
        cost: 10000,
        categoryId: 1,
      });
    expect(res.status).toEqual(201);
  });
});

describe("get details of products endpoint", () => {
  it("should get details of product", async () => {
    const res = await request(app).get(api_v1_endpoint + "/products");
    expect(res.status).toEqual(200);
  });
});

describe("get details of on product endpoint", () => {
  it("should get details of one product", async () => {
    const res = await request(app).get(api_v1_endpoint + "/products/1");
    expect(res.status).toEqual(200);
  });
});

afterAll(async () => {
  // Close Sequelize connection after all tests
  await db.sequelize.close();
});
