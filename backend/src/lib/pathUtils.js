import { fileURLToPath } from "url";
import { dirname } from "path";

export const getFileMeta = (metaUrl) => {
  const __filename = fileURLToPath(metaUrl);
  const __dirname = dirname(__filename);
  return { __filename, __dirname };
};
