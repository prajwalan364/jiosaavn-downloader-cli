# JIOSAAVN DOWNLOADER CLI (NODE.JS)

Download Music From Jiosaavn at Highest Quality (320Kbps)

![cover](https://user-images.githubusercontent.com/40541176/90336209-d6b00f00-dff7-11ea-89e0-bcee9041bfb3.PNG)

## Getting Started

### Prerequisites

- nodejs
- ffmpeg

## Installation

Please make sure that you have node v10.x or latest and npm v5.x or latest versions installed on your machine.

### FFmpeg Installation

- Download FFmpeg from: https://ffmpeg.org/download.html
- Set your ffmpeg.exe and ffprobe.exe path in the libs/ffmpeg.js file
![Capture](https://user-images.githubusercontent.com/40541176/90336145-6e612d80-dff7-11ea-8c90-951e2857c559.PNG)


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

### Music are downloaded in Download folder

## Issues

- While downloading album progress bar not showing correctly.
- 403 error some times (just restart)
- No error handling 😑😑
