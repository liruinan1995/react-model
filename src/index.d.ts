type Setter = {
  classSetter: ClassSetter
  functionSetter: FunctionSetter
}

type FunctionSetter = {
  [modelName: string]: {
    [actionName: string]: {
      setState: React.Dispatch<any>
      depActions?: string[]
    }
  }
}

interface Global {
  Actions: {
    [modelName: string]: {
      [actionName: string]: Action
    }
  }
  State: {
    [modelName: string]: any
  }
  AsyncState: {
    [modelName: string]: undefined | ((context?: any) => Promise<Partial<any>>)
  }
  subscriptions: Subscriptions
  Setter: Setter
  devTools: any
  withDevTools: boolean
  uid: number
}

type ClassSetter = React.Dispatch<any> | undefined

// Very Sad, Promise<ProduceFunc<S>> can not work with Partial<S> | ProduceFunc<S>
type Action<S = {}, P = any, ActionKeys = {}> = (
  state: S,
  actions: getConsumerActionsType<Actions<S, ActionKeys>>,
  params: P,
  middlewareConfig?: Object
) =>
  | Partial<S>
  | Promise<Partial<S>>
  | ProduceFunc<S>
  | Promise<ProduceFunc<S>>
  | void
  | Promise<void>

type ProduceFunc<S> = (state: S) => void

type Actions<S = {}, ActionKeys = {}> = {
  [P in keyof ActionKeys]: Action<S, ActionKeys[P], ActionKeys>
}

type Dispatch<A> = (value: A) => void
type SetStateAction<S> = S | ((prevState: S) => S)

interface ModelContext {
  modelName: string
}

interface BaseContext<S = {}> {
  action: Action
  consumerActions: (
    actions: Actions,
    modelContext: ModelContext
  ) => getConsumerActionsType<Actions>
  params: Object
  middlewareConfig?: Object
  actionName: string
  modelName: string
  next?: Function
  newState: Global['State'] | Function | null
  Global: Global
}

interface InnerContext<S = {}> extends BaseContext<S> {
  // Actions with function type context will always invoke current component's reload.
  type?: 'function' | 'outer' | 'class'
  setState?: Dispatch<SetStateAction<S>>
}

type Context<S = {}> = (InnerContext<S>) & {
  next: Function
}

type Middleware<S = {}> = (C: Context<S>, M: Middleware<S>[]) => void

interface Models {
  [name: string]: ModelType
}

type ModelType<InitStateType = any, ActionKeys = any> = {
  actions: {
    [P in keyof ActionKeys]: Action<InitStateType, ActionKeys[P], ActionKeys>
  }
  state: InitStateType
  asyncState?: (context?: any) => Promise<Partial<InitStateType>>
}

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any
  ? A
  : never

type getConsumerActionsType<A extends Actions<any, any>> = {
  [P in keyof A]: ArgumentTypes<A[P]>[2] extends undefined
    ? (
        params?: ArgumentTypes<A[P]>[2],
        middlewareConfig?: ArgumentTypes<A[P]>[3]
      ) => ReturnType<A[P]>
    : (
        params: ArgumentTypes<A[P]>[2],
        middlewareConfig?: ArgumentTypes<A[P]>[3]
      ) => ReturnType<A[P]>
}

type Get<Object, K extends keyof Object> = Object[K]

type ModelsProps<M extends Models> = {
  useStore: <K extends keyof M>(
    name: K,
    models?: M
  ) => [Get<M[K], 'state'>, getConsumerActionsType<Get<M[K], 'actions'>>]
  getState: <K extends keyof M>(modelName: K) => Readonly<Get<M[K], 'state'>>
}

type Subscriptions = {
  [key: string]: Function[]
}
