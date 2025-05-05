import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { RegisteredUser } from '../../user/entity/user.entity';
import { Tutelado } from './tutelado.entity';
import { TutorEmpresa } from './tutor-empresa.entity';

export enum TutorStatus {
  PENDENTE = 'PENDENTE',
  APROVADO = 'APROVADO',
  REJEITADO = 'REJEITADO',
}

@Entity('tutores')
export class Tutor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'json', nullable: true })
  scoreCredito: any;

  @Column({
    type: 'enum',
    enum: TutorStatus,
    default: TutorStatus.PENDENTE,
  })
  status: TutorStatus;

  @Column({ type: 'float', nullable: true })
  scoreD00: number;

  @Column({ type: 'float', nullable: true })
  scoreD30: number;

  @Column({ type: 'float', nullable: true })
  scoreD60: number;

  @Column({ type: 'float', nullable: true })
  rendaIndividual: number;

  @Column({ type: 'float', nullable: true })
  rendaFamiliar: number;

  @Column({ type: 'float', nullable: true })
  rendaPresumida: number;

  @Column({ nullable: true })
  classeSocialPessoal: string;

  @Column({ nullable: true })
  classeSocialFamiliar: string;

  @Column({ type: 'boolean', default: false })
  scoreValido: boolean;

  @Column({ type: 'boolean', default: false })
  assinadoContrato: boolean;

  @Column({ nullable: true })
  dataAssinaturaContrato: Date;

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

  @OneToMany(() => Tutelado, (tutelado) => tutelado.tutor)
  tutelados: Tutelado[];

  @OneToMany(() => TutorEmpresa, (tutorEmpresa) => tutorEmpresa.tutor)
  empresaVinculos: TutorEmpresa[];
}
