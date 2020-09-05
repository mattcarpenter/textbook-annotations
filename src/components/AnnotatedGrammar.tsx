import React from 'react';
import reactStringReplace from 'react-string-replace';

function AnnotatedGrammar({text, onClick}) {
  const replacedText = reactStringReplace(text, '\n', () => <br />);
  return (
  <span
    style={{color: 'red'}}
    onClick={onClick}>
    {replacedText}
  </span>);
}

export default AnnotatedGrammar;
