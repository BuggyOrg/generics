
import {utils} from '@buggyorg/graphtools'
import {isGenericFree, genericNodes} from './utils.js'
import rules from './rules'
import _ from 'lodash'

function applyGenericRules (graph) {
  var newGraph = utils.clone(graph)
  var applied = _.reduce(rules, (acc, f) => f(newGraph) || acc, false)
  return {graph: newGraph, applied}
}

export function replaceGenerics (graph) {
  for (var n = 0; n < graph.nodes().length * 20; n++) {
    var res = applyGenericRules(graph)
    if (res.applied) {
      graph = res.graph
    } else {
      break
    }
  }
  return graph
}

export { isGenericFree, genericNodes }
