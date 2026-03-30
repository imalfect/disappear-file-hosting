import Title from '@/components/Title';

const serviceName = process.env.NEXT_PUBLIC_SERVICE_NAME || 'Disappear';

export default function TermsPage() {
	return (
		<main className="min-h-dvh px-6 sm:px-8 py-12">
			<div className="mx-auto max-w-xl space-y-8">
				<div className="flex justify-center">
					<Title />
				</div>

				<div className="space-y-1 text-center">
					<h2 className="text-sm font-mono font-medium">terms & conditions</h2>
					<p className="text-xs font-mono text-muted-foreground">
						by using this service you agree to the following terms
					</p>
				</div>

				<div className="border border-border divide-y divide-border">
					<div className="p-4 space-y-3">
						<p className="text-xs font-mono font-medium">1. acceptance of terms</p>
						<p className="text-xs font-mono text-muted-foreground leading-relaxed">
							by accessing or using {serviceName} (&quot;the service&quot;), you agree to be bound by these terms and conditions. if you do not agree, do not use the service.
						</p>
					</div>

					<div className="p-4 space-y-3">
						<p className="text-xs font-mono font-medium">2. prohibited content</p>
						<p className="text-xs font-mono text-muted-foreground leading-relaxed">
							you must not upload, share, or distribute any of the following:
						</p>
						<ul className="text-xs font-mono text-muted-foreground space-y-1 list-none">
							<li>— child sexual abuse material (CSAM) or any form of child exploitation content</li>
							<li>— non-consensual intimate imagery (revenge porn)</li>
							<li>— content that violates any applicable local, national, or international law</li>
							<li>— malware, viruses, or any software designed to damage or disrupt systems</li>
							<li>— copyrighted material you do not have the right to distribute</li>
							<li>— content that promotes terrorism, violence, or incites harm against individuals or groups</li>
							<li>— personal or private information of others without their consent (doxxing)</li>
							<li>— phishing pages, scam content, or fraudulent material</li>
						</ul>
					</div>

					<div className="p-4 space-y-3">
						<p className="text-xs font-mono font-medium">3. file storage & expiration</p>
						<p className="text-xs font-mono text-muted-foreground leading-relaxed">
							all files are temporary and automatically expire after 24 hours. we do not guarantee availability of files during this period. the service may delete files before expiration at its discretion.
						</p>
					</div>

					<div className="p-4 space-y-3">
						<p className="text-xs font-mono font-medium">4. encryption</p>
						<p className="text-xs font-mono text-muted-foreground leading-relaxed">
							the service offers optional client-side encryption. when encryption is used, the server has no ability to access the contents of the file. this does not exempt you from the prohibited content rules above. you are solely responsible for the content you upload, encrypted or not.
						</p>
					</div>

					<div className="p-4 space-y-3">
						<p className="text-xs font-mono font-medium">5. no warranty</p>
						<p className="text-xs font-mono text-muted-foreground leading-relaxed">
							the service is provided &quot;as is&quot; without warranty of any kind, express or implied. we do not guarantee uptime, data integrity, or availability. use the service at your own risk.
						</p>
					</div>

					<div className="p-4 space-y-3">
						<p className="text-xs font-mono font-medium">6. limitation of liability</p>
						<p className="text-xs font-mono text-muted-foreground leading-relaxed">
							in no event shall the service operators be liable for any damages arising from the use or inability to use the service, including but not limited to loss of data, loss of profits, or any indirect, incidental, or consequential damages.
						</p>
					</div>

					<div className="p-4 space-y-3">
						<p className="text-xs font-mono font-medium">7. abuse & enforcement</p>
						<p className="text-xs font-mono text-muted-foreground leading-relaxed">
							we reserve the right to remove any content and block any user or ip address at any time, without notice, for any reason. violations of these terms may be reported to relevant law enforcement authorities.
						</p>
					</div>

					<div className="p-4 space-y-3">
						<p className="text-xs font-mono font-medium">8. rate limits & fair use</p>
						<p className="text-xs font-mono text-muted-foreground leading-relaxed">
							the service enforces rate limits to prevent abuse. do not attempt to circumvent these limits. excessive or automated usage that degrades the service for others may result in access being restricted.
						</p>
					</div>

					<div className="p-4 space-y-3">
						<p className="text-xs font-mono font-medium">9. changes to terms</p>
						<p className="text-xs font-mono text-muted-foreground leading-relaxed">
							we reserve the right to modify these terms at any time. continued use of the service after changes constitutes acceptance of the updated terms.
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}
