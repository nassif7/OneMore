import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { act, create } from 'react-test-renderer'
import * as Haptics from 'expo-haptics'
import Toggle from './index'

jest.mock('expo-haptics', () => ({ selectionAsync: jest.fn() }))

const render = (value: boolean, onChange = jest.fn()) => {
  let tree!: ReturnType<typeof create>
  act(() => {
    tree = create(<Toggle label="MOOD TAGS" value={value} onChange={onChange} />)
  })
  const row = tree.root.findByType(TouchableOpacity)
  const texts = tree.root.findAllByType(Text)
  const stateText = texts[texts.length - 1]
  const box = tree.root.findAllByType(View).find((v) => StyleSheet.flatten(v.props.style)?.borderWidth === 2)!
  return { row, stateText, box: StyleSheet.flatten(box.props.style), text: StyleSheet.flatten(stateText.props.style), onChange }
}

describe('Toggle', () => {
  it('ON: red fill, white "ON", black offset shadow', () => {
    const { stateText, box, text } = render(true)
    expect(stateText.props.children).toBe('ON')
    expect(box.backgroundColor).toBe('#C0392B')
    expect(text.color).toBe('#fff')
    expect(box.shadowOffset).toEqual({ width: 3, height: 3 })
    expect(box.shadowOpacity).toBe(1)
  })

  it('OFF: cream, black border, grey "OFF", no shadow', () => {
    const { stateText, box, text } = render(false)
    expect(stateText.props.children).toBe('OFF')
    expect(box.backgroundColor).toBe('#F5F0E8')
    expect(box.borderColor).toBe('#000')
    expect(text.color).toBe('#888')
    expect(box.shadowOpacity).toBeUndefined()
  })

  it('has the same width in both states so the row does not jump', () => {
    expect(render(true).box.width).toBe(render(false).box.width)
  })

  it('is a switch with checked state and the setting name as label', () => {
    const on = render(true).row.props
    expect(on.accessibilityRole).toBe('switch')
    expect(on.accessibilityState).toEqual({ checked: true })
    expect(on.accessibilityLabel).toBe('MOOD TAGS')
    expect(render(false).row.props.accessibilityState).toEqual({ checked: false })
  })

  it('flips the value and ticks haptics when the row is pressed', () => {
    const off = render(false)
    act(() => off.row.props.onPress())
    expect(off.onChange).toHaveBeenCalledWith(true)
    const on = render(true)
    act(() => on.row.props.onPress())
    expect(on.onChange).toHaveBeenCalledWith(false)
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(2)
  })
})
