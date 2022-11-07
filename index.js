const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5005;

// middle ware
app.use(cors());
app.use(express.json());

const services = require("./data/services.json");

app.get("/", (req, res) => {
  res.send("Welcome to Photo Bizz");
});
app.get("/services", (req, res) => {
  res.send(services);
});
app.listen(port, () => {
  console.log(`Photo Bizz server is running on port: ${port}`);
});
