import axios from 'axios';
import { env } from '../config/env.js';

let tokenCache = {
  token: null,
  expiresAt: null,
};

function extractToken(responseData) {
  const candidates = [
    responseData?.token,
    responseData?.access_token,
    responseData?.valor?.token,
    responseData?.data?.token,
    responseData?.data?.access_token,
    responseData?.result?.token,
    responseData?.result?.access_token,
    responseData?.jwt,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  if (responseData && typeof responseData === 'object') {
    for (const key of Object.keys(responseData)) {
      const value = responseData[key];
      if (typeof value === 'string' && value.length > 20) {
        return value.trim();
      }
    }
  }

  return null;
}

export async function login() {
  const url = `${env.DCM_BASE_URL}${env.DCM_LOGIN_PATH}`;

  console.log('[Auth] Realizando login na API DCM...');

  const response = await axios.post(
    url,
    {
      username: env.DCM_USERNAME,
      password: env.DCM_PASSWORD,
    },
    {
      timeout: env.REQUEST_TIMEOUT_MS,
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const token = extractToken(response.data);

  if (!token) {
    throw new Error('Token não encontrado na resposta de login da API DCM.');
  }

  const expiresAt = Date.now() + env.TOKEN_CACHE_MINUTES * 60 * 1000;

  tokenCache = { token, expiresAt };

  console.log(
    `[Auth] Login realizado com sucesso. Token válido por ${env.TOKEN_CACHE_MINUTES} minutos.`
  );

  return token;
}

export async function getValidToken() {
  const now = Date.now();

  if (tokenCache.token && tokenCache.expiresAt && now < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  return await login();
}

export function clearTokenCache() {
  tokenCache = { token: null, expiresAt: null };
  console.log('[Auth] Cache de token limpo. Próxima chamada fará novo login.');
}
