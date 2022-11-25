import { Dispatch, useState } from "react"
import { create, updateMatches } from "../lobby-reducer"
import type { Action } from "../lobby-reducer"

interface NewGameProps {
  dispatch: Dispatch<Action>
}

const NewGame = ({ dispatch }: NewGameProps) => {
  const [numPlayers, setNumPlayers] = useState<number>()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (numPlayers) {
      create(numPlayers, dispatch)
    }
    updateMatches(dispatch)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setNumPlayers(parseInt(e.target.value))

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Number of Players"
        type="number"
        name="numPlayers"
        value={numPlayers || undefined}
        min="2"
        max="10"
        onChange={handleChange}
        className="w-48"
      />
      <input
        type="submit"
        value="New Game"
        className="px-4 py-2 m-2 bg-blue-400 rounded"
      />
    </form>
  )
}

export default NewGame
