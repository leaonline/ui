import { Cloze } from 'meteor/leaonline:corelib/items/text/Cloze'

export const ClozeItemRendererUtils = {}

ClozeItemRendererUtils.isBlank = flavor => flavor === Cloze.flavor.blanks.value

ClozeItemRendererUtils.isSelect = flavor => flavor === Cloze.flavor.select.value

ClozeItemRendererUtils.isEmpty = flavor => flavor === Cloze.flavor.empty.value

ClozeItemRendererUtils.isText = flavor => flavor === Cloze.flavor.text.value

ClozeItemRendererUtils.getFlavor = flavor => Cloze.flavor[flavor]?.value
