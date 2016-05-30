/* eslint-env mocha */

import chai from 'chai'
import graphlib from 'graphlib'
import fs from 'fs'
import 'babel-register'
import {replaceGenerics} from '../src/api'
import {genericNodes} from '../src/utils'

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

  it.only('can process the recursive map example', () => {
    var mapGraph = readFixture('fullGraphs/map.json')
    var replaced = replaceGenerics(mapGraph)
    console.log(genericNodes(replaced))
    console.log(JSON.stringify(graphlib.json.write(replaced)))
    expect(genericNodes(replaced)).to.be.empty
  })
})

