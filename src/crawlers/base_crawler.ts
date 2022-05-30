import axios from "axios";
import * as cheerio from 'cheerio';


export abstract class BaseCrawler {
    page: any;
    site: string;
    selectors: {[index: string]:any};

    constructor(site: string, selectors: object) {
        this.site = site;
        this.selectors = selectors;
        this.page = null;
    }

    async downloadPage(path: string): Promise<this> {
        const page = await axios.get(`${this.site}/${path}`);
        this.page = cheerio.load(page.data);
        return this;
    }

    abstract extractData(): Promise<any>;
}