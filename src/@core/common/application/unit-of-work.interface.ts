import { AggregateRoot } from '../domain/aggregate-root';

export interface IUnitOfWork {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}