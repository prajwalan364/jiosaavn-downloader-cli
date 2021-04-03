/* 
	JIO SAAVN DOWNLOADER 

	Author : Prajwalan M

	Description: Download Songs From JioSaavn 
	Install Instruction
		1.run npm install

	Executing: npm start 

	NOTE: Songs are stored in Download Folder 
*/

const fs = require('fs');
const path = require('path');

const { DownloaderHelper } = require('node-downloader-helper');
const prompt = require('prompt-sync')();
const figlet = require('figlet');
const chalk = require('chalk');
const cliProgress = require('cli-progress');
const colors = require('colors');
const _ = require('lodash');
const async = require('async');
const UA = require('user-agents');
const utf8 = require('utf8');

const userAgentCreator = new UA({ deviceCategory: 'desktop' });

const convertTomp3 = require('./libs/ffmpeg');
const writingMetaData = require('./libs/writingMetaData');
const {
	generateAlbumData,
	generateSongData,
	generateSearchSongData,
	generatePlaylistData,
} = require('./utils/api');

let user = userAgentCreator.random().toString();

class Downloader {
	constructor() {
		this.q = async.queue(this.singleFile, 1);

		// assign a callback
		this.q.drain(function () {
			//console.log(chalk.hex('#e67e22')('ALL Downloads are Completed'));
		});

		// assign an error callback
		this.q.error(function (err, task) {
			console.error('task experienced an error', task);
		});
	}

	downloadFiles(songs) {
		for (let song of songs) {
			this.q.push(song);
		}
	}

	singleFile(song, cb) {
		const bar = new cliProgress.SingleBar(
			{
				format:
					colors.cyan('[{bar}]') +
					'{percentage}% | Speed: {speed} KB/s | ETA: {eta}s',
			},
			cliProgress.Presets.shades_classic
		);

		const dir =
			fs.existsSync('./Download') && fs.lstatSync('./Download').isDirectory();

		if (!dir) {
			fs.mkdirSync('./Download');
		}

		let filenames = {};
		const dl_song = new DownloaderHelper(song.download_link, './Download', {
			headers: { 'User-Agent': user },
			retry: { maxRetries: 2, delay: 100 },
			forceResume: true,
		});
		const dl_cover = new DownloaderHelper(song.song_image, './Download', {
			headers: { 'User-Agent': user },
			retry: { maxRetries: 2, delay: 100 },
			forceResume: true,
		});

		dl_song.on('download', (data) => {
			bar.start(data.totalSize, 0);
		});
		dl_song.on('progress', (data) => {
			bar.update(data.downloaded, {
				speed: data.speed / Math.pow(1024, 1),
			});
		});

		dl_song.on('end', (data) => {
			let fileSize = data.downloadedSize / Math.pow(1024, 2);
			bar.stop();
			console.log(
				chalk.hex('#e67e22')(
					`\nDownload Completed: ${data.fileName} Size: ${fileSize.toFixed(
						2
					)} MB`
				)
			);
			filenames.file = data.fileName;
			dl_cover.start();
		});

		dl_cover.on('end', (data) => {
			filenames.cover = data.fileName;
			chkForFormat(filenames.file, filenames.cover, song);
			cb();
		});

		dl_song.on('error', (err) => {
			console.log(err);
		});

		dl_cover.on('error', (err) => {
			console.log(err);
		});

		dl_song.start();
	}
}

const chkForFormat = async (file, coverFile, songData) => {
	if (file.split('.')[1] === 'mp4' || file.split('.')[1] === 'm4a') {
		await convertTomp3(file, coverFile, songData);
	} else if (file.split('.')[1] === 'mp3') {
		await writingMetaData(file, coverFile, songData);
	} else {
		console.log(chalk.hex('#c0392b')('Invalid File Format'));
	}
};

const main = async () => {
	console.log(
		figlet.textSync('JIO SAAVN DOWNLOADER', {
			font: 'Bloody',
			horizontalLayout: 'default',
			verticalLayout: 'default',
			whitespaceBreak: true,
		})
	);
	while (true) {
		console.log(
			chalk.hex('#1dd1a1')(
				'\n[1]: Single Song Download\n[2]: Search\n[3]: Album Download(Buggy)\n[4]: Playlist Download(Buggy)\n[0]: Exit'
			)
		);
		const input = prompt('[ ➤ ]Enter Your Choice: ');
		switch (input) {
			case '1': {
				const url = prompt('\t[ ➤ ] Enter the JioSaavn Song URL: ');
				let songData = await generateSongData(url);

				const dl = new Downloader();
				dl.downloadFiles([songData.result[0]]);
				return;
			}
			case '2': {
				const query = prompt('\t[ ➤ ] Enter Song Name: ');
				let songData = await generateSearchSongData(query);
				const songs = Object.values(songData);
				_.map(songs[0], (song, index) => {
					console.log(chalk.hex('#00cec9')(`[${index}]: ${song.song_title}`));
				});
				const inx = prompt('\t[ ➤ ] Enter Song Number: ');

				const dl = new Downloader();
				dl.downloadFiles([songs[0][inx]]);
				return;
			}
			case '3': {
				const url = prompt('\t[ ➤ ] Enter the JioSaavn Album URL: ');
				let data = await generateAlbumData(url);

				const dl = new Downloader();
				_.map(data.result, async (song) => {
					await dl.downloadFiles([song]);
				});
				return;
			}

			case '4': {
				const url = prompt('\t[ ➤ ] Enter the JioSaavn Playlist URL: ');
				let data = await generatePlaylistData(url);
				const dl = new Downloader();
				_.map(data.result, async (song) => {
					await dl.downloadFiles([song]);
				});
				return;
			}
			case '0':
				process.exit();

			default:
				console.log(chalk.hex('#e74c3c')('\n[ ✘ ] Invalid Choice'));
		}
	}
};

main();
