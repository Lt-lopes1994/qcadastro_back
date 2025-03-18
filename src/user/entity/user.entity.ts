import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cpf: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  cpfStatus: string;

  @Column()
  cpfVerificationUrl: string;

  @Column()
  email: string;

  @Column()
  emailVerificationCode: string;

  @Column()
  emailVerified: boolean;

  @Column()
  phoneNumber: string;

  @Column()
  phoneVerificationCode: string;

  @Column()
  phoneVerified: boolean;

  @Column()
  password: string;

  @CreateDateColumn()
  lgpdAcceptedAt: Date;
}
