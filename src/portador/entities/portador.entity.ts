import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RegisteredUser } from '../../user/entity/user.entity';

@Entity()
export class Portador {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cnhNumero: string;

  @Column()
  cnhCategoria: string;

  @Column()
  cnhValidade: Date;

  @Column()
  cnhImagemPath: string;

  @Column({ nullable: true })
  anttImagemPath: string;

  @Column({ nullable: true })
  anttNumero: string;

  @Column({ nullable: true })
  anttValidade: Date;

  @Column({ default: 'PENDENTE' })
  status: string; // PENDENTE, APROVADO, REJEITADO

  @Column({ nullable: true })
  motivoRejeicao: string;

  @ManyToOne(() => RegisteredUser)
  @JoinColumn({ name: 'userId' })
  user: RegisteredUser;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
