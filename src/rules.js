
import {rewrite} from './const-rewrite.bundle.js'
import * as matchers from './matchers'

export const predecessorPropagatesType = rewrite.rule(
  matchers.genericInput,
  (graph, node, match) => {
    var genericInput = match
    console.log(genericInput)
  }
)

export default [
  predecessorPropagatesType
]
