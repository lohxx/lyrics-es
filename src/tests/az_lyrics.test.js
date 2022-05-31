import * as cheerio from 'cheerio';

import * as main from '../run';
import * as az_lyrics from '../crawlers/az_lyrics';
import * as html_test from './az_lyrics_html';

const downloadPageMock = jest
  .spyOn(az_lyrics.AZLyrics.prototype, 'downloadPage')
  .mockImplementation(function() {
      this.page = cheerio.load(html_test.html);
      return this
  });

it('Assert', async () => {
    const azLyrics = new az_lyrics.AZLyrics().downloadPage();
    const song = await azLyrics.extractData();

    expect(downloadPageMock).toHaveBeenCalled();
    expect(song['title']).toBe('"Helena Beat"');
    expect(song['guests']).toBe('');
    expect(song['lyrics'].trim()).toContain(`Yeah yeah and it's O.K.`);
    expect(song['lyrics'].trim()).toContain(`I tie my hands up to a chair so I don't fall that way`);
    expect(song['lyrics'].trim()).toContain(`Yeah yeah and I'm alright`);
    expect(song['lyrics'].trim()).toContain(`I took a sip of something poison but I'll hold on tight`);
});
