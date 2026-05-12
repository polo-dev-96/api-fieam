import express from 'express';
import captacaoRoutes from './routes/captacaoRoutes.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'API Alunos SesiSenai online' });
});

app.use('/api/captacao', captacaoRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada.' });
});

app.use((err, req, res, _next) => {
  console.error('[App] Erro não tratado:', err.message);
  res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
});

export default app;
