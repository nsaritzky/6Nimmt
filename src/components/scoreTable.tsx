import { FilteredMetadata } from "boardgame.io"
import { SixNimmt } from "../Game"
import type { PlayerState, GameState, PlayerID } from "../types"

interface Props {
  playerScores: Record<PlayerID, number>
  matchData: FilteredMetadata | undefined
  playerID: string | number
}

const ScoreTable = ({ playerScores, matchData, playerID }: Props) => {
  const displayName = (id: PlayerID) =>
    matchData
      ? matchData.find((p) => p.id == parseInt(id))?.name
      : `Player ${parseInt(id) + 1}`

  return (
    <div className="w-32">
      <table className="w-full text-lg ">
        <thead>
          <tr className="w-full bg-gray-200 font-bold">
            <th colSpan={2}>Score</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(playerScores).map(([id, score]) => (
            <tr
              key={id}
              className={`w-full py-2 ${
                id === playerID ? "bg-blue-200" : "bg-gray-100"
              }`}
            >
              <td className="pr-4">{displayName(id)}</td>
              <td>{score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ScoreTable
