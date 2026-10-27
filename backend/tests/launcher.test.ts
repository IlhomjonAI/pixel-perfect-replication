// @vitest-environment node
import { spawn } from "node:child_process";
import { createServer, type AddressInfo } from "node:net";
import { expect, it } from "vitest";

it.each(["Frontend", "Backend"])(
  "reports an occupied %s port before starting services",
  async (label) => {
    const blocker = createServer();
    await new Promise<void>((resolve) => blocker.listen(0, "127.0.0.1", resolve));
    const port = (blocker.address() as AddressInfo).port;
    try {
      const child = spawn(process.execPath, ["scripts/run.mjs", "dev"], {
        env: {
          ...process.env,
          PORT: label === "Frontend" ? String(port) : "0",
          API_PORT: label === "Backend" ? String(port) : "0",
          API_HOST: "127.0.0.1",
        },
        stdio: ["ignore", "pipe", "pipe"],
      });
      let output = "";
      child.stdout!.on("data", (chunk) => {
        output += String(chunk);
      });
      child.stderr!.on("data", (chunk) => {
        output += String(chunk);
      });
      const code = await new Promise<number | null>((resolve, reject) => {
        child.once("error", reject);
        child.once("exit", resolve);
      });
      expect(code).toBe(1);
      expect(output).toContain(`${label}: ${port}-port band`);
      expect(output).not.toContain("Node.js API:");
      expect(output).not.toContain("EADDRINUSE");
    } finally {
      await new Promise<void>((resolve) => blocker.close(() => resolve()));
    }
  },
);
