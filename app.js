const express = require("express");
const serverConfig = require("./configs/server.config");
const bodyParser = require("body-parser");

// initiaizing express
const app = express();

/**
 * Using the body-parser middleware
 *
 * Using for parsing the request.
 * Parsing the request of the type json and convert that to object
 *
 * */

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * Initializing the database
 */
const db = require("./models");
const Category = db.category;
const Product = db.product;
const Role = db.role;
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

//Setting the One to Many relationship between Category and Product
Category.hasMany(Product); // This will create a foreign key column( categoryId) in Product table

const initRoles = async () => {
  try {
    await db.sequelize.sync({ force: true });
    console.log("tables dropped and recreated");

    /**Initialising few categories */
    var categories = [
      {
        name: "Electronics",
        description: "This category will contain all the electronic products",
      },
      {
        name: "KitchenItems",
        description:
          "This category will contain all the Kitchen related products",
      },
    ];

    await Category.bulkCreate(categories);
    console.log("Categories table is initialized");

    /**
     * Adding Roles
     */
    await Role.findOrCreate({ where: { id: 1, name: "user" } });
    await Role.findOrCreate({ where: { id: 2, name: "admin" } });
    // Perform role initialization

    // Close Sequelize connection after initialization
    // await sequelize.close();
  } catch (err) {
    console.log("Error: ", err);
  }
};

const initializationPromise = initRoles();

// console.log(Category);
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("tables dropped and recreated");
//   init();
// });

// function init() {
//Initializing few Categories
//   var categories = [
//     {
//       name: "Electronics",
//       description: "This category will contain all the electronic products",
//     },
//     {
//       name: "KitchenItems",
//       description:
//         "This category will contain all the Kitchen related products",
//     },
//   ];

//   Category.bulkCreate(categories)
//     .then(() => {
//       console.log("Categories table is initialized");
//     })
//     .catch((err) => {
//       console.log("Error while initializing ategories table");
//     });

/**
 * Adding roles
 */
//   Role.create({
//     id: 1,
//     name: "user",
//   });
//   Role.create({
//     id: 2,
//     name: "admin",
//   });
// }

/**
 * Importing the routes and using it
 */

require("./routes/category.routes")(app);
require("./routes/product.routes")(app);
require("./routes/auth.routes")(app);
require("./routes/cart.routes")(app);
require("./routes/stripe.routes")(app);

/**
 * Made initRoles async and exporting the "initializationPromise" promise to make sure, files which are importing the app
 * make use of this "initializationPromise" promise to wait till the app gets fully initialised before they could use it
 * in their process
 */
module.exports = {
  app,
  initializationPromise,
};
