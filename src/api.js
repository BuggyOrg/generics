
import {utils} from '@buggyorg/graphtools'
import {isGenericFree, genericNodes} from './utils.js'
import rules from './rules'

function applyGenericRules (graph) {
  var newGraph = utils.clone(graph)
  rules.forEach((f) => f(newGraph))
  return newGraph
}

export function replaceGenerics (graph) {
  for (var n = 0; n < graph.nodes().length * 20; n++) {
    graph = applyGenericRules(graph)
  }
  return graph
}

export { isGenericFree, genericNodes }
