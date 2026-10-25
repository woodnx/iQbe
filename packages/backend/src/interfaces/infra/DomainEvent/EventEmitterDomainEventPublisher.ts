import { container } from "tsyringe";

import { DomainEvent } from "@/domains/shared/DomainEvent/index.js";
import { IDomainEventPublisher } from "@/domains/shared/DomainEvent/IDomainEventPublisher.js";

import EventEmitterClient from "./EventEmmiterClient.js";

export class EventEmitterDomainEventPublisher implements IDomainEventPublisher {
  publish(domainEvent: DomainEvent): void {
    container
      .resolve(EventEmitterClient)
      .eventEmitter.emit(domainEvent.eventName, domainEvent);
  }
}
