const { withPodfile } = require('@expo/config-plugins')

// Several pods' own resource-bundle subtargets (RNSVG, Sentry, SDWebImage, ...) ship a much
// older IPHONEOS_DEPLOYMENT_TARGET than the app itself and don't inherit the main target's
// setting — recent Xcode versions refuse to build anything below their minimum supported
// target, so this forces a floor across every pod target on every `expo prebuild`.
const PATCH = `
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        deployment_target = config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if deployment_target && deployment_target.to_f < 16.0
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.0'
        end
      end
    end
`

const withPodDeploymentTargetFix = (config) =>
  withPodfile(config, (config) => {
    const { contents } = config.modResults
    if (contents.includes('IPHONEOS_DEPLOYMENT_TARGET')) {
      return config
    }
    const postInstallEnd = /(post_install do \|installer\|[\s\S]*?)\n(\s*)end\n/
    const match = contents.match(postInstallEnd)
    if (!match) {
      console.warn('[withPodDeploymentTargetFix] Could not find post_install block in Podfile — skipping patch.')
      return config
    }
    config.modResults.contents = contents.replace(postInstallEnd, `$1${PATCH}$2end\n`)
    return config
  })

module.exports = withPodDeploymentTargetFix
