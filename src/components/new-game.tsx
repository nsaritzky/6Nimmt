import { Dispatch, useState } from "react"
import { create, updateMatches } from "../lobby-reducer"
import type { Action } from "../lobby-reducer"

interface NewGameProps {
  dispatch: Dispatch<Action>
}

const NewGame = ({ dispatch }: NewGameProps) => {
  const [numPlayers, setNumPlayers] = useState(2)

  const handleSubmit = (e: any) => {
    e.preventDefault()
    create(numPlayers)
    updateMatches(dispatch)
  }

  const handleChange = (e: any) => setNumPlayers(parseInt(e.target.value))

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        name="numPlayers"
        value={numPlayers}
        min="2"
        max="10"
        onChange={handleChange}
      />
      <input type="submit" value="Submit" />
    </form>
  )
}

export default NewGame
