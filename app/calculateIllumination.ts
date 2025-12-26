const synodicMonth = 29.53059;

export function calculateIllumination(date: Date) {
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14));

  const daysSince =
    (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);

  const age = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth;

  const phase = age / synodicMonth;

  const illumination = ((1 - Math.cos(2 * Math.PI * phase)) / 2) * 100;
  return Math.round(illumination);
}
