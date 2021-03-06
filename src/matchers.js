
import {walk, utils} from '@buggyorg/graphtools'
import {isGenericType, isActiveTypeRef, isFunctionReference, isTypeRef} from './utils'
import _ from 'lodash'

var genericInputPort = (node) => {
  if (node.atomic) {
    return _.keys(_.pickBy(node.inputPorts, (type, name) => isGenericType(type)))
  } else {
    return _.keys(_.pickBy(_.merge({}, node.inputPorts, node.outputPorts), (type, name) => isGenericType(type)))
  }
}

var typeRefInputPort = (graph, node) => {
  if (node.atomic) {
    return _.keys(_.pickBy(node.inputPorts, (type, name) => isTypeRef(type) && !isActiveTypeRef(graph, type)))
  } else {
    return _.keys(_.pickBy(_.merge({}, node.inputPorts, node.outputPorts), (type, name) => isTypeRef(type) && !isActiveTypeRef(graph, type)))
  }
}

var genericOutputPort = (node) => {
  if (node.atomic) {
    return _.keys(_.pickBy(node.outputPorts, (type, name) => isGenericType(type)))
  } else {
    return _.keys(_.pickBy(_.merge({}, node.outputPorts, node.inputPorts), (type, name) => isGenericType(type)))
  }
}

var typeRefOutputPort = (graph, node) => {
  if (node.atomic) {
    return _.keys(_.pickBy(node.outputPorts, (type, name) => isTypeRef(type) && !isActiveTypeRef(graph, type)))
  } else {
    return _.keys(_.pickBy(_.merge({}, node.outputPorts, node.inputPorts), (type, name) => isTypeRef(type) && !isActiveTypeRef(graph, type)))
  }
}

export function genericInput (graph, n) {
  const node = graph.node(n)

  var genericPort = genericInputPort(node)
  if (genericPort.length === 0 || (node.atomic && node.settings && node.settings.isGeneric)) {
    return false
  }
  var predecessor = _(genericPort)
    .map((p) => _.map(walk.predecessor(graph, n, p), (pred) => ({port: p, predecessor: pred})))
    .flatten()
    .filter((p) => !isGenericType(utils.portType(graph, p.predecessor.node, p.predecessor.port)))
    .first()
  if (!predecessor) {
    return false
  }
  return predecessor
}

export function genericOutput (graph, n) {
  const node = graph.node(n)

  var genericPort = genericOutputPort(node)
  if (genericPort.length === 0 || (node.atomic && node.settings && node.settings.isGeneric)) {
    return false
  }
  var successor = _(genericPort)
    .map((p) => _.map(walk.successor(graph, n, p), (pred) => ({port: p, successor: pred})))
    .flatten()
    .compact()
    .filter((p) => !isGenericType(utils.portType(graph, p.successor.node, p.successor.port)))
    .first()
  if (!successor) {
    return false
  }
  return successor
}

export function recursiveCompound (graph, n) {
  const node = graph.node(n)

  // this only works for recursive compounds
  if (node.atomic || !node.recursive || !node.recursesTo) {
    return false
  }

  // only when there is a generic port ;)
  var genericPorts = _.concat(genericInputPort(node))
  if (genericPorts.length === 0) {
    return false
  }

  var recNode = graph.node(node.recursesTo.branchPath)
  var recGenPorts = _.concat(genericInputPort(recNode))
  var newPorts = _.difference(genericPorts, recGenPorts)
  if (newPorts.length > 0) {
    return { node: node.recursesTo.branchPath, ports: newPorts }
  } else {
    return false
  }
}

export function genericType (graph, n) {
  const node = graph.node(n)

  // don't process non generics or already processed generics (isGeneric = true)
  if (!node.settings || !node.settings.isGeneric || node.id === 'functional/lambda') {
    return false
  }
  // if all output ports were already assigned do not process this
  if (genericInputPort(node).length === 0 && genericOutputPort(node).length === 0) {
    return false
  }
  // if no new port would be assigned
  if (!node.atomic && _.intersection(
    _.intersection(_.keys(node.settings.genericType), genericInputPort(node)),
    genericOutputPort(node)).length === 0) {
    return false
  }
  return true
}

export function activeTypeRefs (graph, n) {
  var active = _(utils.ports(graph, n))
    .toPairs()
    .filter((p) => isActiveTypeRef(graph, p[1]))
    .fromPairs()
    .value()
  return (_.keys(active).length === 0) ? false : active
}

export function functionReferences (graph, n) {
  var active = _(utils.ports(graph, n))
    .toPairs()
    .filter((p) => isFunctionReference(graph, p[1]))
    .fromPairs()
    .value()
  return (_.keys(active).length === 0) ? false : active
}

export function typeRefInput (graph, n) {
  const node = graph.node(n)

  var typeRefPort = typeRefInputPort(graph, node)
  if (typeRefPort.length === 0) {
    return false
  }
  var predecessor = _(typeRefPort)
    .map((p) => _.map(walk.predecessor(graph, n, p), (pred) => ({port: p, predecessor: pred})))
    .flatten()
    .filter((p) => !isGenericType(utils.portType(graph, p.predecessor.node, p.predecessor.port)) &&
      !isTypeRef(utils.portType(graph, p.predecessor.node, p.predecessor.port)))
    .first()
  if (!predecessor) {
    return false
  }
  return predecessor
}

export function typeRefOutput (graph, n) {
  const node = graph.node(n)

  var typeRefPort = typeRefOutputPort(graph, node)
  if (typeRefPort.length === 0) {
    return false
  }
  var successor = _(typeRefPort)
    .map((p) => _.map(walk.successor(graph, n, p), (pred) => ({port: p, successor: pred})))
    .flatten()
    .compact()
    .filter((p) => !isGenericType(utils.portType(graph, p.successor.node, p.successor.port)) &&
      !isTypeRef(utils.portType(graph, p.successor.node, p.successor.port)))
    .first()
  if (!successor) {
    return false
  }
  return successor
}
