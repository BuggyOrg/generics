
import {utils} from '@buggyorg/graphtools'
import _ from 'lodash'

export function isGenericType (type) {
  return typeof (type) !== 'object' && type.indexOf('generic') !== -1
}

export function isTypeRef (type) {
  return typeof (type) === 'object' && type.type === 'type-ref'
}

export function isActiveTypeRef (graph, type) {
  return isTypeRef(type) &&
    !isGenericType(utils.portType(graph, type.reference.node, type.reference.port))
}

export function entangleType (type, template) {
  if (template && template[0] === '[' && template[template.length - 1] === ']') {
    if (typeof (type) === 'object' && type.type === 'type-ref') {
      return _.merge({}, type, {template})
    }
    return type.replace(/\[/g, '').replace(/\]/g, '')
  } else {
    return type
  }
}

export function tangleType (type, template) {
  if (template[0] === '[' && template[template.length - 1] === ']') {
    if (typeof (type) === 'object' && type.type === 'type-ref') {
      return _.merge({}, type, {template})
    }
    return '[' + type + ']'
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
