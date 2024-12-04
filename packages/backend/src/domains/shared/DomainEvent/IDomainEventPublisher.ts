import { DomainEvent } from ".";

export interface IDomainEventPublisher {
  publish(domainEvent: DomainEvent): void,
}