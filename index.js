const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("sheet is running");
});
//==============================

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.txwujtc.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    //================================
    
    const tableheadingCollection = client
      .db("diuswe_cpsheet")
      .collection("tableheading");
    const allstudentdataCollection= client.db("diuswe_cpsheet").collection("allstudentdata")

    //get method
    
    app.get("/tableheading", async (req, res) => {
      const result = await tableheadingCollection.find().toArray();
      const allheadingCount=await tableheadingCollection.estimatedDocumentCount()

      res.send({result,allheadingCount});
    });

    app.get("/allstudentdata/:sixTableHeadingIndexPropertyName", async (req, res) => {
      const query = {}
      const targetedIndexPropertyName = req.params.sixTableHeadingIndexPropertyName
      // console.log(targetedIndexPropertyName,"allStudent:id");
      const options = {
        sort: {
          [targetedIndexPropertyName]: -1 
        }
      }
      const result = await allstudentdataCollection.find(query,options).toArray();
      res.send(result);
    });
    //post method
    app.post("/tableheading", async (req, res) => {
      const tableHeading = req.body;
      const result = await tableheadingCollection.insertOne(tableHeading);
      res.send(result);
    });
app.post("/allstudentdata", async (req, res) => {
  const newStudentdata = req.body
  const result = await allstudentdataCollection.insertOne(newStudentdata)
  res.send(result)
  // console.log(newStudentdata);
    })
    //delete Method
    app.delete("/deleteheading/:id", async (req, res) => {
      const Id = req.params.id;
      const query = { _id: new ObjectId(Id) };
      const result = await tableheadingCollection.deleteOne(query);
      res.send(result);
    });

app.delete("/delete_student/:id", async (req, res) => {
      const Id = req.params.id;
      const query = { _id: new ObjectId(Id) };
      const result = await allstudentdataCollection.deleteOne(query);
      res.send(result);
    });
    //update method
    app.patch("/update_heading/:id", async (req, res) => {
      const update_id=req.params.id
      const updateData = req.body.heading_value
      const filter = { _id: new ObjectId(update_id) }
      const updateDoc = {
        $set: {
          heading_value:updateData
        }
      }
      const result = await tableheadingCollection.updateOne(filter, updateDoc)
      res.send(result)
    })
//update all object properties without _id
    app.put("/update_student/:id", async (req, res) => {
      const update_id = req.params.id
      const updateData = req.body 
      // console.log(updateData,update_id,"update_student");
      const filter = { _id: new ObjectId(update_id) }
      const updateDoc = {
        $set:updateData
      }
      const result = await allstudentdataCollection.updateMany(filter, updateDoc)
      res.send(result)
    })
    //================================

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

//==============================
app.listen(port, () => {
  console.log(`this sheet port is running with ${port} `);
});
