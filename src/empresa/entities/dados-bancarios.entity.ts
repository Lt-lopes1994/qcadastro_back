import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Empresa } from './empresa.entity';
import { RegisteredUser } from '../../user/entity/user.entity';

@Entity()
export class DadosBancarios {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  apelidoConta: string;

  @Column()
  condicaoVencimento: string;

  @Column()
  condicaoPagamento: string;

  @Column()
  nomeBanco: string;

  @Column()
  agencia: string;

  @Column()
  tipoConta: string;

  @Column()
  numeroConta: string;

  @Column()
  digitoVerificador: string;

  @Column()
  chavePix: string;

  @ManyToOne(() => RegisteredUser)
  @JoinColumn({ name: 'userId' })
  user: RegisteredUser;

  @Column()
  userId: number;

  @OneToOne(() => Empresa, (empresa) => empresa.dadosBancarios)
  @JoinColumn()
  empresa: Empresa;
}
