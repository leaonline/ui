export const ConnectItemRendererUtils = {}

ConnectItemRendererUtils.createLine = ({ root, from, to, source, target, color }) => {
    // get the root position
    if (!root || typeof root.getBoundingClientRect !== 'function') {
        return null
    }
    const rootRect = root.getBoundingClientRect()

    const rx = rootRect.left
    const ry = rootRect.top

    // get the source position
    const x1 = source.left - rx + source.width + 10
    const y1 = source.top - ry + source.height / 2

    // get the dropzone position
    const x2 = target.left - rx
    const y2 = target.top - ry + target.height / 2

    // center remove button on the middle of the line
    const cx = (x1 + x2) / 2
    const cy = (y1 + y2) / 2 - 10

    // measure width and height of the svg container
    const width = rootRect.width
    const height = rootRect.height

    return { from, to, x1, y1, x2, y2, cx, cy, color, width, height }
}
