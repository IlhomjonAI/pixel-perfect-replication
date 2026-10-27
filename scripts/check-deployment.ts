import "../backend/config";
import { deploymentErrors } from "../backend/lib/deployment";

const target = process.argv[2];
if (target !== "frontend" && target !== "backend") {
  console.error("Foydalanish: npm run deploy:check -- frontend|backend");
  process.exitCode = 1;
} else {
  const errors = deploymentErrors(target, process.env);
  for (const error of errors) console.error(error);
  if (errors.length) process.exitCode = 1;
  else console.log(`${target}: sozlamalar tekshirildi. Hostingda ulanishlarni ham sinang.`);
}
