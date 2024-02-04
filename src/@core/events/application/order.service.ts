import { IUnitOfWork } from '../../common/application/unit-of-work.interface';
import { ICustomerRepository } from '../domain/repositories/customer-repository.interface';
import { IEventRepository } from '../domain/repositories/event-repository.interface';
import { IOrderRepository } from '../domain/repositories/order-repository.interface';
import { ISpotReservationRepository } from '../domain/repositories/spot-reservation-repository.interface';

export class OrderService {
  constructor(
    private orderRepo: IOrderRepository,
    private customerRepo: ICustomerRepository,
    private eventRepo: IEventRepository,
    private spotReservationRepo: ISpotReservationRepository,
    private uow: IUnitOfWork,
  ) {}

  list() {
    return this.orderRepo.findAll();
  }

  async create(input: {
    name: string,
    cpf: string
  }) {
  }
}