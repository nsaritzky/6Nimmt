import { LobbyAPI } from "boardgame.io"
import useInterval from "../use-interval"
import { Action, PlayerData, leave, stop } from "../lobby-reducer"
import { Dispatch, useState } from "react"
import { Button } from "flowbite-react"

interface Props {
  match: LobbyAPI.Match
  player: PlayerData

  dispatch: Dispatch<Action>
}

const GameLobby = ({ match, player, dispatch }: Props) => {
  const totalSpots = Object.values(match.players).length
  const takenSpots = Object.values(match.players).filter((p) => p.name).length

  return (
    <div className="flex justify-center">
      <div>{match.players.map((p) => p.name && <div key={p.id}>{p.name}</div>)}</div>
      <div className="m-4">
        <Button
          color="failure"
          onClick={() => {
            leave(match.matchID, player, dispatch)
            stop(dispatch)
          }}
        >
          Leave
        </Button>
      </div>
    </div>
  )
}

export default GameLobby
