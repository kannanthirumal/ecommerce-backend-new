const orderController = require("../controllers/cart.controller");
const { authJwt, requestValidator } = require("../middlewares");

module.exports = function (app) {
  //Route for the POST request to create the cart
  app.post(
    "/ecomm/api/v1/carts",
    [authJwt.verifyToken],
    orderController.create
  );

  //Route for the PUT request to update the cart
  app.put(
    "/ecomm/api/v1/carts/:id",
    [authJwt.verifyToken],
    orderController.update
  );

  // Route for updating the cart status
  app.put(
    "/ecomm/api/v1/carts/:id/update-status",
    [authJwt.verifyToken],
    orderController.updateStatus
  );

  // Route for the PUT request to remove items from the cart
  app.put(
    "/ecomm/api/v1/carts/:id/remove-items",
    [authJwt.verifyToken],
    orderController.removeItems
  );

  //Route for the GET request to get the cart
  app.get(
    "/ecomm/api/v1/carts/:cartId",
    [authJwt.verifyToken],
    orderController.getCart
  );
};
