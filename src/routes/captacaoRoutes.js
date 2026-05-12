import { Router } from 'express';
import {
  getSesiCaptacao,
  getSenaiCaptacao,
  getCaptacaoByColigada,
} from '../controllers/captacaoController.js';

const router = Router();

router.get('/sesi', getSesiCaptacao);
router.get('/senai', getSenaiCaptacao);
router.get('/:coligada', getCaptacaoByColigada);

export default router;
