const express = require('express')
const app = express()
const cors = require('cors')
const User = require('./Module/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { MongoClient, ServerApiVersion } = require('mongodb')
const authRoutes = require('./Router/Auth');
const { isObjectIdOrHexString, isValidObjectId, default: mongoose } = require('mongoose');
const port = process.env.PORT || 5000
require('./connectDB/db')
app.use(cors({
    origin: ['http://localhost:5173']
}))
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

const verifyAdmin = async (req, res, next) => {
    console.log(req.decoded);
    const email = req.decoded?.email
    console.log(email);
    // const query = { email: email }
    const user = await User.findOne({ email });
    const isAdmin = user?.role === 'admin'
    console.log(isAdmin);
    if (!isAdmin) {
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
    const cashInCollection = database.collection("cash-in");
    const cashOutCollection = database.collection("cash-Out");
    const userCollection = database.collection("users");
    app.post('/cash-in-out', verifyToken, verifyUser, async (req, res) => {
        const data = req.body
        const result = await cashInCollection.insertOne(data);
        res.send(result)
    })

    app.post('/cash-out', verifyToken, verifyAgent, async (req, res) => {
        const data = req.body
        const result = await cashInCollection.insertMany(data);
        res.send(result)
    })

    app.get('/cash-out-transaction/:email', verifyToken, async (req, res) => {
        const status = req.query.status
        const email = req.params.email
        const query = { email: email, status: 'complete' }
        console.log(status, query, 'jhjg');
        const result = await cashInCollection.find(query).toArray()
        console.log(result);
        res.send(result)
    })

    app.get('/user', verifyToken, async (req, res) => {
        const email = req.query.email
        console.log(email, 'lllllllllllscdddddddddd');
        const query = { email: email }
        const result = await userCollection.findOne(query)
        res.send(result)
    })

    app.get('/all-user', verifyToken, verifyAgent, async (req, res) => {
        const result = await userCollection.find().toArray()
        res.send(result)
    })

    app.get('/agent', verifyToken, verifyAgent, async (req, res) => {
        const email = req.query.email
        console.log(email, 'lllllllllllscdddddddddd');
        const query = { email: email }
        const result = await userCollection.findOne(query)
        res.send(result)
    })

    app.get('/all-transactions', verifyToken, verifyAdmin, async (req, res) => {
        const status = req.query.status
        const query = { status: status }
        const result = await cashInCollection.find(query).toArray()
        res.send(result)
    })
    app.get('/transactions/:email', verifyToken, verifyUser, async (req, res) => {
        const email = req.params.email
        const status = req.query.status
        const query = { status: 'complete', email: email }
        console.log(status, query, 'jhjg');
        const result = await cashInCollection.find(query).toArray()
        console.log(result);
        res.send(result)
    })
    app.get('/cash-in-out-request', verifyToken, verifyAgent, async (req, res) => {
        const status = req.query.status
        console.log(status);
        const query = { status: status }
        console.log(query);
        const result = await cashInCollection.find(query).toArray()
        res.send(result)
    })

    app.get('/users-management', verifyToken, verifyAdmin, async (req, res) => {
        const result = await userCollection.find().toArray()
        res.send(result)
    })
    app.get('/send-user', async (req, res) => {
        // const email = req.query.email
        // const query = { email: email }
        const result = await userCollection.find().toArray()
        res.send(result)
    })

    app.patch('/cash-outs/:id', verifyToken, verifyAgent, async (req, res) => {
        const ids = req.params.id
        const type = req.query.type
        console.log(type);
        const tra = req.query.tra
        console.log(tra);
        const time = req.query.time
        console.log(time);
        const options = { upsert: true };
        const ObjectId = mongoose.Types.ObjectId
        const filter = { _id: new ObjectId(ids) }
        const updateDoc = {
            $set: {
                status: 'complete',
                transactionId: tra,
                type: type,
                time: time
            },
        };
        const result = await cashInCollection.updateOne(filter, updateDoc, options);
        console.log(result);
        res.send(result)
    })
    app.patch('/update-user/:email', verifyToken, verifyAdmin, async (req, res) => {
        const email = req.params.email
        console.log(email, 'iiiiiiiik');
        const status = req.query.status
        console.log(status, 'kkkkiiiiii');
        const options = { upsert: true };
        const filter = { email: email }
        const updateDoc = {
            $set: {
                status: status,
                newUserBonus: 'complete'
            },
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        res.send(result)
    })
    app.patch('/cash-in/:email', verifyToken, verifyAgent, async (req, res) => {
        const email = req.params.email
        console.log(email, 'iiiiiiiik');
        const amount = req.query.amount
        console.log(amount, 'kkkkiiiiii');
        const options = { upsert: true };
        const filter = { email: email }
        const updateDoc = {
            $set: {
                amount: amount,
            },
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        res.send(result)
    })

    app.patch('/cash-out/:email', verifyToken, verifyAgent, async (req, res) => {
        const email = req.params.email
        console.log(email, 'iiiiiiiik');
        const amount = req.query.amount
        console.log(amount, 'kkkkiiiiii');
        // const options = { upsert: true };
        const filter = { email: email }
        const updateDoc = {
            $set: {
                amount: amount,
            },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result)
    })

    app.patch('/new-user-bonus/:email', verifyToken, verifyAdmin, async (req, res) => {
        const email = req.params.email
        console.log(email, 'iiiiiiiik');
        const options = { upsert: true };
        const filter = { email: email }
        const updateDoc = {
            $set: {
                amount: 40
            },
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        res.send(result)
    })

    app.patch('/new-agent-bonus/:email', verifyToken, verifyAdmin, async (req, res) => {
        const email = req.params.email
        console.log(email, 'iiiiiiiik');
        const options = { upsert: true };
        const filter = { email: email }
        const updateDoc = {
            $set: {
                amount: 10000
            },
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        res.send(result)
    })

    app.patch('/send-money/:email', async (req, res) => {
        const email = req.params.email
        const amount = req.query.amount
        console.log(email, 'iiiiiiiik');
        const options = { upsert: true };
        const filter = { email: email }
        console.log(email);
        const updateDoc = {
            $set: {
                amount: amount
            },
        };
        console.log(updateDoc);
        const result = await userCollection.updateOne(filter, updateDoc, options);
        console.log(result);
        res.send(result)
    })
    app.post('/send-money', async (req, res) => {
        const sendUser = req.body
        const result = await cashInCollection.insertOne(sendUser)
        res.send(result)
    })


    app.patch('/recived-money/:email', async (req, res) => {
        const email = req.params.email
        console.log(email);
        const amount = req.query.amount
        console.log(email, 'iiiiiiiik');
        const options = { upsert: true };
        const filter = { email: email }
        const updateDoc = {
            $set: {
                amount: amount
            },
        };
        console.log(updateDoc);
        const result = await userCollection.updateOne(filter, updateDoc, options);
        console.log(result);
        res.send(result)
    })
    app.post('/recived-money', async (req, res) => {
        const recivedUser = req.body
        const result = await cashInCollection.insertOne(recivedUser)
        res.send(result)
    })
    app.post('/send-money-fee', async (req, res) => {
        const recivedUser = req.body
        const result = await cashInCollection.insertOne(recivedUser)
        res.send(result)
    })

    // app.post('/new-user-bonus', async (req, res) => {
    //     const bonus = req.body
    //     const result = await nagadCollection.insertOne(bonus);
    //     res.send(result)
    // })
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