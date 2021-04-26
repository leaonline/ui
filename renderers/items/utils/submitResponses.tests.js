/* eslint-env mocha */
import { expect } from 'chai'
import { ReactiveVar } from 'meteor/reactive-var'
import { createSubmitResponses } from './createSubmitResponses'

describe(createSubmitResponses.name, function () {
  it('throws on invalid input', function () {
    [
      undefined,
      {},
      { responseCache: { get: () => {}, set: () => {}}}
    ].forEach(input => {
      expect(() => createSubmitResponses()).to.throw('Expected function, got undefined')
    })
    expect(() => createSubmitResponses({
      onInput: () => {}
    })).to.throw('Missing key \'get\'')
    expect(() => createSubmitResponses({
      onInput: () => {},
      responseCache: { get: () => {}}
    })).to.throw('Missing key \'set\'')
  })
  it('returns a function to submit responses', function () {
    const submitResponses = createSubmitResponses({
      onInput: (data) => {
        expect(data).to.deep.equal({
          foo: 'bar',
          responses: ['foo']
        })
      },
      responseCache: {
        get: () => {},
        set: val => {
          expect(val).to.equal(JSON.stringify(['foo']))
        }
      }
    })
    submitResponses({
      responses: ['foo'],
      data: { foo: 'bar' }
    })
  })
  it('skips responding if cached', function () {
    const cache = new ReactiveVar(JSON.stringify(['foo']))
    const submitResponses = createSubmitResponses({
      onInput: () => {
        expect.fail()
      },
      responseCache: {
        get: val => cache.get(),
        set: () => {} }
    })
    submitResponses({
      responses: ['foo']
    })
  })
})
