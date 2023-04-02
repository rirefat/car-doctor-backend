const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', async (req, res)=>{
    res.send("Node server is running")
});

app.get('/services', async (req, res)=>{
    res.send("Service Available")
});

app.listen(port, ()=>{
    console.log(`Node server is running on port ${port}`)
});