/// <reference path="./index.d.ts" />
import 'react-testing-library/cleanup-after-each'
import * as React from 'react'
import { Model, Provider, connect } from '../src'
import { Counter, Theme } from './'
import { render, fireEvent } from 'react-testing-library'
import { timeout } from '../src/helper'

const Button = connect(
  'Counter',
  (props: any) => ({ counter: props })
)(
  connect(
    'Theme',
    (props: any) => ({ theme: props })
  )(
    class extends React.Component<any> {
      render() {
        const { state, actions } = this.props
        return (
          <button
            onClick={() => {
              actions.increment(3).catch((e: any) => console.error(e))
              actions.changeTheme()
            }}
          >
            {state.counter.count}
            {state.theme.theme}
          </button>
        )
      }
    }
  )
)

describe('class component', () => {
  test('multi connect', async () => {
    Model({ Counter, Theme })
    const { container } = render(
      <Provider>
        <Button />
      </Provider>
    )
    const button: any = container.firstChild
    expect(button!.textContent).toBe('0dark')
    fireEvent.click(button)
    await timeout(100, {}) // Wait Consumer rerender
    expect(button!.textContent).toBe('3light')
  })
})
