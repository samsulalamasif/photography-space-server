const express = require('express');
const app = express()
const cors = require("cors")
const port = process.env.PORT || 5000
require('dotenv').config()

app.use(express.json())
app.use(cors())














app.get("/", (req, res) => {
    res.send("Photography Space server side is running")
})

app.listen(port, () => {
    console.log(`Photography Space server side is running on port: ${port}`);
})
