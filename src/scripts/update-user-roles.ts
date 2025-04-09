import { AppDataSource } from '../database/datasource';
import { RegisteredUser } from '../user/entity/user.entity';
import { UserRole } from '../security/enums/roles.enum';

async function updateUserRoles() {
  try {
    await AppDataSource.initialize();
    console.log('✓ Conexão com o banco de dados inicializada');

    const userRepository = AppDataSource.getRepository(RegisteredUser);

    // Mapeamento de roles antigas para novas se necessário
    // Por exemplo, se você tiver um role existente que não se encaixa no novo enum

    console.log('Atualizando roles de usuários...');

    // Atualizar todos os usuários com role null ou undefined para 'user'
    await userRepository
      .createQueryBuilder()
      .update(RegisteredUser)
      .set({ role: UserRole.USER })
      .where('role IS NULL')
      .execute();

    console.log('✓ Usuários atualizados com sucesso!');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Erro ao atualizar roles:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void updateUserRoles();
