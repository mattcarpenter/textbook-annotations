import React from 'react';
import AnnotatedGrammar from './AnnotatedGrammar';
import reactStringReplace from 'react-string-replace';
import ScaleText from "react-scale-text";

const replaceGrammarPattern = /(\([\s\S][^()[\]]*?\)\[.+\])/g;

function Honbun({ honbun, grammar }) {

  // try my own replacement
  const text = honbun.text;
  let m = replaceGrammarPattern.exec(text);
  debugger;

  // prepare grammar annotations
  let replacedText = reactStringReplace(honbun.text, replaceGrammarPattern, (match, i) => {
    // parse grammar annotation
    const annotationMatchPattern = /\(([\s\S][^)]*?)\)\[(.+)\]/g;
    const annotationMatch = annotationMatchPattern.exec(match);

    if (!annotationMatch) {
      return <span>BAD</span>
    }

    return <AnnotatedGrammar text={annotationMatch[1]} grammar={grammar[annotationMatch[2]]} />
  });

  // prepare linebreaks
  replacedText = reactStringReplace(replacedText, /\n/g, (match, i) =>
    <br />
  );

  return (
    <ScaleText widthOnly={true}>
      {replacedText}
    </ScaleText>
  )
}

export default Honbun;
