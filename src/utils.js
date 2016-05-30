
import {utils} from '@buggyorg/graphtools'
import _ from 'lodash'

export function isGenericType (type) {
  return type.indexOf('generic') !== -1
}

export function isTypeRef (type) {
  return type.type === 'type-ref'
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
