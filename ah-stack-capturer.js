const asyncHooksRx = /\(async_hooks.js/

function no() { return false }

function captureStack() {
  var stack = {}
  Error.captureStackTrace(stack, captureStack)
  return stack.stack
}

class StackCapturer {
  /**
   * Creates StackCapturere instance.
   * Either `shouldCapture` OR `events` with optional `types` need to be supplied.
   *
   * @constructor
   * @params {Object} $0 configures when a stack should be captured
   *
   * @params {Set.<string>=} $0.events defines on which async hooks events
   * (init|before|after|destroy) a stack should be captured
   * @params {Set.<string>=} $0.types defines for which async hook types a
   * stack should be captured
   *
   * @params {function=} $0.shouldCapture `function ((event, type, activity)`
   * if supplied overrides the `shouldCapture` method entirely
   */
  constructor({
      events = null
    , types = null
    , shouldCapture = null
  }) {
    if (shouldCapture != null && typeof shouldCapture !== 'function') {
      throw new Error('shouldCapture needs to be of type function')
    }

    if (shouldCapture != null) {
      if (events != null || types != null) {
        throw new Error('Only provide either events and types OR shouldCapture function')
      }
    } else if (events == null || !(events instanceof Set)) {
      throw new Error('Need to supply shouldCapture of type function or events of type Set')
    }

    if (types != null && !(types instanceof Set)) {
      throw new Error('types need to be of type Set')
    }

    this._events = events
    this._types = types
    this._shouldCapture = shouldCapture
  }

  /**
   * Returns `true|false` indicating if a stack should be captured according to the
   * options passed in the @constructor.
   *
   * @name stackCapturer.shouldCaptureStack
   * @function
   * @param {String} event the async hook event (init|before|after|destroy)
   * @param {String} type the type of async resource that triggered the event
   * @return {Boolean} `true` or `false` indicating if a stack should be captured
   */
  shouldCaptureStack(event, type, activity) {
    // support entirely overriding the shouldCaptureStack function
    if (this._shouldCapture != null) return this._shouldCapture(event, type, activity)
    // if it wasn't supplied use events and types to determine if we should
    // capture the stack
    if (!this._events.has(event)) return false
    if (this._types != null && !this._types.has(type)) return false
    return true
  }

  /**
   * Captures the current stack.
   *
   * @name stackCapturer.captureStack
   * @function
   * @return {String} the current stack
   */
  captureStack() {
    return captureStack()
  }

  /**
   * Processes the supplied stack by splitting the string into lines
   * and removing those that are part of the async hook execution itself.
   *
   * This allows the user to focus only on the relevant stack.
   *
   * @name stackCapturer.processStack
   * @function
   * @param {String} stack the captured stack
   * @return {Array.<String>} the processed stack
   */
  processStack(stack) {
    // was it already processed?
    if (Array.isArray(stack)) return stack
    // remove first line (Error) and then find last mention of async_hooks
    // return all lines after that
    const lines = stack.split('\n').slice(1).map(x => x.trim())
    const len = lines.length
    let i = 0
    // find first occurence
    while (!asyncHooksRx.test(lines[i]) && i < len) i++
    // We blew past everything and didn't seem to find any async hooks
    // related part of the stack. Therefore let's include all of it.
    if (i === len) return lines

    // read past last occurence
    while (asyncHooksRx.test(lines[i]) && i < len) i++

    // We found async_hooks, but nothing that happened before.
    // Therefore let's just return nothing
    if (i === len) return []

    // don't convert back to string in case the consumer wants
    // to do more with the stack lines
    return lines.slice(i)
  }

  /**
   * Creates a StackCapturer that captures ALL events for the supplied types.
   *
   * @name StackCapturer.forAllEvents
   * @function
   * @param {Set.<String>=} types types passed to the StackCapturer constructor
   */
  static forAllEvents(types = null) {
    return new StackCapturer({
        events: new Set([ 'init', 'before', 'after', 'destroy' ])
      , types
    })
  }

  /**
   * Creates a StackCapturer that captures nothing.
   *
   * @name StackCapturer.turnedOff
   * @function
   */
  static turnedOff() {
    return new StackCapturer({ shouldCapture: no })
  }
}

module.exports = StackCapturer
