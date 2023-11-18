/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	experimental: {
		serverActions: {
			bodySizeLimit: '1gb'
		}
	}
};

module.exports = nextConfig;