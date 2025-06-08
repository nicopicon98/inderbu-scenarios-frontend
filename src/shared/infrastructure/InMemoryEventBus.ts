import { DomainEvent, EventBus } from '@/entities/reservation/domain/reservation.domain';

// DDD: Simple in-memory event bus implementation
export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Array<(event: any) => Promise<void>>>();

  async publish(event: DomainEvent): Promise<void> {
    const eventType = event.constructor.name;
    const eventHandlers = this.handlers.get(eventType) || [];

    // Execute all handlers for this event type
    const promises = eventHandlers.map(handler =>
      handler(event).catch(error =>
        console.error(`Error handling event ${eventType}:`, error)
      )
    );

    await Promise.all(promises);

    // Simple logging for development
    console.log(`Domain Event: ${eventType}`, {
      ...event
    });
  }

  subscribe<T extends DomainEvent>(
    eventType: new (...args: any[]) => T,
    handler: (event: T) => Promise<void>
  ): void {
    const eventTypeName = eventType.name;

    if (!this.handlers.has(eventTypeName)) {
      this.handlers.set(eventTypeName, []);
    }

    this.handlers.get(eventTypeName)!.push(handler);
  }

  // Utility method to clear all handlers (useful for testing)
  clear(): void {
    this.handlers.clear();
  }
}

// Factory function
export function createInMemoryEventBus(): EventBus {
  return new InMemoryEventBus();
}

// Re-export EventBus for convenience
export type { EventBus } from '@/entities/reservation/domain/reservation.domain';
