import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Veiculo } from './veiculo.entity';

@Entity()
export class Equipamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  tipo: string; // Ex: "Reboque", "Implemento", etc.

  @Column({ nullable: true })
  descricao: string;

  @Column({ nullable: true })
  numeroSerie: string;

  @Column({ nullable: true })
  marca: string;

  @Column({ nullable: true })
  modelo: string;

  @Column({ nullable: true })
  anoFabricacao: string;

  // Caminho para imagens do equipamento
  @Column({ type: 'json', nullable: true })
  imagensPaths: string[];

  // Relação com o veículo
  @ManyToOne(() => Veiculo)
  @JoinColumn({ name: 'veiculoId' })
  veiculo: Veiculo;

  @Column()
  veiculoId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
