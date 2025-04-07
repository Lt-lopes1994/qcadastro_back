import { AppDataSource } from '../database/datasource';
import { Role } from '../admin/entities/role.entity';

async function createRoles() {
  try {
    // Inicializar a conexão com o banco de dados
    await AppDataSource.initialize();
    console.log('Conexão com o banco de dados inicializada');

    // Criar repositório de roles
    const roleRepository = AppDataSource.getRepository(Role);

    // Definir as roles iniciais
    const roles = [
      {
        level: 1,
        name: 'user',
        description: 'Usuário comum com acesso básico',
      },
      {
        level: 2,
        name: 'portador',
        description: 'Portador de veículo com permissões específicas',
      },
      {
        level: 3,
        name: 'colaborador',
        description: 'Colaborador com acesso a recursos adicionais',
      },
      {
        level: 4,
        name: 'tutor',
        description: 'Tutor com permissões para gerenciar outros usuários',
      },
      {
        level: 5,
        name: 'empresa',
        description: 'Empresa parceira com acesso a recursos empresariais',
      },
      {
        level: 6,
        name: 'admin',
        description: 'Administrador com acesso completo ao sistema',
      },
    ];

    // Inserir as roles no banco de dados
    for (const roleData of roles) {
      // Verificar se a role já existe
      const existingRole = await roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = roleRepository.create(roleData);
        await roleRepository.save(role);
        console.log(
          `Role ${roleData.name} (nível ${roleData.level}) criada com sucesso`,
        );
      } else {
        console.log(`Role ${roleData.name} já existe, atualizando...`);
        existingRole.level = roleData.level;
        existingRole.description = roleData.description;
        await roleRepository.save(existingRole);
        console.log(`Role ${roleData.name} atualizada com sucesso`);
      }
    }

    console.log('Roles criadas/atualizadas com sucesso!');

    // Fechar conexão
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Erro ao criar/atualizar roles:', error);
  }
}

void createRoles();
