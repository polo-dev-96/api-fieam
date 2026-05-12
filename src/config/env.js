import 'dotenv/config';

const requiredVars = [
  'DCM_BASE_URL',
  'DCM_LOGIN_PATH',
  'DCM_CAPTACAO_PATH',
  'DCM_USERNAME',
  'DCM_PASSWORD',
];

const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Variáveis de ambiente obrigatórias não definidas: ${missing.join(', ')}\n` +
    'Configure o arquivo .env com base no .env.example.'
  );
}

export const env = {
  PORT: parseInt(process.env.PORT) || 3000,

  DCM_BASE_URL: process.env.DCM_BASE_URL,
  DCM_LOGIN_PATH: process.env.DCM_LOGIN_PATH,
  DCM_CAPTACAO_PATH: process.env.DCM_CAPTACAO_PATH,

  DCM_USERNAME: process.env.DCM_USERNAME,
  DCM_PASSWORD: process.env.DCM_PASSWORD,

  TOKEN_CACHE_MINUTES: parseInt(process.env.TOKEN_CACHE_MINUTES) || 115,
  REQUEST_TIMEOUT_MS: parseInt(process.env.REQUEST_TIMEOUT_MS) || 30000,
  REQUEST_DELAY_MS: parseInt(process.env.REQUEST_DELAY_MS) || 200,
  MAX_PAGES: parseInt(process.env.MAX_PAGES) || 500,
};
