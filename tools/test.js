const fs = require('fs');
//const honbuns = JSON.parse(fs.readFileSync('../src/data/honbuns.json'));
const text = fs.readFileSync('../src/data/test.txt').toString();
const replaceGrammarPattern = /(\([\s\S][^()[\]]*?\)\[.+\])/g;

let r = text.matchAll(replaceGrammarPattern);
debugger;
