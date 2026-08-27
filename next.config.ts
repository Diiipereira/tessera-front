import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const config: NextConfig = {
	reactStrictMode: true,
	typedRoutes: true,
	images: {
		remotePatterns: [{ protocol: 'https', hostname: 'cdn.discordapp.com', pathname: '/**' }]
	}
};

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

export default withNextIntl(config);
