import { AppDataSource } from '../database/datasource';

async function resetDatabase() {
  try {
    // Inicializar a conexão
    await AppDataSource.initialize();
    console.log('Conexão com o banco de dados inicializada');

    // Dropar o esquema
    await AppDataSource.dropDatabase();
    console.log('Banco de dados dropado com sucesso');

    // Dropar as tabelas
    await AppDataSource.synchronize(false);
    console.log('Tabelas dropadas com sucesso');

    // Criar o esquema
    await AppDataSource.synchronize(true);
    console.log('Banco de dados criado com sucesso');

    // Executar migrações
    await AppDataSource.runMigrations();
    console.log('Migrações executadas com sucesso');

    // Fechar a conexão
    await AppDataSource.destroy();
    console.log('Operação concluída!');
  } catch (error) {
    console.error('Erro durante a operação:', error);
  }
}

void resetDatabase();
