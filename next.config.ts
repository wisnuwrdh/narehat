import withSerwist from "@serwist/next";
import { withCloudflare } from "@opennextjs/cloudflare/config";

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

export default withCloudflare(withSerwistConfig(nextConfig));
