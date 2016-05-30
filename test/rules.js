/* eslint-env mocha */

import chai from 'chai'
import graphlib from 'graphlib'
import fs from 'fs'
import 'babel-register'
import * as rules from '../src/rules'

var expect = chai.expect

var readFixture = (file) => {
  return graphlib.json.read(JSON.parse(fs.readFileSync('test/fixtures/' + file)))
}

describe('Rewriting rules', () => {
  it('sets generic type via input ports', () => {
    var preGeneric = readFixture('preGeneric.json')
    rules.predecessorPropagatesType(preGeneric)
    expect(preGeneric.node('equal_0')).to.have.property('settings')
    expect(preGeneric.node('equal_0').settings.genericType).to.be.a('string')
    expect(preGeneric.node('equal_0').settings.genericType).to.equal('number')
  })

  it('sets generic type via input ports for a compound node', () => {
    var preGeneric = readFixture('preGenericCompound.json')
    rules.predecessorPropagatesType(preGeneric)
    expect(preGeneric.node('genIn_1')).to.have.property('settings')
    expect(preGeneric.node('genIn_1').settings.genericType).to.be.an('object')
    expect(preGeneric.node('genIn_1').settings.genericType['x']).to.equal('number')
  })

  it('sets generic type via output ports', () => {
    var postGeneric = readFixture('postGeneric.json')
    rules.successorPropagatesType(postGeneric)
    expect(postGeneric.node('join_1')).to.have.property('settings')
    expect(postGeneric.node('join_1').settings.genericType).to.be.a('string')
    expect(postGeneric.node('join_1').settings.genericType).to.equal('number')
  })

  it('sets generic type via output ports for a compound node', () => {
    var postGeneric = readFixture('postGenericCompound.json')
    rules.successorPropagatesType(postGeneric)
    expect(postGeneric.node('genOut_4')).to.have.property('settings')
    expect(postGeneric.node('genOut_4').settings.genericType).to.be.an('object')
    expect(postGeneric.node('genOut_4').settings.genericType['value']).to.equal('number')
  })

  it('sets port types of a generic node', () => {
    var preGeneric = readFixture('preGeneric.json')
    rules.predecessorPropagatesType(preGeneric)
    rules.genericTypes(preGeneric)
    expect(preGeneric.node('equal_0').inputPorts.i1).to.equal('number')
    expect(preGeneric.node('equal_0').inputPorts.i2).to.equal('number')
  })

  it('uses type references to determine types', () => {
    var preGeneric = readFixture('typeRef.json')
    rules.typeReferences(preGeneric)
    expect(preGeneric.node('equal_0').inputPorts.i1).to.equal('number')
  })
})

