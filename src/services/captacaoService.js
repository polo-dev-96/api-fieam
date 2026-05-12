import axios from 'axios';
import { env } from '../config/env.js';
import { getValidToken, clearTokenCache } from './authService.js';
import { sleep } from '../utils/sleep.js';

const ENTIDADE_MAP = {
  2: 'SESI',
  3: 'SENAI',
};

function extractRecords(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  const candidates = [
    responseData?.data,
    responseData?.dados,
    responseData?.result,
    responseData?.items,
    responseData?.lista,
    responseData?.registros,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  if (responseData && typeof responseData === 'object') {
    for (const key of Object.keys(responseData)) {
      if (Array.isArray(responseData[key])) {
        return responseData[key];
      }
    }
  }

  return [];
}

export async function fetchCaptacaoPage(coligada, pagina, retryOnAuth = true) {
  const url = `${env.DCM_BASE_URL}${env.DCM_CAPTACAO_PATH}`;
  const token = await getValidToken();

  try {
    const response = await axios.post(
      url,
      { coligada, pagina },
      {
        timeout: env.REQUEST_TIMEOUT_MS,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    const status = error.response?.status;

    if (status === 404) {
      return null;
    }

    if ((status === 401 || status === 403) && retryOnAuth) {
      console.warn(
        `[Captacao] Token inválido (${status}). Renovando token e tentando novamente...`
      );
      clearTokenCache();
      return fetchCaptacaoPage(coligada, pagina, false);
    }

    throw error;
  }
}

function applyFilters(records, filters) {
  let result = records;

  if (filters.cpf) {
    result = result.filter((r) => r.CPF === filters.cpf);
  }

  if (filters.periodo_letivo) {
    result = result.filter((r) => {
      const ano = r.PERIODO_LETIVO ? String(r.PERIODO_LETIVO).slice(0, 4) : null;
      return ano === String(filters.periodo_letivo);
    });
  }

  return result;
}

export async function fetchAllCaptacao(coligada, filters = {}) {
  const entidade = ENTIDADE_MAP[coligada];

  if (!entidade) {
    throw new Error(`Coligada ${coligada} não mapeada. Use 2 (SESI) ou 3 (SENAI).`);
  }

  const allRecords = [];
  let pagina = 0;
  let totalPaginasConsultadas = 0;

  while (pagina < env.MAX_PAGES) {
    console.log(`[Captacao] Consultando ${entidade} - página ${pagina}`);

    let responseData;

    try {
      responseData = await fetchCaptacaoPage(coligada, pagina);
    } catch (error) {
      console.error(
        `[Captacao] Erro ao consultar ${entidade} - página ${pagina}: ${error.message}`
      );
      throw new Error(
        `Falha ao buscar dados de ${entidade} na página ${pagina}: ${error.message}`
      );
    }

    const records = extractRecords(responseData);

    if (!records || records.length === 0) {
      console.log(
        `[Captacao] Página ${pagina} de ${entidade} retornou vazia. Paginação encerrada.`
      );
      break;
    }

    allRecords.push(...records);
    totalPaginasConsultadas++;
    pagina++;

    if (pagina < env.MAX_PAGES) {
      await sleep(env.REQUEST_DELAY_MS);
    }
  }

  if (pagina >= env.MAX_PAGES) {
    console.warn(
      `[Captacao] Limite máximo de páginas (${env.MAX_PAGES}) atingido para ${entidade}.`
    );
  }

  const filteredRecords = applyFilters(allRecords, filters);

  console.log(
    `[Captacao] ${entidade} concluído. Páginas: ${totalPaginasConsultadas}, Registros: ${allRecords.length}, Após filtros: ${filteredRecords.length}`
  );

  return {
    coligada,
    entidade,
    totalPaginasConsultadas,
    totalRegistros: filteredRecords.length,
    data: filteredRecords,
  };
}
