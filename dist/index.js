'use strict';

const queue = Symbol('actions');
const { Map, List, fromJS, Iterable } = require('immutable');

module.exports.call = (action, funk) => {
  action[queue] = (action[queue] || []).concat([fromJS(funk)]);
};

// function from reducer to another reducer
// the new reducer adds a 'funks' key with declarative effects
// of type [func, [args]]
// returns an Immutable object
module.exports.coalesceFunks = reducer => (state, action) => {
  const nextState = reducer(state, action);
  const funks = action[queue] || List
  // restore action to the way it was
  ();delete action[queue];
  const map = Iterable.isIterable(nextState) ? nextState : new Map(nextState);
  const existingFunks = map.get('funks'
  // setting funks if
  // 1. no existing funks
  // 2. sizes of existing funks is different from the funks
  // 3. funks are different and also the sizes of existingFunks and funks are different
  //    example: existingFunks could already be List(), if the newly created funks
  //             is also List()
  // funks sizes are different from existing and
  // does
  );if (!existingFunks || funks.size !== existingFunks.size || funks !== existingFunks && funks.size !== existingFunks.size) {
    return map.set('funks', funks);
  }
  return map;
};

// listen for store updates, and run each funk.
// `runFunksImmutable` assumes that each funk either returns nothing
// or returns a promise for an action.
// `runFunksImmutable` dispatches the actions
// You can replace `runFunksImmutable` with your own implementation
// if you prefer callbacks over promises, for example
module.exports.runFunks = store => {
  store.subscribe(() => {
    const funks = store.getState().get('funks') || List();
    funks.forEach(function (funk) {
      const func = funk.get(0);
      const args = funk.get(1).toArray();
      const maybePromiseForAction = func.apply(null, args);
      if (!maybePromiseForAction || !maybePromiseForAction.then) {
        return;
      }
      maybePromiseForAction.then(store.dispatch);
    });
  });
};
