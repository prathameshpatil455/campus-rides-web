const fs = require('fs');
const path = require('path');
require('dotenv').config();

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');
const envTsPath = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');
const envProdTsPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

const baseApiUrl = process.env.BASE_API_URL || 'http://localhost:3000/api';

const envTsContent = `export const environment = {
  apiBaseUrl: '${baseApiUrl}',
  production: false,
};
`;

const envProdTsContent = `export const environment = {
  apiBaseUrl: '${process.env.BASE_API_URL || 'https://campus-rides-service.onrender.com/api'}',
  production: true,
};
`;

fs.writeFileSync(envTsPath, envTsContent);
fs.writeFileSync(envProdTsPath, envProdTsContent);

console.log('✅ Environment files synced from .env');

