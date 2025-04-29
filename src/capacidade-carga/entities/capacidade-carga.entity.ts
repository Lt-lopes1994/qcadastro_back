import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Veiculo } from '../../cadastro-veiculo/entities/veiculo.entity';

@Entity()
export class CapacidadeCarga {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  larguraVaoPortaTraseira: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  alturaVaoPortaTraseira: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  profundidadeInternaBau: number;

  @Column({ default: false })
  temGanchos: boolean;

  @Column({ nullable: true })
  impeditivoInterno: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  tara: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  lotacao: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pesoBruto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  capacidadeTotalCarga: number;

  @OneToOne(() => Veiculo, (veiculo) => veiculo.capacidadeCarga)
  @JoinColumn({ name: 'veiculoId' })
  veiculo: Veiculo;

  @Column()
  veiculoId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
