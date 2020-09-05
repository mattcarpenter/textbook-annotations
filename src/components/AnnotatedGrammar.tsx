import React from 'react';
import reactStringReplace from 'react-string-replace';

function AnnotatedGrammar({text, grammar}) {
  const replacedText = reactStringReplace(text, '\n', () => <br />);
  return <span style={{color: 'red'}}>{replacedText}</span>
}

export default AnnotatedGrammar;
