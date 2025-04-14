/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutor, TutorStatus } from './entities/tutor.entity';
import { Tutelado, TuteladoStatus } from './entities/tutelado.entity';
import { CreateTutorDto, TipoUsuario } from './dto/create-tutor.dto';
import { VincularTuteladoDto } from './dto/vincular-tutelado.dto';
import { RegisteredUser } from '../user/entity/user.entity';

@Injectable()
export class TutorService {
  constructor(
    @InjectRepository(Tutor)
    private tutorRepository: Repository<Tutor>,
    @InjectRepository(Tutelado)
    private tuteladoRepository: Repository<Tutelado>,
    @InjectRepository(RegisteredUser)
    private userRepository: Repository<RegisteredUser>,
  ) {}

  async cadastrarUsuario(
    userId: number,
    createTutorDto: CreateTutorDto,
  ): Promise<Tutor | Tutelado> {
    // Verificar se usuário existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verifica se o usuário já é um tutor ou tutelado
    const tutorExistente = await this.tutorRepository.findOne({
      where: { userId },
    });
    const tuteladoExistente = await this.tuteladoRepository.findOne({
      where: { userId },
    });

    if (tutorExistente && createTutorDto.tipo === TipoUsuario.TUTOR) {
      throw new BadRequestException('Usuário já está cadastrado como tutor');
    }

    if (tuteladoExistente && createTutorDto.tipo === TipoUsuario.TUTELADO) {
      throw new BadRequestException('Usuário já está cadastrado como tutelado');
    }

    // Processar como tutor
    if (createTutorDto.tipo === TipoUsuario.TUTOR) {
      if (!createTutorDto.scoreCredito) {
        throw new BadRequestException(
          'É necessário fornecer o scoreCredito para cadastrar um tutor',
        );
      }

      const scoreData =
        createTutorDto.scoreCredito.scoreCreditoRendaPresumidaPFSimplificado;

      // Verificar se o score é válido (pode ser customizado conforme necessidade)
      const scoreValido =
        scoreData && scoreData.scoreCredito && scoreData.scoreCredito.D00 > 500; // exemplo de validação

      const tutor = new Tutor();
      tutor.userId = userId;
      tutor.scoreCredito = createTutorDto.scoreCredito;
      tutor.status = scoreValido ? TutorStatus.APROVADO : TutorStatus.PENDENTE;
      tutor.scoreValido = scoreValido;

      // Extrair informações do score
      if (scoreData && scoreData.scoreCredito) {
        tutor.scoreD00 = scoreData.scoreCredito.D00;
        tutor.scoreD30 = scoreData.scoreCredito.D30;
        tutor.scoreD60 = scoreData.scoreCredito.D60;
      }

      if (scoreData && scoreData.renda) {
        tutor.rendaIndividual = scoreData.renda.individual;
        tutor.rendaFamiliar = scoreData.renda.familiar;
        tutor.rendaPresumida = scoreData.renda.presumido;
        tutor.classeSocialPessoal =
          scoreData.renda.classeSocialPessoal?.toString();
        tutor.classeSocialFamiliar =
          scoreData.renda.classeSocialFamiliar?.toString();
      }

      // Atualizar o papel do usuário
      if (user.role !== 'admin') {
        user.role = 'tutor';
        await this.userRepository.save(user);
      }

      return await this.tutorRepository.save(tutor);
    }
    // Processar como tutelado
    else {
      const tutelado = new Tutelado();
      tutelado.userId = userId;
      tutelado.status = TuteladoStatus.ATIVO;

      // Como o tutelado precisa ter um tutor, deixamos o campo tutorId como null
      // até que ele seja vinculado a um tutor através de outro endpoint

      // Atualizar o papel do usuário
      if (user.role !== 'admin') {
        user.role = 'tutelado';
        await this.userRepository.save(user);
      }

      return await this.tuteladoRepository.save(tutelado);
    }
  }

  async vincularTutelado(
    tutorId: number,
    vincularDto: VincularTuteladoDto,
  ): Promise<Tutelado> {
    // Verificar se o tutor existe
    const tutor = await this.tutorRepository.findOne({
      where: { id: tutorId },
    });
    if (!tutor) {
      throw new NotFoundException(`Tutor com ID ${tutorId} não encontrado`);
    }

    // Verificar se o tutor está aprovado
    if (tutor.status !== TutorStatus.APROVADO) {
      throw new BadRequestException(
        'Apenas tutores aprovados podem vincular tutelados',
      );
    }

    // Verificar se o tutelado existe
    const tutelado = await this.tuteladoRepository.findOne({
      where: { id: vincularDto.tuteladoId },
    });

    if (!tutelado) {
      throw new NotFoundException(
        `Tutelado com ID ${vincularDto.tuteladoId} não encontrado`,
      );
    }

    // Verificar se o tutelado já tem um tutor ativo
    if (tutelado.tutorId && tutelado.status === TuteladoStatus.ATIVO) {
      throw new BadRequestException('Este tutelado já possui um tutor ativo');
    }

    // Vincular o tutelado ao tutor
    tutelado.tutorId = tutorId;
    tutelado.status = TuteladoStatus.ATIVO;

    return await this.tuteladoRepository.save(tutelado);
  }

  async desvincularTutelado(
    tutorId: number,
    tuteladoId: number,
  ): Promise<Tutelado> {
    // Verificar se o tutor existe
    const tutor = await this.tutorRepository.findOne({
      where: { id: tutorId },
    });
    if (!tutor) {
      throw new NotFoundException(`Tutor com ID ${tutorId} não encontrado`);
    }

    // Verificar se o tutelado existe e está vinculado ao tutor
    const tutelado = await this.tuteladoRepository.findOne({
      where: { id: tuteladoId, tutorId },
    });

    if (!tutelado) {
      throw new NotFoundException(
        `Tutelado com ID ${tuteladoId} não encontrado ou não está vinculado a este tutor`,
      );
    }

    // Desvincular o tutelado
    tutelado.status = TuteladoStatus.INATIVO;

    return await this.tuteladoRepository.save(tutelado);
  }

  async findTutorByUserId(userId: number): Promise<Tutor> {
    const tutor = await this.tutorRepository.findOne({
      where: { userId },
      relations: ['tutelados', 'tutelados.user'],
    });

    if (!tutor) {
      throw new NotFoundException(`Usuário com ID ${userId} não é um tutor`);
    }

    return tutor;
  }

  async findTuteladoByUserId(userId: number): Promise<Tutelado> {
    const tutelado = await this.tuteladoRepository.findOne({
      where: { userId },
      relations: ['tutor', 'tutor.user'],
    });

    if (!tutelado) {
      throw new NotFoundException(`Usuário com ID ${userId} não é um tutelado`);
    }

    return tutelado;
  }

  async listarTutelados(tutorId: number): Promise<Tutelado[]> {
    // Verificar se o tutor existe
    const tutor = await this.tutorRepository.findOne({
      where: { id: tutorId },
      relations: ['tutelados', 'tutelados.user'],
    });

    if (!tutor) {
      throw new NotFoundException(`Tutor com ID ${tutorId} não encontrado`);
    }

    return tutor.tutelados;
  }

  async listarTodosTutores(): Promise<Tutor[]> {
    return await this.tutorRepository.find({
      relations: ['user', 'tutelados'],
    });
  }
}
