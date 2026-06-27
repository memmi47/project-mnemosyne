import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.resolve("."),
  serverExternalPackages: ["better-sqlite3"]
};

export default nextConfig;
