# ah-stack-capturer [![build status](https://secure.travis-ci.org/thlorenz/ah-stack-capturer.png)](http://travis-ci.org/thlorenz/ah-stack-capturer)

Captures async hook stack traces for specific resource types and events.

```js
const capturer = StackCapturer.forAllEvents()
capturer.shouldCapture('init') // => true
const stack = capturer.captureStack()
const processed = capturer.processStack()
```

## Installation

    npm install ah-stack-capturer

## API

### `new StackCapturer`

Creates StackCapturere instance.
Either `shouldCapture` OR `events` with optional `types` need to be supplied.

#### arguments

- `{Object} opts`  configures when a stack should be captured
- `{Set.<string>=} opts.events` defines on which async hooks events (init|before|after|destroy) a stack should be captured
- `{Set.<string>=} opts.types` defines for which async hook types a stack should be captured
- `{function=} opts.shouldCapture` if supplied overrides the `shouldCapture` method entirely

### `stackCapturer.shouldCaptureStack`

Returns `true|false` indicating if a stack should be captured according to the
options passed in the @constructor.

#### arguments

- `{String} event` the async hook event (init|before|after|destroy)
- `{String} type` the type of async resource that triggered the event
- `@return {Boolean}` `true` or `false` indicating if a stack should be captured

### `stackCapturer.captureStack`

Captures the current stack.

#### arguments

- `@return {String}` the current stack

### `stackCapturer.processStack`

Processes the supplied stack by splitting the string into lines
and removing those that are part of the async hook execution itself.

This allows the user to focus only on the relevant stack.

#### arguments

- `{String} stack` the captured stack
- `@return {Array.<String>}` the processed stack

### `StackCapturer.forAllEvents`

Creates a StackCapturer that captures ALL events for the supplied types.

#### arguments

- `{Set.<String>=} types` types passed to the StackCapturer constructor

### `StackCapturer.turnedOff`

Creates a StackCapturer that captures nothing.

## License

MIT
