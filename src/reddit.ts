import {URL} from "url";

const OLD_HOST = 'old.reddit.com';

export function toOldRedditJsonUrl(url: URL): URL {
    const result = new URL(url.toString());
    result.search = '';
    result.host = OLD_HOST;
    result.pathname += '.json';
    return result;
}