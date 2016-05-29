/* eslint-env mocha */

import chai from 'chai'
import graphlib from 'graphlib'
import 'babel-register'
import * as utils from '../src/utils'

var expect = chai.expect

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
})

