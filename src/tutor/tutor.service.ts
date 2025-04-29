/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutor, TutorStatus } from './entities/tutor.entity';
import { Tutelado, TuteladoStatus } from './entities/tutelado.entity';
import { CreateTutorDto, TipoUsuario } from './dto/create-tutor.dto';
import { VincularTuteladoDto } from './dto/vincular-tutelado.dto';
import { RegisteredUser } from '../user/entity/user.entity';
import type { DesignarVeiculoDto } from './dto/designar-veiculo.dto';
import { Veiculo } from 'src/cadastro-veiculo/entities/veiculo.entity';
import { EmailService } from 'src/email/email.service';
import { Empresa } from '../empresa/entities/empresa.entity';
import { VincularEmpresaDto } from './dto/vincular-empresa.dto';
import { SolicitacaoVinculo } from './entities/solicitacao-vinculo.entity';
import { SolicitacaoVinculoDto } from './dto/solicitacao-vinculo.dto';
import { RespostaSolicitacaoDto } from './dto/resposta-solicitacao.dto';
import { StatusSolicitacao } from './entities/status-solicitacao.enum';

@Injectable()
export class TutorService {
  constructor(
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
    @InjectRepository(Tutelado)
    private readonly tuteladoRepository: Repository<Tutelado>,
    @InjectRepository(RegisteredUser)
    private readonly userRepository: Repository<RegisteredUser>,
    @InjectRepository(Veiculo)
    private readonly veiculoRepository: Repository<Veiculo>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(SolicitacaoVinculo)
    private readonly solicitacaoRepository: Repository<SolicitacaoVinculo>,
    private readonly emailService: EmailService,
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

  async listarTutelados(tutorId: number): Promise<any[]> {
    // Verificar se o tutor existe
    const tutor = await this.tutorRepository.findOne({
      where: { id: tutorId },
      relations: ['tutelados', 'tutelados.user'],
    });

    if (!tutor) {
      throw new NotFoundException(`Tutor com ID ${tutorId} não encontrado`);
    }

    // Array para armazenar os resultados formatados
    type TuteladoFormatado = Tutelado & {
      user: Partial<RegisteredUser> | null;
      veiculosDesignados: any[];
    };
    const tuteladosFormatados: TuteladoFormatado[] = [];

    // Processar cada tutelado para remover dados sensíveis e adicionar veículos
    for (const tutelado of tutor.tutelados) {
      // Remover dados sensíveis do usuário
      const userSanitized = this.removeDadosSensiveis(tutelado.user);

      // Buscar veículos designados para este tutelado
      const veiculos = await this.veiculoRepository.find({
        where: { tuteladoDesignadoId: tutelado.id },
        relations: ['tutor', 'tutor.user'],
      });

      // Sanitizar dados de usuário dos tutores de cada veículo
      const veiculosSanitizados = veiculos.map((veiculo) => {
        if (veiculo.tutor?.user) {
          return {
            ...veiculo,
            tutor: {
              ...veiculo.tutor,
              user: this.removeDadosSensiveis(veiculo.tutor.user),
            },
          };
        }
        return veiculo;
      });

      // Adicionar ao array de resultados
      tuteladosFormatados.push({
        ...tutelado,
        user: userSanitized as any, // Type assertion to avoid type error
        veiculosDesignados: veiculosSanitizados as any[], // Type assertion to avoid type error
      });
    }

    return tuteladosFormatados;
  }

  async listarTodosTutores(): Promise<Tutor[]> {
    return await this.tutorRepository.find({
      relations: ['user', 'tutelados'],
    });
  }

  async designarVeiculo(
    tutorId: number,
    designarVeiculoDto: DesignarVeiculoDto,
  ): Promise<Veiculo> {
    // Verificar se o tutor existe
    const tutor = await this.tutorRepository.findOne({
      where: { id: tutorId },
    });
    if (!tutor) {
      throw new NotFoundException(`Tutor com ID ${tutorId} não encontrado`);
    }

    // Verificar se o tutelado existe e está vinculado ao tutor
    const tutelado = await this.tuteladoRepository.findOne({
      where: { id: designarVeiculoDto.tuteladoId, tutorId },
    });

    if (!tutelado) {
      throw new NotFoundException(
        `Tutelado com ID ${designarVeiculoDto.tuteladoId} não encontrado ou não está vinculado a este tutor`,
      );
    }

    // Verificar se o veículo existe e pertence ao tutor
    const veiculo = await this.veiculoRepository.findOne({
      where: { id: designarVeiculoDto.veiculoId, tutorId },
    });

    if (!veiculo) {
      throw new NotFoundException(
        `Veículo com ID ${designarVeiculoDto.veiculoId} não encontrado ou não pertence a este tutor`,
      );
    }

    // MODIFICADO: Agora atualizamos o veículo, não o tutelado
    veiculo.tuteladoDesignadoId = designarVeiculoDto.tuteladoId;
    return await this.veiculoRepository.save(veiculo);
  }

  async verificarCpf(cpf: string): Promise<{
    encontrado: boolean;
    dados?: { tutor: any; usuario: any; empresa: any };
  }> {
    // Verifica se o CPF já está cadastrado no campo JSON scoreCredito
    const result = await this.tutorRepository.query(
      `SELECT
          t.*,
          rs.*,
          e.*
        FROM
          tutores t
        JOIN
          registered_user rs ON t.userId = rs.id
        LEFT JOIN
          empresa e ON t.empresaId = e.id
        WHERE
          JSON_UNQUOTE(JSON_EXTRACT(t.scoreCredito, '$.cpf')) = ?
        LIMIT
          1; `,
      [cpf],
    );

    console.log('Resultado da verificação de CPF:', result);

    // Se o resultado for vazio, significa que o CPF não está cadastrado
    if (!result || result.length === 0) {
      return { encontrado: false };
    }

    // Se encontrou, vamos organizar os dados por entidade e remover campos sensíveis
    const dadosBrutos = result[0];

    // Dados do tutor
    const tutor = {
      id: dadosBrutos.tutor_id, // Usando o alias correto
      userId: dadosBrutos.userId,
      scoreCredito: dadosBrutos.scoreCredito,
      status: dadosBrutos.status,
      scoreD00: dadosBrutos.scoreD00,
      scoreD30: dadosBrutos.scoreD30,
      scoreD60: dadosBrutos.scoreD60,
      rendaIndividual: dadosBrutos.rendaIndividual,
      rendaFamiliar: dadosBrutos.rendaFamiliar,
      rendaPresumida: dadosBrutos.rendaPresumida,
      classeSocialPessoal: dadosBrutos.classeSocialPessoal,
      classeSocialFamiliar: dadosBrutos.classeSocialFamiliar,
      scoreValido: dadosBrutos.scoreValido,
      createdAt: dadosBrutos.createdAt,
      updatedAt: dadosBrutos.updatedAt,
      assinadoContrato: dadosBrutos.assinadoContrato,
      dataAssinaturaContrato: dadosBrutos.dataAssinaturaContrato,
      empresaId: dadosBrutos.empresaId,
    };

    // Dados do usuário (excluindo campos sensíveis)
    const usuario = {
      id: dadosBrutos.user_id, // Usando o alias correto
      firstName: dadosBrutos.firstName,
      lastName: dadosBrutos.lastName,
      cpf: dadosBrutos.cpf,
      cpfStatus: dadosBrutos.cpfStatus,
      email: dadosBrutos.email,
      emailVerified: dadosBrutos.emailVerified,
      phoneNumber: dadosBrutos.phoneNumber,
      phoneVerified: dadosBrutos.phoneVerified,
      role: dadosBrutos.role,
      isActive: dadosBrutos.isActive,
      fotoPath: dadosBrutos.fotoPath,
      lgpdAcceptedAt: dadosBrutos.lgpdAcceptedAt,
      // Removidos dados sensíveis: password, passwordResetToken, emailVerificationCode, phoneVerificationCode
    };

    // Dados da empresa
    const empresa = dadosBrutos.empresaId
      ? {
          id: dadosBrutos.empresa_id, // Usando o alias correto
          cnpj: dadosBrutos.cnpj,
          razaoSocial: dadosBrutos.razaoSocial,
          nomeFantasia: dadosBrutos.nomeFantasia,
          naturezaJuridica: dadosBrutos.naturezaJuridica,
          logradouro: dadosBrutos.logradouro,
          numero: dadosBrutos.numero,
          complemento: dadosBrutos.complemento,
          bairro: dadosBrutos.bairro,
          municipio: dadosBrutos.municipio,
          cep: dadosBrutos.cep,
          uf: dadosBrutos.uf,
          telefone: dadosBrutos.telefone,
          situacaoCadastral: dadosBrutos.situacaoCadastral,
          dataInicioAtividade: dadosBrutos.dataInicioAtividade,
          atividadeEconomica: dadosBrutos.atividadeEconomica,
          porte: dadosBrutos.porte,
          capitalSocial: dadosBrutos.capitalSocial,
          urlComprovante: dadosBrutos.urlComprovante,
          logoPath: dadosBrutos.logoPath,
        }
      : null;

    return {
      encontrado: true,
      dados: {
        tutor,
        usuario,
        empresa,
      },
    };
  }

  async enviarEmailConvite(email: string, userId: number): Promise<void> {
    try {
      // Buscar informações do usuário que está enviando o convite (um tutelado)
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
      }

      const userName = `${user.firstName} ${user.lastName}`;

      // Conteúdo do email
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://qualityentregas.com.br/wp-content/uploads/2023/09/Ativo-2.png" alt="QProspekta Logo" style="max-width: 200px;">
          </div>
          <h2 style="color: #4CAF50; text-align: center;">Convite para se tornar Tutor</h2>
          <p>Olá!</p>
          <p>Você recebeu um convite de <strong>${userName}</strong> para se cadastrar como Tutor na plataforma QProspekta.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;">Como Tutor, você poderá gerenciar veículos e vincular tutelados à sua conta.</p>
          </div>
          
          <p>Para aceitar o convite, clique no botão abaixo e complete seu cadastro:</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://www.qprospekta.com/" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">ACEITAR CONVITE</a>
          </div>
          
          <p>Se você tiver alguma dúvida, entre em contato com nossa equipe de suporte.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin: 0;">Atenciosamente,</p>
            <p style="margin: 5px 0;"><strong>Equipe QProspekta/</strong></p>
          </div>
        </div>
      `;

      const plainText = `
        Convite para se tornar Tutor
        
        Olá!
        
        Você recebeu um convite de ${userName} para se cadastrar como Tutor na plataforma QProspekta.
        
        Como Tutor, você poderá gerenciar veículos e vincular tutelados à sua conta.
        
        Para aceitar o convite, acesse: https://www.qprospekta.com/
        
        Se você tiver alguma dúvida, entre em contato com nossa equipe de suporte.
        
        Atenciosamente,
        Equipe QProspekta
      `;

      // Criamos um objeto similar ao usado em sendVerificationEmail
      await this.emailService.sendTutorInviteEmail(email, {
        userName,
        htmlContent,
        plainText,
      });
    } catch (error) {
      console.error('Erro ao enviar email de convite:', error);
      throw new Error('Falha ao enviar email de convite');
    }
  }

  async vincularEmpresa(
    tutorId: number,
    vincularEmpresaDto: VincularEmpresaDto,
    isUserId = false,
  ): Promise<Tutor> {
    try {
      // Log para diagnóstico
      console.log('Requisição recebida:', {
        tutorId,
        vincularEmpresaDto,
        isUserId,
      });

      if (!vincularEmpresaDto || vincularEmpresaDto.empresaId === undefined) {
        throw new BadRequestException('ID da empresa não foi fornecido');
      }

      // Buscar o tutor
      let tutor: Tutor | null;

      if (isUserId) {
        tutor = await this.tutorRepository.findOne({
          where: { userId: tutorId },
        });
      } else {
        tutor = await this.tutorRepository.findOne({
          where: { id: tutorId },
        });
      }

      if (!tutor) {
        const mensagem = isUserId
          ? `Usuário com ID ${tutorId} não é um tutor`
          : `Tutor com ID ${tutorId} não encontrado`;
        throw new NotFoundException(mensagem);
      }

      // Verificar se a empresa existe
      const empresa = await this.empresaRepository.findOne({
        where: { id: vincularEmpresaDto.empresaId },
      });

      if (!empresa) {
        throw new NotFoundException(
          `Empresa com ID ${vincularEmpresaDto.empresaId} não encontrada`,
        );
      }

      // Atualizar o tutor com o ID e CNPJ da empresa (sempre no formato somente números)
      tutor.empresaId = vincularEmpresaDto.empresaId;
      tutor.cnpjEmpresa = empresa.cnpj.replace(/[^\d]/g, ''); // Remover todos caracteres não numéricos

      const tutorAtualizado = await this.tutorRepository.save(tutor);

      // Carregar a relação com a empresa para a resposta
      const tutorComEmpresa = await this.tutorRepository.findOne({
        where: { id: tutorAtualizado.id },
        relations: ['empresa'],
      });

      if (!tutorComEmpresa) {
        throw new NotFoundException(
          `Tutor com ID ${tutorAtualizado.id} não encontrado ao carregar relações`,
        );
      }

      return tutorComEmpresa;
    } catch (error) {
      console.error('ERRO AO VINCULAR EMPRESA:', error);
      throw error;
    }
  }

  async assinarContrato(tutorId: number): Promise<Tutor> {
    const tutor = await this.tutorRepository.findOne({
      where: { id: tutorId },
    });

    if (!tutor) {
      throw new NotFoundException(`Tutor com ID ${tutorId} não encontrado`);
    }

    tutor.assinadoContrato = true;
    tutor.dataAssinaturaContrato = new Date();

    return await this.tutorRepository.save(tutor);
  }

  async solicitarVinculoTutor(
    tuteladoUserId: number,
    solicitacaoDto: SolicitacaoVinculoDto,
  ): Promise<SolicitacaoVinculo> {
    // Verificar se o tutor existe
    const tutorExiste = await this.tutorRepository.findOne({
      where: { id: solicitacaoDto.tutorId },
    });

    if (!tutorExiste) {
      throw new NotFoundException(
        `Tutor com ID ${solicitacaoDto.tutorId} não encontrado`,
      );
    }

    // Verificar se o usuário já existe como tutelado
    let tutelado: Tutelado;
    try {
      tutelado = await this.findTuteladoByUserId(tuteladoUserId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Usuário não é tutelado ainda, vamos cadastrá-lo
        console.log('Usuário não é tutelado, criando registro...');

        // Verificar se o usuário existe
        const user = await this.userRepository.findOne({
          where: { id: tuteladoUserId },
        });
        if (!user) {
          throw new NotFoundException(
            `Usuário com ID ${tuteladoUserId} não encontrado`,
          );
        }

        // Criar novo tutelado SEM vincular ao tutor ainda
        const novoTutelado = new Tutelado();
        novoTutelado.userId = tuteladoUserId;
        novoTutelado.status = TuteladoStatus.INATIVO; // Inicialmente inativo

        // Atualizar o papel do usuário
        if (user.role !== 'admin') {
          user.role = 'tutelado';
          await this.userRepository.save(user);
        }

        tutelado = await this.tuteladoRepository.save(novoTutelado);
      } else {
        throw error; // Outro tipo de erro, propagar
      }
    }

    // Verificar se já existe solicitação pendente
    const solicitacaoExistente = await this.solicitacaoRepository.findOne({
      where: {
        tuteladoId: tutelado.id,
        tutorId: solicitacaoDto.tutorId,
        status: StatusSolicitacao.PENDENTE,
      },
    });

    if (solicitacaoExistente) {
      throw new BadRequestException(
        'Já existe uma solicitação pendente para este tutor',
      );
    }

    // Criar nova solicitação
    const solicitacao = new SolicitacaoVinculo();
    solicitacao.tutorId = solicitacaoDto.tutorId;
    solicitacao.tuteladoId = tutelado.id;
    solicitacao.status = StatusSolicitacao.PENDENTE;

    const novaSolicitacao = await this.solicitacaoRepository.save(solicitacao);

    // Enviar email para o tutor
    await this.enviarEmailSolicitacaoVinculo(novaSolicitacao);

    return novaSolicitacao;
  }

  async responderSolicitacaoVinculo(
    tutorUserId: number,
    solicitacaoId: number,
    respostaDto: RespostaSolicitacaoDto,
  ): Promise<SolicitacaoVinculo> {
    try {
      console.log(
        `Iniciando resposta à solicitação ID ${solicitacaoId} com aprovação: ${respostaDto.aprovado}`,
      );

      // Obter tutor
      const tutor = await this.findTutorByUserId(tutorUserId);
      if (!tutor) {
        throw new NotFoundException(
          `Tutor com ID ${tutorUserId} não encontrado`,
        );
      }
      // Buscar a solicitação específica pelo ID
      const solicitacao = await this.solicitacaoRepository.findOne({
        where: { id: solicitacaoId },
        relations: ['tutelado'],
      });

      // Verificar se a solicitação existe
      if (!solicitacao) {
        throw new NotFoundException(
          `Solicitação com ID ${solicitacaoId} não encontrada`,
        );
      }
      console.log(`Solicitação encontrada: ${JSON.stringify(solicitacao)}`);

      // Verificar se a solicitação pertence ao tutor
      if (solicitacao.tutorId !== tutor.id) {
        throw new ForbiddenException(
          'Você não tem permissão para responder a esta solicitação',
        );
      }

      // Verificar se a solicitação já foi processada
      if (solicitacao.status !== StatusSolicitacao.PENDENTE) {
        throw new BadRequestException(
          `Esta solicitação já foi ${solicitacao.status === StatusSolicitacao.APROVADA ? 'aprovada' : 'rejeitada'} anteriormente`,
        );
      }

      // Atualizar status da solicitação
      solicitacao.status = respostaDto.aprovado
        ? StatusSolicitacao.APROVADA
        : StatusSolicitacao.REJEITADA;
      solicitacao.dataProcessamento = new Date();

      // Salvar alterações da solicitação
      const solicitacaoAtualizada =
        await this.solicitacaoRepository.save(solicitacao);

      // Se aprovado, efetuar o vínculo
      if (respostaDto.aprovado) {
        try {
          // Verificar se o tutelado existe

          // Buscar com todos os detalhes necessários
          const tutelado = await this.tuteladoRepository.findOne({
            where: { id: solicitacao.tuteladoId },
          });

          if (!tutelado) {
            console.error(
              `Tutelado com ID ${solicitacao.tuteladoId} não encontrado!`,
            );
            throw new NotFoundException(
              `Tutelado com ID ${solicitacao.tuteladoId} não encontrado`,
            );
          }

          // Atualizar o tutelado
          console.log(
            `Atualizando tutelado para tutorId=${tutor.id} e status=ATIVO`,
          );
          tutelado.tutorId = tutor.id;
          tutelado.status = TuteladoStatus.ATIVO;

          // Salvar tutelado com método explícito de atualização
          const tuteladoSalvo = await this.tuteladoRepository.save({
            ...tutelado,
            tutorId: tutor.id,
            status: TuteladoStatus.ATIVO,
          });

          console.log(
            `Tutelado atualizado com sucesso: ${JSON.stringify(tuteladoSalvo)}`,
          );
        } catch (vinculoError) {
          throw new BadRequestException(
            `Erro ao vincular tutelado: ${vinculoError.message}`,
          );
        }
      }

      return solicitacaoAtualizada;
    } catch (error) {
      console.error('Erro ao responder solicitação:', error);
      throw error;
    }
  }

  async listarSolicitacoesPendentes(
    tutorUserId: number,
  ): Promise<SolicitacaoVinculo[]> {
    const tutor = await this.findTutorByUserId(tutorUserId);

    return this.solicitacaoRepository.find({
      where: {
        tutorId: tutor.id,
        status: StatusSolicitacao.PENDENTE,
      },
      relations: ['tutelado', 'tutelado.user'],
    });
  }

  async listarMinhasSolicitacoesPendentes(
    userId: number,
  ): Promise<SolicitacaoVinculo[]> {
    try {
      // Buscar o tutelado pelo ID do usuário
      const tutelado = await this.findTuteladoByUserId(userId);

      // Buscar as solicitações pendentes para este tutelado
      return this.solicitacaoRepository.find({
        where: {
          tuteladoId: tutelado.id,
          status: StatusSolicitacao.PENDENTE,
        },
        relations: ['tutor', 'tutor.user'],
      });
    } catch (error) {
      // Se o usuário não for um tutelado, retornar lista vazia
      if (error instanceof NotFoundException) {
        return [];
      }
      throw error;
    }
  }

  async listarMinhasSolicitacoesNegadas(
    userId: number,
  ): Promise<SolicitacaoVinculo[]> {
    try {
      // Buscar o tutelado pelo ID do usuário
      const tutelado = await this.findTuteladoByUserId(userId);

      // Buscar as solicitações Negadas para este tutelado
      return this.solicitacaoRepository.find({
        where: {
          tuteladoId: tutelado.id,
          status: StatusSolicitacao.REJEITADA,
        },
        relations: ['tutor', 'tutor.user'],
      });
    } catch (error) {
      // Se o usuário não for um tutelado, retornar lista vazia
      if (error instanceof NotFoundException) {
        return [];
      }
      throw error;
    }
  }

  private async enviarEmailSolicitacaoVinculo(
    solicitacao: SolicitacaoVinculo,
  ): Promise<void> {
    // Buscar dados do tutor e tutelado
    const tutor = await this.tutorRepository.findOne({
      where: { id: solicitacao.tutorId },
      relations: ['user'],
    });

    const tutelado = await this.tuteladoRepository.findOne({
      where: { id: solicitacao.tuteladoId },
      relations: ['user'],
    });

    if (!tutor?.user || !tutelado?.user) {
      throw new NotFoundException('Dados de tutor ou tutelado não encontrados');
    }

    const tutorEmail = tutor.user.email;
    const tutorName = `${tutor.user.firstName} ${tutor.user.lastName}`;
    const tuteladoName = `${tutelado.user.firstName} ${tutelado.user.lastName}`;

    // HTML para o email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://qualityentregas.com.br/wp-content/uploads/2023/09/Ativo-2.png" alt="QProspekta Logo" style="max-width: 200px;">
        </div>
        <h2 style="color: #4CAF50; text-align: center;">Nova Solicitação de Vínculo</h2>
        <p>Olá, ${tutorName}!</p>
        <p>Você recebeu uma solicitação de vínculo do tutelado <strong>${tuteladoName}</strong> na plataforma QProspekta.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
          <p style="margin: 0; font-size: 16px;">Para aprovar ou rejeitar esta solicitação, acesse seu painel na plataforma.</p>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://www.qprospekta.com/solicitacoes" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">GERENCIAR SOLICITAÇÕES</a>
        </div>
        
        <p>Se você tiver alguma dúvida, entre em contato com nossa equipe de suporte.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin: 0;">Atenciosamente,</p>
          <p style="margin: 5px 0;"><strong>Equipe QProspekta</strong></p>
        </div>
      </div>
    `;

    const plainText = `
      Nova Solicitação de Vínculo
      
      Olá, ${tutorName}!
      
      Você recebeu uma solicitação de vínculo do tutelado ${tuteladoName} na plataforma QProspekta.
      
      Para aprovar ou rejeitar esta solicitação, acesse seu painel na plataforma: https://www.qprospekta.com/solicitacoes
      
      Se você tiver alguma dúvida, entre em contato com nossa equipe de suporte.
      
      Atenciosamente,
      Equipe QProspekta
    `;

    await this.emailService.sendTutorSolicitacaoEmail(tutorEmail, {
      tutorName,
      tuteladoName,
      htmlContent,
      plainText,
    });
  }

  async findTutorByCnpjEmpresa(cnpj: string): Promise<Tutor[]> {
    // Normalizar o CNPJ removendo caracteres especiais
    const cnpjNumerico = cnpj.replace(/[^\d]/g, '');

    // Construir possíveis formatos de CNPJ para a busca
    const formatoPadrao = cnpj;
    const formatoNumerico = cnpjNumerico;
    const formatoFormatado = cnpjNumerico.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5',
    );

    console.log('Buscando tutores por CNPJ nos formatos:', {
      formatoPadrao,
      formatoNumerico,
      formatoFormatado,
    });

    // Buscar no banco usando os possíveis formatos
    const tutores = await this.tutorRepository
      .createQueryBuilder('tutor')
      .leftJoinAndSelect('tutor.user', 'user')
      .leftJoinAndSelect('tutor.empresa', 'empresa')
      .where('tutor.cnpjEmpresa = :formato1', { formato1: formatoPadrao })
      .orWhere('tutor.cnpjEmpresa = :formato2', { formato2: formatoNumerico })
      .orWhere('tutor.cnpjEmpresa = :formato3', { formato3: formatoFormatado })
      .orWhere('REPLACE(tutor.cnpjEmpresa, ".", "") = :cnpjSemPontos', {
        cnpjSemPontos: formatoNumerico,
      })
      .getMany();

    return tutores;
  }

  async verificarCnpj(cnpj: string): Promise<{
    encontrado: boolean;
    dados?: { tutor: any; usuario: any; empresa: any }[];
  }> {
    try {
      // Normalizar o CNPJ removendo caracteres especiais
      const cnpjNumerico = cnpj.replace(/[^\d]/g, '');

      // Construir possíveis formatos de CNPJ para a busca
      const formatoPadrao = cnpj;
      const formatoNumerico = cnpjNumerico;
      const formatoFormatado = cnpjNumerico.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5',
      );

      console.log('Verificando tutores por CNPJ nos formatos:', {
        formatoPadrao,
        formatoNumerico,
        formatoFormatado,
      });

      // Busca tutores pelo CNPJ usando consulta SQL para obter todos os dados relacionados
      const result = await this.tutorRepository.query(
        `SELECT
          t.id AS tutor_id,
          t.userId,
          t.scoreCredito,
          t.status,
          t.scoreD00,
          t.scoreD30,
          t.scoreD60,
          t.rendaIndividual,
          t.rendaFamiliar,
          t.rendaPresumida,
          t.classeSocialPessoal,
          t.classeSocialFamiliar,
          t.scoreValido,
          t.createdAt AS tutor_created,
          t.updatedAt AS tutor_updated,
          t.assinadoContrato,
          t.dataAssinaturaContrato,
          t.empresaId,
          t.cnpjEmpresa,
          rs.id AS user_id,
          rs.firstName,
          rs.lastName,
          rs.cpf,
          rs.cpfStatus,
          rs.email,
          rs.emailVerified,
          rs.phoneNumber,
          rs.phoneVerified,
          rs.role,
          rs.isActive,
          rs.fotoPath,
          rs.lgpdAcceptedAt,
          e.id AS empresa_id,
          e.cnpj,
          e.razaoSocial,
          e.nomeFantasia,
          e.naturezaJuridica,
          e.logradouro,
          e.numero,
          e.complemento,
          e.bairro,
          e.municipio,
          e.cep,
          e.uf,
          e.telefone,
          e.situacaoCadastral,
          e.dataInicioAtividade,
          e.atividadeEconomica,
          e.porte,
          e.capitalSocial,
          e.urlComprovante,
          e.logoPath
        FROM
          tutores t
        JOIN
          registered_user rs ON t.userId = rs.id
        LEFT JOIN
          empresa e ON t.empresaId = e.id
        WHERE
          t.cnpjEmpresa = ?
          OR t.cnpjEmpresa = ?
          OR t.cnpjEmpresa = ?
          OR REPLACE(t.cnpjEmpresa, '.', '') = ?
        `,
        [formatoPadrao, formatoNumerico, formatoFormatado, formatoNumerico],
      );

      console.log('Resultado da verificação de CNPJ:', result);

      // Se o resultado for vazio, significa que o CNPJ não está cadastrado
      if (!result || result.length === 0) {
        return { encontrado: false };
      }

      // Se encontrou, vamos organizar os dados por entidade
      const dadosFormatados = result.map((dadosBrutos) => {
        // Dados do tutor
        const tutor = {
          id: dadosBrutos.tutor_id, // Usando o alias correto
          userId: dadosBrutos.userId,
          scoreCredito: dadosBrutos.scoreCredito,
          status: dadosBrutos.status,
          scoreD00: dadosBrutos.scoreD00,
          scoreD30: dadosBrutos.scoreD30,
          scoreD60: dadosBrutos.scoreD60,
          rendaIndividual: dadosBrutos.rendaIndividual,
          rendaFamiliar: dadosBrutos.rendaFamiliar,
          rendaPresumida: dadosBrutos.rendaPresumida,
          classeSocialPessoal: dadosBrutos.classeSocialPessoal,
          classeSocialFamiliar: dadosBrutos.classeSocialFamiliar,
          scoreValido: dadosBrutos.scoreValido,
          createdAt: dadosBrutos.tutor_created,
          updatedAt: dadosBrutos.tutor_updated,
          assinadoContrato: dadosBrutos.assinadoContrato,
          dataAssinaturaContrato: dadosBrutos.dataAssinaturaContrato,
          empresaId: dadosBrutos.empresaId,
          cnpjEmpresa: dadosBrutos.cnpjEmpresa,
        };

        // Dados do usuário (excluindo campos sensíveis)
        const usuario = {
          id: dadosBrutos.user_id, // Usando o alias correto
          firstName: dadosBrutos.firstName,
          lastName: dadosBrutos.lastName,
          cpf: dadosBrutos.cpf,
          cpfStatus: dadosBrutos.cpfStatus,
          email: dadosBrutos.email,
          emailVerified: dadosBrutos.emailVerified,
          phoneNumber: dadosBrutos.phoneNumber,
          phoneVerified: dadosBrutos.phoneVerified,
          role: dadosBrutos.role,
          isActive: dadosBrutos.isActive,
          fotoPath: dadosBrutos.fotoPath,
          lgpdAcceptedAt: dadosBrutos.lgpdAcceptedAt,
        };

        // Dados da empresa
        const empresa = dadosBrutos.empresaId
          ? {
              id: dadosBrutos.empresa_id, // Usando o alias correto
              cnpj: dadosBrutos.cnpj,
              razaoSocial: dadosBrutos.razaoSocial,
              nomeFantasia: dadosBrutos.nomeFantasia,
              naturezaJuridica: dadosBrutos.naturezaJuridica,
              logradouro: dadosBrutos.logradouro,
              numero: dadosBrutos.numero,
              complemento: dadosBrutos.complemento,
              bairro: dadosBrutos.bairro,
              municipio: dadosBrutos.municipio,
              cep: dadosBrutos.cep,
              uf: dadosBrutos.uf,
              telefone: dadosBrutos.telefone,
              situacaoCadastral: dadosBrutos.situacaoCadastral,
              dataInicioAtividade: dadosBrutos.dataInicioAtividade,
              atividadeEconomica: dadosBrutos.atividadeEconomica,
              porte: dadosBrutos.porte,
              capitalSocial: dadosBrutos.capitalSocial,
              urlComprovante: dadosBrutos.urlComprovante,
              logoPath: dadosBrutos.logoPath,
            }
          : null;

        return {
          tutor,
          usuario,
          empresa,
        };
      });

      return {
        encontrado: true,
        dados: dadosFormatados,
      };
    } catch (error) {
      console.error('Erro ao verificar CNPJ:', error);
      return { encontrado: false };
    }
  }

  async obterInformacoesTutelado(userId: number) {
    // Verificar se o usuário existe
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verificar se o usuário é um tutelado
    const tutelado = await this.tuteladoRepository.findOne({
      where: { userId },
      relations: ['tutor', 'tutor.user'],
    });

    if (!tutelado) {
      throw new NotFoundException(`Usuário com ID ${userId} não é um tutelado`);
    }

    // Remover dados sensíveis dos objetos de usuário
    const sanitizedUser = this.removeDadosSensiveis(user);
    const sanitizedTutorUser = tutelado.tutor?.user
      ? this.removeDadosSensiveis(tutelado.tutor.user)
      : null;

    // MODIFICADO: Buscar veículos designados para este tutelado
    const veiculosDesignados = await this.veiculoRepository.find({
      where: { tuteladoDesignadoId: tutelado.id },
      relations: ['tutor', 'tutor.user'],
    });

    // Sanitizar dados de usuário dos tutores de cada veículo
    const veiculosSanitizados = veiculosDesignados.map((veiculo) => {
      if (veiculo.tutor?.user) {
        return {
          ...veiculo,
          tutor: {
            ...veiculo.tutor,
            user: this.removeDadosSensiveis(veiculo.tutor.user),
          },
        };
      }
      return veiculo;
    });

    return {
      user: sanitizedUser,
      tutelado: {
        ...tutelado,
        tutor: {
          ...tutelado.tutor,
          user: sanitizedTutorUser,
        },
      },
      tutor: {
        ...tutelado.tutor,
        user: sanitizedTutorUser,
      },
      tutorUser: sanitizedTutorUser,
      // MODIFICADO: Retornar a lista de veículos designados com type assertion
      veiculosDesignados: veiculosSanitizados as any[],
      // Para compatibilidade, retornar o primeiro veículo como 'veiculoDesignado'
      veiculoDesignado:
        veiculosSanitizados.length > 0 ? (veiculosSanitizados[0] as any) : null,
    };
  }

  // Método auxiliar para remover dados sensíveis dos objetos de usuário
  private removeDadosSensiveis(
    user: RegisteredUser | null | undefined,
  ): Partial<RegisteredUser> | null {
    if (!user) return null;

    // Desestruturação para extrair apenas os campos que queremos manter
    const {
      id,
      cpf,
      firstName,
      lastName,
      cpfStatus,
      cpfVerificationUrl,
      email,
      emailVerified,
      phoneNumber,
      phoneVerified,
      role,
      isActive,
      fotoPath,
      lgpdAcceptedAt,
      createdAt,
      updatedAt,
    } = user;

    // Retornar apenas os campos seguros
    return {
      id,
      cpf,
      firstName,
      lastName,
      cpfStatus,
      cpfVerificationUrl,
      email,
      emailVerified,
      phoneNumber,
      phoneVerified,
      role,
      isActive,
      fotoPath,
      lgpdAcceptedAt,
      createdAt,
      updatedAt,
    };
  }
}
