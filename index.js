const { MongoClient, ServerApiVersion } = require("mongodb");
require("colors");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5005;

// middle ware
app.use(cors());
app.use(express.json());

//CONNECT to MongoDb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hufticd.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function dbConnect() {
  try {
    await client.connect();
    console.log("Database connected".yellow.italic);
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
}
dbConnect();

//------------------------- workinG  End points
const serviceCollection = client.db("photoBizz").collection("services");

//get services data from the data base and send response to the client site
app.get("/services", async (req, res) => {
  try {
    const query = {};
    const cursor = serviceCollection.find(query);
    const services = await cursor.toArray();
    res.send({
      success: true,
      message: "Successfully got the data",
      data: services,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//------------------------- End points end
app.get("/", (req, res) => {
  res.send("Welcome to Photo Bizz");
});

app.listen(port, () => {
  console.log(`Photo Bizz server is running on port: ${port}`.cyan.italic);
});
