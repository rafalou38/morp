import type { Handle } from '@sveltejs/kit';
const excluded_SSR = [
	//'capture-race'
]
	.map((v) => `(${v})`)
	.join('|');
export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.match(excluded_SSR)) {
		return resolve(event, {
			ssr: false
		});
	}

	return resolve(event);
};
