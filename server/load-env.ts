/**
 * Load environment variables from .env.local
 * This file should be imported at the very beginning of the application
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load .env.local from project root
const envLocalPath = path.resolve(__dirname, "..", ".env.local");

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  const lines = envContent.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    // Parse KEY=VALUE
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();

      // Only set if not already set in process.env
      if (!process.env[key]) {
        // Remove quotes if present
        const cleanValue = value
          .replace(/^['"]|['"]$/g, "")
          .replace(/\\n/g, "\n");
        process.env[key] = cleanValue;
      }
    }
  }

  console.log(`✓ Loaded environment variables from ${envLocalPath}`);
} else {
  console.warn(
    `⚠ .env.local not found at ${envLocalPath}. Using system environment variables.`,
  );
}
