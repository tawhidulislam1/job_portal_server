const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
// miderware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("job portal serve is working now...............");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zhrby.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const portalCollection = client.db("JobPortal").collection("jobs");
    const jobApplicationCollection = client
      .db("JobPortal")
      .collection("Job_Applicaton");
    //APP related api

    app.get("/jobs", async (req, res) => {
      const curser = portalCollection.find();
      const result = await curser.toArray();
      res.send(result);
    });
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await portalCollection.findOne(query);
      res.send(result);
    });
    app.get("/job-application", async (req, res) => {
      const email = req.query.email;
      const query = { application_email: email };
      const result = await jobApplicationCollection.find(query).toArray();
      for (const application of result) {
        const query = { _id: new ObjectId(application.job_id) };
        const jobs = await portalCollection.findOne(query);
        if (jobs) {
          application.title = jobs.title;
          application.location = jobs.location;
          application.company = jobs.company;
          application.company_logo = jobs.company_logo;
        }
      }
      res.send(result);
    });
    app.post("/job-application", async (req, res) => {
      const application = req.body;
      const result = await jobApplicationCollection.insertOne(application);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`the job port is ${port}`);
});
