import { AppDataSource } from '../database/datasource';
import * as readline from 'readline';
import { DataSource } from 'typeorm';

async function promptConfirmation(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}
async function resetDatabase() {
  let dataSource: DataSource | null = null;

  try {
    // Verificar ambiente
    if (process.env.NODE_ENV === 'production') {
      console.error(
        'ATENÇÃO: Este script não deve ser executado em ambiente de produção!',
      );
      const forceRun = await promptConfirmation(
        'Tem certeza que deseja continuar?',
      );
      if (!forceRun) {
        console.log('Operação cancelada pelo usuário.');
        return;
      }
    }

    // Confirmar antes de prosseguir
    const confirmed = await promptConfirmation(
      'ATENÇÃO: Este script irá APAGAR TODOS OS DADOS. Deseja continuar?',
    );
    if (!confirmed) {
      console.log('Operação cancelada pelo usuário.');
      return;
    }

    // Inicializar a conexão
    dataSource = await AppDataSource.initialize();
    console.log('✓ Conexão com o banco de dados inicializada');

    // Dropar o esquema
    await dataSource.dropDatabase();
    console.log('✓ Banco de dados dropado com sucesso');

    // Criar o esquema (as tabelas serão criadas automaticamente)
    await dataSource.synchronize(true);
    console.log('✓ Esquema do banco de dados recriado com sucesso');

    // Executar migrações
    const migrations = await dataSource.runMigrations();
    console.log(`✓ ${migrations.length} migrações executadas com sucesso:`);
    migrations.forEach((migration) => console.log(`  - ${migration.name}`));

    console.log('\n✅ Resetamento do banco de dados concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a operação:', error);
    process.exit(1);
  } finally {
    // Garantir que a conexão seja sempre fechada
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('✓ Conexão com o banco de dados fechada');
    }
  }
}

// Verificar se o script foi chamado diretamente (não importado em outro arquivo)
if (require.main === module) {
  resetDatabase().catch((error) => {
    console.error('Erro não tratado:', error);
    process.exit(1);
  });
} else {
  // Exportar a função para poder ser chamada por outros scripts
  module.exports = resetDatabase;
}
