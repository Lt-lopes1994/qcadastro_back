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
import { Portador } from '../../portador/entities/portador.entity';

@Entity('documentos_clicksign')
export class DocumentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  documentoKey: string;

  @Column()
  status: string; // 'pendente', 'assinado', 'expirado', etc.

  @ManyToOne(() => RegisteredUser)
  @JoinColumn({ name: 'userId' })
  user: RegisteredUser;

  @Column()
  userId: number;

  @ManyToOne(() => Portador, { nullable: true })
  @JoinColumn({ name: 'portadorId' })
  portador: Portador;

  @Column({ nullable: true })
  portadorId: number;

  @Column({ nullable: true })
  signUrl: string;

  @Column({ type: 'json', nullable: true })
  signatarios: any;

  @Column({ nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
