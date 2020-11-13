import { ExpirationCompleteEvent, Publisher, Subjects } from "@xhtickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    readonly subject = Subjects.ExpirationComplete
}