const express = require('express')
const app = express()
const cors = require('cors')
const User = require('./Module/User');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb')
const authRoutes = require('./Router/Auth');
const port = process.env.PORT || 5000
require('./connectDB/db')
app.use(cors())
app.use(express.json());

app.use('/auth', authRoutes)

// middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization
    console.log(token);
    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }
    jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Access Denied.' });
        }
        req.decoded = decoded
        next()
    })
}

const verifyUser = async (req, res, next) => {
    console.log(req.decoded);
    const email = req.decoded?.email
    console.log(email);
    // const query = { email: email }
    const user = await User.findOne({ email });
    const isUser = user?.role === 'user'
    console.log(isUser);
    if (!isUser) {
        return res.status(403).send({ message: 'forbidden access' })
    }
    next()
}

const verifyAgent = async (req, res, next) => {
    console.log(req.decoded);
    const email = req.decoded?.email
    console.log(email);
    // const query = { email: email }
    const user = await User.findOne({ email });
    const isAgent = user?.role === 'agent'
    console.log(isAgent);
    if (!isAgent) {
        return res.status(403).send({ message: 'forbidden access' })
    }
    next()
}
const uri = process.env.MONGO_URL
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
try {
    const database = client.db("nagadDB");
    const nagadCollection = database.collection("nagad");
    const userCollection = database.collection("users");
    app.post('/post', async (req, res) => {
        const doc = req.body
        console.log(doc);
        const result = await nagadCollection.insertOne(doc);
        res.send(result)
    })

    app.get('/user', verifyToken, async (req, res) => {
        const email = req.query.email
        console.log(email,'lllllllllllscdddddddddd');
        const query = { email: email }
        const result = await userCollection.findOne(query)
        res.send(result)
    })
}
catch (err) {
    console.log(err);
}

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})