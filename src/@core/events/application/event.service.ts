import { IUnitOfWork } from '../../common/application/unit-of-work.interface';
import { EventSectionId } from '../domain/entities/event-section.entity';
import { EventSpotId } from '../domain/entities/event-spot.entity';
import { IEventRepository } from '../domain/repositories/event-repository.interface';
import { IPartnerRepository } from '../domain/repositories/partner-repository.interface';

export class EventService {
    constructor(
        private eventRepo: IEventRepository,
        private partnerRepo: IPartnerRepository,
        private uow: IUnitOfWork,
    ) { }


    async findSections(event_id: string) {
        const event = await this.eventRepo.findById(event_id);
        return event.sections;
    }

    async create(input: {
        name: string;
        description?: string | null;
        date: Date;
        partner_id: string;
    }) {
        const partner = await this.partnerRepo.findById(input.partner_id);
        if (!partner) {
            throw new Error('Partner not found');
        }

        const event = partner.initEvent({
            name: input.name,
            date: input.date,
            description: input.description,
        });

        this.eventRepo.add(event);
        await this.uow.commit();
        return event;
    }

    async update(
        id: string,
        input: { name?: string },
    ) {
        const event = await this.eventRepo.findById(id);

        if (!event) {
            throw new Error('Event not found');
        }

        input.name && event.changeName(input.name);

        this.eventRepo.add(event);
        await this.uow.commit();

        return event;
    }
}