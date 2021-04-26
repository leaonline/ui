import { check, Match } from 'meteor/check'

/**
 *
 * @param onInput
 * @param responseCache
 * @return {function({responses?: *, data?: *}=)}
 */
export const createSubmitResponses = ({ onInput, responseCache = {} } = {}) => {
  check(onInput, Function)
  check(responseCache, Match.ObjectIncluding({
    get: Function,
    set: Function
  }))

  return ({ responses, data = {} } = {}) => {
    check(responses, Array)
    // skip if there is no onInput connected
    // which can happen when creating new items
    if (!onInput) {
      console.warn('no onInput handler connected to this component')
      return
    }

    // we use a simple stringified cache as we have fixed
    // positions, so we can easily skip sending same repsonses
    const cache = responseCache.get()
    const strResponses = JSON.stringify(responses)
    if (cache && strResponses === cache) {
      return
    }

    responseCache.set(strResponses)
    return onInput({
      responses,
      ...data
    })
  }
}
