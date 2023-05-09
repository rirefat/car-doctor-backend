const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());

// Function to verify JWT token 
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized Access" });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized Access" });
        }
        req.decoded = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d7wzr9v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const serviceCollection = client.db("carDoctor").collection("services");
        const productCollection = client.db("carDoctor").collection("products");
        const cartCollection = client.db("carDoctor").collection("cart");
        const orderCollection = client.db("carDoctor").collection("order");
        const teamMembers = client.db("carDoctor").collection("team");

        //===================================================== GET API SECTION =====================================================
        // API for reading services data
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const result = await cursor.toArray();

            res.send(result);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.send(result);
        })

        // API for reading products data
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();

            res.send(result);
        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.findOne(query);

            res.send(result);
        })

        // API for reading team data
        app.get('/team', async (req, res) => {
            const query = {};
            const cursor = teamMembers.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // API for reading cart data
        app.get('/cart', async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = {
                    order_email: req.query.email
                }
            }
            const cursor = cartCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // API for reading orders data
        app.get('/orders', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                res.status(401).send({ message: "Unauthorized Access" });
            }
            let query = {};
            if (req.query.email) {
                query = {
                    order_email: req.query.email
                }
            }
            const cursor = orderCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        //===================================================== POST API SECTION =====================================================
        // API for posting service data
        app.post('/services', async (req, res) => {
            const doc = req.body;
            const result = await serviceCollection.insertOne(doc);
            res.send(result);
        })

        // API for posting product data
        app.post('/products', async (req, res) => {
            const doc = req.body;
            const result = await productCollection.insertOne(doc);
            res.send(result);
        })

        // API for posting cart data
        app.post('/cart', async (req, res) => {
            const doc = req.body;
            const result = await cartCollection.insertOne(doc);
            res.send(result);
        })

        // API for posting order data
        app.post('/orders', async (req, res) => {
            const doc = req.body;
            const result = await orderCollection.insertOne(doc);
            res.send(result);
            console.log("confirm order")
        })


        //===================================================== DELETE API SECTION =====================================================
        // API for deleting single service data
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
            console.log("Service deleted")
        })

        // API for deleting single product data
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.deleteOne(query);
            res.send(result);
            console.log("Product Deleted")
        })

        // API for deleting single cart item
        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cartCollection.deleteOne(query)
            res.send(result);
            console.log("deleted one item from cart")
        })

        // API for deleting all items from cart
        app.delete('/cart', async (req, res) => {
            const email = req.query.email;
            const query = { order_email: { $regex: email } }
            const result = await cartCollection.deleteMany(query);
            res.send(result);
            console.log("cart clear")
        })

        //===================================================== UPDATE API SECTION =====================================================
        // API for updating single service data
        app.put('/services/:id', async (req, res) => {
            const id = req.params.id;
            const service = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: service.name,
                    description: service.description,
                    price: service.price,
                    img: service.img
                }
            };
            const result = await serviceCollection.updateOne(filter, updateDoc, options);
            res.send(result);
            console.log("Service data is updated");
        })

        // API for updating single product data
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const product = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    img: product.img
                }
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result);
            console.log("Product data is updated");
        })

        // API for JSON Web Token
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.SECRET_TOKEN, { expiresIn: '5h'});
            res.send({ token })
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