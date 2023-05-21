const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = 5000;

//middleware
app.use(cors())
app.use(express.json())


// mongodb.connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l8zs6j6.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db('ToyGalaxy').collection('Toys');
    // craete index for searching
    const result = await toysCollection.createIndex({ name: 1 }, { name: "toyIndex" })

    // search by name
    app.get("/getToyByName/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await toysCollection.find({ name: { $regex: searchText, $options: "i" } }).toArray();
      res.send(result);
    });

    app.get('/', (req, res) => {
      res.send('Welcome to ToyGalaxyHub')
    })

    // get all toys
    app.get('/toys', async (req, res) => {
      const result = await toysCollection.find().limit(20).toArray();
      res.send(result);
    })

    // add a toy
    app.post('/toys', async (req, res) => {
      const toy = req.body;
      const result = await toysCollection.insertOne({ ...toy, createdAt: new Date() });
      res.send(result);
    })


    // get a single toy
    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    // delete a toy
    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    // update a toy
    app.patch('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const newToy = req.body;

      filter = { _id: new ObjectId(id) };
      options = { upsert: true };
      updatedToy = {
        $set: {
          ...newToy,
        }
      }

      const result = await toysCollection.updateOne(filter, updatedToy, options);
      res.send(result);
    })

    // filter by email
    app.get('/getToysByEmail/:email', async (req, res) => {
      const query = { sellerEmail: req.params.email };
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    })

    // filter by subcategory
    app.get('/getToysByCategory/:subcategory', async (req, res) => {
      const query = { subcategory: req.params.subcategory };
      const result = await toysCollection.find(query).limit(2).toArray();
      res.send(result);
    })

    // popular toy
    app.get('/getPopularToys', async (req, res) => {
      const result = await toysCollection.find().sort({ createdAt: -1 }).limit(3).toArray();
      res.send(result);
    })

    // sorting by price
    app.get('/getSortedToysByEmail/:email', async (req, res) => {
      const query = { sellerEmail: req.params.email };
      console.log(req.query);
      const sort = req.query.sortBy === 'true' ? 1 : -1;
      const result = await toysCollection.find(query).sort({ price: sort }).collation({ locale: "en_US", numericOrdering: true }).toArray();
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});