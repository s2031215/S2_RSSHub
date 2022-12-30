const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {

    const response = await got({
        method: 'get',
        url: `https://www.inside.com.tw`,
    });

    const { data, code, message } = response;
    if (code) {
        throw new Error(message ? message : code);
    }

    const $ = cheerio.load(data) // 使用 cheerio 加载返回的 HTML
    const list = $('.post_list:not(.I_post_list)');
    let news = [];

    list.each(function (index, value) {
        let $ = cheerio.load(value);
        let title = $(".post_title");
        let context = $(".post_description");
        let day = $(".post_date");
        let post_cover = $(".post_cover");
        for (var i = 0; i < title.length; i++) {
            news.push({
                'title': title.eq(i).text().trim(),
                'context': context.eq(i).text(),
                'date': day.eq(i).text().trim(),
                'url': post_cover.eq(i).attr('href')
            });
        }
    });

    ctx.state.data = {
        title: `INSIDE 硬塞的網路趨勢觀察`,
        link: `https://www.inside.com.tw/`,
        description: `成為科技與商業思維領導媒體，讓讀者掌握最新科技趨勢與商業脈動。`,
        item: news.map((item) => ({
            title: item.title,
            description: item.context,
            pubDate: new Date(item.date).toUTCString(),
            link: item.url,
            author: '硬塞',
        })),
    };
};