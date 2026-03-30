/** @type {import('next').NextConfig} */
const nextConfig = {
	serverExternalPackages: ['mongoose'],
	experimental: {
		serverActions: {
			bodySizeLimit: '2gb',
		},
	},
};

module.exports = nextConfig;
