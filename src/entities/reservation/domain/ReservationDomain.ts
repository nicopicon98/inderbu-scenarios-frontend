import { PaginatedReservations, PaginationQuery } from '../model/types';

// DDD: Repository abstraction (Domain layer)
export interface ReservationRepository {
  /**
   * Find reservations by user ID with pagination
   */
  findByUserId(
    userId: number, 
    pagination: PaginationQuery
  ): Promise<PaginatedReservations>;

  /**
   * Find a single reservation by ID
   */
  findById(reservationId: number): Promise<any>;

  /**
   * Cancel a reservation
   */
  cancel(reservationId: number, reason?: string): Promise<void>;

  /**
   * Create a new reservation
   */
  create(reservationData: any): Promise<any>;
}

// DDD: Domain events
export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor() {
    this.occurredOn = new Date();
    this.eventId = crypto.randomUUID();
  }
}

export class ReservationsAccessedEvent extends DomainEvent {
  constructor(
    public readonly userId: number,
    public readonly accessedBy: number,
    public readonly reservationCount: number
  ) {
    super();
  }
}

export class ReservationCancelledEvent extends DomainEvent {
  constructor(
    public readonly reservationId: number,
    public readonly userId: number,
    public readonly cancelledBy: number,
    public readonly reason?: string
  ) {
    super();
  }
}

export class ReservationCreatedEvent extends DomainEvent {
  constructor(
    public readonly reservationId: number,
    public readonly userId: number,
    public readonly scenarioId: number,
    public readonly date: string,
    public readonly timeSlot: string
  ) {
    super();
  }
}

// DDD: Event bus abstraction
export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe<T extends DomainEvent>(
    eventType: new (...args: any[]) => T,
    handler: (event: T) => Promise<void>
  ): void;
}
