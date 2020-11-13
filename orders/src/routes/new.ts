import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from "@xhtickets/common"
import express, { Request, Response } from "express"
import { body } from "express-validator"
import mongoose from "mongoose"
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher"
import { Order } from "../models/order"
import { Ticket } from "../models/ticket"
import { natsWrapper } from "../nats-wrapper"
const router = express.Router()
const EXPIRATION_WINDOW_SECONDS = 1 * 60
router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body
    // find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId)
    if (!ticket) {
      throw new NotFoundError()
    }
    // make sure that this ticket is not already reserved

    const isReserved = await ticket.isReserved()

    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved")
    }

    // calculate an expiration date for that order
    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    // build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket,
    })
    await order.save()

    // publish an event that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
      version: order.version,
    })
    res.status(201).send(order)
  }
)

export { router as newOrderRouter }
