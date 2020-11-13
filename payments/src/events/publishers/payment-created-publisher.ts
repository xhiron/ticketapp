import { PaymentCreatedEvent, Publisher, Subjects } from "@xhtickets/common"

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
}
