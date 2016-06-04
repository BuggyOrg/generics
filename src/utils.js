
import {utils} from '@buggyorg/graphtools'
import _ from 'lodash'

export function isGenericType (type) {
  return typeof (type) !== 'object' && type.indexOf('generic') !== -1
}

export function isTypeRef (type) {
  return typeof (type) === 'object' && type.type === 'type-ref'
}

export function isFunction (type) {
  return typeof (type) === 'object' && type.type === 'function'
}

export function hasInactiveTypeRefKeys (graph, obj) {
  return _.reduce(obj, (acc, value, key) => {
    return acc || hasInactiveTypeReferences(graph, value)
  }, false)
}

export function hasInactiveTypeReferences (graph, type) {
  return (isTypeRef(type) && !isActiveTypeRef(graph, type)) ||
    (isFunction(type) && (
      hasInactiveTypeRefKeys(graph, type.arguments) ||
      hasInactiveTypeRefKeys(graph, type.outputs)))
}

export function hasTypeRefKeys (graph, obj) {
  return _.reduce(obj, (acc, value, key) => {
    return acc || hasTypeReferences(graph, value)
  }, false)
}

export function hasTypeReferences (graph, type) {
  return (isTypeRef(type) && isActiveTypeRef(graph, type)) ||
    (isFunction(type) && (
      hasTypeRefKeys(graph, type.arguments) ||
      hasTypeRefKeys(graph, type.outputs)))
}

export function isFunctionReference (graph, type) {
  return isFunction(type) && hasTypeReferences(graph, type) && !hasInactiveTypeReferences(graph, type)
}

export function isActiveTypeRef (graph, type) {
  if (!isTypeRef(type)) {
    return false
  }
  var portType = utils.portType(graph, type.node, type.port)
  return (isTypeRef(portType) && isActiveTypeRef(portType)) ||
    (!isTypeRef(portType) && !isGenericType(portType))
}

export function entangleType (type, template) {
  if (template && template[0] === '[' && template[template.length - 1] === ']') {
    if (typeof (type) === 'object' && type.type === 'type-ref') {
      return _.merge({}, type, {template})
    }
    return type.replace(/\[/g, '').replace(/\]/g, '')
  } else if (template && isTypeRef(template) && template.template) {
    return entangleType(type, template.template)
  } else {
    return type
  }
}

export function tangleType (type, template) {
  if (template && template[0] === '[' && template[template.length - 1] === ']') {
    if (typeof (type) === 'object' && type.type === 'type-ref') {
      return _.merge({}, type, {template})
    }
    return '[' + type + ']'
  } else if (template && isTypeRef(template) && template.template) {
    return tangleType(type, template.template)
  } else {
    return type
  }
}

export function genericNodes (graph) {
  var nodes = graph.nodes()
  var genNodes = []
  for (let i = 0; i < nodes.length; i++) {
    var inp = graph.node(nodes[i]).inputPorts
    if (inp !== undefined) {
      var inpKeys = Object.keys(inp)
      for (let j = 0; j < inpKeys.length; j++) {
        if (isGenericType(inp[inpKeys[j]])) {
          genNodes.push(nodes[i])
        }
      }
    }
    var outp = graph.node(nodes[i]).outputPorts
    if (outp !== undefined) {
      var outpKeys = Object.keys(outp)
      for (let j = 0; j < outpKeys.length; j++) {
        if (isGenericType(outp[outpKeys[j]])) {
          genNodes.push(nodes[i])
        }
      }
    }
  }
  return genNodes
}

export function isGenericFree (graph) {
  return genericNodes(graph).length === 0
}
