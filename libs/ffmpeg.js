const fs = require('fs');
const path = require('path');

const pathToffmpeg = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const writingMetaData = require('../libs/writingMetaData');
const chalk = require('chalk');

const pathToFfmpeg = path.join(__dirname, '..');

ffmpeg.setFfmpegPath(`${pathToFfmpeg}/node_modules/ffmpeg-static/ffmpeg`);

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
