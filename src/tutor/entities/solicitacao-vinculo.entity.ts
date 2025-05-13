import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tutor } from './tutor.entity';
import { Tutelado } from './tutelado.entity';
import { StatusSolicitacao } from './status-solicitacao.enum';

@Entity('solicitacoes_vinculo')
export class SolicitacaoVinculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tutorId: number;

  @Column()
  tuteladoId: number;

  @Column({
    type: 'enum',
    enum: StatusSolicitacao,
    default: StatusSolicitacao.PENDENTE,
  })
  status: StatusSolicitacao;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dataSolicitacao: Date;

  @Column({ nullable: true })
  dataProcessamento: Date;

  @ManyToOne(() => Tutor)
  @JoinColumn({ name: 'tutorId' })
  tutor: Tutor;

  @ManyToOne(() => Tutelado)
  @JoinColumn({ name: 'tuteladoId' })
  tutelado: Tutelado;
}
