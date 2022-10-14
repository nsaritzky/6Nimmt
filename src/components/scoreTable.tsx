import { SixNimmt } from "../Game"
import type { PlayerState, GameState } from "../types"

const ScoreTable = ({ G }: { G: GameState }) => {
  console.log(G.players)
  return (
    <div className="w-32">
      <table className="w-full text-lg ">
        <tr className="w-full bg-gray-200 font-bold">
          <th colSpan={2}>Score</th>
        </tr>
        {Object.entries(G.players).map(([id, p]) => (
          <tr className="w-full bg-gray-100 py-2">
            <td className="pr-4">Player {id}</td>
            <td>{p.score}</td>
          </tr>
        ))}
      </table>
    </div>
  )
}

export default ScoreTable
