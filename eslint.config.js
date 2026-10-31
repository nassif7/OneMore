// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // TODO(sdk57): eslint-config-expo 57 enables the React Compiler rules as errors. These
    // sites would need behavioural refactors, so they are downgraded until reviewed.
    rules: {
      // index.tsx:36 (loadNudgeData), QuickTagSheet:12, TimePickerSheet:27 (reset on `visible`)
      "react-hooks/set-state-in-effect": "warn",
      // NudgeBox:16 and :18 (Math.random in useMemo, Date.now in render)
      "react-hooks/purity": "warn",
      // stats.tsx:24 (module-level `savedView` persisted across mounts)
      "react-hooks/globals": "warn",
    },
  }
]);
