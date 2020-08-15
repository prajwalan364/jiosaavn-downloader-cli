const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const writingMetaData = require('../libs/writingMetaData');
const chalk = require('chalk');

ffmpeg.setFfmpegPath('./ffmpeg-20200730-134a48a-win64-static/bin/ffmpeg.exe'); //Add your ffmpeg.exe path
ffmpeg.setFfprobePath('./ffmpeg-20200730-134a48a-win64-static/bin/ffprobe.exe'); // Add your ffprobe.exe path

const convertTomp3 = async (path, coverFile, songData) => {
	console.log(chalk.hex('#16a085')('[•]mp4 Detected Converting to mp3....'));
	ffmpeg(`./Download/${path}`)
		.toFormat('mp3')
		.audioBitrate('320k')
		.saveToFile(`./Download/${path.split('.')[0]}.mp3`)
		.on('error', (err) => console.log(err))
		.on('progress', () => {})
		.on('end', () => {
			const file = `${path.split('.')[0]}.mp3`;
			fs.unlink(`./Download/${path}`, () => {});
			console.log(chalk.hex('#2ecc71')('[ ✓ ] Converted'));
			writingMetaData(file, coverFile, songData);
		});
};

module.exports = convertTomp3;
