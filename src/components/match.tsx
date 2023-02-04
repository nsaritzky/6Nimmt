import { LobbyAPI } from "boardgame.io"
import { Button } from "flowbite-react"
import { Dispatch, useEffect, useState } from "react"
import { Action, PlayerData, start, WEEK_IN_MILLISECONDS } from "../lobby-reducer"
import { join, leave, updateMatches } from "../lobby-reducer"
import { Client } from "boardgame.io/react"

interface Props {
  match: LobbyAPI.Match
  playerUID: string
  player: PlayerData | undefined
  playerName: string
  dispatch: Dispatch<Action>
  className?: string
}

const Match = ({ match, player, playerName, dispatch, className = "" }: Props) => {
  const disabled = playerName == ""
  const onClick = async () => {
    try {
      if (player) {
        /* await leave(match.matchID, player, dispatch) */
        start(match.matchID, player, dispatch)
      } else {
        await join(match.matchID, playerName, dispatch)
      }
      updateMatches(dispatch, Date.now() - WEEK_IN_MILLISECONDS)
    } catch (error) {
      console.log(error)
    }
  }

  const takenSpots = Object.values(match.players).filter((p) => p.name).length
  const totalSpots = Object.values(match.players).length
  return (
    <>
      <div
        className={
          "flex justify-between p-2 m-2 w-full items-center border" + className
        }
      >
        <span>{`${takenSpots} / ${totalSpots}`}</span>
        <div className="pl-2">
          <Button
            size="xs"
            outline={true}
            disabled={disabled}
            color={player ? "success" : undefined}
            type="button"
            name="join"
            value="Join"
            onClick={onClick}
          >
            {player ? "Enter" : "Join"}
          </Button>
        </div>
      </div>
    </>
  )
}

export default Match
