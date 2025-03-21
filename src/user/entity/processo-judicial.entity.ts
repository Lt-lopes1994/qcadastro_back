import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RegisteredUser } from './user.entity';

@Entity()
export class ProcessoJudicial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numero: string;

  @Column({ nullable: true })
  dataNotificacao: Date;

  @Column({ nullable: true })
  tipo: string;

  @Column({ nullable: true })
  assuntoPrincipal: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  varaJulgadora: string;

  @Column({ nullable: true })
  tribunal: string;

  @Column({ nullable: true })
  tribunalLevel: string;

  @Column({ nullable: true })
  tribunalTipo: string;

  @Column({ nullable: true })
  tribunalCidade: string;

  @Column({ nullable: true })
  estado: string;

  @Column({ type: 'json', nullable: true })
  partes: any;

  @ManyToOne(() => RegisteredUser)
  @JoinColumn({ name: 'userId' })
  user: RegisteredUser;

  @Column()
  userId: number;
}
