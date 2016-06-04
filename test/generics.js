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

  it('can process the recursive map example', () => {
    var mapGraph = readFixture('fullGraphs/map.json')
    var replaced = replaceGenerics(mapGraph)
    expect(genericNodes(replaced)).to.be.empty
  })

  it('can process the quicksort example', () => {
    var quickGraph = readFixture('fullGraphs/quicksort.json')
    var replaced = replaceGenerics(quickGraph)
    expect(genericNodes(replaced)).to.be.empty
  })

  it('can process the selectionsort example', () => {
    var selGraph = readFixture('fullGraphs/selectionsort.json')
    var replaced = replaceGenerics(selGraph)
    expect(genericNodes(replaced)).to.be.empty
  })
})

