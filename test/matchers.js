/* eslint-env mocha */

import chai from 'chai'
import graphlib from 'graphlib'
import fs from 'fs'
import 'babel-register'
import * as matchers from '../src/matchers'

var expect = chai.expect

var readFixture = (file) => {
  return graphlib.json.read(JSON.parse(fs.readFileSync('test/fixtures/' + file)))
}

describe('Matches nodes for generic processing', () => {
  it('matches nodes with generic inputs', () => {
    var preGeneric = readFixture('preGeneric.json')
    expect(matchers.genericInput(preGeneric, 'equal_0').port).to.be.oneOf(['i1', 'i2'])
  })

  it('matches nodes with generic outputs', () => {
    var postGeneric = readFixture('postGeneric.json')
    expect(matchers.genericOutput(postGeneric, 'join_1').port).to.equal('to')
  })
})