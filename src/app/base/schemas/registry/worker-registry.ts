import { WORKER_REGISTRIES_SCHEMA } from '@andrey-allyson/escalas-automaticas/dist/extra-duty-lib/structs/worker-registries';
import zod from 'zod';

export const workerRegistrySchema = zod.object({
  ...WORKER_REGISTRIES_SCHEMA.shape,
  name: zod.string(),
  isCoordinator: zod.boolean().optional(),
  role: zod.enum([
    'coordinator'
  ]).array().optional(),
});