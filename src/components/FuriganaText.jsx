export default function FuriganaText({
  tokens,
  vocabulary,
  grammar,
  onWordClick,
  onGrammarClick,
  showFurigana = false,
}) {
  const vocabMap = Object.fromEntries(vocabulary.map((v) => [v.id, v]));

  function handleClick(e, token) {
    e.stopPropagation();
    if (token.wordId) {
      const rect = e.currentTarget.getBoundingClientRect();
      onWordClick(vocabMap[token.wordId], { x: rect.left, y: rect.bottom });
    } else if (token.grammarId) {
      onGrammarClick(token.grammarId);
    }
  }

  return (
    <p className="text-2xl leading-loose">
      {tokens.map((token, i) => {
        const isClickable = !!(token.wordId || token.grammarId);
        const classes = [
          isClickable ? "cursor-pointer" : "",
          token.wordId ? "text-blue-700" : "",
          token.grammarId ? "underline decoration-orange-500" : "",
        ]
          .filter(Boolean)
          .join(" ");

        if (token.reading && showFurigana) {
          return (
            <ruby
              key={i}
              className={classes}
              onClick={isClickable ? (e) => handleClick(e, token) : undefined}
            >
              {token.text}
              <rt className="text-xs text-gray-500">{token.reading}</rt>
            </ruby>
          );
        }
        return (
          <span
            key={i}
            className={classes}
            onClick={isClickable ? (e) => handleClick(e, token) : undefined}
          >
            {token.text}
          </span>
        );
      })}
    </p>
  );
}
