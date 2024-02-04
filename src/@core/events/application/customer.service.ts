import { Customer } from '../domain/entities/customer.entity';
import { ICustomerRepository } from '../domain/repositories/customer-repository.interface';

export class CustomerService {
  constructor(
    private customerRepo: ICustomerRepository,
  ) {}

  list() {
    return this.customerRepo.findAll();
  }

  async register(input: { name: string; cpf: string }) {
    const customer = Customer.create(input);
    this.customerRepo.add(customer);
    return customer;
  }
}