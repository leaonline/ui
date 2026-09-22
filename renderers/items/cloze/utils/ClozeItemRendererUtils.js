import { Cloze } from 'meteor/leaonline:corelib/items/text/Cloze'

export const ClozeItemRendererUtils = {}

ClozeItemRendererUtils.isBlank = (flavor) =>
  flavor === Cloze.flavor.blanks.value

ClozeItemRendererUtils.isSelect = (flavor) =>
  flavor === Cloze.flavor.select.value

ClozeItemRendererUtils.isEmpty = (flavor) => flavor === Cloze.flavor.empty.value

ClozeItemRendererUtils.isText = (flavor) => flavor === Cloze.flavor.text.value

ClozeItemRendererUtils.getFlavor = (flavor) => Cloze.flavor[flavor]?.value

ClozeItemRendererUtils.isItem = (flavor) =>
  ClozeItemRendererUtils.isBlank(flavor) ||
  ClozeItemRendererUtils.isSelect(flavor)

/**
 * Constructs feedback-relevant information for a given token, based on
 * the token type and the scoring data.
 *
 * It searches the scores array for a score that matches the given token by
 * - itemId (which is equal to the contentId)
 * - itemIndex (defined as "target" in score objects)
 *
 * If a score entry is found, a result object is constructed:
 *
 * ```js
 * {
 *    wasScored: Boolean, // indicate the token was assigned a score
 *    isValid: Boolean, // indicate the response was "correct"
 *    correctResponse:
 * }
 * ```
 *
 * @param param0 {object}
 * @param param0.scores {object[]}
 * @param param0.token {object}
 * @return {object|undefined}
 */
ClozeItemRendererUtils.getFeedbackForToken = ({ scores, token }) => {
  if (ClozeItemRendererUtils.isItem(token.flavor)) {
    const score = scores.find(
      (_score) =>
        _score.itemId === token.itemId && _score.target == token.itemIndex,
    )
    if (score) {
      const result = {}
      result.wasScored = true

      const isValid = !!score.score
      result.isValid = isValid
      result.correctResponse = score.expected ? String(score.expected) : ''
      result.color = isValid ? 'success' : 'danger'
      result.isUndefined = score.isUndefined

      // to render the "expected" term/word, we need to
      // find the expected word from the token, because the correctResponse
      // only contains a RegEx pattern
      const expected =
        token.value?.length > 1
          ? token.value[token.itemIndex]?.value
          : token.value[0]?.value
      const showExpected = !isValid && expected

      // variant A: select
      if (showExpected && Array.isArray(expected)) {
        const index =
          score.correctResponse instanceof RegExp
            ? Number(score.correctResponse.source)
            : Number(score.correctResponse)
        if (Number.isInteger(index)) {
          result.expected = expected[index]
        }
      }

      // variant B: blanks - use value directly
      if (showExpected && typeof expected === 'string') {
        result.expected = expected
      }

      return result
    }
  }
}
