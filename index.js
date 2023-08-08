const connectDB = require('./db');
const express = require('express')

connectDB();
const app = express()
const port = 5000

//midleware
app.use(express.json())

// Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})