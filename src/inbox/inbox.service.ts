import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InboxMessage } from './entities/inbox-message.entity';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class InboxService {
  private logger = new Logger(InboxService.name);

  constructor(
    private dataSource: DataSource,
    @InjectQueue('inbox')
    private inboxQueue: Queue
  ) {}

  // @Cron('45 * * * * *')
  async enqueuePendingMessages(batchSize = 100): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log('Querying messages');
      const messages = await queryRunner.manager.query<InboxMessage[]>(
        `SELECT * FROM inbox_messages WHERE processed = false FOR UPDATE SKIP LOCKED LIMIT $1`,
        [batchSize]
      );

      if (messages.length < 1) {
        this.logger.log('Nothing to process...');
        return;
      }

      this.logger.log(`${messages.length} messages found`);
      for (const msg of messages) {
        await this.inboxQueue.add('processInboxMessage', {
          inboxId: msg.id,
          type: msg.type,
          payload: msg.payload,
        });
      }
      this.logger.log('Messages processed');
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error processing messages: ${err}`);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
