import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const config: NextConfig = {
	reactStrictMode: true,
	typedRoutes: true,
	pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
	images: {
		remotePatterns: [{ protocol: 'https', hostname: 'cdn.discordapp.com', pathname: '/**' }]
	}
};

const withMDX = createMDX({
	options: {
		remarkPlugins: ['remark-frontmatter', 'remark-gfm']
	}
});

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

export default withNextIntl(withMDX(config));
