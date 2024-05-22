const { app, initializationPromise } = require("./app");
const serverConfig = require("./configs/server.config");
const helmet = require("helmet");

const cors = require("cors");

const corsOptions = {
  origin: "http://127.0.0.1:5500",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow credentials in cross-origin requests
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Use the helmet middleware with CSP configuration
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "https://img.favpng.com"],
      // Add other directives as needed
    },
  })
);

initializationPromise.then(() => {
  //Starting the server
  app.listen(serverConfig.PORT, () => {
    console.log(`Application started on the port no : ${serverConfig.PORT}`);
  });
});
