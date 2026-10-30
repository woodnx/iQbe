import { container, Lifecycle } from "tsyringe";
import { EventEmitterDomainEventPublisher } from "./interfaces/infra/DomainEvent/EventEmitterDomainEventPublisher.js";
import { EventEmitterDomainEventSubscriber } from "./interfaces/infra/DomainEvent/EventEmitterDomainEventSubscriber.js";
import KyselyClientManager from "./interfaces/infra/kysely/KyselyClientManager.js";

container.register(
  "IDataAccessClientManager",
  {
    useClass: KyselyClientManager,
  },
  {
    lifecycle: Lifecycle.ResolutionScoped,
  },
);

// DomainEvent
container.register("IDomainEventPublisher", {
  useClass: EventEmitterDomainEventPublisher,
});

container.register("IDomainEventSubscriber", {
  useClass: EventEmitterDomainEventSubscriber,
});
