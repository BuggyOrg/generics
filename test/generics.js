/* eslint-env mocha */

import chai from 'chai'
import graphlib from 'graphlib'
import fs from 'fs'
import 'babel-register'
import {replaceGenerics} from '../src/api'

var expect = chai.expect

var readFixture = (file) => {
  return graphlib.json.read(JSON.parse(fs.readFileSync('test/fixtures/' + file)))
}

describe('Determine generic types', () => {
  it('does not replace non generics', () => {
    var nonGeneric = readFixture('nonGeneric.json')
    var replaced = replaceGenerics(nonGeneric)
    expect(graphlib.json.write(nonGeneric)).to.eql(graphlib.json.write(replaced))
  })
})

