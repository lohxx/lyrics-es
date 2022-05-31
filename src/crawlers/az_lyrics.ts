import { BaseCrawler } from './base_crawler';

class Selector {
    values: string[];
    private _cur = -1;
    constructor(...selector: string[]) {
        this.values = selector;
    }

    next(): string | boolean {
        this._cur += 1;
        if (this._cur >= this.values.length) {
           return false;
        }
        return this.values[this._cur];
    }

    reset(): void {
        this._cur = -1;
    }
}

const AZLyricsSelectors = {
    'guests':  new Selector(
        'body > div.container.main-page > div > div.col-xs-12.col-lg-8.text-center > span',
        'body > div.container.main-page > div > div.col-xs-12.col-lg-8.text-center > div.lyricsh > h2 > b'),
    'title': new Selector(
        'body > div.container.main-page > div > div.col-xs-12.col-lg-8.text-center > div.ringtone+b',
        'body > div.container.main-page > div > div.col-xs-12.col-lg-8.text-center > b'),
    'lyrics': new Selector(
        'body > div.container.main-page > div > div.col-xs-12.col-lg-8.text-center > div.ringtone + b + br + br + div', 
        'body > div.container.main-page > div > div.col-xs-12.col-lg-8.text-center > div.ringtone + b + br + span.feat + br+br+div')
}

export class AZLyrics extends BaseCrawler {
    constructor(selectors = {}) {
        super('https://www.azlyrics.com/lyrics', {...AZLyricsSelectors, ...selectors});
        this.page = {};
    }

    async extractData(): Promise<object> {
        const data: {[index: string]:any} = {}
        const keys: string[] = Object.keys(this.selectors);
        for (const key of keys) {
            let selector = this.selectors[key].next();
            while (selector) {
                data[key] = this.page(selector).text();
                if (data[key]) {
                    data[key] = data[key].trim();
                    break;
                 };
                selector = this.selectors[key].next();
            }

            this.selectors[key].reset();
        }
        return data;
    }
}