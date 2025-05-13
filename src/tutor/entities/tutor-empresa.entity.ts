import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tutor } from './tutor.entity';
import { Empresa } from '../../empresa/entities/empresa.entity';

@Entity('tutor_empresas')
export class TutorEmpresa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tutorId: number;

  @Column()
  empresaId: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tutor, (tutor) => tutor.empresaVinculos)
  @JoinColumn({ name: 'tutorId' })
  tutor: Tutor;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresaId' })
  empresa: Empresa;
}
