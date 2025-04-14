import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Portador } from '../../portador/entities/portador.entity';
import { Tutor } from '../../tutor/entities/tutor.entity';

@Entity()
export class Veiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  placa: string;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @Column()
  marcaModelo: string;

  @Column({ nullable: true })
  submodelo: string;

  @Column({ nullable: true })
  versao: string;

  @Column()
  ano: string;

  @Column()
  anoModelo: string;

  @Column({ nullable: true })
  chassi: string;

  @Column({ nullable: true })
  cor: string;

  @Column({ nullable: true })
  municipio: string;

  @Column({ nullable: true })
  uf: string;

  @Column({ nullable: true })
  origem: string;

  @Column({ nullable: true })
  situacao: string;

  @Column({ nullable: true })
  segmento: string;

  @Column({ nullable: true })
  subSegmento: string;

  @Column({ type: 'json', nullable: true })
  fipe: any;

  @Column({ type: 'json', nullable: true })
  extra: any;

  @ManyToOne(() => Portador)
  @JoinColumn({ name: 'portadorId' })
  portador: Portador;

  @Column()
  portadorId: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  tutorId: number;

  @ManyToOne(() => Tutor)
  @JoinColumn({ name: 'tutorId' })
  tutor: Tutor;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
