import './config/env.js';
import app from './app.js';
import { env } from './config/env.js';

app.listen(env.PORT, () => {
  console.log(`[Server] API Alunos SesiSenai rodando na porta ${env.PORT}`);
  console.log(`[Server] Health check: http://localhost:${env.PORT}/health`);
  console.log(`[Server] SESI:         http://localhost:${env.PORT}/api/captacao/sesi`);
  console.log(`[Server] SENAI:        http://localhost:${env.PORT}/api/captacao/senai`);
});
