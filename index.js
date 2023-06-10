const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express()
const cors = require("cors")
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000
require('dotenv').config()


// Middleware
app.use(express.json())
app.use(cors())

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization
    if (!authorization) {
        return res.status(401).send({ error: true, message: "unauthorized access" })
    }

    const token = authorization.split(" ")[1]

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: "unauthorized access" })
        }
        req.decoded = decoded
        next()
    })
}




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
        const classCollection = client.db("PhotographySpaceDb").collection("classes");


        // JWT Api---------------
        app.post("/jwt", (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
            res.send({ token })
        })

        // verify Admin---------------
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            if (user?.role !== "admin") {
                return res.status(403).send({ error: true, message: "Forbidden Massage" })
            }
            next()
        }

        // verify Instructor---------------
        const verifyInstructor = async (req, res, next) => {
            const email = req.decoded.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            if (user?.role !== "instructor") {
                return res.status(403).send({ error: true, message: "Forbidden Massage" })
            }
            next()
        }

        // users api get---------------
        app.get("/users", verifyJWT, verifyAdmin, async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
        })

        // users api post-------------
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

        // check admin api-----------
        app.get("/users/admin/:email", verifyJWT, async (req, res) => {
            const email = req.params.email
            if (req.decoded.email !== email) {
                res.send({ admin: false })
            }
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            const result = { admin: user?.role === "admin" }
            res.send(result)
        })


        // check instructor api-----------
        app.get("/users/instructor/:email", verifyJWT, async (req, res) => {
            const email = req.params.email
            if (req.decoded.email !== email) {
                res.send({ instructor: false })
            }
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            const result = { instructor: user?.role === "instructor" }
            res.send(result)
        })


        // admin role api----------
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


        // Instructor role api-----------
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



        // Add Class Post api-----------
        app.post("/class", verifyJWT, verifyInstructor, async (req, res) => {
            const addClass = req.body
            const result = await classCollection.insertOne(addClass)
            res.send(result)
        })


        // manage all class  api 
        app.get("/class", async (req, res) => {
            const result = await classCollection.find().toArray()
            res.send(result)
        })



        // my classes api----------
        app.get("/myClasses/:email", verifyJWT, verifyInstructor, async (req, res) => {
            const email = req.params.email
            const query = { userEmail: email }
            const result = await classCollection.find(query).toArray()
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
