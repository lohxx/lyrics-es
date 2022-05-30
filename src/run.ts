import { promises as fsPromises } from 'fs';
import * as az_lyrics from './crawlers/az_lyrics';
import * as crawlers from './crawlers/base_crawler';

interface SongInfo {
  album: string;
  song_url: string;
  seen: boolean;
}

interface DownloadInfo {
  songs: SongInfo[];
  artist: string;
}

// O tipo de crawler deve conter todas as informacoes necessarias de como baixar
// onde salvar e como salvar
const crawlersType = {
  'azLyrics': {
    crawler: az_lyrics.AZLyrics,
    path: './src/resources/artists-crawler.json',
    outputPath: './src/resources/'
  }
};


async function readSongsFile(crawlerType: string = 'azLyrics' , filePath: string) {
    const crawlersKeys = Object.keys(crawlerType);
    if (crawlersKeys.indexOf(crawlerType) == -1) {
      console.log('Não foi possivel encontrar o crawler especificado')
      return
    }

    const crawler = crawlersType[crawlerType];

    try {
      const data = JSON.parse(await fsPromises.readFile(filePath, { encoding: 'utf8' }));
      const azLyrics = new crawler.crawler();
      const singers = Object.keys(data);

      for(let artist of singers) {
        data[artist]['artist'] = artist;
        const songs = await downloadPages(data[artist], azLyrics);
        saveLyrics(songs);
        delete data[artist]['artist'];
      }

      fsPromises.writeFile(
        crawler.outputPath, JSON.stringify(data, null, 2));

    } catch (err) {
      console.log('error: ', err);
    }
}


async function downloadPages(data: DownloadInfo, azLyrics: crawlers.BaseCrawler) {
    const songs = [];    
      for(let song of data.songs) {
        if (song.seen) {
          continue
        }
        const page = await azLyrics.downloadPage(song.song_url);
        const extractedData = await page.extractData();
        song.seen = true;
        songs.push({...extractedData, album: song.album, artist: data['artist']});
    }
    return songs;
}

async function saveLyrics(songs: any[], outputPath: string) {
  const rex = /[^a-z]/gmi;
  for (let song of songs) {
    const filename = `${song.artist.replace(rex, '')}__${song.title.replace(rex, '')}`;
    await fsPromises.writeFile(`${outputPath}${filename}.json`, JSON.stringify(song, null, 2));
  }
}