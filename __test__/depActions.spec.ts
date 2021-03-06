/// <reference path="./index.d.ts" />
import { testHook } from 'react-hooks-testing-library'
import { Model } from '../src'
import { Counter } from '.'

describe('', () => {
  test('communicator', async () => {
    let stateFirst: any, stateSecond: any
    let actionsFirst: any, actionsSecond: any
    const { useStore, getActions } = Model({ Counter })
    const actions = getActions('Counter')
    testHook(() => {
      ;[stateFirst, actionsFirst] = useStore('Counter', ['add'])
    })
    testHook(() => {
      ;[stateSecond, actionsSecond] = useStore('Counter')
    })
    expect(stateFirst.count).toBe(0)
    expect(stateSecond.count).toBe(0)
    await actionsFirst.increment(3)
    expect(stateFirst.count).toBe(3)
    expect(stateSecond.count).toBe(3)
    await actionsSecond.increment(4)
    expect(stateFirst.count).toBe(3)
    expect(stateSecond.count).toBe(7)
    await actions.increment(4)
    expect(stateFirst.count).toBe(3)
    expect(stateSecond.count).toBe(11)
  })
})
