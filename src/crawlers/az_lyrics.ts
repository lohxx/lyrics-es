import axios from "axios";
import * as cheerio from 'cheerio';

import { BaseCrawler } from './base_crawler';

class Selector {
    selectors: string[];
    constructor(selector: string[]) {
        this.selectors = selector;
    }

    toString() {
        return this.selectors
    }
}

const mainSelectors = {
    'guests':  new Selector(['body > div.container.main-page > div > div.col-xs-12.col-lg-8.text-center > span']),
    'title': new Selector(['body > div.container.main-page > div > div.col-xs-12.col-lg-8.text-center > div.ringtone+b',
        'body > div.container.main-page > div > div.col-xs-12.col-lg-8.text-center > b']),
    'lyrics': new Selector(['body > div.container.main-page > div > div.col-xs-12.col-lg-8.text-center > div.ringtone + b + br + br + div', 
    'body > div.container.main-page > div > div.col-xs-12.col-lg-8.text-center > div.ringtone + b + br + span.feat + br+br+div'])
}

export class AZLyrics extends BaseCrawler {
    constructor(selectors = {}) {
        super('https://www.azlyrics.com/lyrics', {...mainSelectors, ...selectors});
        this.page = {};
    }

    async downloadPage(path: string): Promise<this> {
        const page = await axios.get(`${this.site}/${path}`);
        this.page = cheerio.load(page.data);
        return this;
    }

    async extractData(): Promise<object> {
        const data: {[index: string]:any} = {}
        const keys: string[] = Object.keys(this.selectors);
        for (const key of keys) {
            data[key] = this.page(this.selectors[key].toString()).text();
            if (!data[key]) {
                data[key] = this.page(this.selectors[key].alternativeSelector).text()
            }
        }
        return data;
    }
}