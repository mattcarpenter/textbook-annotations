const got = require('got');
const cheerio = require('cheerio');
const async = require('async');
const fs = require('fs');
const args = process.argv.slice(2);

const tocUrls = [
  'https://jlptsensei.com/jlpt-n1-grammar-list/',
  'https://jlptsensei.com/jlpt-n2-grammar-list/',
  'https://jlptsensei.com/jlpt-n3-grammar-list/',
  'https://jlptsensei.com/jlpt-n4-grammar-list/',
  'https://jlptsensei.com/jlpt-n5-grammar-list/'
];

const grammars = {};

if (args[0]) {
  (async () => {
    await scrapeToc(tocUrls);
    fs.writeFileSync(args[0], JSON.stringify(grammars, null, '\t'));
  })();
}

const selectors = {
  grammarName: 'header > h1 > span.d-block.p-3.text-centeret-gram',
  definition: '#meaning > p',
  jlptLevel: 'header > div.row.gram-meta > div:nth-child(1) > div.entry-meta > p.glm-level > a',
  grammarNotes: '.grammar-notes p',
  usage: '#usage > table',
  examples: '.example-cont',
  exampleJapanese: '.example-main',
  grammarLink: '.jl-link.jp',
  pageNumbers: 'a.page-numbers'
};

async function scrapeToc() {
  return new Promise(resolveSensei => {
    async.mapLimit(tocUrls, 1, async url => {
      // Load all TOC pages
      const {body: firstPage} = await got(url);
      const $firstPage = cheerio.load(firstPage, { decodeEntities: false });
      const tocPages = [url];

      $firstPage(selectors.pageNumbers).each(function (index, node) {
        if (index) {
          tocPages.push($firstPage(this).attr('href'));
        }
      });

      // load grammar from TOC pages
      return new Promise(async resolveAllTocPages => {
        async.mapLimit(tocPages, 5, async tocPage => {
          console.log('Loading TOC ' + tocPage);
          const {body: responseBody} = await got(tocPage);
          const $ = cheerio.load(responseBody, {decodeEntities: false});
          const grammarPages = [];

          $(selectors.grammarLink).each(function (index, node) {
            grammarPages.push({
              name: $(this).text(),
              url: $(this).attr('href')
            });
          });

          // scrape grammar page
          return new Promise((resolve, reject) => {
            async.mapLimit(grammarPages, 5, async page => {
              console.log('Scraping grammar ' + page.url);
              const grammar = await scrapeContent(page.url);
              grammars[page.name] = {...grammar, url: page.url};
            }, (err, results) => {
              console.log('done scraping all grammar pages for ' + url);
              resolve();
            });
          });
        }, (err, results) => {
          resolveAllTocPages();
        });
      });
    }, (err, results) => {
      if (err) throw err;
      resolveSensei();
    });
  });
}

async function scrapeContent(url) {
  const { body: responseBody } = await got(url);
  const $ = cheerio.load(responseBody, { decodeEntities: false });

  // scrape basic details
  const grammarName = $(selectors.grammarName).text();
  const definition = $(selectors.definition).text();
  const jlptLevel = $(selectors.jlptLevel).text();
  const usage = $(selectors.usage).html();

  // compose grammar notes
  const grammarNotesList = [];
  $(selectors.grammarNotes).each(function (index, node) {
    if (typeof node.className === 'undefined') {
      grammarNotesList.push($.html($(this)));
    }
  });
  grammarNotesList.pop();
  const grammarNotes = `<div>${grammarNotesList.join()}</div>`;

  // compose examples
  const examplesList = [];
  const examples = $(selectors.examples).each(function (index, node) {
    examplesList.push({
      en: $(this).find('#example_' + (index + 1) + '_en > div').html(),
      ja: $(this).find(selectors.exampleJapanese).html()
    })
  });

  return{
    name: grammarName,
    definition: definition,
    jlptLevel: jlptLevel,
    notes: grammarNotes,
    examples: examplesList,
    usage: usage
  };
}

