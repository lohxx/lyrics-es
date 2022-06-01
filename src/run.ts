import { promises as fsPromises } from 'fs';
import * as az_lyrics from './crawlers/az_lyrics';
import * as crawlers from './crawlers/base_crawler';

const crawlerOptions: CrawlerOptions = {
  'azLyrics': {
    crawler: az_lyrics.AZLyrics,
    path: './src/resources/artists-crawler.json',
    outputPath: './src/resources/'
  }
};

export async function extractSongs(crawlerType: string = 'azLyrics') {
    const crawlersKeys = Object.keys(crawlerOptions);
    if (crawlersKeys.indexOf(crawlerType) == -1) {
      console.log('Não foi possivel encontrar o crawler especificado');
      return
    }

    const crawler = crawlerOptions[crawlerType];

    try {
      const data = JSON.parse(await fsPromises.readFile(crawler.path, { encoding: 'utf8' }));
      const azLyrics = new crawler.crawler();
      const singers = Object.keys(data);

      for(let artist of singers) {
        data[artist]['artist'] = artist;
        const songs = await downloadPages(data[artist], azLyrics);
        saveLyrics(songs, crawler.outputPath);
        delete data[artist]['artist'];
      }

      fsPromises.writeFile(
        crawler.path, JSON.stringify(data, null, 2));

    } catch (err) {
      console.log('error: ', err);
    }
}


export async function downloadPages(data: DownloadInfo, azLyrics: crawlers.BaseCrawler): Promise<object[]> {
    const songs = [];
    console.log(data)    
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

async function saveLyrics(songs: any[], outputPath: string): Promise<void> {
  const rex = /[^a-z]/gmi;
  for (let song of songs) {
    const filename = `${song.artist.replace(rex, '')}__${song.title.replace(rex, '')}`;
    await fsPromises.writeFile(`${outputPath}${filename}.json`, JSON.stringify(song, null, 2));
  }
}
