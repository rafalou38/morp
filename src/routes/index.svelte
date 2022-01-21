<script lang="ts">
	import GUN from 'gun';

	const gun = GUN('https://rgun.herokuapp.com/gun');

	const copy = gun.get('test').get('paste');

	let text = '';

	function update() {
		copy.put(this.value);
	}
	copy.on((data) => {
		text = data;
	});
</script>

<textarea name="" id="" cols="30" rows="10" on:input={update}>{text}</textarea>
