import React, { useState, useRef } from 'react';
import AnnotatedGrammar from './AnnotatedGrammar';
import reactStringReplace from 'react-string-replace';
import Drawer from 'react-drag-drawer'
import Popover from 'react-text-selection-popover';
import "react-awesome-button/dist/styles.css";

//@ts-ignore
import { AwesomeButton } from "react-awesome-button";

import './Honbun.css';

const styles = {
  lineHeight: '30px'
};

const replaceGrammarPattern = /(\([\s\S][^()[\]]*?\)\[.+\])/g;

function Honbun({ honbun, grammar }) {

  const [grammarDrawerOpen, setGrammarDrawerOpen] = useState(false);
  const [grammarDrawerGrammar, setGrammarDrawerGrammar] = useState();
  const honbunEl = useRef(null);

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
      <div style={styles} ref={honbunEl}>
        {replacedText}
      </div>
      <Popover selectionRef={honbunEl}>
        <AwesomeButton type="primary" style={{height: 30}}>Look Up</AwesomeButton>&nbsp;
        <AwesomeButton type="secondary" style={{height: 30}}>Translate</AwesomeButton>
      </Popover>
      <Drawer
        open={grammarDrawerOpen}
        onRequestClose={() => { setGrammarDrawerOpen(false);}}
        modalElementClass="modal"
      >
        <div>
          {grammarDrawerGrammar &&
            <div className="drawer-container">
              <h2>{grammarDrawerGrammar.name}</h2>
              {grammarDrawerGrammar.definition}
              {grammarDrawerGrammar.notes &&
                <div dangerouslySetInnerHTML={{__html: grammarDrawerGrammar.notes}}></div>
              }
              {grammarDrawerGrammar.usage &&
                <div>
                  <h3>Usage</h3>
                  <div dangerouslySetInnerHTML={{__html: grammarDrawerGrammar.usage}}></div>
                </div>
              }
              {grammarDrawerGrammar.examples &&
              <pre>{JSON.stringify(grammarDrawerGrammar.examples, null, '\t')}</pre>
              }
            </div>
          }
        </div>
      </Drawer>
    </div>
  )
}

export default Honbun;
