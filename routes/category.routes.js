/**
 * This file will contain the routes logic for the Category resource
 * and will export it.
 */
const { authJwt, requestValidator } = require("../middlewares");

const categoryController = require("../controllers/category.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  //Route for the POST request to create the category
  app.post(
    "/ecomm/api/v1/categories",
    [
      requestValidator.validateCategoryRequest,
      authJwt.verifyToken,
      authJwt.isAdmin,
    ],
    categoryController.create
  );

  //Route for the GET request to fetch all the categories
  app.get("/ecomm/api/v1/categories", categoryController.findAll);

  //Route for the GET request to fetch a category based on the id
  app.get("/ecomm/api/v1/categories/:id", categoryController.findOne);

  //Route for the PUT request to update a category based on the id
  app.put(
    "/ecomm/api/v1/categories/:id",
    [
      requestValidator.validateCategoryRequest,
      authJwt.verifyToken,
      authJwt.isAdmin,
    ],
    categoryController.update
  );

  //Route for the DELETE request to delete a category based on the id
  app.delete(
    "/ecomm/api/v1/categories/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    categoryController.delete
  );
};
