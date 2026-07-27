import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import withSerwist from "@serwist/next";

initOpenNextCloudflareForDev();

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["sharp", "onnxruntime-node"],
  outputFileTracingExcludes: {
    "*": ["**/onnxruntime-node/**", "**/sharp/**"],
  },
};

const withSerwistConfig = withSerwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

export default withSerwistConfig(nextConfig);
