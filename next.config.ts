import withSerwist from "@serwist/next";

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

const withSerwistConfig = withSerwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

export default withSerwistConfig(nextConfig);
