import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum TipoAcao {
  DESIGNACAO_VEICULO = 'DESIGNACAO_VEICULO',
  REMOCAO_DESIGNACAO = 'REMOCAO_DESIGNACAO',
  VINCULO_SOLICITADO = 'VINCULO_SOLICITADO',
  VINCULO_ACEITO = 'VINCULO_ACEITO',
  VINCULO_RECUSADO = 'VINCULO_RECUSADO',
  DESIGNACAO_CARRETA = 'DESIGNACAO_CARRETA',
  REMOCAO_CARRETA = 'REMOCAO_CARRETA',
  VEICULO_ATIVADO = 'VEICULO_ATIVADO',
  VEICULO_DESATIVADO = 'VEICULO_DESATIVADO',
  OUTRO = 'OUTRO',
}

@Entity('auditoria_acoes')
export class AuditoriaAcao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: TipoAcao,
    default: TipoAcao.OUTRO,
  })
  tipoAcao: TipoAcao;

  @Column()
  entidadeOrigemTipo: string;

  @Column()
  entidadeOrigemId: number;

  @Column()
  entidadeDestinoTipo: string;

  @Column()
  entidadeDestinoId: number;

  @Column()
  usuarioId: number;

  @CreateDateColumn()
  dataAcao: Date;

  @Column({ type: 'json', nullable: true })
  dadosAnteriores: any;

  @Column({ type: 'json', nullable: true })
  dadosPosteriores: any;

  @Column({ type: 'text', nullable: true })
  observacao: string;
}
