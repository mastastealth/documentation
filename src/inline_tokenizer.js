/**
 * Create a tokenizer method for Remark, our Markdown processor,
 * that is able to parse JSDoc inline tokens
 *
 * @private
 * @param {string} type the destination type of the parsed objects
 * @param {RegExp} regex regular expression for extracting content
 * from text
 * @returns {Function} tokenizer
 */
function makeTokenizer(type, regex) {
  const tokenizer = function (eat, value) {
    const match = regex.exec(value);

    if (!match) {
      return;
    }

    return eat(match[0])({
      type,
      url: match[1],
      title: null,
      jsdoc: true,
      children: [
        {
          type: 'text',
          value: match[2] || match[1]
        }
      ]
    });
  };

  tokenizer.notInLink = true;
  tokenizer.locator = function (value, fromIndex) {
    return value.indexOf('{@' + type, fromIndex);
  };

  return tokenizer;
}

const tokenizeLink = makeTokenizer('link', /^\{@link\s+(.+?)(?:[\s|](.*?))?\}/);
const tokenizeTutorial = makeTokenizer(
  'tutorial',
  /^\{@tutorial\s+(.+?)(?:[\s|](.*?))?\}/
);

/**
 * A remark plugin that installs
 * [tokenizers](https://github.com/wooorm/remark/blob/master/doc/remarkplugin.3.md#function-tokenizereat-value-silent)
 * and [locators](https://github.com/wooorm/remark/blob/master/doc/remarkplugin.3.md#function-locatorvalue-fromindex)
 * for JSDoc inline `{@link}` and `{@tutorial}` tags.
 *
 * This does not handle the `[text]({@link url})` and `[text]({@tutorial url})` forms of these tags.
 * That's a JSDoc misfeature; just use regular markdown syntax instead: `[text](url)`.
 *
 * @returns {undefined}
 */
module.exports = function (/* options: Object*/) {
  const proto = this.Parser.prototype;
  proto.inlineTokenizers.tokenizeLink = tokenizeLink;
  proto.inlineTokenizers.tokenizeTutorial = tokenizeTutorial;
  const methods = proto.inlineMethods;
  methods.splice(
    methods.indexOf('inlineText'),
    0,
    'tokenizeLink',
    'tokenizeTutorial'
  );
};
