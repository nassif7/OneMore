import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { act, create } from 'react-test-renderer'
import Toggle from './index'

const segments = (value: boolean) => {
  let tree!: ReturnType<typeof create>
  act(() => {
    tree = create(<Toggle value={value} onChange={() => {}} />)
  })
  const touchables = tree.root.findAllByType(TouchableOpacity)
  const texts = tree.root.findAllByType(Text)
  const byLabel = (label: string) => {
    const i = texts.findIndex((t) => t.props.children === label)
    return {
      bg: StyleSheet.flatten(touchables[i].props.style).backgroundColor,
      color: StyleSheet.flatten(texts[i].props.style).color,
    }
  }
  return { on: byLabel('ON'), off: byLabel('OFF') }
}

describe('Toggle segment colours', () => {
  it('ON selected: ON is black with white text, OFF is white with black text', () => {
    const { on, off } = segments(true)
    expect(on).toEqual({ bg: '#000', color: '#fff' })
    expect(off).toEqual({ bg: '#fff', color: '#000' })
  })

  it('OFF selected: OFF is red with white text, ON is white with black text', () => {
    const { on, off } = segments(false)
    expect(off).toEqual({ bg: '#C0392B', color: '#fff' })
    expect(on).toEqual({ bg: '#fff', color: '#000' })
  })
})
