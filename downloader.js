/* 
	JIO SAAVN DOWNLOADER 

	Author : Prajwalan M

	Description: Download Songs From JioSaavn 
	NOTE: some of the songs are in mp4,m4a which are not supporting for metadata creatation,
		  so these songs are converted to mp3 by using ffmpeg library

	Warning: ffmpeg is required otherwise .mp4 are not working
 
	Install Instruction
		ffmpeg Installation Instruction
			Download link: https://ffmpeg.zeranoe.com/builds/
			1. Extract and copy or move the folder current Directory (ex: JIOSAAVN V2/ffmpeg-20200730-134a48a-win64-static)
			2. open ffmpeg.js file and set path of ffmpeg.exe and ffprobe.exe in ffmpeg.js file
				Ex: ffmpeg.setFfmpegPath('./path/to/ffmpeg.exe');
					ffmpeg.setFfprobePath('./path/to/ffprobe.exe'); 
			3. After that run npm install

	Executing: npm start 

	NOTE: Songs are stored in Download Folder 
*/

const fs = require('fs');

const { DownloaderHelper } = require('node-downloader-helper');
const prompt = require('prompt-sync')();
const figlet = require('figlet');
const chalk = require('chalk');
const cliProgress = require('cli-progress');
const colors = require('colors');
const _ = require('lodash');

const convertTomp3 = require('./libs/ffmpeg');
const writingMetaData = require('./libs/writingMetaData');
const {
	generateAlbumData,
	generateSongData,
	generateSearchSongData,
} = require('./utils/api');

const Download = async (song, cover, songData) => {
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
	const dl_song = new DownloaderHelper(song, './Download');
	const dl_cover = new DownloaderHelper(cover, './Download');

	dl_song.on('download', (data) => {
		bar.start(data.totalSize, 0);
	});

	dl_song.on('progress', (data) => {
		bar.update(data.downloaded, {
			speed: data.speed / Math.pow(1024, 1),
		});
	});

	dl_song.on('end', (data) => {
		fileSize = data.downloadedSize / Math.pow(1024, 2);
		bar.stop();
		console.log(
			chalk.hex('#e67e22')(
				`\nDownload Completed: ${data.fileName} Size: ${fileSize.toFixed(2)} MB`
			)
		);
		filenames.file = data.fileName;
	});
	dl_song.on('error', (err) => {
		console.log(err);
	});

	dl_song.on('error', (err) => {
		console.log(err.message);
	});

	dl_cover.on('end', (data) => {
		filenames.cover = data.fileName;
	});
	await dl_song.start();
	await dl_cover.start();

	//writing metaData for the Song
	await chkForFormat(filenames.file, filenames.cover, songData);
	//return filenames;
};

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
		figlet.textSync('JIO SAAVN DOWNLAODER', {
			font: 'Bloody',
			horizontalLayout: 'default',
			verticalLayout: 'default',
			whitespaceBreak: true,
		})
	);
	while (true) {
		console.log(
			chalk.hex('#1dd1a1')(
				'\n[1]: Single Song Download\n[2]: Search\n[3]: Album Download(Buggy)\n[0]: Exit'
			)
		);
		const input = prompt('[ ➤ ]Enter Your Choice: ');
		switch (input) {
			case '1': {
				const url = prompt('\t[ ➤ ] Enter the JioSaavn Song URL: ');
				let songData = await generateSongData(url);
				return await Download(
					songData.result[0].download_link,
					songData.result[0].song_image,
					songData.result[0]
				);
			}
			case '2': {
				const query = prompt('\t[ ➤ ] Enter Song: ');
				let songData = await generateSearchSongData(query);
				const songs = Object.values(songData);
				_.map(songs[0], (song, index) => {
					console.log(chalk.hex('#00cec9')(`[${index}]: ${song.song_title}`));
				});
				const inx = prompt('\t[ ➤ ] Enter Song Number: ');
				await Download(
					songs[0][inx].download_link,
					songs[0][inx].song_image,
					songs[0][inx]
				);
				return;
			}
			case '3': {
				const url = prompt('\t[ ➤ ] Enter the JioSaavn Album URL: ');
				let data = await generateAlbumData(url);
				songData = Object.values(data);
				_.map(songData[0], async (song) => {
					await Download(song.download_link, song.song_image, song);
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
