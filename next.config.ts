import withSerwist from "@serwist/next";

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["sharp", "onnxruntime-node"],
};

const withSerwistConfig = withSerwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

export default withSerwistConfig(nextConfig);
