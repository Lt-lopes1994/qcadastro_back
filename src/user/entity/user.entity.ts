import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class RegisteredUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  cpf: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  cpfStatus: string;

  @Column()
  cpfVerificationUrl: string;

  @Column({ unique: true })
  email: string;

  @Column()
  emailVerificationCode: string;

  @Column()
  emailVerified: boolean;

  @Column({ unique: true })
  phoneNumber: string;

  @Column()
  phoneVerificationCode: string;

  @Column()
  phoneVerified: boolean;

  @Column()
  password: string;

  @Column()
  passwordResetToken: string;

  @Column()
  role: string;

  @Column()
  isActive: boolean;

  @CreateDateColumn()
  lgpdAcceptedAt: Date;
}
