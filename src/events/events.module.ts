import { EntityManager } from '@mikro-orm/mysql';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, OnModuleInit } from '@nestjs/common';
import { CustomerMysqlRepository } from '../@core/events/infra/db/repositories/customer-mysql.repository';
import { EventMysqlRepository } from '../@core/events/infra/db/repositories/event-mysql.repository';
import { OrderMysqlRepository } from '../@core/events/infra/db/repositories/order-mysql.repository';
import { PartnerMysqlRepository } from '../@core/events/infra/db/repositories/partner-mysql.repository';
import { SpotReservationMysqlRepository } from '../@core/events/infra/db/repositories/spot-reservation-mysql.repository';
import {
    CustomerSchema,
    EventSchema,
    EventSectionSchema,
    EventSpotSchema,
    OrderSchema,
    PartnerSchema,
    SpotReservationSchema,
} from '../@core/events/infra/db/schemas';
import { PaymentGateway } from '../@core/events/application/payment.gateway';
import { OrderService } from '../@core/events/application/order.service';
import { EventService } from '../@core/events/application/event.service';
import { CustomerService } from '../@core/events/application/customer.service';
import { PartnerService } from '../@core/events/application/partner.service';
import { IPartnerRepository } from '../@core/events/domain/repositories/partner-repository.interface';
import { IUnitOfWork } from '../@core/common/application/unit-of-work.interface';
import { ICustomerRepository } from '../@core/events/domain/repositories/customer-repository.interface';
import { IEventRepository } from '../@core/events/domain/repositories/event-repository.interface';
import { PartnersController } from './partners/partners.controller';
import { CustomersController } from './customers/customers.controller';
import { OrdersController } from './orders/orders.controller';
import { EventsController } from './events/events.controller';
import { EventSectionsController } from './events/event-sections.controller';
import { EventSpotsController } from './events/event-spots.controller';
import { ApplicationModule } from '../application/application.module';
import { ApplicationService } from '../@core/common/application/application.service';
import { DomainEventManager } from '../@core/common/domain/domain-event-manager';
import { PartnerCreated } from '../@core/events/domain/domain-events/partner-created.event';
import { MyHandlerHandler } from '../@core/events/application/handlers/my-handler.handler';
import { ModuleRef } from '@nestjs/core';

@Module({
    imports: [
        MikroOrmModule.forFeature([
            CustomerSchema,
            PartnerSchema,
            EventSchema,
            EventSectionSchema,
            EventSpotSchema,
            OrderSchema,
            SpotReservationSchema,
        ]),
        ApplicationModule
    ],
    providers: [
        {
            provide: 'IPartnerRepository',
            useFactory: (em: EntityManager) => new PartnerMysqlRepository(em),
            inject: [EntityManager],
        },
        {
            provide: 'ICustomerRepository',
            useFactory: (em: EntityManager) => new CustomerMysqlRepository(em),
            inject: [EntityManager],
        },
        {
            provide: 'IEventRepository',
            useFactory: (em: EntityManager) => new EventMysqlRepository(em),
            inject: [EntityManager],
        },
        {
            provide: 'IOrderRepository',
            useFactory: (em: EntityManager) => new OrderMysqlRepository(em),
            inject: [EntityManager],
        },
        {
            provide: 'ISpotReservationRepository',
            useFactory: (em: EntityManager) => new SpotReservationMysqlRepository(em),
            inject: [EntityManager],
        },
        {
            provide: PartnerService,
            useFactory: (
                partnerRepo: IPartnerRepository,
                appService: ApplicationService,
            ) => new PartnerService(partnerRepo, appService),
            inject: ['IPartnerRepository', ApplicationService],
        },
        {
            provide: CustomerService,
            useFactory: (
                customerRepo: ICustomerRepository,
                uow: IUnitOfWork
            ) => new CustomerService(customerRepo, uow),
            inject: ['ICustomerRepository', 'IUnitOfWork'],
        },
        {
            provide: EventService,
            useFactory: (
                eventRepo: IEventRepository,
                partnerRepo: IPartnerRepository,
                uow: IUnitOfWork
            ) =>
                new EventService(eventRepo, partnerRepo, uow),
            inject: ['IEventRepository', 'IPartnerRepository', 'IUnitOfWork'],
        },
        PaymentGateway,
        {
            provide: OrderService,
            useFactory: (
                orderRepo,
                customerRepo,
                eventRepo,
                spotReservationRepo,
                uow,
                paymentGateway,
            ) =>
                new OrderService(
                    orderRepo,
                    customerRepo,
                    eventRepo,
                    spotReservationRepo,
                    uow,
                    paymentGateway,
                ),
            inject: [
                'IOrderRepository',
                'ICustomerRepository',
                'IEventRepository',
                'ISpotReservationRepository',
                'IUnitOfWork',
                PaymentGateway,
            ],
        },
        {
            provide: MyHandlerHandler,
            useFactory: (
                partnerRepo: IPartnerRepository,
                domainEventManager: DomainEventManager,
            ) => new MyHandlerHandler(partnerRepo, domainEventManager),
            inject: ['IPartnerRepository', DomainEventManager],
        },
    ],
    controllers: [
        PartnersController,
        CustomersController,
        EventsController,
        EventSectionsController,
        EventSpotsController,
        OrdersController,
    ],
})
export class EventsModule implements OnModuleInit {

    constructor(
        private readonly domainEventManager: DomainEventManager,
        private moduleRef: ModuleRef
    ) { }

    onModuleInit() {
        MyHandlerHandler.listensTo().forEach((eventName: string) => {
            this.domainEventManager.register(
                eventName,
                async (event) => {
                    const handler: MyHandlerHandler = await this.moduleRef.resolve(
                        MyHandlerHandler,
                    )
                    await handler.handle(event)
                },
            );
        })
    }
}