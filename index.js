const connectDB = require('./db');
const express = require('express')
var cors = require('cors')
connectDB();
const app = express()
const port = 5000


app.use(cors())

//middleware
app.use(express.json())

// Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))


app.listen(port, () => {
    console.log(`Inotebook backend listening at http://localhost:${port}`)
})