import { AppDataSource } from '../database/datasource';
import { RegisteredUser } from '../user/entity/user.entity';
import { SecurityService } from '../security/security.service';

async function createAdmin() {
  try {
    // Inicializar a conexão com o banco de dados
    await AppDataSource.initialize();
    console.log('Conexão com o banco de dados inicializada');

    // Criar instância do SecurityService
    const securityService = new SecurityService();

    // Gerar hash da senha
    const password = 'SuperAdmin123@2025';
    const hashedPassword = await securityService.hashPassword(password);

    // Criar o usuário admin
    const adminUser = new RegisteredUser();
    adminUser.cpf = '00000000000';
    adminUser.firstName = 'Admin';
    adminUser.lastName = 'System';
    adminUser.cpfStatus = 'VERIFIED';
    adminUser.cpfVerificationUrl = 'https://example.com';
    adminUser.email = 'admin@qualityentregas.com.br';
    adminUser.emailVerificationCode = '000000';
    adminUser.emailVerified = true;
    adminUser.phoneNumber = '11999999999';
    adminUser.phoneVerificationCode = '000000';
    adminUser.phoneVerified = true;
    adminUser.password = hashedPassword;
    adminUser.passwordResetToken = '';
    adminUser.role = 'admin';
    adminUser.isActive = true;

    // Salvar no banco de dados
    const userRepository = AppDataSource.getRepository(RegisteredUser);
    await userRepository.save(adminUser);

    console.log('Usuário administrador criado com sucesso!');

    // Fechar conexão
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  }
}

void createAdmin();
