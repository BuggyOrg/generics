
import {utils} from '@buggyorg/graphtools'
import rules from './rules'

function applyGenericRules (graph) {
  var newGraph = utils.clone(graph)
  rules.forEach(f => f(newGraph))
  return newGraph
}

export function replaceGenerics (graph) {
  return applyGenericRules(graph)
}
