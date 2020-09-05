import React from 'react';
import AnnotatedGrammar from './AnnotatedGrammar';
import reactStringReplace from 'react-string-replace';

const styles = {
  lineHeight: '30px'
};

const replaceGrammarPattern = /(\([\s\S][^()[\]]*?\)\[.+\])/g;

function Honbun({ honbun, grammar }) {

  // prepare grammar annotations
  let replacedText = reactStringReplace(honbun.text, replaceGrammarPattern, (match, i) => {
    // parse grammar annotation
    const annotationMatchPattern = /\(([\s\S][^)]*?)\)\[(.+)\]/g;
    const annotationMatch = annotationMatchPattern.exec(match);

    if (!annotationMatch) {
      return <span>BADBADBDDDDDDDDDDDDDD</span>
    }

    return <AnnotatedGrammar text={annotationMatch[1]} grammar={grammar[annotationMatch[2]]} />
  });

  // prepare linebreaks
  replacedText = reactStringReplace(replacedText, /(\n)/g, (match, i) =>
    <br />
  );

  return (
    <div style={styles}>
      {replacedText}
    </div>
  )
}

export default Honbun;
