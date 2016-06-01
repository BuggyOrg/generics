
import {rewrite} from './const-rewrite.bundle.js'
import * as matchers from './matchers'
import {utils} from '@buggyorg/graphtools'
import {isGenericType, tangleType, entangleType, isFunction, isTypeRef} from './utils'
import _ from 'lodash'
import fs from 'fs'
import graphlib from 'graphlib'
import tempfile from 'tempfile'

const matchNonGenericNeighbor = (graph, node, match, matchType) => {
  var curNode = graph.node(node)
  var neigh = match[matchType]
  var genericType = utils.portType(graph, node, match.port)
  var neighType = utils.portType(graph, neigh.node, neigh.port)
  if (curNode.atomic) {
    curNode.settings = _.merge({}, curNode.settings, {genericType: entangleType(neighType, genericType)})
    curNode.settings.isGeneric = true
  } else {
    if (!_.has(curNode, 'settings.genericType')) {
      curNode.settings = _.merge({}, curNode.settings, {genericType: {}})
    }
    curNode.settings.genericType[match.port] = entangleType(neighType, genericType)
    curNode.settings.isGeneric = true
  }
}

export const predecessorPropagatesType = rewrite.rule(
  matchers.genericInput,
  _.partial(matchNonGenericNeighbor, _, _, _, 'predecessor')
)

export const successorPropagatesType = rewrite.rule(
  matchers.genericOutput,
  _.partial(matchNonGenericNeighbor, _, _, _, 'successor')
)

export const genericTypes = rewrite.rule(
  matchers.genericType,
  (graph, n) => {
    var curNode = graph.node(n)
    var gType = curNode.settings.genericType
    if (curNode.atomic) {
      _.each(utils.ports(graph, n), (portType, p) => {
        if (isGenericType(portType)) {
          utils.setPortType(graph, n, p, tangleType(gType, portType))
        }
      })
    } else {
      _.each(utils.ports(graph, n), (portType, p) => {
        if (isGenericType(portType) && _.has(gType, p)) {
          utils.setPortType(graph, n, p, tangleType(gType[p], portType))
        }
      })
    }
  }
)

function replaceFunctionPorts (graph, node, portType) {
  node[portType] = _.mapValues(node[portType], (type, key) => {
    if (isFunction(type)) {
      return replaceFunctionTypeReferences(graph, type)
    }
    return type
  })
  graph.setNode(node.branchPath, _.cloneDeep(node))
}

function replaceFunctionTypeReferences (graph, functionType) {
  var resTypeRefs = _.partial(resolveTypeReference, graph)
  return {
    type: 'function',
    arguments: _.mapValues(functionType.arguments, resTypeRefs),
    outputs: _.mapValues(functionType.outputs, resTypeRefs),
    return: resTypeRefs(functionType.return)
  }
}

function resolveTypeReference (graph, typeRef) {
  if (isTypeRef(typeRef)) {
    try {
      return resolveTypeReference(graph, tangleType(
        graph.node(typeRef.node)[utils.portDirectionType(graph, typeRef.node, typeRef.port)][typeRef.port],
        typeRef.template))
    } catch (err) {
      throw new Error(err + '\n  As type reference in: ' + JSON.stringify(typeRef))
    }
  } else if (isFunction(typeRef)) {
    return replaceFunctionTypeReferences(graph, typeRef)
  } else if (isGenericType(typeRef)) {
    throw new Error('Cannot apply type replacement on generic type' + JSON.stringify(typeRef) + '.')
  } else {
    return typeRef
  }
}

export const typeReferences = rewrite.rule(
  matchers.activeTypeRefs,
  (graph, n, match) => {
    _.each(match, (typeRef, port) => {
      var typeRefType = utils.portType(graph, typeRef.node, typeRef.port)
      utils.setPortType(graph, n, port, tangleType(typeRefType, typeRef.template))
      graph.node(n).settings = graph.node(n).settings || {}
      graph.node(n).settings.isGeneric = true
    })
  }
)

export const functionReferences = rewrite.rule(
  matchers.functionReferences,
  (graph, n, match) => {
    try {
      replaceFunctionPorts(graph, graph.node(n), 'inputPorts')
      replaceFunctionPorts(graph, graph.node(n), 'outputPorts')
      graph.node(n).settings = graph.node(n).settings || {}
      graph.node(n).settings.isGeneric = true
    } catch (err) {
      var jsonTmp = tempfile('.json')
      fs.writeFileSync(jsonTmp, JSON.stringify(graphlib.json.write(graph)))
      throw new Error('Unable to apply function reference on node ' + n + ' to match \n' + JSON.stringify(match, null, 2) + '\n' + err + '\nwrote graph to ' + jsonTmp)
    }
  }
)

export const recursivePorts = rewrite.rule(
  matchers.recursiveCompound,
  (graph, n, match) => {
    _.each(match.ports, (p) => {
      utils.setPortType(graph, n, p, utils.portType(graph, match.node, p))
    })
  }
)

export default [
  predecessorPropagatesType,
  successorPropagatesType,
  genericTypes,
  typeReferences,
  functionReferences,
  recursivePorts
]
