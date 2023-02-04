import { Client, Lobby } from "boardgame.io/react"
import { LobbyClient } from "boardgame.io/client"
import GameLobby from "./components/game-lobby"
import UserNameForm from "./components/username-form"
import { Dispatch, useCallback, useEffect, useReducer, useRef, useState } from "react"
import { LobbyAPI } from "boardgame.io"
import { Button } from "flowbite-react"
import useInterval from "./use-interval"
import usePersistantReducer from "./use-persistant-reducer"
import deepEqual from "fast-deep-equal"
import NewGame from "./components/new-game"
import Match from "./components/match"
import { v4 as uuid } from "uuid"
import { ChevronLeft } from "lucide-react"
import { serverHostname as server, STORAGE_KEY } from "./config"
import { BoardProps, GameState } from "./types"

const HOUR_IN_MILLISECONDS = 3600000
export const WEEK_IN_MILLISECONDS = HOUR_IN_MILLISECONDS * 168

export interface PlayerData {
  playerID: string
  credentials: string
}

type LocalData = Record<string, PlayerData>

export type Action =
  | { type: "setUsername"; name: string }
  | {
      type: "join"
      matchID: string
      playerData: { playerID: string; credentials: string }
    }
  | { type: "leave"; matchID: string }
  | { type: "updateMatches"; matches: LobbyAPI.Match[] }
  | { type: "start"; runningMatch: RunningMatch }
  | { type: "stop" }
  | { type: "clearStaleMatches" }

interface RunningMatch {
  matchID: string
  playerData: PlayerData
}

interface State {
  matchList: LobbyAPI.Match[]
  playerData: LocalData
  playerName: string
  playerUID: string
  runningMatch?: RunningMatch
  runningMatchAPI?: LobbyAPI.Match
}

const isFull = (match: LobbyAPI.Match) =>
  match.players.filter((p) => !p.name).length == 0

const client = new LobbyClient({ server })

export const updateMatches = async (
  dispatch: Dispatch<Action>,
  updatedAfter?: number
) => {
  const { matches } = await client.listMatches("6Nimmt!", { updatedAfter })
  return dispatch({ type: "updateMatches", matches })
}
/*
 * export const updateMatch = async (
 *   match: LobbyAPI.Match,
 *   dispatch: Dispatch<Action>
 * ) => {
 *   const updatedMatch = await client.getMatch("6Nimmt!", match.matchID)
 *   dispatch({ type: "updateMatch", match: updatedMatch })
 *   return updatedMatch
 * } */

export const create = async (numPlayers: number, dispatch: Dispatch<Action>) => {
  await client.createMatch("6Nimmt!", { numPlayers })
  await updateMatches(dispatch, Date.now() - WEEK_IN_MILLISECONDS)
}

export const join = async (
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
  matchID: string,
  playerData: PlayerData,
  dispatch: Dispatch<Action>
) => {
  await client.leaveMatch("6Nimmt!", matchID, playerData)
  await updateMatches(dispatch, Date.now() - WEEK_IN_MILLISECONDS)
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
  return dispatch({ type: "stop" })
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "setUsername":
      return { ...state, playerName: action.name }
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
    /* case "updateMatch":
     *   try {
     *     if (
     *       !deepEqual(
     *         state.matchList.find((m) => m.matchID === action.match.matchID),
     *         action.match
     *       )
     *     ) {
     *       return {
     *         ...state,
     *         matchList: state.matchList.map((m) =>
     *           m.matchID === action.match.matchID ? action.match : m
     *         ),
     *       }
     *     } else {
     *       return state
     *     }
     *   } catch (error) {
     *     console.log(error)
     *     return state
     *   } */

    case "clearStaleMatches":
      return {
        ...state,
        matchList: state.matchList.filter(
          (m) => !isFull(m) && Date.now() - m.updatedAt > HOUR_IN_MILLISECONDS * 24
        ),
      }
    default:
      const _exhaustivenessCheck: never = action
  }
  return state
}

const BespokeLobby = ({
  SixNimmtClient,
}: {
  SixNimmtClient: ReturnType<typeof Client<GameState, BoardProps<GameState>>>
}) => {
  const [state, dispatch] = usePersistantReducer(
    reducer,
    {
      matchList: [],
      playerData: {},
      playerName: "",
      playerUID: uuid(),
    },
    STORAGE_KEY
  )
  const [currentMatch, setCurrentMatch] = useState<LobbyAPI.Match>()

  /* const Board = client({
   *   game: SixNimmt,
   *   board: SixNimmtBoard,
   *   multiplayer: SocketIO({ server }),
   * }) */

  useInterval(
    async () => await updateMatches(dispatch, Date.now() - WEEK_IN_MILLISECONDS),
    state.runningMatch ? null : 2000
  )

  useEffect(() => {
    ;(async () => {
      if (state.runningMatch) {
        await client.updatePlayer("6Nimmt", state.runningMatch.matchID, {
          credentials: state.runningMatch.playerData.credentials,
          playerID: state.runningMatch.playerData.playerID,
          newName: state.playerName,
        })
      }
    })()
  }, [state.playerName])

  useEffect(() => {
    setCurrentMatch(
      state.matchList.find((m) => m.matchID == state.runningMatch?.matchID)
    )
  }, [state.runningMatch])

  let currentMatchFull: boolean = currentMatch
    ? Object.values(currentMatch.players).filter((p) => !p.name).length == 0
    : false

  const lobby = (
    <div className="flex justify-center">
      <div className="mt-4 ">
        <UserNameForm userName={state.playerName} dispatch={dispatch} />
        <NewGame dispatch={dispatch} />
        <div className="flex flex-col items-center">
          {state.matchList.map((m) => (
            <Match
              key={m.matchID}
              match={m}
              playerUID={state.playerUID}
              player={state.playerData[m.matchID]}
              playerName={state.playerName}
              dispatch={dispatch}
            />
          ))}
        </div>
      </div>
    </div>
  )

  const playing = (
    <div>
      {state.runningMatch && (
        <>
          <SixNimmtClient
            matchID={state.runningMatch.matchID}
            playerID={state.runningMatch.playerData.playerID}
            credentials={state.runningMatch.playerData.credentials}
            leaveMatch={() =>
              leave(
                state.runningMatch!.matchID,
                state.runningMatch!.playerData,
                dispatch
              )
            }
            stop={() => stop(dispatch)}
          />
          <div className="m-4"></div>
        </>
      )}
    </div>
  )

  const gameLobby = currentMatch ? (
    <GameLobby
      match={currentMatch!}
      player={state.playerData[currentMatch!.matchID]}
      dispatch={dispatch}
    />
  ) : (
    <></>
  )

  return currentMatch ? (currentMatchFull ? playing : gameLobby) : lobby
}

export default BespokeLobby
