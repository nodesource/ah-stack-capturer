const StackCapturer = require('../')
const test = require('tape')

test('\nstack capturer for all events', function(t) {
  const all = StackCapturer.forAllEvents()
  t.ok(all.shouldCaptureStack('init'), 'captures init')
  t.ok(all.shouldCaptureStack('before'), 'captures before')
  t.ok(all.shouldCaptureStack('after'), 'captures after')
  t.ok(all.shouldCaptureStack('destroy'), 'captures destroy')
  t.ok(!all.shouldCaptureStack('non-event'), 'does not capture non-event')
  t.end()
})

test('\nstack capturer with custom function', function(t) {
  const custom = new StackCapturer({ shouldCapture: (event, type) => event === type })
  t.ok(custom.shouldCaptureStack('hello', 'hello'), 'captures when condition met')
  t.ok(!custom.shouldCaptureStack('hello', 'world'), 'does not capture when condition is not met')
  t.end()
})

test('\ninit only', function(t) {
  const initOnly = new StackCapturer({ events: new Set([ 'init' ]) })
  t.ok(initOnly.shouldCaptureStack('init', 'some type'), 'captures init event')
  t.ok(!initOnly.shouldCaptureStack('before', 'some type'), 'does not capture before event')
  t.end()
})

test('\nbefore for foo type only', function(t) {
  const sc = new StackCapturer({ events: new Set([ 'before' ]), types: new Set([ 'foo' ]) })
  t.ok(sc.shouldCaptureStack('before', 'foo'), 'captures when event and type match')
  t.ok(!sc.shouldCaptureStack('before', 'bar'), 'does not capture when type mismatches')
  t.ok(!sc.shouldCaptureStack('init', 'foo'), 'does not capture when event mismatches')
  t.end()
})

test('\nargument validation', function(t) {
  function shouldCapture() { }
  t.throws(() => new StackCapturer({ events: [] }), 'invalid event type')
  t.throws(() => new StackCapturer({ types: [] }), 'invalid types type')
  t.throws(() => new StackCapturer({ shouldCapture: '' }), 'invalid shouldCapture type')
  t.throws(() => new StackCapturer({ events: new Set(), shouldCapture }), 'supplying both events and shouldCapture')
  t.throws(() => new StackCapturer({ types: new Set(), shouldCapture }), 'supplying both types and shouldCapture')
  t.end()
})

test('\ncaptureStack', function(t) {
  const capturer = StackCapturer.forAllEvents()
  const stack = capturer.captureStack()
  t.ok(typeof stack, 'string', 'captures stack')
  t.end()
})

test('\nprocess stack', function(t) {
  const stack =
    'Error\n' +
    '    at StackCapturer.captureStack (/Volumes/d/dev/js/projects/async-hooks/ah-stack-capturer/ah-stack-capturer.js:76:12)\n' +
    '    at ActivityCollector._init (/Volumes/d/dev/js/projects/async-hooks/ah-collector/ah-collector.js:134:48)\n' +
    '    at runInitCallback (async_hooks.js:460:5)\n' +
    '    at emitInitS (async_hooks.js:328:7)\n' +
    '    at new Timeout (timers.js:513:5)\n' +
    '    at createSingleTimeout (timers.js:396:15)\n' +
    '    at exports.setTimeout (timers.js:388:10)\n' +
    '    at Test.<anonymous> (/Volumes/d/dev/js/projects/async-hooks/ah-collector/test/timeout.onefire.capture-stack.js:19:3)\n' +
    '    at Test.bound [as _cb] (/Volumes/d/dev/js/projects/async-hooks/ah-collector/node_modules/tape/lib/test.js:66:32)\n' +
    '    at Test.run (/Volumes/d/dev/js/projects/async-hooks/ah-collector/node_modules/tape/lib/test.js:85:10)'

  const capturer = StackCapturer.forAllEvents()
  const processed = capturer.processStack(stack)
  t.ok(Array.isArray(processed), 'returns processed lines')
  t.ok(processed.length > 0, 'returns more than 0 processed lines')
  t.deepEqual(processed
    , [ 'at new Timeout (timers.js:513:5)',
        'at createSingleTimeout (timers.js:396:15)',
        'at exports.setTimeout (timers.js:388:10)',
        'at Test.<anonymous> (/Volumes/d/dev/js/projects/async-hooks/ah-collector/test/timeout.onefire.capture-stack.js:19:3)',
        'at Test.bound [as _cb] (/Volumes/d/dev/js/projects/async-hooks/ah-collector/node_modules/tape/lib/test.js:66:32)',
        'at Test.run (/Volumes/d/dev/js/projects/async-hooks/ah-collector/node_modules/tape/lib/test.js:85:10)' ]
    , 'removes all frames up to including last async_hooks related trace'
  )
  const processedAgain = capturer.processStack(processed)
  t.deepEqual(processedAgain, processed, 'processing again returns processed unchanged')
  t.end()
})
