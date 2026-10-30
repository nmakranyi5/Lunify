// Extends app.json. The GitHub Pages deploy sets EXPO_BASE_URL so the web build
// is served from /Lunify; native builds must not set it, or asset paths gain a
// "/Lunify" prefix that collides with the iOS app executable.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
