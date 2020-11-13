import request from "supertest"
import {app} from "../../app"
import mongoose from "mongoose"
import { Ticket } from "../../models/ticket"
import { Order, OrderStatus } from "../../models/order"

it("gets an order ", async() => {
    // create a ticket
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    })
    await ticket.save()
    const user = global.signup()

    //  make a request to build an order with this ticket
    const {body: order} = await request(app)
    .post("/api/orders")
    .set("Cookie",user)
    .send({ticketId: ticket.id})
    .expect(201)

    // make request to fetch the order
    const {body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie",user)
    .send({ticketId: ticket.id})
    .expect(200)

    expect(fetchedOrder.id).toEqual(order.id)
})

it("return an error if user tries to fetch another users error", async() => {
    // create a ticket
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    })
    await ticket.save()
    const user = global.signup()

    //  make a request to build an order with this ticket
    const {body: order} = await request(app)
    .post("/api/orders")
    .set("Cookie",user)
    .send({ticketId: ticket.id})
    .expect(201)

    // make request to fetch the order
    await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie",global.signup())
    .send({ticketId: ticket.id})
    .expect(401)

})