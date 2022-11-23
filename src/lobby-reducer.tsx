import { Client, Lobby } from "boardgame.io/react"
import { LobbyClient } from "boardgame.io/client"
import { SixNimmt } from "./Game"
import SixNimmtBoard from "./Board"
import { Dispatch, useCallback, useEffect, useReducer, useRef, useState } from "react"
import { LobbyAPI } from "boardgame.io"
import { Button } from "flowbite-react"
import useInterval from "./use-interval"
import usePersistantReducer from "./use-persistant-reducer"
import { tryCatchK } from "fp-ts/TaskEither"
import deepEqual from "fast-deep-equal"
import { isTypeOnlyImportOrExportDeclaration } from "typescript"
import NewGame from "./components/new-game"
import Match from "./components/match"
import { v4 as uuid } from "uuid"
import { GameState } from "./types"
import { SocketIO } from "boardgame.io/multiplayer"
import { ChevronLeft } from "lucide-react"
import { serverHostname as server, STORAGE_KEY } from "./config"

const playerName = "Nathan"

export interface PlayerData {
  playerID: string
  credentials: string
}

type LocalData = Record<string, PlayerData>

export type Action =
  | {
      type: "join"
      matchID: string
      playerData: { playerID: string; credentials: string }
    }
  | { type: "leave"; matchID: string }
  | { type: "updateMatches"; matches: LobbyAPI.Match[] }
  | { type: "start"; runningMatch: RunningMatch }
  | { type: "stop" }

interface RunningMatch {
  matchID: string
  playerData: PlayerData
}

interface State {
  matchList: LobbyAPI.Match[]
  playerData: LocalData
  playerUID: string
  runningMatch?: RunningMatch
}

const client = new LobbyClient({ server: server })

export const create = async (numPlayers: number) => {
  await client.createMatch("6Nimmt!", { numPlayers })
}

export const join = async (matchID: string, dispatch: Dispatch<Action>) => {
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
  matchID: string,
  playerData: PlayerData,
  dispatch: Dispatch<Action>
) => {
  await client.leaveMatch("6Nimmt!", matchID, playerData)
  return dispatch({ type: "leave", matchID })
}

export const start = (
  matchID: string,
  playerData: PlayerData,
  dispatch: Dispatch<Action>
) => {
  return dispatch({
    type: "start",
    runningMatch: {
      matchID,
      playerData,
    },
  })
}

export const stop = (dispatch: Dispatch<Action>) => {
  console.log("Leaving match?")
  return dispatch({ type: "stop" })
}

export const updateMatches = async (dispatch: Dispatch<Action>) => {
  const { matches } = await client.listMatches("6Nimmt!")

  return dispatch({ type: "updateMatches", matches })
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "join":
      try {
        return {
          ...state,
          playerData: { ...state.playerData, [action.matchID]: action.playerData },
        }
      } catch (error) {
        console.log(error)
        return state
      }
    case "leave":
      try {
        const { [action.matchID]: _, ...rest } = state.playerData
        return { ...state, playerData: rest }
      } catch (error) {
        console.log(error)
        return state
      }
    case "start":
      return { ...state, runningMatch: action.runningMatch }
    case "stop":
      const { runningMatch, ...newState } = state
      return newState
    case "updateMatches":
      try {
        if (!deepEqual(state.matchList, action.matches)) {
          return { ...state, matchList: action.matches }
        } else {
          return state
        }
      } catch (error) {
        console.log(error)
        return state
      }
    default:
      const _exhaustivenessCheck: never = action
  }
  return state
}

const BespokeLobby = ({
  SixNimmtClient,
}: {
  SixNimmtClient: ReturnType<typeof Client>
}) => {
  const [state, dispatch] = usePersistantReducer(
    reducer,
    { matchList: [], playerData: {}, playerUID: uuid() },
    STORAGE_KEY
  )

  /* const Board = client({
   *   game: SixNimmt,
   *   board: SixNimmtBoard,
   *   multiplayer: SocketIO({ server }),
   * }) */

  useInterval(
    async () => await updateMatches(dispatch),
    state.runningMatch ? null : 2000
  )

  const lobby = (
    <div className="flex justify-center">
      <div className="mt-4">
        <NewGame dispatch={dispatch} />
        <div className="flex flex-col items-center">
          {state.matchList.map((m) => (
            <Match
              key={m.matchID}
              match={m}
              playerUID={state.playerUID}
              player={state.playerData[m.matchID]}
              dispatch={dispatch}
            />
          ))}
        </div>
      </div>
    </div>
  )

  const playing = (
    <div>
      <button className="ml-4 mt-4" onClick={() => stop(dispatch)}>
        <div className="flex">
          <ChevronLeft />
          Back to Lobby
        </div>
      </button>
      {state.runningMatch && (
        <>
          <SixNimmtClient
            matchID={state.runningMatch.matchID}
            playerID={state.runningMatch.playerData.playerID}
            credentials={state.runningMatch.playerData.credentials}
          />
          <div className="m-4">
            <Button
              color="failure"
              onClick={() => {
                leave(
                  state.runningMatch!.matchID,
                  state.runningMatch!.playerData,
                  dispatch
                )
                stop(dispatch)
              }}
            >
              Leave
            </Button>
          </div>
        </>
      )}
    </div>
  )

  return state.runningMatch ? playing : lobby
}

export default BespokeLobby
