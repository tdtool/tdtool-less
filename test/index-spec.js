/**
 * @Author: Zhengfeng.Yao <yzf>
 * @Date:   2017-05-03 16:32:00
 * @Last modified by:   yzf
 * @Last modified time: 2017-05-03 16:32:02
 */

import * as chai from 'chai'
import extend from '../src/index'

const expect = chai.expect

class Config {
  constructor() {
    this.config = {}
  }

  add = (key, value) => {
    this.config[key] = value
  }
}

describe('index', () => {
  it('test no options', () => {
    const configObj = new Config()
    extend(configObj)
    expect(configObj.config['rule.css']).to.not.be.undefined
    expect(configObj.config['rule.less'].use).to.include.members(['style-loader'])
  })

  it('test node options', () => {
    const configObj = new Config()
    extend(configObj, {
      target: 'node',
      sourceMap: true,
      minimize: true,
      theme: {
        '@font-size': '14px'
      },
      postCss: [
        'test'
      ]
    })
    expect(configObj.config['rule.less'].use[0].loader).to.equal('css-loader/locals')
    expect(configObj.config['rule.less'].use[2].options.sourceMap).to.equal(true)
    expect(configObj.config['rule.less'].use[1].options.plugins()).to.includes.members(['test'])
  })

  it('test extractCss options', () => {
    const configObj = new Config()
    extend(configObj, {
      extractCss: true,
      postCss: true,
      urlLoaderLimit: 5 * 1024
    })
    expect(configObj.config['plugin.ExtractText']).to.not.be.undefined
    expect(configObj.config['rule.css'].use.slice(-1)[0].options.plugins().length).to.equal(5)
    extend(configObj, {
      extractCss: 'test.js'
    })
    expect(configObj.config['plugin.ExtractText'].filename).to.equal('test.js')
  })
})
