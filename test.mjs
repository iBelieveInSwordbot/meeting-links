// Extract and unit-test the platform detection & deep-link conversion logic.
import fs from 'node:fs';
const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

// Extract the PLATFORMS object + detect/normalize helpers by evaluating the
// inner script in a minimal shim.
const scriptMatch = html.match(/<script>\s*\(function \(\) \{([\s\S]*?)\}\)\(\);\s*<\/script>/);
if (!scriptMatch) { console.error('script not found'); process.exit(1); }

// Build a sandbox that captures the internals we want to test.
const shim = `
  const document = {
    getElementById: () => ({
      addEventListener: () => {},
      textContent: '{"meetings":[]}',
      innerHTML: '', appendChild: () => {}, value: '', className: '', focus: () => {}
    }),
    addEventListener: () => {},
    activeElement: null
  };
  const window = { location: {} };
  ${scriptMatch[1]}
  return { PLATFORMS, detectPlatform, normalizeUrl };
`;
const factory = new Function(shim);
const { PLATFORMS, detectPlatform, normalizeUrl } = factory();

const cases = [
  // [input, expected platform, expected deep-link prefix or exact]
  ['https://zoom.us/j/1234567890?pwd=abc',           'zoom',  'zoommtg://zoom.us/join?action=join&confno=1234567890&pwd=abc'],
  ['https://company.zoom.us/j/9876543?pwd=xyz',       'zoom',  'zoommtg://company.zoom.us/join?action=join&confno=9876543&pwd=xyz'],
  ['https://zoom.us/wc/join/5551234?pwd=q',           'zoom',  'zoommtg://zoom.us/join?action=join&confno=5551234&pwd=q'],
  ['zoommtg://zoom.us/join?action=join&confno=1',     'zoom',  'zoommtg://zoom.us/join?action=join&confno=1'],
  ['https://example.webex.com/meet/room',             'webex', 'https://example.webex.com/meet/room'],
  ['webex://something',                                'webex', 'webex://something'],
  ['https://meet.google.com/abc-defg-hij',            'meet',  'https://meet.google.com/abc-defg-hij'],
  ['https://teams.microsoft.com/l/meetup-join/foo',   'teams', 'msteams:/l/meetup-join/foo'],
  ['msteams:/l/meetup-join/foo',                       'teams', 'msteams:/l/meetup-join/foo'],
  ['<https://zoom.us/j/1234?pwd=x>',                  'zoom',  'zoommtg://zoom.us/join?action=join&confno=1234&pwd=x', 'normalize'],
  ['https://example.com/notameeting',                 null,    null],
  ['',                                                 null,    null]
];

let pass = 0, fail = 0;
for (const [input, expectedPlatform, expectedLink, mode] of cases) {
  const url = mode === 'normalize' ? normalizeUrl(input) : input;
  const p = detectPlatform(url);
  const link = p ? PLATFORMS[p].toDeepLink(url) : null;
  const ok = (p === expectedPlatform) && (link === expectedLink);
  if (ok) { pass++; console.log('✓', input, '→', p, link); }
  else    { fail++; console.log('✗', input, '\n    got:      ', p, link, '\n    expected: ', expectedPlatform, expectedLink); }
}
console.log(`\n${pass}/${pass+fail} passed`);
process.exit(fail ? 1 : 0);
