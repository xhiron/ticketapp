import { Publisher, Subjects, TicketUpdatedEvent } from "@xhtickets/common";
import { natsWrapper } from "../../src/nats-wrapper";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated
}