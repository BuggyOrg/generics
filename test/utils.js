/* eslint-env mocha */

import chai from 'chai'
import graphlib from 'graphlib'
import fs from 'fs'
import 'babel-register'
import * as utils from '../src/utils'

var expect = chai.expect

var readFixture = (file) => {
  return graphlib.json.read(JSON.parse(fs.readFileSync('test/fixtures/' + file)))
}

describe('Generic utility functions', () => {
  it('can recognize a generic type', () => {
    expect(utils.isGenericType('generic')).to.be.true
    expect(utils.isGenericType('[generic]')).to.be.true
    expect(utils.isGenericType('[[generic]]')).to.be.true
  })

  it('can recognize a non generic type', () => {
    expect(utils.isGenericType('gen')).to.be.false
    expect(utils.isGenericType('[gen]eric')).to.be.false
    expect(utils.isGenericType('number')).to.be.false
  })

  it('can identify type references', () => {
    expect(utils.isTypeRef({type: 'type-ref'})).to.be.true
    expect(utils.isTypeRef({type: 'function'})).to.be.false
    expect(utils.isTypeRef('number')).to.be.false
  })

  it('can recognize active type refs', () => {
    var preGeneric = readFixture('preGeneric.json')
    expect(utils.isActiveTypeRef(preGeneric, {type: 'type-ref', node: 'equal_0', port: 'eq'})).to.be.true
    expect(utils.isActiveTypeRef(preGeneric, {type: 'type-ref', node: 'equal_0', port: 'i1'})).to.be.false
  })
})

