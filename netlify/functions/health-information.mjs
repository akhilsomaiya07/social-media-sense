import { health } from '../../lib/health.mjs';

export default async function handler(request) {
  return health(request);
}

export const config = { path: '/api/health-information' };
