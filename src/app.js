const express = require('express');
require('./db/mongoose');
const cors = require('cors');
const userRouter = require('./routers/user');

const app = express()

// app.use((req, res, next) => {
//     if (req.method === "GET") {
//         res.send({message: 'GET requests are disabled!'})
//     } else {
//         next()
//     }
// })

// maintenance mode
// app.use((req,res, next) => {
//     res.status(503).send({adminMessage:'Site is currently down. please try back soon'})
// })

app.use(cors())
// parse all income json to objects
app.use(express.json())
app.use(userRouter)

module.exports = app