
import {rewrite} from './const-rewrite.bundle.js'
import * as matchers from './matchers'
import {utils} from '@buggyorg/graphtools'
import {isGenericType, tangleType, entangleType} from './utils'
import _ from 'lodash'

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
        if (isGenericType(portType)) {
          utils.setPortType(graph, n, p, tangleType(gType[p], portType))
        }
      })
    }
  }
)

export const typeReferences = rewrite.rule(
  matchers.activeTypeRefs,
  (graph, n, match) => {
    _.each(match, (typeRef, port) => {
      var typeRefType = utils.portType(graph, typeRef.reference.node, typeRef.reference.port)
      utils.setPortType(graph, n, port, typeRefType)
    })
  }
)

export default [
  predecessorPropagatesType,
  successorPropagatesType,
  genericTypes,
  typeReferences
]
