import { expect } from 'chai'
import { getExplanations } from '../getExplanations'

describe('getExplanations', () => {
  it('extracts explanations from general item level', () => {
    const value = { explanation: 'moo' }
    const explanations = getExplanations({ value })
    expect(explanations).to.deep.equal(['moo'])
  })
  it('extracts explanations from scoring/competency specific level', () => {
    const scores = [{}, { explanation: 'moo' }, {}, { explanation: 'bar' }]
    const explanations = getExplanations({ scores })
    expect(explanations).to.deep.equal(['moo', 'bar'])
  })
  it('extracts explanations from both', () => {
    const value = { explanation: 'foo' }
    const scores = [{}, { explanation: 'moo' }, {}, { explanation: 'bar' }]
    const explanations = getExplanations({ value, scores })
    expect(explanations).to.deep.equal(['foo', 'moo', 'bar'])
  })
})
