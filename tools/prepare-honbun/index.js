const fs = require('fs');
const parse = require('csv-parse');
const Kuroshiro = require('kuroshiro');
const kuroshiro = new Kuroshiro();
const Analyzer = require('kuroshiro-analyzer-kuromoji');
const analyzer = new Analyzer();

const baseGrammar = JSON.parse(fs.readFileSync('../../data/grammar.json').toString());
const extraGrammar = JSON.parse(fs.readFileSync('../../data/extra.json').toString());
const grammar = Object.assign(baseGrammar, extraGrammar);
const grammarPattern = /\([\s\S][^()[\]]*?\)\[(.+)\]/g;

const csvParser = parse({delimiter: ','});
const csvInput = fs.createReadStream('../../data/vocab.csv');
const vocabRecords = [];

const necessaryGrammar = {};

const honbuns = [
  {
    name: 'Ch5 Step 1',
    file: '../../data/ch5honbun.txt'
  },
  {
    name: 'Ch5 Step 5',
    file: '../../data/ch5step5.txt'
  },
  {
    name: 'Ch6 Step 1',
    file: '../../data/ch6step1.txt'
  },
  {
    name: 'BS1',
    file: '../../data/BS1.txt',
    vocabOnly: true
  },
  {
    name: 'BS2',
    file: '../../data/BS2.txt',
    vocabOnly: true
  },
  {
    name: 'FTS1',
    file: '../../data/FTS1.txt',
    vocabOnly: true
  }
];

// Parse vocab
csvParser.on('readable', function(){
  let record;
  while (record = csvParser.read()) {
    vocabRecords.push({
      kanji: record[0],
      hiragana: record[1],
      definition: record[3],
      otherForms: record[4].split(/[,、]/g).filter(t => t !== '')
    });
  }
});

csvParser.on('error', function(err){
  console.error(err.message)
});

csvParser.on('end', function() {
  kuroshiro.init(analyzer).then(prepareHonbuns);
});

csvInput.pipe(csvParser);

function prepareHonbuns() {
  honbuns.forEach(honbun => {
    // load text
    const text = fs.readFileSync(honbun.file).toString();
    const matcherText = text;
    honbun.text = text;
    // extract grammar names
    let match = grammarPattern.exec(matcherText);
    while (match !== null) {
      const grammarName = match[1].replace(/\n/, '');
      if (grammar[grammarName]) {
        necessaryGrammar[grammarName] = grammar[grammarName];
        necessaryGrammar[grammarName].name = grammarName; // fix to make sure hiragana shows up in the name field, not romaji
      }
      match = grammarPattern.exec(matcherText);
    }
  });

  console.log(JSON.stringify({
    honbuns: honbuns,
    grammar: necessaryGrammar,
    vocab: vocabRecords
  }, null, '\t'));
}
