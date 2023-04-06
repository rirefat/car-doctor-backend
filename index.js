const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d7wzr9v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const serviceCollection = client.db("carDoctor").collection("services");
        const productCollection = client.db("carDoctor").collection("products");
        const teamMembers = client.db("carDoctor").collection("team");
        
        // API for reading services data
        app.get('/services', async (req, res)=>{
            const query = {};
            const cursor = serviceCollection.find(query);
            const result = await cursor.toArray();

            res.send(result);
        })

        app.get('/services/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.send(result);
        })
        
        // API for reading products data
        app.get('/products', async (req, res)=>{
            const query = {};
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();

            res.send(result);
        })
        
        // API for reading team data
        app.get('/team', async (req, res)=>{
            const query = {};
            const cursor = teamMembers.find(query);
            const result = await cursor.toArray();

            res.send(result);
        })

        // API for posting service data
        app.post('/services', async (req, res)=>{
            const doc = req.body;
            const result = await serviceCollection.insertOne(doc);
            res.send(result);
        })

        // API for deleting single service data
        app.delete('/services/:id', async (req,res)=>{
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
            console.log("deleted")
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', async (req, res) => {
    res.send("Node server is running")
});

app.get('/services', async (req, res) => {
    res.send("Service Available")
});

app.listen(port, () => {
    console.log(`Node server is running on port ${port}`)
});