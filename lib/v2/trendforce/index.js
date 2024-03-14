const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    function stringToDate(dateString) {
        const datePart = dateString.match(/\d{8}/)[0];
        const year = Number.parseInt(datePart.substring(0, 4));
        const month = Number.parseInt(datePart.substring(4, 6)) - 1;
        const day = Number.parseInt(datePart.substring(6, 8)) + 1;
        const dateObject = new Date(year, month, day);
        return dateObject;
    }

    async function getwebcontext(pageid) {
        const rsslist = [];
        const response = await got({
            method: 'get',
            url: `https://www.trendforce.com.tw/presscenter/news/Semiconductors?page=` + pageid,
        });

        const { body, statusCode, statusMessage } = response;

        if (statusCode !== 200) {
            throw new Error(statusCode, statusMessage);
        }

        // console.log(body)
        const $ = await cheerio.load(body); // 使用 cheerio 加载返回的 HTML
        const list = $('.list-item');
        list.each(function () {
            // Range Name
            // console.log($(this).find('.title-link').text().trim());
            // console.log($(this).find('.title-link').attr('href'));
            // console.log($(this).find('p').text().trim());
            const title = $(this).find('.title-link').text().trim();
            const context = $(this).find('p').text().trim();
            const url = 'https://www.trendforce.com.tw' + $(this).find('.title-link').attr('href');
            const date = stringToDate(url);
            rsslist.push({
                title,
                context,
                date,
                url,
            });
        });
        return rsslist;
    }

    const news = await Promise.all([getwebcontext('1'), getwebcontext('2')]).then(([result1, result2]) => result1.concat(result2));

    ctx.state.data = {
        title: `TrendForce 集邦科技`,
        link: `https://www.trendforce.com.tw`,
        description: `科技產業研究機構與市場情報供應商，提供深入的市場分析和專業諮詢服務。`,
        item: news.map((item) => ({
            title: item.title,
            description: item.context,
            pubDate: new Date(item.date).toUTCString(),
            link: item.url,
            author: 'trendforce',
        })),
    };
};
