import { Route } from '@/types';
import { load } from 'cheerio';
import got from '@/utils/got';
import { getData } from './utils';

export const route: Route = {
    path: '/:type',
    categories: ['new-media'],
    example: '/aeon/essays',
    parameters: { type: 'Type' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['aeon.aeon.co/:type'],
    },
    name: 'Types',
    maintainers: ['emdoe'],
    handler,
    description: `Supported types: Essays, Videos, and Audio.

  Compared to the official one, the RSS feed generated by RSSHub not only has more fine-grained options, but also eliminates pull quotes, which can't be easily distinguished from other paragraphs by any RSS reader, but only disrupt the reading flow. This feed also provides users with a bio of the author at the top.

  However, The content generated under \`audio\` does not contain links to audio files.`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const binaryType = type === 'videos' ? 'videos' : 'essays';
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

    const url = `https://aeon.co/${type}`;
    const { data: response } = await got(url);
    const $ = load(response);

    const data = JSON.parse($('script#__NEXT_DATA__').text());

    const list = data.props.pageProps.articles.map((item) => ({
        title: item.title,
        link: `https://aeon.co/${binaryType}/${item.slug}`,
        pubDate: item.createdAt,
    }));

    const items = await getData(ctx, list);

    return {
        title: `AEON | ${capitalizedType}`,
        link: url,
        item: items,
    };
}
