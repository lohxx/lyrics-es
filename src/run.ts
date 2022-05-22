import { promises as fsPromises } from 'fs';

import * as crawlers from './crawlers/az_lyrics';

interface SongInfo {
  album: string;
  song_url: string;
  seen: boolean;
}

interface DownloadInfo {
  songs: SongInfo[];
  artist: string;
}

async function readSongsFile() {
    const path = './src/resources/artists-crawler.json';
    try {
      const data = JSON.parse(await fsPromises.readFile(path, { encoding: 'utf8' }));
      const azLyrics = new crawlers.AZLyrics();
      const singers = Object.keys(data);

      for(let artist of singers) {
        data[artist]['artist'] = artist;
        const songs = await downloadPages(data[artist], azLyrics);
        saveLyrics(songs);
        delete data[artist]['artist'];
      }

      fsPromises.writeFile(path, JSON.stringify(data, null, 2));

    } catch (err) {
      console.log('error: ', err);
    }
}


async function downloadPages(data: DownloadInfo, azLyrics: crawlers.AZLyrics) {
    const songs = [];    
      for(let song of data['songs']) {
        if (song.seen) {
          continue
        }
        const page = await azLyrics.downloadPage(song.song_url);
        const extractedData = await page.extractData();
        song['seen'] = true;
        songs.push({...extractedData, album: song.album, artist: data['artist']});
    }
    return songs;
}

async function saveLyrics(songs: any[]) {
  const rex = /[^a-z]/gmi;
  for (let song of songs) {
    const filename = `${song.artist.replace(rex, '')}__${song.title.replace(rex, '')}`;
    await fsPromises.writeFile(`src/resources/${filename}.json`, JSON.stringify(song, null, 2));
  }
}

readSongsFile()
