const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("colors");
const express = require("express");
const cors = require("cors");
var jwt = require("jsonwebtoken");

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

    //JWT START workinG
    app.post("/jwt", (req, res) => {
      const user = req.body;
      console.log(user);
      //create token
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "2d",
      });
      res.send({ token });
    });
    //JWT enD
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
}
dbConnect();

//workinG-------------------------------- JWT verify function starT
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  ///get token
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access." });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access." });
    }
    req.decoded = decoded;
    next();
  });
}
//------------------------------------------JWT verify function enD

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
// Add services to the services collection
app.post("/services", async (req, res) => {
  try {
    const service = req.body;
    const result = await serviceCollection.insertOne(service);
    res.send({
      success: true,
      message: "Service details added successfully",
      data: result,
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

//GET reviews data for an individual user workinG
app.get("/reviews", verifyJWT, async (req, res) => {
  //jwt
  const decoded = req.decoded;
  if (decoded.email !== req.query.email) {
    res.status(401).send({
      success: false,
      message: "Unauthorized access.",
    });
  }
  //jwt

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
//GET data for an individual category erroR "/reviewsByCategory/id"
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
      message: "Successfully got the service data.",
      data: reviewInCategory,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//Update review workinG
app.get("/reviews/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const review = await reviewCollection.findOne(query);
    res.send({
      success: true,
      message: "Successfully got the service data.",
      data: review,
    });
  } catch {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
// //Update review workinG
app.put("/reviews/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const updatedReview = req.body;
    // console.log(updatedReview);
    //update in database
    const option = { upsert: true };
    const updatedRev = {
      $set: {
        reviewerName: updatedReview.reviewerName,
        email: updatedReview.email,
        reviewerImg: updatedReview.reviewerImg,
        serviceTitle: updatedReview.serviceTitle,
        serviceId: updatedReview.serviceId,
        reviewDescription: updatedReview.reviewDescription,
      },
    };

    const result = await reviewCollection.updateOne(query, updatedRev, option);
    res.send({
      success: true,
      message: "Review updated successfully.",
      data: result,
    });
  } catch {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//Delete review
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
