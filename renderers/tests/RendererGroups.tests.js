import { expect } from 'chai'
import { RendererGroups } from '../RendererGroups'

describe('RendererGroups', () => {
  it('preserves the public group names, labels and task-content eligibility', () => {
    expect(RendererGroups).to.deep.equal({
      layout: {
        name: 'layout',
        isTaskContent: true,
        label: 'taskRenderers.layout.title',
      },
      items: {
        name: 'items',
        isTaskContent: true,
        label: 'taskRenderers.items.title',
      },
      documents: {
        name: 'document',
        isTaskContent: false,
        label: 'taskRenderers.documents.title',
      },
    })
  })
})
