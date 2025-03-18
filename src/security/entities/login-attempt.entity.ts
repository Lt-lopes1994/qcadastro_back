import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class LoginAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ipAddress: string;

  @Column({ nullable: true })
  username: string;

  @Column()
  successful: boolean;

  @CreateDateColumn()
  attemptedAt: Date;
}
