import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('inbox_messages')
@Index(['eventHash'], { unique: true })
export class InboxMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column('jsonb')
  payload: any;

  @Column()
  eventHash: string;

  @Column({ default: false })
  processed: boolean;

  @CreateDateColumn()
  receivedAt: Date;
}
