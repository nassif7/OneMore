import { Button, HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui'
import {
  background,
  border,
  containerBackground,
  font,
  foregroundStyle,
  frame,
  kerning,
  lineLimit,
  minimumScaleFactor,
  padding,
  textCase,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers'
import { createWidget, type WidgetEnvironment } from 'expo-widgets'

import type { WidgetProps } from '@/helpers/widgetSync'

// The widget body runs in an isolated JavaScriptCore context: no imports or module-scope values
// are available at render time, so every colour and size below is declared inside the component.
const OneMoreWidget = (props: WidgetProps, environment: WidgetEnvironment) => {
  'widget'

  const CREAM = '#F5F0E8'
  const BLACK = '#000000'
  const RED = '#C0392B'
  const family = environment.widgetFamily
  const lastDate = props.lastLoggedAt !== null ? new Date(props.lastLoggedAt) : null

  // Lock screen: the system tints these, so no custom colours or backgrounds.
  if (family === 'accessoryCircular') {
    return (
      <VStack modifiers={[frame({ maxWidth: 1000, maxHeight: 1000 }), widgetURL('onemore://')]}>
        <Text modifiers={[font({ size: 34, weight: 'black' }), minimumScaleFactor(0.5), lineLimit(1)]}>
          {String(props.todayCount)}
        </Text>
      </VStack>
    )
  }

  if (family === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={1} modifiers={[frame({ maxWidth: 1000, alignment: 'leading' }), widgetURL('onemore://')]}>
        <HStack spacing={6}>
          <Text modifiers={[font({ size: 26, weight: 'black' }), lineLimit(1)]}>{String(props.todayCount)}</Text>
          <Text modifiers={[font({ size: 10, weight: 'bold', design: 'monospaced' }), kerning(1.5)]}>TODAY</Text>
        </HStack>
        <HStack spacing={4}>
          <Text modifiers={[font({ size: 9, weight: 'bold', design: 'monospaced' }), kerning(1.5)]}>LAST</Text>
          {lastDate ? (
            <Text
              date={lastDate}
              dateStyle="relative"
              modifiers={[font({ size: 11, weight: 'bold', design: 'monospaced' }), textCase('uppercase'), lineLimit(1), minimumScaleFactor(0.7)]}
            />
          ) : (
            <Text modifiers={[font({ size: 11, weight: 'bold', design: 'monospaced' })]}>NONE</Text>
          )}
        </HStack>
      </VStack>
    )
  }

  // systemSmall (and any larger family, which falls back to the same layout)
  return (
    <VStack
      alignment="leading"
      spacing={2}
      modifiers={[
        padding({ all: 12 }),
        frame({ maxWidth: 1000, maxHeight: 1000, alignment: 'topLeading' }),
        border({ content: BLACK, width: 4 }),
        containerBackground(CREAM, 'widget'),
        widgetURL('onemore://'),
      ]}>
      <Text modifiers={[font({ size: 10, weight: 'black', design: 'monospaced' }), kerning(2), foregroundStyle(RED)]}>TODAY</Text>
      <Text modifiers={[font({ size: 76, weight: 'black' }), minimumScaleFactor(0.5), lineLimit(1), foregroundStyle(BLACK)]}>
        {String(props.todayCount)}
      </Text>
      <HStack spacing={4}>
        <Text modifiers={[font({ size: 9, weight: 'black', design: 'monospaced' }), kerning(1.5), foregroundStyle(RED)]}>LAST</Text>
        {lastDate ? (
          <Text
            date={lastDate}
            dateStyle="relative"
            modifiers={[
              font({ size: 10, weight: 'bold', design: 'monospaced' }),
              textCase('uppercase'),
              lineLimit(1),
              minimumScaleFactor(0.6),
              foregroundStyle(BLACK),
            ]}
          />
        ) : (
          <Text modifiers={[font({ size: 10, weight: 'bold', design: 'monospaced' }), foregroundStyle(BLACK)]}>NONE</Text>
        )}
      </HStack>
      <Spacer />
      {props.interactive ? (
        <Button
          onPress={() => {
            const now = Date.now()
            return { todayCount: props.todayCount + 1, lastLoggedAt: now, pendingTs: [...props.pendingTs, now] }
          }}>
          <Text
            modifiers={[
              font({ size: 16, weight: 'black', design: 'monospaced' }),
              foregroundStyle(CREAM),
              frame({ maxWidth: 1000, height: 28 }),
              background(BLACK),
            ]}>
            +1
          </Text>
        </Button>
      ) : null}
    </VStack>
  )
}

export default createWidget<WidgetProps>('OneMoreWidget', OneMoreWidget)
