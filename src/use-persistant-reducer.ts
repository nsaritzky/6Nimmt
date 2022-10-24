import { useReducer, useEffect, useRef, Dispatch } from "react"
import deepEqual from "fast-deep-equal/es6"

const usePersistantReducer = <State, Action>(
  reducer: (state: State, action: Action) => State,
  initialState: State,
  storageKey: string
): [State, Dispatch<Action>] => {
  const init = () => {
    const stateString = localStorage.getItem(storageKey)
    if (stateString) {
      try {
        return JSON.parse(stateString)
      } catch (error) {
        return initialState
      }
    } else {
      return initialState
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState, init)

  const stateRef = useRef<State>()
  useEffect(() => {
    if (!deepEqual(stateRef.current, state)) {
      localStorage.setItem(storageKey, JSON.stringify(state))
    }
    stateRef.current = state
  }, [state])

  return [state, dispatch]
}

export default usePersistantReducer
