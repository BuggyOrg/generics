
import {walk, utils} from '@buggyorg/graphtools'
import {isGenericType} from './utils'
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
  if (isGenericType(utils.portType(graph, predecessor.node, predecessor.port))) {
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
  if (isGenericType(utils.portType(graph, successor.node, successor.port))) {
    return false
  }
  return { port: genericPort, successor }
}
