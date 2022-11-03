import { UrlWithParsedQuery, parse } from "url";

export class Utils {

  public static parseUrl(url: string): UrlWithParsedQuery {
    if(!url) 
     throw new Error('Empty URL')

    return parse(url, true);
  }
}
