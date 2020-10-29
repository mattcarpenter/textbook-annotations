import React, { useState, useRef } from 'react';
import AnnotatedGrammar from './AnnotatedGrammar';
import AnnotatedVocab from './AnnotatedVocab';
import reactStringReplace from 'react-string-replace';
import LineTo from 'react-lineto';
import Drawer from 'react-drag-drawer';
import Popover from 'react-text-selection-popover';
import placeRightBelow from 'react-text-selection-popover/lib/placeRightBelow'
import "react-awesome-button/dist/styles.css";
import axios from 'axios';

//@ts-ignore
import { AwesomeButton } from "react-awesome-button";

import './Honbun.css';

const styles = {
  lineHeight: '30px'
};

const replaceGrammarPattern = /(\([\s\S][^()[\]]*?\)\[.+\])/g;
const replaceVocabPattern = /((.+?)=(.+?),)/g;

function Honbun({ honbun, grammar, vocab }) {

  const [grammarDrawerOpen, setGrammarDrawerOpen] = useState(false);
  const [grammarDrawerGrammar, setGrammarDrawerGrammar] = useState();
  const [grammarDrawerContent, setGrammarDrawerContent] = useState();
  const [grammarDrawerLookupTerm, setGrammarDrawerLookupTerm] = useState();
  const [selectionTranslation, setSelectionTranslation] = useState('');
  const [checked, setChecked] = useState(false);

  const honbunEl = useRef(null);
  const definitionElements: JSX.Element[] = [];

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
          setGrammarDrawerContent('grammar');
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

  // prepare vocab annotations
  if (!checked) {
    let annotationId = 0;
    let vocabId = 0;
    vocab
      .sort((a, b) => b.kanji.length - a.kanji.length)
      .forEach(vocabTerm => {
        vocabId++;
        vocabTerm.annotationIds = [];
        [vocabTerm.kanji, ...vocabTerm.otherForms]
          .filter(t => t !== '')
          .forEach(t => {
            let searchTerm = t;
            let replacement = vocabTerm.hiragana;
            if (t.indexOf('=') > -1) {
              searchTerm = t.split('=')[0];
              replacement = t.split('=')[1];
            }
            replacedText = reactStringReplace(replacedText, searchTerm, (match, i) => { // old 2nd arg = t
              annotationId++;
              vocabTerm.annotationIds.push(annotationId);
              return (
                <AnnotatedVocab
                  className={`vocab-${annotationId}`}
                  text={match}
                  reading={replacement} // used to be vocabTerm.hiragana
                  definition={vocabTerm.definition}
                  onClick={() => {
                  }}
                />
              );
            });
          });

        // any matches?
        if (vocabTerm.annotationIds.length) {
          // Create definition element
          definitionElements.push(
            <div>
              <div className={`definition-${vocabId}`}>
                {vocabTerm.definition}
              </div>
            </div>
          );
        }
      });
  }

  return (
    <div>
      <input type="checkbox" checked={checked} onClick={() => setChecked(!checked)}/> Hide Furigana
      <div style={styles} ref={honbunEl}>
        {replacedText}
      </div>
      <div>
        {definitionElements}
      </div>
      <Popover
        selectionRef={honbunEl}
        placementStrategy={placeRightBelow}
        onTextSelect={() => {
          // @ts-ignore
          setGrammarDrawerLookupTerm(window.getSelection().toString());
        }}
      >
        <div style={{marginTop:20}}>
          <AwesomeButton
            type="primary"
            style={{height: 30}}
            onPress={() => {
              setGrammarDrawerContent('dictionary');
              setGrammarDrawerOpen(true);
            }}
          >
            Look Up
          </AwesomeButton>&nbsp;
          <AwesomeButton
            type="secondary"
            style={{height: 30}}
            onPress={() => {
              setSelectionTranslation('');
              setGrammarDrawerContent('translate');
              setGrammarDrawerOpen(true);
              axios
                .post('https://eps50mnw3l.execute-api.ap-northeast-1.amazonaws.com/default/translate', {
                  phrase: grammarDrawerLookupTerm.replace(/\n/g,'')
                })
                .then(response => {
                  setSelectionTranslation(response.data.result);
                });
            }}
          >
            Translate
          </AwesomeButton>
        </div>
      </Popover>
      <Drawer
        open={grammarDrawerOpen}
        onRequestClose={() => { setGrammarDrawerOpen(false);}}
        modalElementClass="modal"
      >
        <div>
          {grammarDrawerGrammar && grammarDrawerContent === 'grammar' &&
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
          {grammarDrawerLookupTerm && grammarDrawerContent === 'dictionary' &&
            <div>
              <h2>Dictionary Lookup</h2>
              <iframe style={{width: '100%', maxHeight: '50vh', height: 500}} src={`https://jisho.org/search/${grammarDrawerLookupTerm}`}></iframe>
            </div>
          }
          {grammarDrawerLookupTerm && grammarDrawerContent === 'translate' &&
            <div>
              <h2>Translate</h2>
              {selectionTranslation}
            </div>
          }
        </div>
      </Drawer>
    </div>
  )
}

export default Honbun;
