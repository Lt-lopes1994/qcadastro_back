import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('netrin_request_logs')
export class NetrinRequestLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @Index()
  userId: number;

  @Column()
  @Index()
  endpointType: string;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  parameter: string;

  @CreateDateColumn()
  @Index()
  timestamp: Date;

  @Column({ default: true })
  success: boolean;

  @Column({ type: 'int', default: 1 })
  month: number;

  @Column({ type: 'int', default: 2023 })
  year: number;
}
