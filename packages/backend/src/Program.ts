import { container, Lifecycle } from "tsyringe";
import KyselyClientManager from "./interfaces/infra/kysely/KyselyClientManager";
import { EventEmitterDomainEventPublisher } from "./interfaces/infra/DomainEvent/EventEmitterDomainEventPublisher";
import { EventEmitterDomainEventSubscriber } from "./interfaces/infra/DomainEvent/EventEmitterDomainEventSubscriber";

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
