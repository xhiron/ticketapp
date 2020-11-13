import request from "supertest"
import {app} from "../../app"
import mongoose from "mongoose"
import { Ticket } from "../../models/ticket"
import { Order, OrderStatus } from "../../models/order"
import { natsWrapper } from "../../nats-wrapper"


it("marks an orer as cancelled", async() => {
    // create a ticket with ticket model
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    })
    await ticket.save()
    const user = global.signup()
    // make a request to create an order
    const {body: order} = await request(app)
    .post("/api/orders")
    .set("Cookie",user)
    .send({ticketId: ticket.id})
    .expect(201)

    // make a request to cancel the order

     await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie",user)
    .send({ticketId: ticket.id})
    .expect(200)
    // expectation to make sure the thing is cancelled

    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it("emits a order cancelled event", async() => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    })
    await ticket.save()
    const user = global.signup()
    // make a request to create an order
    const {body: order} = await request(app)
    .post("/api/orders")
    .set("Cookie",user)
    .send({ticketId: ticket.id})
    .expect(201)

    // make a request to cancel the order

     await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie",user)
    .send({ticketId: ticket.id})
    .expect(200)
    expect(natsWrapper.client.publish).toHaveBeenCalled()
})