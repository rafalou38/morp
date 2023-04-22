<script lang="ts">
	import '../app.css';
	import { createStyleString } from '@capsizecss/core';
	import fontMetrics from '@capsizecss/metrics/dosis';

	const dosis = createStyleString('capsize-dosis-12', {
		capHeight: 12,
		lineGap: 24,
		fontMetrics,
	});

	const cssCode = '<st' + 'yle>' + dosis + '</sty' + 'le>';
</script>

<slot />

{@html cssCode}
