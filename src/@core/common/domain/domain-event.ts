import { ValueObject } from './value-objects/value-objects';

export interface IDomainEvent {
  aggregate_id: ValueObject;
  occurred_on: Date;
  event_version: number;
}