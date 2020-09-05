import React, { useState } from 'react';
import AnnotatedGrammar from './AnnotatedGrammar';
import reactStringReplace from 'react-string-replace';
import Drawer from 'react-drag-drawer'
import './Honbun.css';

const styles = {
  lineHeight: '30px'
};

const replaceGrammarPattern = /(\([\s\S][^()[\]]*?\)\[.+\])/g;

function Honbun({ honbun, grammar }) {

  const [grammarDrawerOpen, setGrammarDrawerOpen] = useState(false);
  const [grammarDrawerGrammar, setGrammarDrawerGrammar] = useState();

  // prepare grammar annotations
  let replacedText = reactStringReplace(honbun.text, replaceGrammarPattern, (match, i) => {
    // parse grammar annotation
    const annotationMatchPattern = /\(([\s\S][^)]*?)\)\[(.+)\]/g;
    const annotationMatch = annotationMatchPattern.exec(match);

    if (!annotationMatch) {
      return <span>(missing)</span>
    }

    const grammarName = annotationMatch[2].replace(/\n/g,'').trim();
    console.log('name:' + grammarName);

    return (
      <AnnotatedGrammar
        text={annotationMatch[1]}
        onClick={() => {
          setGrammarDrawerGrammar(grammar[grammarName]);
          setGrammarDrawerOpen(true);
        }}
      />
    );
  });

  // prepare linebreaks
  replacedText = reactStringReplace(replacedText, /(\n)/g, (match, i) =>
    <br />
  );

  return (
    <div>
      <div style={styles}>
        {replacedText}
      </div>
      <Drawer
        open={grammarDrawerOpen}
        onRequestClose={() => { setGrammarDrawerOpen(false);}}
        modalElementClass="modal"
      >
        <div>
          {JSON.stringify(grammarDrawerGrammar, null, '\t')}
        </div>
      </Drawer>
    </div>
  )
}

export default Honbun;
