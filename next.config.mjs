/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.ufs.sh",
            },
            {
                protocol: "https",
                hostname: "utfs.io",
            },
        ],
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /\.mjs$/,
            include: /node_modules/,
            type: "javascript/auto",
        });

        return config;
    },
};

export default nextConfig;