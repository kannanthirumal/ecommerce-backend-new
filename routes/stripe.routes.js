const stripeController = require("../controllers/stripe.controller");
const { authJwt, requestValidator } = require("../middlewares");

module.exports = function (app) {
  //Route for the POST request to create the cart
  console.log("Within stripe route");
  app.post(
    "/ecomm/api/v1/stripe-checkout-session",
    [authJwt.verifyToken],
    stripeController.create
  );
};
