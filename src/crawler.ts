import { promises as fsPromises } from 'fs';

import * as crawlers from './crawlers/az_lyrics';

interface SongInfo {
  album: string;
  song_url: string;
}

interface DownloadInfo {
  songs: SongInfo[];
  artist: string;
}

async function readSongsFile() {
    try {
      const data = JSON.parse(await fsPromises.readFile('./src/resources/artists-crawler.json', { encoding: 'utf8' }));
      const azLyrics = new crawlers.AZLyrics();
      const singers = Object.keys(data);

      for(let artist of singers) {
        data[artist]['artist'] = artist;
        const songs = await downloadPages(data[artist], azLyrics);
        console.log(songs);
      }
    } catch (err) {
      console.log('error: ', err);
    }
}


async function downloadPages(data: DownloadInfo, azLyrics: crawlers.AZLyrics) {
    const songs = [];    
      for(let song of data['songs']) {
        const page = await azLyrics.downloadPage(song.song_url);
        const extractedData = await page.extractData();
        songs.push({...extractedData, album: song.album, artist: data['artist']});
    }
    return songs;
}

async function saveLyric(page: any) {
  //let [song, data] = page['value'];
  //const parsedSong = new Song(song.data, data);
  //const filename = `${data['artist'].replace(' ', '')}__${parsedSong.title.replace(' ', '')}`;
  //console.log(filename, parsedSong.title);

  //await fs.writeFile(
  //  `resources/${filename}.json`,
  //  JSON.stringify({...data, title: parsedSong.title, guests: parsedSong.guests, lyrics: parsedSong.lyrics}));
}

readSongsFile()
