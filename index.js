const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

//-------------------------   End points
const serviceCollection = client.db("photoBizz").collection("services");
const reviewCollection = client.db("photoBizz").collection("reviews");

//----- Service API
//get only 3 data from the data base for home page
app.get("/servicesHome", async (req, res) => {
  try {
    const query = {};
    const cursor = serviceCollection.find(query);
    const servicesHome = await cursor.limit(3).toArray();
    res.send({
      success: true,
      message: "Successfully got the service data",
      data: servicesHome,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//get services data from the data base and send response to the client site (read method)
app.get("/services", async (req, res) => {
  try {
    const query = {};
    const cursor = serviceCollection.find(query);
    const services = await cursor.toArray();
    res.send({
      success: true,
      message: "Successfully got the service data",
      data: services,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//get individual service details from data as client site requested (read method)
app.get("/services/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const service = await serviceCollection.findOne(query);
    res.send({
      success: true,
      message: "Successfully got the service data",
      data: service,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//----- Reviews API
//post data from the client site (create method)
app.post("/reviews", async (req, res) => {
  try {
    const review = req.body;
    const result = await reviewCollection.insertOne(review);
    res.send({
      success: true,
      message: "Review added successfully",
      data: result,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
//GET reviews data for an individual user
app.get("/reviews", async (req, res) => {
  try {
    let query = {};
    // console.log(req.query.email);
    if (req.query.email) {
      query = {
        email: req.query.email,
      };
    }
    const cursor = reviewCollection.find(query);
    const reviews = await cursor.toArray();
    res.send({
      success: true,
      message: "Successfully got the service data",
      data: reviews,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
//GET data for an individual category
app.get("/reviewsByCategory", async (req, res) => {
  try {
    let query = {};
    if (req.query.serviceId) {
      query = {
        serviceId: req.query.serviceId,
      };
    }

    const cursor = reviewCollection.find(query);
    const reviewInCategory = await cursor.toArray();
    res.send({
      success: true,
      message: "Successfully got the service data",
      data: reviewInCategory,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//Delete review workinG
app.delete("/reviews/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await reviewCollection.deleteOne(query);
    res.send({
      success: true,
      message: "Review deleted successfully",
      data: result,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//get data from the review collection

//------------------------- End points end
app.get("/", (req, res) => {
  res.send("Welcome to Photo Bizz");
});

app.listen(port, () => {
  console.log(`Photo Bizz server is running on port: ${port}`.cyan.italic);
});
