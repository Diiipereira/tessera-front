'use client';

import { globalErrorStyles } from '@/lib/global-error-styles';

export default function GlobalError({
	error,
	retry
}: {
	error: Error & { digest?: string };
	retry: () => void;
}) {
	return (
		<html lang="en">
			<body style={globalErrorStyles.body}>
				<title>Tessera could not start this page</title>
				<main style={globalErrorStyles.main}>
					<h1 style={globalErrorStyles.heading}>Tessera could not start this page.</h1>
					<p style={globalErrorStyles.body_text}>
						This is the dashboard itself failing, not one screen inside it. Trying again is worth a
						shot; if it keeps happening, the reference below is what ties this to the server log.
					</p>
					{error.digest === undefined ? null : (
						<p style={globalErrorStyles.digest}>{error.digest}</p>
					)}
					<button type="button" onClick={retry} style={globalErrorStyles.button}>
						Try again
					</button>
				</main>
			</body>
		</html>
	);
}
