import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
declare global {
    namespace NodeJS {
        interface Global {
            signup(): string[]
        }
    }
}

jest.mock("../nats-wrapper")

let mongo: any
beforeAll( async() => {
    process.env.JWT_KEY = "Test key"
    mongo = new MongoMemoryServer()
    const mongoUri = await mongo.getUri()

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
})

beforeEach(async () => {
    jest.clearAllMocks()
    const collections = await mongoose.connection.db.collections()
    for (let collection of collections) {
        await collection.deleteMany({})
    }
})

afterAll(async () => {
    await mongo.stop()
    await mongoose.connection.close()
})

global.signup = () => {
// build a jwt payload {id , email}
const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com"
}
// create the JWT!
const token = jwt.sign(payload, process.env.JWT_KEY!)

// Build session object
const session = {jwt: token}

// convert into JSON
const sessionJSON = JSON.stringify(session)

// encode as base64
const base64 = Buffer.from(sessionJSON).toString("base64")

// return string with cookie with the encoded
return [`express:sess=${base64}`]
}