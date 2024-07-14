import { z } from "zod";
import { loadWorkerByPromptInput } from "./load-by-prompt-input";
import { publishWorkerRegistries } from "./publish";

export const uploadWorkersOptionsSchema = z.object({
  input: z.string().optional(),
});

export type UploadWorkersOptions = z.infer<typeof uploadWorkersOptionsSchema>;

export async function upload(options: UploadWorkersOptions) {
  const {
    input,
  } = options;

  const registries = await loadWorkerByPromptInput();
  
  console.log('publicando...');
  await publishWorkerRegistries(registries);
  
  console.log('registros salvos com sucesso!');
}