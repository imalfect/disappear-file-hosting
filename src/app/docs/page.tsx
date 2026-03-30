import Title from '@/components/Title';

export default function DocsPage() {
	return (
		<main className="min-h-dvh px-6 sm:px-8 py-12">
			<div className="mx-auto max-w-xl space-y-8">
				<div className="flex justify-center">
					<Title />
				</div>

				<div className="space-y-1 text-center">
					<h2 className="text-sm font-mono font-medium">api documentation</h2>
					<p className="text-xs font-mono text-muted-foreground">
						all endpoints are relative to the base url
					</p>
				</div>

				{/* Upload */}
				<section className="border border-border divide-y divide-border">
					<div className="p-4">
						<div className="flex items-center gap-2 mb-2">
							<span className="text-xs font-mono font-medium bg-foreground text-background px-1.5 py-0.5">POST</span>
							<code className="text-xs font-mono">/api/upload</code>
						</div>
						<p className="text-xs font-mono text-muted-foreground">
							upload a file. returns the file id.
						</p>
					</div>
					<div className="p-4 space-y-3">
						<div>
							<p className="text-xs font-mono font-medium mb-1">body</p>
							<p className="text-xs font-mono text-muted-foreground">
								<code>multipart/form-data</code> with a <code>file</code> field
							</p>
						</div>
						<div>
							<p className="text-xs font-mono font-medium mb-1">query parameters</p>
							<div className="space-y-2">
								<div className="flex gap-2 text-xs font-mono">
									<code className="text-muted-foreground shrink-0">slug</code>
									<span className="text-muted-foreground">—</span>
									<span className="text-muted-foreground">optional. custom short url (alphanumeric only)</span>
								</div>
								<div className="flex gap-2 text-xs font-mono">
									<code className="text-muted-foreground shrink-0">captcha</code>
									<span className="text-muted-foreground">—</span>
									<span className="text-muted-foreground">turnstile token (required for files &gt;100MB if configured)</span>
								</div>
								<div className="flex gap-2 text-xs font-mono">
									<code className="text-muted-foreground shrink-0">encrypted</code>
									<span className="text-muted-foreground">—</span>
									<span className="text-muted-foreground">set to <code>1</code> if file is client-side encrypted</span>
								</div>
								<div className="flex gap-2 text-xs font-mono">
									<code className="text-muted-foreground shrink-0">salt</code>
									<span className="text-muted-foreground">—</span>
									<span className="text-muted-foreground">hex-encoded 16-byte encryption salt (required if encrypted)</span>
								</div>
								<div className="flex gap-2 text-xs font-mono">
									<code className="text-muted-foreground shrink-0">iv</code>
									<span className="text-muted-foreground">—</span>
									<span className="text-muted-foreground">hex-encoded 12-byte encryption IV (required if encrypted)</span>
								</div>
							</div>
						</div>
						<div>
							<p className="text-xs font-mono font-medium mb-1">response</p>
							<pre className="text-xs font-mono text-muted-foreground bg-card border border-border p-3 overflow-x-auto">
{`{
  "uploadedId": "uuid"
}`}
							</pre>
						</div>
						<div>
							<p className="text-xs font-mono font-medium mb-1">errors</p>
							<div className="space-y-1">
								<p className="text-xs font-mono text-muted-foreground"><code>400</code> — missing file, invalid slug, or invalid encryption params</p>
								<p className="text-xs font-mono text-muted-foreground"><code>403</code> — captcha required or failed</p>
								<p className="text-xs font-mono text-muted-foreground"><code>413</code> — file exceeds 2GB limit</p>
							</div>
						</div>
					</div>
					<div className="p-4">
						<p className="text-xs font-mono font-medium mb-2">example</p>
						<pre className="text-xs font-mono text-muted-foreground bg-card border border-border p-3 overflow-x-auto">
{`curl -X POST \\
  -F "file=@photo.jpg" \\
  "https://dspr.lol/api/upload?slug=myphoto"`}
						</pre>
					</div>
				</section>

				{/* Download */}
				<section className="border border-border divide-y divide-border">
					<div className="p-4">
						<div className="flex items-center gap-2 mb-2">
							<span className="text-xs font-mono font-medium bg-foreground text-background px-1.5 py-0.5">GET</span>
							<code className="text-xs font-mono">/api/download/:id</code>
						</div>
						<p className="text-xs font-mono text-muted-foreground">
							download a file by its id. redirects to a presigned s3 url (1 hour expiry).
						</p>
					</div>
					<div className="p-4 space-y-3">
						<div>
							<p className="text-xs font-mono font-medium mb-1">query parameters</p>
							<div className="flex gap-2 text-xs font-mono">
								<code className="text-muted-foreground shrink-0">raw</code>
								<span className="text-muted-foreground">—</span>
								<span className="text-muted-foreground">set to <code>1</code> to get the presigned url as json instead of a 302 redirect</span>
							</div>
						</div>
						<div>
							<p className="text-xs font-mono font-medium mb-1">default response</p>
							<p className="text-xs font-mono text-muted-foreground"><code>302</code> redirect to presigned s3 url</p>
						</div>
						<div>
							<p className="text-xs font-mono font-medium mb-1">raw response</p>
							<pre className="text-xs font-mono text-muted-foreground bg-card border border-border p-3 overflow-x-auto">
{`{
  "url": "https://s3.../presigned-url"
}`}
							</pre>
						</div>
						<div>
							<p className="text-xs font-mono font-medium mb-1">errors</p>
							<div className="space-y-1">
								<p className="text-xs font-mono text-muted-foreground"><code>404</code> — file not found</p>
								<p className="text-xs font-mono text-muted-foreground"><code>410</code> — file has expired</p>
							</div>
						</div>
					</div>
					<div className="p-4">
						<p className="text-xs font-mono font-medium mb-2">example</p>
						<pre className="text-xs font-mono text-muted-foreground bg-card border border-border p-3 overflow-x-auto">
{`# direct download (follows redirect)
curl -L -o file.jpg \\
  "https://dspr.lol/api/download/UUID"

# get presigned url
curl "https://dspr.lol/api/download/UUID?raw=1"`}
						</pre>
					</div>
				</section>

				{/* Slug Check */}
				<section className="border border-border divide-y divide-border">
					<div className="p-4">
						<div className="flex items-center gap-2 mb-2">
							<span className="text-xs font-mono font-medium bg-foreground text-background px-1.5 py-0.5">GET</span>
							<code className="text-xs font-mono">/api/slug-check</code>
						</div>
						<p className="text-xs font-mono text-muted-foreground">
							check if a custom slug is available.
						</p>
					</div>
					<div className="p-4 space-y-3">
						<div>
							<p className="text-xs font-mono font-medium mb-1">query parameters</p>
							<div className="flex gap-2 text-xs font-mono">
								<code className="text-muted-foreground shrink-0">slug</code>
								<span className="text-muted-foreground">—</span>
								<span className="text-muted-foreground">the slug to check (alphanumeric only)</span>
							</div>
						</div>
						<div>
							<p className="text-xs font-mono font-medium mb-1">response</p>
							<pre className="text-xs font-mono text-muted-foreground bg-card border border-border p-3 overflow-x-auto">
{`{
  "available": true
}`}
							</pre>
						</div>
					</div>
				</section>

				{/* Short URL */}
				<section className="border border-border divide-y divide-border">
					<div className="p-4">
						<div className="flex items-center gap-2 mb-2">
							<span className="text-xs font-mono font-medium bg-foreground text-background px-1.5 py-0.5">GET</span>
							<code className="text-xs font-mono">/:slug</code>
						</div>
						<p className="text-xs font-mono text-muted-foreground">
							short url redirect. resolves a slug to its file view page.
						</p>
					</div>
					<div className="p-4">
						<p className="text-xs font-mono font-medium mb-1">response</p>
						<p className="text-xs font-mono text-muted-foreground"><code>307</code> redirect to <code>/viewfile/:id</code></p>
					</div>
				</section>

				{/* View File */}
				<section className="border border-border divide-y divide-border">
					<div className="p-4">
						<div className="flex items-center gap-2 mb-2">
							<span className="text-xs font-mono font-medium bg-foreground text-background px-1.5 py-0.5">PAGE</span>
							<code className="text-xs font-mono">/viewfile/:id</code>
						</div>
						<p className="text-xs font-mono text-muted-foreground">
							file info page. shows metadata, expiry, and download button. for encrypted files, prompts for password and decrypts in-browser.
						</p>
					</div>
				</section>

				{/* Notes */}
				<section className="border border-border p-4 space-y-2">
					<p className="text-xs font-mono font-medium">notes</p>
					<ul className="text-xs font-mono text-muted-foreground space-y-1 list-none">
						<li>— files expire after 24 hours</li>
						<li>— max file size is 2GB</li>
						<li>— uploads over 100MB may require captcha verification</li>
						<li>— rate limited to 5 uploads per 10 minutes</li>
						<li>— encryption is client-side (AES-256-GCM + PBKDF2). the server never sees the password or plaintext</li>
						<li>— presigned download urls expire after 1 hour</li>
					</ul>
				</section>
			</div>
		</main>
	);
}
