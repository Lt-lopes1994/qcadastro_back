/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { AppDataSource } from '../database/datasource';
import * as fs from 'fs';
import * as path from 'path';

async function exportSchema() {
  try {
    // Inicializar a conexão
    await AppDataSource.initialize();
    console.log('✓ Conexão com o banco de dados inicializada');

    // Obter o schema builder do TypeORM
    const schemaBuilder = AppDataSource.driver.createSchemaBuilder();

    // Gerar SQL para o esquema completo
    const sqlSchemaQueries = await schemaBuilder.log();

    // Extrair as queries do objeto SqlInMemory
    const queries = sqlSchemaQueries.upQueries.map((q) => q.query);

    // Caminho para salvar o arquivo SQL
    const filePath = path.join(process.cwd(), 'full-schema.sql');

    // Escrever as consultas no arquivo
    fs.writeFileSync(filePath, queries.join(';\n') + ';', 'utf8');

    console.log(`✓ Esquema completo exportado para ${filePath}`);
  } catch (error) {
    console.error('❌ Erro ao exportar esquema:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✓ Conexão com o banco de dados fechada');
    }
  }
}

// Executar a função
exportSchema().catch((err) => {
  console.error('Erro não tratado:', err);
  process.exit(1);
});
