
import {walk, utils} from '@buggyorg/graphtools'
import {isGenericType} from './utils'
import _ from 'lodash'

var genericInputPort = (node) => {
  return _.findKey(node.inputPorts, (type, name) => isGenericType(type))
}

export function genericInput (graph, n) {
  const node = graph.node(n)

  var genericPort = genericInputPort(node)
  if (!genericPort) {
    return false
  }
  var predecessor = _.first(walk.predecessor(graph, n, genericPort))
  if (isGenericType(utils.portType(graph, predecessor.node, predecessor.port))) {
    return false
  }
  return { port: genericPort, predecessor }
}
