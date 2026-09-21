/**
 * Extracts explanations from two levels, first from general item level,
 * second from scoring/competency specific level.
 * @param value {object}
 * @param value.expanation {string=}
 * @param scores {object[]}
 * @return {string[]}
 */
export const getExplanations = ({ value, scores }) =>  {
  let explanations = []
  if (!Array.isArray(scores)) return explanations
  explanations = scores.filter(score => !!score.explanation).map(score => score.explanation)
  if (value?.explanation) {
    explanations.unshift(value.explanation)
  }
  return explanations
}
