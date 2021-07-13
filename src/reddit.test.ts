import {toOldRedditJsonUrl} from "./reddit";
import {URL} from "url";

test('base test', () => {
    const input = new URL('https://www.reddit.com/r/memes/comments/klxdct/ctrl_shift_esc/?utm_source=share&utm_medium=ios_app&utm_name=iossmf');
    const expected = new URL('https://old.reddit.com/r/memes/comments/klxdct/ctrl_shift_esc.json');
    const actual = toOldRedditJsonUrl(input);
    expect(actual.toString()).toBe(expected.toString());
})