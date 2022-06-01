type CrawlerOptions = { [key: string]: {
    crawler: any,
    path: string,
    outputPath: string
  } }; 
  
  interface SongInfo {
    album: string;
    song_url: string;
    seen: boolean;
  }
  
  interface DownloadInfo {
    songs: SongInfo[];
    artist: string;
  }