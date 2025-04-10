import {
  Controller,
  Post,
  Body,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InboxMessage } from './entities/inbox-message.entity';
import { createHash } from 'crypto';

@Controller('inbox')
export class InboxController {
  private readonly logger = new Logger(InboxController.name);

  constructor(
    @InjectRepository(InboxMessage)
    private inboxRepo: Repository<InboxMessage>
  ) {}

  @Post()
  async receiveEvent(
    @Body() body: { type: string; payload: any }
  ): Promise<{ status: string }> {
    const { type, payload } = body;

    const eventHash = createHash('sha256')
      .update(type + JSON.stringify(payload))
      .digest('hex');

    try {
      const inbox = new InboxMessage();
      inbox.payload = payload;
      inbox.type = type;
      inbox.eventHash = eventHash;
      await this.inboxRepo.save(inbox);

      this.logger.log(`📥 Event ${type} enqueued successfully`);
    } catch (err) {
      if (err.code === '23505') {
        this.logger.warn(`⚠️ Duplicate event detected (hash: ${eventHash})`);
        throw new ConflictException('Duplicate event');
      }

      this.logger.error('❌ Failed to insert inbox message', err.stack);
      throw err;
    }

    return { status: 'queued' };
  }
}
