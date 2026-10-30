import { IDomainEventSubscriber } from "@/applications/shared/DomainEvent/IDomainEventSubscriber.js";
import { DomainEvent } from "@/domains/shared/DomainEvent/index.js";
import { container } from "tsyringe";
import EventEmitterClient from "./EventEmmiterClient.js";

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
