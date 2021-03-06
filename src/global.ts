let State = {}
let Actions = {}
let AsyncState = {}
// Communicate between Provider-Consumer and Hooks
let Setter: Setter = {
  // classSetter stores the setState from Provider, invoke the classSetter.setState can update the state of Global Provider.
  classSetter: undefined,
  // functionSetter stores the setState returned by useStore. These setStates can invoke the rerender of hooks components.
  functionSetter: {}
}

let subscriptions = {}

let devTools: any
let withDevTools = false

let uid = Math.random() // The unique id of hooks

export default {
  Actions,
  AsyncState,
  Setter,
  State,
  devTools,
  withDevTools,
  uid,
  subscriptions
} as Global
