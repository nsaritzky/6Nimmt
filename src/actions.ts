import type { LobbyClient } from "boardgame.io/client"
import { Dispatch } from "react"
import { Action, PlayerData } from "./lobby-reducer"
import { GameState } from "./types"

export const create = async (client: LobbyClient, numPlayers: number) => {
  await client.createMatch("6Nimmt!", { numPlayers })
}

export const join = async (
  client: LobbyClient,
  matchID: string,
  playerName: string,
  dispatch: Dispatch<Action>
) => {
  const { playerID, playerCredentials: credentials } = await client.joinMatch(
    "6Nimmt!",
    matchID,
    { playerName /* playerID: playerUID */ }
  )
  return dispatch({
    type: "join",
    matchID,
    playerData: { playerID, credentials },
  })
}

export const leave = async (
  client: LobbyClient,
  matchID: string,
  playerData: PlayerData,
  dispatch: Dispatch<Action>
) => {
  await client.leaveMatch("6Nimmt!", matchID, playerData)
  return dispatch({ type: "leave", matchID })
}

export const updateMatches = async (
  client: LobbyClient,
  dispatch: Dispatch<Action>
) => {
  const { matches } = await client.listMatches("6Nimmt!")

  return dispatch({ type: "updateMatches", matches })
}
