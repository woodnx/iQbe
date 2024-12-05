import { container } from 'tsyringe';

import { DomainEvent } from '@/domains/shared/DomainEvent';
import { IDomainEventPublisher } from '@/domains/shared/DomainEvent/IDomainEventPublisher';

import EventEmitterClient from './EventEmmiterClient';

export class EventEmitterDomainEventPublisher implements IDomainEventPublisher {
  publish(domainEvent: DomainEvent): void {
    container
    .resolve(EventEmitterClient)
    .eventEmitter.emit(domainEvent.eventName, domainEvent);
  }
}