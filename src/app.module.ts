import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { CustomerSchema, EventSchema, EventSectionSchema, EventSpotSchema, OrderSchema, PartnerSchema, SpotReservationSchema } from "./@core/events/infra/db/schemas";

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
  ],
  
})
export class EventsModule {}