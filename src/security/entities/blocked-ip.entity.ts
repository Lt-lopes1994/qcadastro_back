import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class BlockedIp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ipAddress: string;

  @Column()
  reason: string;

  @CreateDateColumn()
  blockedAt: Date;

  @Column()
  expiresAt: Date;
}
