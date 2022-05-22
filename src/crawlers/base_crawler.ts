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

    abstract downloadPage(path: string): Promise<this>;
    abstract extractData(): Promise<any>;
}