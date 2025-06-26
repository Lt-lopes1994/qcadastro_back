// test-certificate.ts
import * as fs from 'fs';
import * as path from 'path';

// Usar caminho relativo ao projeto
const projectRoot = path.resolve(__dirname, '../..');
const certificatePath = path.join(
  projectRoot,
  'etc/qcadastro/certs/QUALITY_TRANSPORTES_E_ENTREGAS_RAPIDAS_LTDA06321409000196.pfx'
);

console.log('Caminho do certificado:', certificatePath);

try {
  // Verificar se o arquivo existe
  const exists = fs.existsSync(certificatePath);
  console.log(`Certificado existe: ${exists}`);

  if (exists) {
    // Tentar ler o arquivo
    const stats = fs.statSync(certificatePath);
    console.log(`Tamanho do certificado: ${stats.size} bytes`);
    console.log(`Permissões: ${stats.mode.toString(8)}`);

    // Tentar abrir o arquivo
    const fd = fs.openSync(certificatePath, 'r');
    console.log('Arquivo pode ser aberto para leitura');
    fs.closeSync(fd);
  }
} catch (error) {
  console.error('Erro ao acessar o certificado:', error);
}
