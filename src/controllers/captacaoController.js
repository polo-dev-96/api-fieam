import { fetchAllCaptacao } from '../services/captacaoService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export async function getSesiCaptacao(req, res) {
  const { cpf, periodo_letivo } = req.query;
  const filters = { cpf, periodo_letivo };
  try {
    const result = await fetchAllCaptacao(2, filters);
    return successResponse(res, { success: true, ...result });
  } catch (error) {
    console.error('[Controller] Erro ao buscar SESI:', error.message);
    return errorResponse(res, error.message);
  }
}

export async function getSenaiCaptacao(req, res) {
  const { cpf, periodo_letivo } = req.query;
  const filters = { cpf, periodo_letivo };
  try {
    const result = await fetchAllCaptacao(3, filters);
    return successResponse(res, { success: true, ...result });
  } catch (error) {
    console.error('[Controller] Erro ao buscar SENAI:', error.message);
    return errorResponse(res, error.message);
  }
}

export async function getCaptacaoByColigada(req, res) {
  const coligada = parseInt(req.params.coligada);

  if (coligada !== 2 && coligada !== 3) {
    return errorResponse(
      res,
      'Coligada inválida. Use 2 para SESI ou 3 para SENAI.',
      400
    );
  }

  const { cpf, periodo_letivo } = req.query;
  const filters = { cpf, periodo_letivo };
  try {
    const result = await fetchAllCaptacao(coligada, filters);
    return successResponse(res, { success: true, ...result });
  } catch (error) {
    console.error(`[Controller] Erro ao buscar coligada ${coligada}:`, error.message);
    return errorResponse(res, error.message);
  }
}
