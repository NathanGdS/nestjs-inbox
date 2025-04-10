import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { InboxMessage } from './entities/inbox-message.entity';
import { Order } from './entities/order.entity';
import { Logger } from '@nestjs/common';

@Processor('inbox')
export class InboxProcessor extends WorkerHost {
  private logger = new Logger(InboxProcessor.name);

  constructor(private dataSource: DataSource) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log('Processing message');
    const { inboxId, type, payload } = job.data;

    await this.dataSource.transaction(async (manager) => {
      const inboxRepo = manager.getRepository(InboxMessage);
      const inbox = await inboxRepo.findOneBy({ id: inboxId });

      if (!inbox || inbox.processed) return;

      if (type === 'order_created') {
        await manager.insert(Order, {
          customerName: payload.customerName,
          product: payload.product,
        });
        this.logger.log('Order inserted successfully');
      }

      inbox.processed = true;
      await inboxRepo.save(inbox);
    });
  }

  @OnWorkerEvent('failed')
  onError(job: Job, error: Error) {
    console.error(`Job ${job.id} failed:`, error);
  }

  @OnWorkerEvent('completed')
  onComplete(job: Job) {
    console.log(`Job ${job.id} completed successfully.`);
  }
}
