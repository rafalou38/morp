export function Waiter(delay: number) {
	// TODO: Reduce excess time from next time
	let lastRun = 0;

	return () => {
		if (Date.now() - lastRun > delay) {
			lastRun = Date.now();
			return true;
		} else {
			return false;
		}
	};
}
