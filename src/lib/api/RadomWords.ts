const API_URL = 'https://random-words-api-five.vercel.app/word';

async function randomNoun() {
	return fetch(API_URL + '/noun')
		.then((res) => res.json())
		.then((data) => data[0].word);
}
async function randomAdjective() {
	return fetch(API_URL + '/adjective')
		.then((res) => res.json())
		.then((data) => data[0].word);
}
export async function randomUsername() {
	try {
		const [adj, noun] = await Promise.all([randomAdjective(), randomNoun()]);
		return (adj + ' ' + noun).toLowerCase();
	} catch (error) {
		return null;
	}
}
