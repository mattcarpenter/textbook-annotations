import React from 'react';
import reactStringReplace from 'react-string-replace';

function AnnotatedVocab({text, reading, definition, onClick, className}) {
  const replacedText = reactStringReplace(text, '\n', () => <br />);
  const truncatedDefinition = definition.slice(0, text.length * 4);
  return (
    <span
      className={className}
      style={{color: '#0881c3'}}
      onClick={onClick}>
    <ruby className={"ruby"}>
      {replacedText}
      <rt style={{userSelect: 'none'}}>
        <div className={"rubyDefinition"}>{truncatedDefinition}</div>
        <br/>{
        reading}
      </rt>
    </ruby>
  </span>);
}

export default AnnotatedVocab;
