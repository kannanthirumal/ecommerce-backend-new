/**
 * This file contains the controller logic for the cart resource.
 * Everytime any CRUD request come for the cart, methods defined in this
 * controller file will be executed.
 */

const db = require("../models");
const Product = db.product;
const Cart = db.cart;
const Op = db.Sequelize.Op;
const { STATUS } = require("../configs/constant");

/**
 * Create and save a new Cart
 */
// exports.create = (req, res) => {
//   const cart = {
//     userId: req.userId, // We will get this from the middleware
//   };

//   const itemIds = req.body.items;
//   Cart.create(cart)
//     .then((cart) => {
//       res.status(201).send(cart);
//     })
//     .catch((err) => {
//       console.log(err.message);
//       res.status(500).send({
//         message: "Some internal server error happened",
//       });
//     });
// };

exports.create = async (req, res) => {
  console.log("inside - first");
  try {
    // Check if there's an existing cart for the user with status "pending"
    const existingCart = await Cart.findOne({
      where: {
        userId: req.userId,
        status: STATUS.PENDING,
      },
    });

    console.log("inside - second");
    if (existingCart) {
      console.log("inside - third");
      // If an existing pending cart is found, return its details
      return res.status(200).send(existingCart);
    }
    console.log("inside - fourth");
    // If no pending cart exists, create a new one
    const newCart = await Cart.create({
      userId: req.userId,
    });

    return res.status(201).send(newCart);
  } catch (error) {
    console.error("createcart errormessage", error.message);
    res.status(500).send({
      message: "Some internal server error happened",
    });
  }
};

/**
 * Update a given cart by adding more item to it
 */
// exports.update = (req, res) => {
//   const cartId = req.params.id;
//   if (cartId == null) {
//     return res.status(404).send({
//       message: "Cart doesn't exist. Please logout and login again",
//     });
//   }

//   Cart.findByPk(cartId).then((cart) => {
//     console.log(cart);
//     if (cart == null) {
//       return res.status(404).send({
//         message: "Cart doesn't exist. Please logout and login again",
//       });
//     }
//     Product.findAll({
//       where: {
//         id: req.body.productIds,
//       },
//     }).then((items) => {
//       if (!items) {
//         res.status(400).send({
//           message: "One or more items trying to be added doesn't exist",
//         });
//         return;
//       }
//       cart.setProducts(items).then(() => {
//         console.log("Products successfully added in the cart");
//         var cost = 0;
//         const productsSelected = [];
//         cart.getProducts().then((products) => {
//           for (i = 0; i < products.length; i++) {
//             cost = cost + products[i].cost;
//             productsSelected.push({
//               id: products[i].id,
//               name: products[i].name,
//               cost: products[i].cost,
//             });
//           }

//           res.status(200).send({
//             id: cart.id,
//             productsSelected: productsSelected,
//             cost: cost,
//           });
//         });
//       });
//     });
//   });
// };

/**
 * Update a given cart by adding more products to it with quantity
 */
exports.update = async (req, res) => {
  try {
    const cartId = req.params.id;

    if (!cartId) {
      return res.status(404).send({
        message: "Cart doesn't exist. Please logout and login again",
      });
    }

    const cart = await Cart.findByPk(cartId);

    if (!cart) {
      return res.status(404).send({
        message: "Cart doesn't exist. Please logout and login again",
      });
    }

    const productsToAdd = req.body.productsToAdd;
    console.log("productsToAdd: ", productsToAdd);
    if (!productsToAdd || productsToAdd.length === 0) {
      console.log("!productsToAdd: ", !productsToAdd);
      console.log("productsToAdd length: ", productsToAdd.length);
      return res.status(400).send({
        message: "Invalid or empty products provided",
      });
    }

    // Use normal loop to add products to the existing cart without replacing
    for (const productToAdd of productsToAdd) {
      const productId = productToAdd.id;
      const pQuantity = productToAdd.quantity;

      const product = await Product.findByPk(productId);

      if (!product) {
        return res.status(400).send({
          message: `Product with ID ${productId} doesn't exist`,
        });
      }

      await cart.addProduct(product, {
        through: { quantity: parseInt(pQuantity) },
      });
    }

    console.log("Products successfully added to the cart");

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

    res.status(200).send({
      id: cart.id,
      productsSelected: productsSelected,
      cost: cost,
      totalQuantity: totalQuantity,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

/**
 * Updating the cart status
 */

exports.updateStatus = async (req, res) => {
  const cartId = req.params.id;
  const newStatus = STATUS.PLACED; // Use your desired status constant

  try {
    let cart = await Cart.findByPk(cartId);

    if (!cart) {
      return res.status(404).send({ message: "Cart not found." });
    }

    // Update the cart status
    cart.status = newStatus;
    console.log("Here inside update status");
    console.log("Here cart is: ", cart);
    cart.save();
    return res.status(200).send(cart);
  } catch (error) {
    console.error("Error updating cart status:", error.message);
    res.status(500).send({ message: "Internal server error." });
  }
};

/**
 * Remove items from a given cart
 */
exports.removeItems = async (req, res) => {
  try {
    const cartId = req.params.id;

    if (!cartId) {
      return res.status(404).send({
        message: "Cart doesn't exist. Please logout and login again",
      });
    }

    const cart = await Cart.findByPk(cartId);

    if (!cart) {
      return res.status(404).send({
        message: "Cart doesn't exist. Please logout and login again",
      });
    }

    const productIds = [];
    for (const productId of req.body.productIds) {
      const parsedProductId = parseInt(productId, 10);
      if (!isNaN(parsedProductId)) {
        productIds.push(parsedProductId);
      }
    }

    if (!productIds || productIds.length === 0) {
      return res.status(400).send({
        message: "Invalid or empty product IDs provided",
      });
    }

    // Use a simple loop to remove products
    for (const productId of productIds) {
      await cart.removeProduct(productId);
    }

    console.log("Products successfully removed from the cart");

    // Fetch the updated list of products in the cart
    const products = await cart.getProducts();

    // Calculate the total cost using a normal loop
    let cost = 0;
    const productsSelected = [];

    for (const product of products) {
      cost += product.cost;
      productsSelected.push({
        id: product.id,
        name: product.name,
        cost: product.cost,
      });
    }

    res.status(200).send({
      id: cart.id,
      productsSelected: productsSelected,
      cost: cost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

/**
 * Controller to get the cart based on the cartId
 */
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findByPk(req.params.cartId);

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

    res.status(200).send({
      id: cart.id,
      productsSelected: productsSelected,
      cost: cost,
      totalQuantity: totalQuantity,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};
