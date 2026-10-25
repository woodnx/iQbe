import { DomainEvent } from "./index.js";

export interface IDomainEventPublisher {
  publish(domainEvent: DomainEvent): void;
}
