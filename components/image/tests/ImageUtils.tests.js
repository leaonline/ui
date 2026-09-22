/* eslint-env mocha */

import { expect } from 'chai'
import { Components } from '../../Components'
import { ImageUtils } from '../ImageUtils'

describe('ImageUtils', () => {
  describe('getAttributes', () => {
    it('returns exact minimal attributes for an absolute HTTP source', () => {
      expect(
        ImageUtils.getAttributes({
          data: { src: 'https://example.test/image.png' },
          instanceId: 'image-id',
        }),
      ).to.deep.equal({
        'data-id': 'image-id',
        title: undefined,
        alt: undefined,
        'aria-title': undefined,
        width: undefined,
        height: undefined,
        class: 'lea-image  ',
        'data-src': 'https://example.test/image.png',
      })
    })

    it('builds option-rich relative attributes with generated precedence', () => {
      const src = '/images/example.png'
      const contentPath = Components.contentPath()
      const attributes = ImageUtils.getAttributes({
        data: {
          src,
          title: 'Example image',
          alt: 'An example',
          width: 320,
          height: 180,
          shadow: true,
          class: 'rounded-image',
          cors: 'anonymous',
          crossorigin: 'use-credentials',
          'data-id': 'caller-id',
          'data-src': 'caller-src',
          'data-tracking': 'image',
          'aria-title': 'Caller title',
          'aria-label': 'Caller label',
        },
        instanceId: 'generated-id',
      })

      expect(attributes).to.deep.equal({
        crossorigin: 'anonymous',
        'data-id': 'generated-id',
        'data-src': `${contentPath}${src}`,
        'data-tracking': 'image',
        'aria-title': 'Example image',
        'aria-label': 'Caller label',
        title: 'Example image',
        alt: 'An example',
        width: 320,
        height: 180,
        class: 'lea-image shadow rounded-image',
      })
    })

    it('uses crossorigin when the cors alias is absent', () => {
      const attributes = ImageUtils.getAttributes({
        data: {
          src: 'http://example.test/image.png',
          crossorigin: 'use-credentials',
        },
        instanceId: 'image-id',
      })

      expect(attributes.crossorigin).to.equal('use-credentials')
    })
  })
})
