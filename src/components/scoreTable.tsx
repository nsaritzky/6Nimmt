import { SixNimmt } from "../Game"
import type { PlayerState, GameState, PlayerID } from "../types"

interface ScoreTableProps {
  playerScores: Record<PlayerID, number>
}

const ScoreTable = ({ playerScores }: ScoreTableProps) => {
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
            <tr key={id} className="w-full bg-gray-100 py-2">
              <td className="pr-4">Player {id}</td>
              <td>{score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ScoreTable
