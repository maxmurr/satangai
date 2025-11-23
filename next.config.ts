import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  typedRoutes: true,
  reactCompiler: true,
  cacheComponents: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
    typedEnv: true,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/en/cash-flow",
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
