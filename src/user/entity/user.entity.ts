import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
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

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column()
  role: string;

  @Column()
  isActive: boolean;

  @Column({ nullable: true })
  fotoPath: string;

  @CreateDateColumn()
  lgpdAcceptedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  processosFull: import('c:/Users/Bruno Mantovan Lopes/qcadastro_back/src/user/entity/processo-judicial.entity').ProcessoJudicial[];
}
