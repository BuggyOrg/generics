
import {rewrite} from './const-rewrite.bundle.js'
import * as matchers from './matchers'
import {utils} from '@buggyorg/graphtools'
import _ from 'lodash'

const matchNonGenericNeighbor = (graph, node, match, matchType) => {
  var curNode = graph.node(node)
  var neigh = match[matchType]
  var neighType = utils.portType(graph, neigh.node, neigh.port)
  if (curNode.atomic) {
    curNode.settings = _.merge({}, curNode.settings, {genericType: neighType})
  } else {
    if (!_.has(curNode, 'settings.genericType')) {
      curNode.settings = _.merge({}, curNode.settings, {genericType: []})
    }
    curNode.settings.genericType.push({port: match.port, type: neighType})
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

export default [
  predecessorPropagatesType,
  successorPropagatesType
]
