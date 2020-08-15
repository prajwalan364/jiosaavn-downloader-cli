const fs = require('fs');
const ID3Writer = require('browser-id3-writer');
const chalk = require('chalk');
const { hex } = require('chalk');

const writingMetaData = async (file, coverFile, songData) => {
	console.log(chalk.hex('#3498db')('[•]Writing Meta Data...'));
	const songBuffer = fs.readFileSync(`./Download/${file}`);
	const coverBuffer = fs.readFileSync(`./Download/${coverFile}`);

	const writer = new ID3Writer(songBuffer);
	await writer
		.setFrame('TIT2', songData.song_title)
		.setFrame('TALB', songData.album_title)
		.setFrame('TPE1', [songData.artist_name])
		.setFrame('TYER', songData.year)
		.setFrame('TLAN', songData.language)
		.setFrame('TCOM', [songData.music])
		.setFrame('APIC', {
			type: 3,
			data: coverBuffer,
			description: songData.label,
		});

	writer.addTag();

	const mp3Buffer = Buffer.from(writer.arrayBuffer);
	fs.writeFileSync(`./Download/${songData.song_title}.mp3`, mp3Buffer);

	fs.unlink(`./Download/${file}`, () => {
		//console.log('file deleted');
	});
	fs.unlink(`./Download/${coverFile}`, () => {
		//console.log('file deleted');
	});
	console.log(
		chalk.hex('#e67e22')(`[ ✓ ]Completed: ${songData.song_title}.mp3\n`)
	);
};

module.exports = writingMetaData;
