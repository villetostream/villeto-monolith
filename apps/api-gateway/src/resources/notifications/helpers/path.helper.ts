import { existsSync } from "fs";
import { join } from "path";

export function resolveTemplatesDir(): string {
  // likely dev locations (ts-node / nest start:dev)
  const dev1 = join(process.cwd(), 'apps', 'api-gateway', 'src', 'resources', 'notifications', 'mail', 'templates');
  const dev2 = join(__dirname, '..', 'mail', 'templates'); // relative to the module file in source

  // common compiled/dist locations in a monorepo
  const dist1 = join(process.cwd(), 'dist', 'apps', 'api-gateway', 'src', 'resources', 'notifications', 'mail', 'templates');
  const dist2 = join(process.cwd(), 'dist', 'apps', 'api-gateway', 'resources', 'notifications', 'mail', 'templates');
  const dist3 = join(process.cwd(), 'dist', 'apps', 'api-gateway', 'mail', 'templates'); // the error showed this path

  const candidates = [dev1, dev2, dist1, dist2, dist3];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      console.log('[Mailer] templates dir found:', candidate);
      return candidate;
    }
  }

  // last resort: return the dev1 path (throws later with clearer message)
  console.warn('[Mailer] templates not found in candidates, returning fallback:', dev1);
  return dev1;
}