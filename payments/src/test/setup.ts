import request from "supertest"
import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import { app } from "../app"
import jwt from "jsonwebtoken"
declare global {
  namespace NodeJS {
    interface Global {
      signup(id?: string): string[]
    }
  }
}

jest.mock("../nats-wrapper")

process.env.STRIPE_KEY = "sk_test_51HD64KKn3PO8bqR5WsEeTxP4SKCi7JxSdsJfp7erPLV4NcBBVRqY5vCloAeuRKQqeivqewWeO4ey6A2ohWeXcOyB00sz0nwChh"

let mongo: any
beforeAll(async () => {
  process.env.JWT_KEY = "Test key"
  mongo = new MongoMemoryServer()
  const mongoUri = await mongo.getUri()

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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

global.signup = (id?: string) => {
  // build a jwt payload {id , email}
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  }
  // create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!)

  // Build session object
  const session = { jwt: token }

  // convert into JSON
  const sessionJSON = JSON.stringify(session)

  // encode as base64
  const base64 = Buffer.from(sessionJSON).toString("base64")

  // return string with cookie with the encoded
  return [`express:sess=${base64}`]
}
