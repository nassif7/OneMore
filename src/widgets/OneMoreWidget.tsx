import { Button, Circle, HStack, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui'
import {
  background,
  buttonStyle,
  containerBackground,
  font,
  foregroundStyle,
  frame,
  kerning,
  layoutPriority,
  lineLimit,
  minimumScaleFactor,
  offset,
  padding,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers'
import { createWidget, type WidgetEnvironment } from 'expo-widgets'

import type { WidgetProps } from '@/helpers/widgetSync'

// The widget body runs in an isolated JavaScriptCore context: no imports or module-scope values
// are available at render time, so every colour and size below is declared inside the component.
//
// Fonts: Bebas Neue can't be bundled into the extension and @expo/ui has no SwiftUI fontWidth, but
// font({ family }) accepts any installed font, so numbers use DIN Condensed Bold (ships with iOS).
const OneMoreWidget = (props: WidgetProps, environment: WidgetEnvironment) => {
  'widget'

  const family = environment.widgetFamily
  const dark = environment.colorScheme === 'dark'
  const RED = '#C0392B'
  const DISPLAY = 'DINCondensed-Bold'
  const BG = dark ? '#0E0E0E' : '#F5F0E8'
  const INK = dark ? '#F5F0E8' : '#000000'
  const lastDate = props.lastLoggedAt != null ? new Date(props.lastLoggedAt) : null

  // +1 button, shared by the small and medium layouts. A hard offset shadow, no blur: a solid copy
  // of the circle shifted 3pt down and right. onPress only returns the new props; the runtime
  // persists them on the entry that was on screen.
  const renderButton = (size: number) => (
    <Button
      modifiers={[buttonStyle('plain')]}
      onPress={() => {
        const now = Date.now()
        return { todayCount: props.todayCount + 1, lastLoggedAt: now, pendingTs: [...props.pendingTs, now] }
      }}>
      <ZStack>
        <Circle modifiers={[foregroundStyle(INK), frame({ width: size, height: size }), offset({ x: 3, y: 3 })]} />
        <Circle modifiers={[foregroundStyle(INK), frame({ width: size, height: size })]} />
        <Circle modifiers={[foregroundStyle(RED), frame({ width: size - 6, height: size - 6 })]} />
        <VStack spacing={-2}>
          <Text modifiers={[font({ family: DISPLAY, size: size * 0.27 }), foregroundStyle('#FFFFFF')]}>ONE</Text>
          <Text modifiers={[font({ family: DISPLAY, size: size * 0.27 }), foregroundStyle('#FFFFFF')]}>MORE</Text>
        </VStack>
      </ZStack>
    </Button>
  )

  // Lock screen: the system tints these, so no custom colours or backgrounds.
  if (family === 'accessoryCircular') {
    return (
      <VStack spacing={0} modifiers={[padding({ all: 4 }), frame({ maxWidth: 1000, maxHeight: 1000 }), widgetURL('onemore://')]}>
        <Text modifiers={[font({ family: DISPLAY, size: 34 }), minimumScaleFactor(0.5), lineLimit(1)]}>
          {String(props.todayCount)}
        </Text>
        <Text modifiers={[font({ size: 8, weight: 'bold', design: 'monospaced' }), kerning(1.5)]}>TODAY</Text>
      </VStack>
    )
  }

  if (family === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={1} modifiers={[padding({ all: 6 }), frame({ maxWidth: 1000, alignment: 'leading' }), widgetURL('onemore://')]}>
        <HStack spacing={6}>
          <Text modifiers={[font({ family: DISPLAY, size: 30 }), lineLimit(1)]}>{String(props.todayCount)}</Text>
          <Text modifiers={[font({ size: 10, weight: 'bold', design: 'monospaced' }), kerning(1.5)]}>TODAY</Text>
        </HStack>
        <HStack spacing={4}>
          <Text modifiers={[font({ size: 9, weight: 'bold', design: 'monospaced' }), kerning(1.5)]}>LAST</Text>
          {lastDate ? (
            <Text
              date={lastDate}
              dateStyle="relative"
              modifiers={[font({ size: 11, weight: 'bold', design: 'monospaced' }), lineLimit(1), minimumScaleFactor(0.7)]}
            />
          ) : (
            <Text modifiers={[font({ size: 11, weight: 'bold', design: 'monospaced' })]}>NONE</Text>
          )}
        </HStack>
      </VStack>
    )
  }

  const frameModifiers = [
    frame({ maxWidth: 1000, maxHeight: 1000, alignment: 'topLeading' }),
    containerBackground(BG, 'widget'),
    widgetURL('onemore://'),
  ]

  // 04 MEDIUM – DASHBOARD + TAP: count, stats and button on top, a black strip with the next nudge below.
  if (family === 'systemMedium') {
    const entryMs = new Date(environment.date as unknown as number).getTime()
    const nextInFuture = props.nextAt != null && Number.isFinite(entryMs) && props.nextAt > entryMs
    const STRIP = '#000000'
    const STRIP_TEXT = '#F5F0E8'
    const label = [font({ size: 8, weight: 'bold', design: 'monospaced' }), kerning(1), foregroundStyle(INK)]
    const stat = [font({ family: DISPLAY, size: 26 }), lineLimit(1), minimumScaleFactor(0.6), foregroundStyle(INK)]
    return (
      <VStack spacing={0} modifiers={frameModifiers}>
        <HStack spacing={14} modifiers={[padding({ top: 12, bottom: 8, horizontal: 16 }), frame({ maxWidth: 1000, maxHeight: 1000 })]}>
          <VStack alignment="leading" spacing={9}>
            <Text modifiers={label}>TODAY&apos;S COUNT</Text>
            <Text modifiers={[font({ family: DISPLAY, size: 80 }), minimumScaleFactor(0.5), lineLimit(1), layoutPriority(1), foregroundStyle(INK)]}>
              {String(props.todayCount)}
            </Text>
          </VStack>
          <VStack alignment="leading" spacing={4}>
            <VStack alignment="leading" spacing={7}>
              <Text modifiers={label}>AVG GAP</Text>
              <Text modifiers={stat}>{props.avgGapLabel ?? '--'}</Text>
            </VStack>
            <VStack alignment="leading" spacing={7}>
              <Text modifiers={label}>LAST ONE</Text>
              {lastDate ? <Text date={lastDate} dateStyle="relative" modifiers={stat} /> : <Text modifiers={stat}>NONE</Text>}
            </VStack>
          </VStack>
          <Spacer />
          {props.interactive ? renderButton(88) : null}
        </HStack>
        <HStack spacing={10} modifiers={[padding({ horizontal: 16 }), frame({ maxWidth: 1000, height: 40 }), background(STRIP)]}>
          {nextInFuture ? (
            <HStack spacing={4}>
              <Text modifiers={[font({ size: 9, weight: 'bold', design: 'monospaced' }), kerning(1), foregroundStyle(STRIP_TEXT)]}>IN</Text>
              <Text
                timerInterval={{ lower: new Date(entryMs), upper: new Date(props.nextAt as number) }}
                modifiers={[font({ size: 10, weight: 'bold', design: 'monospaced' }), foregroundStyle(STRIP_TEXT)]}
              />
            </HStack>
          ) : (
            <Text modifiers={[font({ size: 9, weight: 'bold', design: 'monospaced' }), kerning(1), foregroundStyle(STRIP_TEXT)]}>ONEMORE</Text>
          )}
          <Text modifiers={[font({ family: DISPLAY, size: 22 }), lineLimit(1), minimumScaleFactor(0.6), foregroundStyle(RED)]}>{props.line}</Text>
          <Spacer />
        </HStack>
      </VStack>
    )
  }

  // 01 SMALL – COUNT: iOS 16 has no widget buttons, so show the count and the LAST line only.
  if (!props.interactive) {
    return (
      <VStack alignment="leading" spacing={0} modifiers={[padding({ horizontal: 14, vertical: 12 }), ...frameModifiers]}>
        <Text modifiers={[font({ size: 9, weight: 'black', design: 'monospaced' }), kerning(2), foregroundStyle(INK)]}>TODAY</Text>
        <Text
          modifiers={[
            font({ family: DISPLAY, size: 120 }),
            minimumScaleFactor(0.4),
            lineLimit(1),
            layoutPriority(1),
            foregroundStyle(INK),
          ]}>
          {String(props.todayCount)}
        </Text>
        <Spacer />
        <HStack spacing={4}>
          <Text modifiers={[font({ size: 9, weight: 'black', design: 'monospaced' }), kerning(1.5), foregroundStyle(RED)]}>LAST</Text>
          {lastDate ? (
            <Text
              date={lastDate}
              dateStyle="relative"
              modifiers={[font({ size: 11, weight: 'bold', design: 'monospaced' }), lineLimit(1), minimumScaleFactor(0.6), foregroundStyle(INK)]}
            />
          ) : (
            <Text modifiers={[font({ size: 11, weight: 'bold', design: 'monospaced' }), foregroundStyle(INK)]}>NONE</Text>
          )}
        </HStack>
      </VStack>
    )
  }

  // 02 SMALL – ONE TAP (light) and 07 SMALL – DARK: label left, count right, red circle button below.
  return (
    <VStack spacing={0} modifiers={[padding({ top: 12, bottom: 12, horizontal: 16 }), ...frameModifiers]}>
      <HStack alignment="center">
        <Text modifiers={[font({ size: 9, weight: 'bold', design: 'monospaced' }), kerning(1), foregroundStyle(INK)]}>TODAY</Text>
        <Spacer />
        <Text modifiers={[font({ family: DISPLAY, size: 32 }), lineLimit(1), foregroundStyle(INK)]}>{String(props.todayCount)}</Text>
      </HStack>
      <Spacer />
      {renderButton(88)}
      <Spacer />
    </VStack>
  )
}

export default createWidget<WidgetProps>('OneMoreWidget', OneMoreWidget)
