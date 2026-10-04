/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // WalletConnect pulls in optional Node-only packages; mark them external
  // so the build doesn't print warnings / fail.
  webpack: (config) => {
    config.externals.push(
      "pino-pretty",
      "lokijs",
      "encoding",
      // Coinbase's optional x402 payment SDK (pulled in indirectly via
      // RainbowKit -> wagmi connectors -> @base-org/account) references
      // several submodules we never use. Ignore all of them with one rule
      // instead of listing each path individually.
      ({ request }, callback) => {
        if (request && request.startsWith("@x402/")) {
          return callback(null, "commonjs " + request);
        }
        callback();
      }
    );
    return config;
  },
};

export default nextConfig;
