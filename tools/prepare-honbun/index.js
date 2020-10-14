const fs = require('fs');
const Kuroshiro = require('kuroshiro');
const kuroshiro = new Kuroshiro();
const Analyzer = require('kuroshiro-analyzer-kuromoji');
const analyzer = new Analyzer();

const baseGrammar = JSON.parse(fs.readFileSync('../../data/grammar.json').toString());
const extraGrammar = JSON.parse(fs.readFileSync('../../data/extra.json').toString());
const grammar = Object.assign(baseGrammar, extraGrammar);
//const grammarPattern = /\(.+\)\[(.+)\]/g;
const grammarPattern = /\([\s\S][^()[\]]*?\)\[(.+)\]/g;

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
    name: '情報２',
    file: '../../data/jouhou2.txt'
  }
];

kuroshiro.init(analyzer).then(() => {

  honbuns.forEach(honbun => {
    // load tex
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
    grammar: necessaryGrammar
  }, null, '\t'));

});