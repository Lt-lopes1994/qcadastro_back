import { Request } from 'express';

export function getClientIp(request: Request): string {
  // Obter IP do cabeçalho X-Forwarded-For quando atrás de proxy
  let ip = request.ip;

  // Fallbacks
  if (!ip || ip === '::1' || ip === '127.0.0.1') {
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      ip = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0].trim();
    } else if (request.headers['x-real-ip']) {
      ip = request.headers['x-real-ip'] as string;
    } else {
      ip = request.connection.remoteAddress || '0.0.0.0';
    }
  }

  // Limpar IPv6 prefix se presente
  return ip.replace(/^::ffff:/, '');
}
