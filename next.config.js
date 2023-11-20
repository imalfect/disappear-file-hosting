/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	experimental: {
		serverActions: {
			bodySizeLimit: '1gb',
			allowedOrigins: ['localhost:5010'],
			allowedForwardedHosts: ['localhost:5010'],
		}
	}
};

module.exports = nextConfig;
