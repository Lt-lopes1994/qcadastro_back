import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SystemLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column()
  entity: string;

  @Column({ nullable: true })
  entityId: string;

  @Column({ nullable: true })
  userId: number;

  @Column({ type: 'json', nullable: true })
  details: any;

  @Column()
  status: string;

  @Column({ nullable: true })
  errorMessage: string;

  @Column()
  createdAt: Date;
}
