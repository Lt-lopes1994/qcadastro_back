import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { RegisteredUser } from '../../user/entity/user.entity';
import { Tutor } from './tutor.entity';
import { Veiculo } from '../../cadastro-veiculo/entities/veiculo.entity';

export enum TuteladoStatus {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

@Entity('tutelados')
export class Tutelado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  tutorId: number;

  @Column({ nullable: true })
  veiculoDesignadoId: number;

  @Column({
    type: 'enum',
    enum: TuteladoStatus,
    default: TuteladoStatus.ATIVO,
  })
  status: TuteladoStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => RegisteredUser)
  @JoinColumn({ name: 'userId' })
  user: RegisteredUser;

  @ManyToOne(() => Tutor, (tutor) => tutor.tutelados)
  @JoinColumn({ name: 'tutorId' })
  tutor: Tutor;

  @OneToOne(() => Veiculo)
  @JoinColumn({ name: 'veiculoDesignadoId' })
  veiculoDesignado: Veiculo;
}
