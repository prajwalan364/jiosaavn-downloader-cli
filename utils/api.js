/* API FOR FETCHING JIOSAAVN SONGS DATA */

const axios = require('axios');
const chalk = require('chalk');
const _ = require('lodash');
const UA = require('user-agents');
const { link } = require('ffmpeg-static');
const userAgentCreator = new UA({ deviceCategory: 'desktop' });

const searchUrl =
	'https://www.jiosaavn.com/api.php?_format=json&n=5&p=1&_marker=0&ctx=android&__call=search.getResults&q=';
const songIdUrl =
	'https://www.jiosaavn.com/api.php?cc=in&_marker=0%3F_marker%3D0&_format=json&model=Redmi_5A&__call=song.getDetails&pids=';
const albumUrl =
	'https://www.jiosaavn.com/api.php?_format=json&__call=content.getAlbumDetails&albumid=';
const playlistUrl =
	'https://www.jiosaavn.com/api.php?__call=playlist.getDetails&_format=json&cc=in&_marker=0%3F_marker%3D0&listid=';

let user = userAgentCreator.random().toString();

const fixImage = (img_url) => {
	axios.defaults.headers.common['User-Agent'] = user;
	let fix_imag_url = img_url.replace('150x150', '500x500');
	fix_imag_url = fix_imag_url.replace('http://', 'https://');
	return fix_imag_url;
};

const getSongID = async (song_link) => {
	if (songIdUrl.includes('jiosaavn.com/')) {
		axios.defaults.headers.common['User-Agent'] = user;
		const res = await axios.get(song_link);
		const id = res.data
			.split('"song":{"type":"')[1]
			.split(',')[2]
			.split(':')[1];
		return id;
	}
};

const getAlbumID = async (album_url) => {
	if (album_url.includes('jiosaavn.com')) {
		axios.defaults.headers.common['User-Agent'] = user;
		const res = await axios.get(album_url);
		const albumId = res.data
			.split('"album_id":"')[0]
			.split('"album":{"type":"')[1]
			.split(',')[1]
			.split(':')[1];
		return albumId;
	}
};

const getPlaylistID = async (link) => {
	axios.defaults.headers.common['User-Agent'] = user;
	const res = await axios.get(link);

	const pid = res.data
		.split('"playlist":{"type"')[1]
		.split(',')[1]
		.split(':')[1];
	return pid;
};

const getDownloadLink = async (preview_link) => {
	let download_link = preview_link.replace('preview', 'h');
	download_link = download_link.replace('_96_p.mp4', '_320.mp3');
	download_link = download_link.replace('http://', 'https://');
	axios.defaults.headers.common['User-Agent'] = user;

	return axios
		.head(download_link)
		.then((response) => {
			if (response.status === 200) {
				return download_link;
			}
		})
		.catch((err) => {
			console.log('mp3 not working changing to mp4');
			let download_link = preview_link.replace('preview', 'h');
			download_link = download_link.replace('_96_p.mp4', '_320.mp4');
			download_link = download_link.replace('http://', 'https://');
			return download_link;
		});
};

const generateSongData = async (link) => {
	console.log(
		chalk.hex('#00d2d3')(
			'Fetching...... (stuck at more than 1 min then restart)'
		)
	);
	axios.defaults.headers.common['User-Agent'] = user;
	let songId = await getSongID(link);
	songId = songId.slice(1, -1);
	let songArray = new Array();
	let songsObj = new Object();

	if (songId != null) {
		const res = await axios.get(songIdUrl + songId);
		songData = await generateJSON(songArray, res.data[songId]);
		songsObj['result'] = await songData;
		return songsObj;
	}
};

const generateAlbumData = async (album_url) => {
	console.log(
		chalk.hex('#00d2d3')(
			'Fetching...... (stuck at more than 1 min then restart)'
		)
	);
	axios.defaults.headers.common['User-Agent'] = user;
	let albumId = await getAlbumID(album_url);
	albumId = albumId.slice(1, -1);
	albumId = Number(albumId);
	let songsArray = new Array();
	let songsObj = new Object();
	if (albumId != null) {
		const res = await axios.get(albumUrl + albumId, {
			headers: {
				contentType: 'application/json; charset=utf-8',
			},
		});
		albumData = JSON.parse(res.data.replace(/\<.+/gi, '').trim());
		let data;
		for (song of albumData.songs) {
			data = await generateJSON(songsArray, song);
		}
		songsObj['result'] = data;
		return songsObj;
	}
};

const generateSearchSongData = async (query) => {
	console.log(
		chalk.hex('#00d2d3')(
			'Fetching...... (stuck at more than 1 min then restart)'
		)
	);
	axios.defaults.headers.common['User-Agent'] = user;
	let songsArray = new Array();
	let songsObj = new Object();
	const res = await axios.get(searchUrl + query);
	let data;
	for (song of res.data.results) {
		data = await generateJSON(songsArray, song);
	}
	songsObj['result'] = data;
	return songsObj;
};

const generatePlaylistData = async (playlist_url) => {
	console.log(
		chalk.hex('#00d2d3')(
			'Fetching...... (stuck at more than 1 min then restart)'
		)
	);
	axios.defaults.headers.common['User-Agent'] = user;

	let playlistId = await getPlaylistID(playlist_url);
	playlistId = playlistId.slice(1, -1);
	playlistId = Number(playlistId);

	let songsArray = new Array();
	let songsObj = new Object();

	const res = await axios.get(playlistUrl + playlistId);

	let data;
	for (song of res.data.songs) {
		data = await generateJSON(songsArray, song);
	}
	songsObj['result'] = data;
	return songsObj;
};

const generateJSON = async (songDataArray, data) => {
	songDataArray.push({
		song_id: data.id,
		song_title: data.song,
		album_title: data.album,
		music: data.music,
		artist_name: data.primary_artists,
		singers: data.singers,
		duration: data.duration,
		song_image: await fixImage(data.image),
		label: data.label,
		language: data.language,
		year: data.year,
		encrypted_media_url: data.encrypted_media_url,
		preview_url: data.media_preview_url,
		download_link: await getDownloadLink(data.media_preview_url),
	});
	return songDataArray;
};

//https://www.jiosaavn.com/featured/anirudh---tamil---jiotunes/dElOTOFAgw6O0eMLZZxqsA__
//https://www.jiosaavn.com/song/genda-phool/GQUqRgBDQkk

module.exports = {
	generateSongData,
	generateAlbumData,
	generateSearchSongData,
	generatePlaylistData,
};
