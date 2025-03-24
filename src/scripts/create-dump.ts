import { AppDataSource } from '../database/datasource';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

const execPromise = util.promisify(exec);

async function createFullDump() {
  try {
    // Inicializar a conexão
    await AppDataSource.initialize();
    console.log('✓ Conexão com o banco de dados inicializada');

    // Obter credenciais do BD do arquivo de ambiente
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '5432';
    const username = process.env.DB_USER || '';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || '';

    // Definir o caminho do arquivo de saída
    const dumpFilePath = path.join(process.cwd(), 'full-database-dump.sql');

    // Configurar a variável de ambiente temporária para a senha
    process.env.PGPASSWORD = password;

    // Construir o comando pg_dump
    const pgDumpCommand = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -F p -f "${dumpFilePath}"`;

    console.log('Gerando dump completo do banco de dados...');
    const { stderr } = await execPromise(pgDumpCommand);

    if (stderr && !stderr.includes('PostgreSQL database dump complete')) {
      throw new Error(`Erro ao executar pg_dump: ${stderr}`);
    }

    // Limpar a variável de ambiente da senha
    delete process.env.PGPASSWORD;

    console.log(`✓ Dump completo gerado em: ${dumpFilePath}`);
    console.log(
      `Tamanho do arquivo: ${(fs.statSync(dumpFilePath).size / 1024 / 1024).toFixed(2)} MB`,
    );
  } catch (error) {
    console.error('❌ Erro ao criar dump:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✓ Conexão com o banco de dados fechada');
    }
  }
}

// Executar a função
createFullDump().catch((err) => {
  console.error('Erro não tratado:', err);
  process.exit(1);
});
