
import {walk, utils} from '@buggyorg/graphtools'
import {isGenericType, isActiveTypeRef} from './utils'
import _ from 'lodash'

var genericInputPort = (node) => {
  return _.findKey(node.inputPorts, (type, name) => isGenericType(type))
}

var genericOutputPort = (node) => {
  return _.findKey(node.outputPorts, (type, name) => isGenericType(type))
}

export function genericInput (graph, n) {
  const node = graph.node(n)

  var genericPort = genericInputPort(node)
  if (!genericPort || (node.atomic && node.settings && node.settings.isGeneric)) {
    return false
  }
  var predecessor = _.first(walk.predecessor(graph, n, genericPort))
  if (!predecessor || isGenericType(utils.portType(graph, predecessor.node, predecessor.port))) {
    return false
  }
  return { port: genericPort, predecessor }
}

export function genericOutput (graph, n) {
  const node = graph.node(n)

  var genericPort = genericOutputPort(node)
  if (!genericPort) {
    return false
  }
  var successor = _.first(walk.successor(graph, n, genericPort))
  if (!successor || isGenericType(utils.portType(graph, successor.node, successor.port))) {
    return false
  }
  return { port: genericPort, successor }
}

export function genericType (graph, n) {
  const node = graph.node(n)

  // don't process non generics
  if (!node.settings || !node.settings.isGeneric) {
    return false
  }
  // if all output ports were already assigned do not process this
  if (!genericInputPort(node) && !genericOutputPort(node)) {
    return false
  }
  return true
}

export function activeTypeRefs (graph, n) {
  return _(utils.ports(graph, n))
    .toPairs()
    .filter((p) => isActiveTypeRef(graph, p[1]))
    .fromPairs()
    .value()
}
