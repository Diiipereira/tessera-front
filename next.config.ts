import type { NextConfig } from 'next';

const config: NextConfig = {
	reactStrictMode: true,
	typedRoutes: true,
	images: {
		remotePatterns: [{ protocol: 'https', hostname: 'cdn.discordapp.com', pathname: '/**' }]
	}
};

export default config;
