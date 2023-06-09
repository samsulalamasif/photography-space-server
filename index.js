const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express()
const cors = require("cors")
const port = process.env.PORT || 5000
require('dotenv').config()

app.use(express.json())
app.use(cors())





const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@cluster0.vqy99hm.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();

        const usersCollection = client.db("PhotographySpaceDb").collection("users");


        // users api get
        app.get("/users", async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
        })

        // users api post
        app.post("/users", async (req, res) => {
            const user = req.body
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: "user already exists " })
            }
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })


        // admin role api
        app.patch("/users/admin/:id", async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: "admin"
                },
            }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.send(result)
        })


        // Instructor role api
        app.patch("/users/instructor/:id", async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: "instructor"
                },
            }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.send(result)
        })









        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);










app.get("/", (req, res) => {
    res.send("Photography Space server side is running")
})

app.listen(port, () => {
    console.log(`Photography Space server side is running on port: ${port}`);
})
