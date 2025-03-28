const express = require('express');
const { exec } = require('child_process');
import * as crypto from 'crypto';

const app = express();
app.use(express.json());

// Substitua pelo mesmo secret configurado no GitHub
const WEBHOOK_SECRET = 'QCadastro#Secret@2025';

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);

  // Validar o Secret
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = `sha256=${hmac.update(payload).digest('hex')}`;

  if (signature !== digest) {
    console.error('Assinatura inválida!');
    return res.status(403).send('Assinatura inválida!');
  }

  const branch = req.body.ref; // Exemplo: "refs/heads/master"

  if (branch === 'refs/heads/master') {
    console.log('Atualização detectada na branch master. Aplicando atualizações...');

    // Executar o script de atualização
    exec('bash /home/ubuntu/qcadastro_back/update-project.sh', (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao atualizar o projeto: ${error.message}`);
        return res.status(500).send('Erro ao atualizar o projeto.');
      }
      console.log(`Saída do script: ${stdout}`);
      console.error(`Erros do script: ${stderr}`);
      res.status(200).send('Atualização aplicada com sucesso.');
    });
  } else {
    res.status(200).send('Nenhuma ação necessária.');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor de webhook rodando na porta ${PORT}`);
});