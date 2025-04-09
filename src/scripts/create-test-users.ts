/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { AppDataSource } from '../database/datasource';
import { RegisteredUser } from '../user/entity/user.entity';
import { SecurityService } from '../security/security.service';
import * as readline from 'readline';
import { faker } from '@faker-js/faker';

// Interface para entrada de usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Função para obter entrada do usuário
async function promptInput(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Gera CPF válido aleatório
function generateCPF(): string {
  const n1 = Math.floor(Math.random() * 10);
  const n2 = Math.floor(Math.random() * 10);
  const n3 = Math.floor(Math.random() * 10);
  const n4 = Math.floor(Math.random() * 10);
  const n5 = Math.floor(Math.random() * 10);
  const n6 = Math.floor(Math.random() * 10);
  const n7 = Math.floor(Math.random() * 10);
  const n8 = Math.floor(Math.random() * 10);
  const n9 = Math.floor(Math.random() * 10);

  const d1 =
    n9 * 2 +
    n8 * 3 +
    n7 * 4 +
    n6 * 5 +
    n5 * 6 +
    n4 * 7 +
    n3 * 8 +
    n2 * 9 +
    n1 * 10;
  const d1Remainder = d1 % 11;
  const n10 = d1Remainder < 2 ? 0 : 11 - d1Remainder;

  const d2 =
    n10 * 2 +
    n9 * 3 +
    n8 * 4 +
    n7 * 5 +
    n6 * 6 +
    n5 * 7 +
    n4 * 8 +
    n3 * 9 +
    n2 * 10 +
    n1 * 11;
  const d2Remainder = d2 % 11;
  const n11 = d2Remainder < 2 ? 0 : 11 - d2Remainder;

  return `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}${n10}${n11}`;
}

// Função principal para criar usuários de teste
async function createTestUsers() {
  try {
    // Inicializar a conexão com o banco de dados
    await AppDataSource.initialize();
    console.log('✓ Conexão com o banco de dados inicializada');

    const count = parseInt(
      await promptInput('Quantos usuários deseja criar? '),
      10,
    );

    if (isNaN(count) || count <= 0) {
      console.error('Número inválido. Por favor, insira um número positivo.');
      rl.close();
      await AppDataSource.destroy();
      return;
    }

    const securityService = new SecurityService();
    const userRepository = AppDataSource.getRepository(RegisteredUser);

    console.log(`\n🚀 Iniciando criação de ${count} usuários de teste...`);

    const defaultPassword = await securityService.hashPassword('Teste@123');
    const createdUsers: RegisteredUser[] = [];

    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const cpf = generateCPF();

      const user = new RegisteredUser();
      user.cpf = cpf;
      user.firstName = firstName;
      user.lastName = lastName;
      user.cpfStatus = 'REGULAR';
      user.cpfVerificationUrl = faker.internet.url();
      user.email = faker.internet.email({ firstName, lastName }).toLowerCase();
      user.emailVerificationCode = '123456';
      user.emailVerified = Math.random() > 0.3; // 70% verificados
      user.phoneNumber = `${faker.helpers.rangeToNumber({ min: 11, max: 99 })}9${faker.helpers.rangeToNumber({ min: 10000000, max: 99999999 })}`;
      user.phoneVerificationCode = '123456';
      user.phoneVerified = Math.random() > 0.3; // 70% verificados
      user.password = defaultPassword;
      user.passwordResetToken = '';
      user.role = 'user';
      user.isActive = Math.random() > 0.1; // 90% ativos
      user.lgpdAcceptedAt = new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
      );

      try {
        const savedUser = await userRepository.save(user);
        createdUsers.push(savedUser);
        process.stdout.write(`\rCriados ${i + 1}/${count} usuários...`);
      } catch (error) {
        console.error(`\nErro ao criar usuário ${i + 1}:`, error.message);
      }
    }

    console.log(`\n\n✅ ${createdUsers.length} usuários criados com sucesso!`);
    console.log('\nInformações de exemplo:');
    if (createdUsers.length > 0) {
      const sample = createdUsers[0];
      console.log(`- Nome: ${sample.firstName} ${sample.lastName}`);
      console.log(`- CPF: ${sample.cpf}`);
      console.log(`- Email: ${sample.email}`);
      console.log(`- Telefone: ${sample.phoneNumber}`);
      console.log('- Senha: Teste@123 (mesma para todos os usuários)');
    }

    console.log('\n🔄 Fechando conexão...');
    rl.close();
    await AppDataSource.destroy();
    console.log('✓ Conexão fechada.');
  } catch (error) {
    console.error('❌ Erro durante a criação de usuários:', error);
    rl.close();
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Iniciar o processo
createTestUsers().catch(console.error);
