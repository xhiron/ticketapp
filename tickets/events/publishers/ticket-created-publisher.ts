import { Publisher, Subjects, TicketCreatedEvent } from "@xhtickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated
}

