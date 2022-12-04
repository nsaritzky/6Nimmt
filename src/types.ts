import type { Ctx } from "boardgame.io"
import type { NonEmptyArray } from "fp-ts/NonEmptyArray"
import type { BoardProps as bgioBoardProps } from "boardgame.io/react"
import type { Dispatch } from "react"

export type bulls = 1 | 2 | 3 | 4 | 5
export type card = { val: number; bulls: bulls; justPlayed?: boolean }
export type PlayerState = {
  hand: card[]
  score: number
  playedCard?: card
  resolveOrder?: number
  selectedPile?: number
  resolved: boolean
}
export type PlayerID = string
export type Piles = [card[], card[], card[], card[]]

// export interface PublicState {
//     piles: Piles
//     players: Record<PlayerID, PlayerState>
// }

export interface GameState {
  deck: card[]
  players: Record<PlayerID, PlayerState>
  piles: Piles
  resolveOrder?: PlayerID[]
  resolveCounter: number
}

export interface BoardProps<G = GameState> extends bgioBoardProps<G> {
  leaveMatch: () => void
  stop: () => void
}

export type GameContext = { G: GameState; ctx: Ctx }

export type PublicState = Pick<GameState, "piles" | "players">
