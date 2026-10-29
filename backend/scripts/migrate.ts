import "../config";
import { connectDatabase } from "../database/connect";
const db = await connectDatabase();
try {
  await db.migrate();
  console.log(`${db.dialect}: database migrations applied.`);
} finally {
  await db.close();
}
