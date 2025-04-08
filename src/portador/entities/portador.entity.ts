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

  @Column({ unique: true })
  cnhNumero: string;

  @Column()
  cnhCategoria: string;

  @Column()
  cnhValidade: Date;

  @Column()
  cnhImagemPath: string;

  @Column({ nullable: true })
  anttImagemPath: string;

  @Column({ nullable: true, unique: true })
  anttNumero: string;

  @Column({ nullable: true })
  anttValidade: Date;

  @Column({ nullable: true })
  cnhRenach: string;

  @Column({ nullable: true })
  cnhPrimeira: Date;

  @Column({ nullable: true })
  cnhEmissao: Date;

  @Column({ nullable: true })
  cnhNumeroRegistro: string;

  @Column({ nullable: true })
  cnhObservacao: string;

  @Column({ type: 'json', nullable: true })
  cnhToxicologico: any;

  @Column({ nullable: true })
  cnhTelefone: string;

  @Column({ nullable: true })
  cnhEndereco: string;

  @Column({ nullable: true })
  cnhEmail: string;

  @Column({ nullable: true })
  dataNascimento: Date;

  @Column({ type: 'json', nullable: true })
  cnhBloqueios: any;

  @Column({ nullable: true })
  nomeCompleto: string;

  @Column({ nullable: true })
  nomeMae: string;

  @Column({ nullable: true })
  nomePai: string;

  @Column({ nullable: true })
  cpf: string;

  @Column({ nullable: true })
  numeroRG: string;

  @Column({ nullable: true })
  estadoRG: string;

  @Column({ nullable: true })
  expeditorRG: string;

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
