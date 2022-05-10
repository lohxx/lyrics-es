const axios = require('axios').default; 
const cheerio = require('cheerio');
const fs = require('fs/promises');
const es = require('./indexer.js');

const mainSelector = 'body > div.container.main-page > div > div.col-xs-12.col-lg-8.text-center > div.ringtone';
const lyricsSelector = `${mainSelector} + b + br + br + div`;
const alternativeLyricsSelector = 'body > div.container.main-page > div > div.col-xs-12.col-lg-8.text-center > div.ringtone + b + br + span.feat + br+br+div';
const songTitleSelector = `${mainSelector}+b`;
const alternativeSongTitleSelector = 'body > div.container.main-page > div > div.col-xs-12.col-lg-8.text-center > b';
const guestsSelector = 'body > div.container.main-page > div > div.col-xs-12.col-lg-8.text-center > span'

class Song {
  #title;
  #lyrics;
  #guests;
  #html;

  constructor(lyrics, metadata) {
      this.album = metadata.album;
      this.#html = cheerio.load(lyrics);
      this.#title = null; 
      this.#lyrics = null;
      this.#guests = [];
  }

    get title() {
      if (!this.#title) {
        this.#title = this.#html(songTitleSelector).text() || this.#html(alternativeSongTitleSelector).text();
        this.#title = this.#title.replace(/"|"/gm, '');
      }
      return this.#title;
    }

    get lyrics() {
      if (!this.#lyrics) {
        this.#lyrics = this.#html(lyricsSelector).text() || this.#html(alternativeLyricsSelector).text();
      }
      return this.#lyrics;
    }

    get guests() {
      if (!this.#guests.lenght) {
        this.#guests = this.#html(guestsSelector).text();
      }
      return this.#guests;
    }
}

async function readSongsFile() {
    try {
      const data = await fs.readFile('resources/artists-crawler.json', { encoding: 'utf8' });
      for (let page of await downloadPages(JSON.parse(data))) {
        saveLyric(page, data);
      }
    } catch (err) {
      console.log(err);
    }
}


async function downloadPages(data) {
    const promises = [];    
    for (let artist of Object.keys(data)) {
      for(let song of  data[artist]['songs']) {
        promise = new Promise(resolve => {
          resolve(Promise.all([axios.get(song['song_url']), {...song, artist}]));
        });
        promises.push(promise);
      } 
    }

    const pages = await Promise.allSettled(promises);

    return pages;
}

async function saveLyric(page) {
  // Implementar mecanismo para nao tentar baixar os arquivos ja baixados
  let [song, data] = page['value'];
  const parsedSong = new Song(song.data, data);
  const filename = `${data['artist'].replace(' ', '')}__${parsedSong.title.replace(' ', '')}`;
  console.log(filename, parsedSong.title);

  await fs.writeFile(
    `resources/${filename}.json`,
    JSON.stringify({...data, title: parsedSong.title, guests: parsedSong.guests, lyrics: parsedSong.lyrics}));
}

readSongsFile();