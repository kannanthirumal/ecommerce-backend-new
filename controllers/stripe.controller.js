const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_API_KEY);
const db = require("../models");
const Cart = db.cart;

async function getCartItems(req, res) {
  const cartId = req.body.id;
  const cart = await Cart.findByPk(cartId);

  if (!cart) {
    return res.status(404).send({
      message: "Cart doesn't exist. Please logout and login again",
    });
  }

  // Fetch the updated list of products in the cart
  const products = await cart.getProducts();

  // Calculate the total cost and quantity using a normal loop
  let cost = 0;
  let totalQuantity = 0;
  const productsSelected = [];

  for (const product of products) {
    const quantity = product.cart_products.quantity;
    totalQuantity += quantity;
    cost += product.cost * quantity;
    productsSelected.push({
      id: product.id,
      name: product.name,
      cost: product.cost,
      quantity: quantity,
    });
  }

  return {
    id: cart.id,
    productsSelected: productsSelected,
    cost: cost,
    totalQuantity: totalQuantity,
  };
}

exports.create = async (req, res) => {
  const cart = await getCartItems(req, res);
  console.log("cart in stripe controller: ", cart);
  const cartId = cart.id;
  const items = cart.productsSelected;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: ["IN"],
      },
      mode: "payment",
      line_items: items.map((item) => {
        console.log("item within stripe controller: ", item);
        return {
          price_data: {
            currency: "INR",
            product_data: {
              name: item.name,
              images: [
                "https://img.favpng.com/8/17/0/product-design-clip-art-logo-food-png-favpng-TsCQEsJH2LUYN3d5Q6RzrTsqL.jpg",
              ],
              description: item.description,
            },
            unit_amount: item.cost * 100,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${process.env.SERVER_URL}/success.html`,
      cancel_url: `${process.env.SERVER_URL}/cancel.html`,
    });

    res.json({
      url: session.url,
    });
  } catch (error) {
    console.log("Error stripe.controller.js: ", error.message);
    res.status(500).send({
      message: "Some internal server error",
    });
  }
};
