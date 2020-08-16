# JIOSAAVN DOWNLOADER CLI (NODE.JS)

Download Music From Jiosaavn at Highest Quality (320Kbps)

## Getting Started

### Prerequisites

- nodejs
- ffmpeg

## Installation

Please make sure that you have node v10.x or latest and npm v5.x or latest versions installed on your machine.

### FFmpeg Installation

- Download FFmpeg from: https://ffmpeg.org/download.html
- Set your ffmpeg.exe and ffprobe.exe path in the libs/ffmpeg.js file
- ![ffmpeg image]('.\img\Capture.PNG?raw=true 'Title')

```diff
Note: FFmpeg is must otherwise some of the songs are in mp4 format are not download.
```

### Installing

```
npm install
```

Usage

```
npm start
```

## Features

- Download a Single Song
- Download an Album (Buggy)
- Search for song

### Music are downloaded in Download Folder

## Issues

- While downloading album progress bar not showing correctly.
- 403 error some times (just restart)
- No error handling 😑😑
