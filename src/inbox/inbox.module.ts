import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { InboxService } from './inbox.service';
import { InboxController } from './inbox.controller';
import { InboxMessage } from './entities/inbox-message.entity';
import { Order } from './entities/order.entity';
import { InboxProcessor } from './inbox.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([InboxMessage, Order]),
    BullModule.registerQueue({
      name: 'inbox',
    }),
  ],
  controllers: [InboxController],
  providers: [InboxService, InboxProcessor],
})
export class InboxModule {}
