[![Build Status](https://travis-ci.org/srikanthkyatham/redux-funk-immutable.svg?branch=master)](https://travis-ci.org/srikanthkyatham/redux-funk-immutable)
# redux-funk-immutable —Declarative async outerware for Redux immutable

![redux-funk](https://s-media-cache-ak0.pinimg.com/564x/4c/c3/d8/4cc3d881adf9cf78637f00ebc92eab6e.jpg)

> *image from [Etsy](https://www.etsy.com/listing/259474265/monkey-chinese-zodiac-year-of-the-monkey?ref=related-5)*


# What

This library enables you to declaratively specify effects in Redux reducers. You can use it to express in reducers not just what should happen, but also, what should happen *next*, while keeping reducers pure.

Using redux-funk, you can put all the logic and state management stuff in one place—the reducer—so you don't have to dig through multiple files to find out what happens when the UI dispatches a certain action.

This library combines (in my opinion) the best ideas from Redux Loop, redux-side-effect, and a few other libraries. It's pretty similar to Redux Loop, but the implementation is much simpler and shorter, and it enables you to program with reducers without having to worry about lifting effects.

# Install

`npm install redux-funk-immutable`

# Usage

Add declarative effects to your reducer. In this example, dispatching `{type: 'INCREMENT_ASYNC'}` increments the counter after one second.

```js
// reducer.js
import { combineReducers } from 'redux-immutable'
import { call, coalesceFunks } from 'redux-funk-immutable'

// exporting for testing
// returns promise for an action
export const incrementAsync = () => new Promise(resolve => {
  setTimeout(() => resolve({type: 'INCREMENT'}), 1000)
})

// converting the immutable parameters to JS objects
export const changeToAsync = (value) => new Promise(resolve => {
  setTimeout(() => resolve({type: 'CHANGE_TO', value.toJS()}), 1000)
})

const counter = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'INCREMENT_ASYNC':
      // the funk `[incrementAsync, []]`
      // is a declarative effect
      // that says "call incrementAsync with no arguments"
      call(action, [incrementAsync, []])
      return state
    case 'CHANGE_TO_ASYNC':
      // demonstrating passing object to call api
      // parameters passed to value get converted to immutable objects
      const value = { value: 1 };
      call(action, [incrementAsync, [value]])
      return state
    case 'CHANGE_TO':
      return action.value
    default:
      return state
  }
}

// coalesceFunks collects any funks you've called
// and adds them to `state.funks`
// note the `funks` reducer below which initializes that part of the state
const rootReducer = coalesceFunks(combineReducers({
  counter,
  funks: () => []
}))

export default rootReducer
```

> Advantages of adding funks to the state are that you have the option to inspect them, test them, or add your own logic for handling them.

To run these funks whenever the state changes, you can use `runFunks`:

```js
// store.js

import { runFunks } from 'redux-funk-immutable'
import { createStore } from 'redux'
import reducer from './reducers'
import { Map } from 'immutable'

const initialState = Map()

const store = createStore(
  reducer,
  initialState
)

runFunks(store)
```

Here's what `runFunks` does:
- Subscribe to the store. When the store updates, call each of the funks. Each funk with a return value returns a promise for an action.
- When the promises resolve, dispatch the actions.

> You can use `redux-funk-immutable` without `runFunks`. Here are examples of why you might want to do this:
- Use callbacks instead of promises
- Only dispatch the actions after a delay
- Pass an api caller or other dependency to each funk
- etc.

# Examples

See [redux-funk-examples](https://github.com/mheiber/redux-funk-examples).

### orginally forked from redux-funk https://github.com/mheiber/redux-funk
