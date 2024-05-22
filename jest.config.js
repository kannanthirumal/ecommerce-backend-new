module.exports = {
  testTimeout: 30000,
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  // setupFiles: ["/tests/setupTests.js"],  Jest will execute the setup files specified in setupFiles automatically, but since you are importing it within your test files, it will be called explicitly from there.
};

//npx sequelize-cli migration:generate --name your_migration_name
