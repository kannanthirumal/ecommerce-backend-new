module.exports = (sequelize, Sequelize) => {
  const Cart = sequelize.define("cart", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
    cost: {
      type: Sequelize.INTEGER,
    },
  });
  return Cart;
};
