import produce from 'immer'
import { createContext } from 'react'
import Global from './global'
import { applyMiddlewares, actionMiddlewares } from './middlewares'

const initialProviderState: Global['State'] = {}
const GlobalContext = createContext(initialProviderState)
const Consumer = GlobalContext.Consumer

// console.group polyfill
if (!console.group) {
  const groups: any[] = []
  const hr = '-'.repeat(80) // 80 dashes row line
  console.group = function logGroupStart(label: any) {
    groups.push(label)
    console.log('%c \nBEGIN GROUP: %c', hr, label)
    console.groupEnd = function logGroupEnd() {
      console.log('END GROUP: %c\n%c', groups.pop(), hr)
    }
  }
}

const consumerAction = (
  action: Action,
  modelContext: { modelName: string }
) => async (params: any, middlewareConfig?: any) => {
  const context: InnerContext = {
    type: 'outer',
    modelName: modelContext.modelName,
    actionName: action.name,
    newState: null,
    params,
    middlewareConfig,
    consumerActions,
    action
  }
  await applyMiddlewares(actionMiddlewares, context)
}

const consumerActions = (
  actions: Actions,
  modelContext: { modelName: string }
) => {
  let ret: any = {}
  Object.entries<Action>(actions).forEach(([key, action]) => {
    ret[key] = consumerAction(action, modelContext)
  })
  return ret
}

const setPartialState = (
  name: keyof typeof Global['State'],
  partialState: typeof Global['State'] | Function
) => {
  if (typeof partialState === 'function') {
    let state = Global.State[name]
    state = produce(state, partialState)
    Global.State = produce(Global.State, s => {
      s[name] = state
    })
  } else {
    Global.State = produce(Global.State, s => {
      s[name] = {
        ...s[name],
        ...partialState
      }
    })
  }
  return Global.State
}

const timeout = <T>(ms: number, data: T): Promise<T> =>
  new Promise(resolve =>
    setTimeout(() => {
      console.log(ms)
      resolve(data)
    }, ms)
  )

const getInitialState = async <T extends any>(context?: T) => {
  await Promise.all(
    Object.keys(Global.State).map(async modelName => {
      if (
        !context ||
        !context.modelName ||
        modelName === context.modelName ||
        context.modelName.indexOf(modelName) !== -1
      ) {
        const asyncGetter = Global.AsyncState[modelName]
        const asyncState = asyncGetter ? await asyncGetter(context) : {}
        Global.State[modelName] = {
          ...Global.State[modelName],
          ...asyncState
        }
      }
    })
  )
  return Global.State
}

const getCache = (modelName: string, actionName: string) => {
  const JSONString = localStorage.getItem(
    `__REACT_MODELX__${modelName}_${actionName}`
  )
  return JSONString ? JSON.parse(JSONString) : null
}

export {
  Consumer,
  consumerActions,
  GlobalContext,
  setPartialState,
  timeout,
  getCache,
  getInitialState
}
