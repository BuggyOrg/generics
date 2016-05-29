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
    expect(matchers.genericInput(preGeneric, 'genIn_1').port).to.equal('x')
  })
})