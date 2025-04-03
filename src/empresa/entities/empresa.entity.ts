// src/empresa/entities/empresa.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DadosBancarios } from './dados-bancarios.entity';
import { RegisteredUser } from '../../user/entity/user.entity';

@Entity()
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  cnpj: string;

  @Column()
  razaoSocial: string;

  @Column()
  nomeFantasia: string;

  @Column()
  naturezaJuridica: string;

  @Column()
  logradouro: string;

  @Column()
  numero: string;

  @Column({ nullable: true })
  complemento: string;

  @Column()
  bairro: string;

  @Column()
  municipio: string;

  @Column()
  cep: string;

  @Column()
  uf: string;

  @Column()
  email: string;

  @Column()
  telefone: string;

  @Column()
  situacaoCadastral: string;

  @Column()
  dataInicioAtividade: string;

  @Column()
  atividadeEconomica: string;

  @Column()
  porte: string;

  @Column({ default: 0 })
  capitalSocial: string;

  @Column({ nullable: true })
  urlComprovante: string;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  logoPath: string | null;

  @ManyToOne(() => RegisteredUser)
  @JoinColumn({ name: 'userId' })
  user: RegisteredUser;

  @Column()
  userId: number;

  @OneToOne(() => DadosBancarios, (dadosBancarios) => dadosBancarios.empresa, {
    cascade: true,
  })
  dadosBancarios: DadosBancarios;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
