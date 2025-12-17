import { IDomainEventSubscriber } from "@/applications/shared/DomainEvent/IDomainEventSubscriber";
import { DomainEvent } from "@/domains/shared/DomainEvent";
import { container } from "tsyringe";
import EventEmitterClient from "./EventEmmiterClient";

export class EventEmitterDomainEventSubscriber
  implements IDomainEventSubscriber
{
  subscribe<T extends Record<string, unknown>>(
    eventName: string,
    callback: (event: DomainEvent<T>) => void,
  ): void {
    container
      .resolve(EventEmitterClient)
      .eventEmitter.once(eventName, callback);
  }
}
