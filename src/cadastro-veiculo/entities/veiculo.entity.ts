import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Portador } from '../../portador/entities/portador.entity';
import { Tutor } from '../../tutor/entities/tutor.entity';
import { Tutelado } from '../../tutor/entities/tutelado.entity';
import { CapacidadeCarga } from '../../capacidade-carga/entities/capacidade-carga.entity';

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

  // Campos para documentos
  @Column({ nullable: true })
  crlvImagePath: string;

  @Column({ nullable: true })
  anttImagePath: string;

  // Campos para fotos do veículo
  @Column({ nullable: true })
  fotoFrentePath: string;

  @Column({ nullable: true })
  fotoTrasPath: string;

  @Column({ nullable: true })
  fotoLateralEsquerdaPath: string;

  @Column({ nullable: true })
  fotoLateralDireitaPath: string;

  @Column({ nullable: true })
  fotoTrasAbertoPath: string;

  @Column({ nullable: true })
  fotoBauFechadoPath: string; // Para caminhões

  @Column({ nullable: true })
  fotoBauAbertoPath: string; // Para caminhões

  // Novos campos de ativo/inativo
  @Column({ default: true })
  ativo: boolean;

  @Column({ nullable: true })
  motivoDesativacao: string;

  @Column({ nullable: true, type: 'timestamp' })
  inativadoEm: Date;

  // Relação com capacidade de carga
  @OneToOne(
    () => CapacidadeCarga,
    (capacidadeCarga) => capacidadeCarga.veiculo,
    {
      cascade: true,
      nullable: true,
    },
  )
  capacidadeCarga: CapacidadeCarga;

  // Relação obrigatória com o tutor que cadastrou
  @ManyToOne(() => Tutor, { nullable: false })
  @JoinColumn({ name: 'tutorId' })
  tutor: Tutor;

  @Column()
  tutorId: number;

  // Relação com o tutelado designado (opcional)
  @ManyToOne(() => Tutelado, (tutelado) => tutelado.veiculosDesignados, {
    nullable: true,
  })
  @JoinColumn({ name: 'tuteladoDesignadoId' })
  tuteladoDesignado: Tutelado;

  @Column({ nullable: true })
  tuteladoDesignadoId: number | null;

  // Mantendo a relação com portador por compatibilidade, mas pode ser opcional agora
  @ManyToOne(() => Portador, { nullable: true })
  @JoinColumn({ name: 'portadorId' })
  portador: Portador;

  @Column({ nullable: true })
  portadorId: number;

  // Campo para armazenar o userId do cadastrante, para fins de auditoria
  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
