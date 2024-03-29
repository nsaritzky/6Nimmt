import cardData from "./cards"
import type { Ctx, Game, Move, PlayerID, FnContext } from "boardgame.io"
import { GameState, card, PlayerState, Piles, PublicState } from "./types"
import { filterWithIndex } from "fp-ts/Record"
import { ActivePlayers, TurnOrder } from "boardgame.io/core"
import { pick, merge } from "./utils"
import { RandomAPI } from "boardgame.io/dist/types/src/plugins/random/random"

const GAME_END_THRESHOLD = 44

const mapValues = <T, O extends { [s: string]: T }, S>(
  obj: O,
  fn: (v: T, k: keyof O, i: number) => S
) => Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]))

const playerView = ({ G, playerID }: { G: GameState; playerID: PlayerID | null }) => {
  const { piles, players } = G
  // const isNotThisPlayer: Predicate<PlayerID> = (id, _) => id != playerID
  return {
    piles,
    players: {
      ...merge(filterWithIndex((id: PlayerID, _) => id === playerID)(players))(
        Object.fromEntries(
          Object.entries(players).map(([id, p]) => [
            id,
            pick<PlayerState, keyof PlayerState>(["score"])(p),
          ])
        )
      ),
    },
  }
}

const findByMin = <T>(Obs: T[], measure: (ob: T) => number): T => {
  const max = Math.min(...Obs.map(measure))
  return Obs.find((ob) => measure(ob) === max)!
}

// Game setup /////////////////////////////////////////////////////////////////

const sortedDeck: card[] = cardData.map((bulls, val) => ({
  val: val + 1,
  bulls,
}))

const setupRound = ({
  players,
  ctx,
  random,
}: {
  players: Record<PlayerID, PlayerState>
  ctx: Ctx
  random: RandomAPI
}) => {
  const deck = random!.Shuffle(sortedDeck)
  // The deck is full, so these shift calls will all succeed.
  const piles: Piles = [
    [deck.shift()!],
    [deck.shift()!],
    [deck.shift()!],
    [deck.shift()!],
  ]
  const refreshedPlayers: Record<PlayerID, PlayerState> = {}
  for (let i = 0; i < ctx.numPlayers; ++i) {
    refreshedPlayers[i + ""] = {
      ...players[i + ""],
      score: players[i + ""] ? players[i + ""].score : 0,
      hand: deck.splice(0, 10).sort((a, b) => a.val - b.val),
      resolved: false,
    }
  }

  return {
    players: refreshedPlayers,
    deck,
    piles,
    resolveCounter: 0,
  }
}

const setup: typeof SixNimmt.setup = ({ ctx, random }) =>
  setupRound({ players: {}, ctx, random })

// Moves //////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// Play Phase /////////////////////////////////////////////////////////////////

export const drawCards: Move<GameState> = ({ G, ctx }, n = 1) => {
  for (let i = 0; i < n; ++i) {
    const newCard = G.deck.pop()
    if (newCard) {
      G.players[ctx.currentPlayer].hand.push(newCard)
    }
  }
}

export const playCard: Move<GameState> = (
  { G, ctx },
  cardIndex: number,
  playerID: PlayerID
) => {
  const curr = G.players[playerID]
  curr.playedCard = curr.hand.splice(cardIndex, 1)[0]
  // If everyone has played, work out the resolution phase order
  if (Object.values(G.players).every((p) => p.playedCard)) {
    determineResolutionOrder(G)
  }
}

const determineResolutionOrder = (G: GameState) => {
  G.resolveOrder = Object.entries(G.players)
    .sort(
      ([_idA, playerA], [_idB, playerB]) =>
        playerA.playedCard!.val - playerB.playedCard!.val
    )
    .map(([id, _]) => id)
  return G
}

const autoSelect = ({ G, ctx, events }: FnContext<GameState>) => {
  if (!G.piles.every((p) => p.length > 0)) {
    throw Error("selectPile: One or more of the piles is empty when it shouldn't be")
  }
  const curr = G.players[ctx.currentPlayer]
  const c = curr.playedCard
  if (!c) {
    throw ReferenceError(`Player ${ctx.currentPlayer}'s' played card not found`)
  } else {
    const autoSelect = G.piles.findIndex(
      (p) =>
        c.val - p[p.length - 1].val ===
        Math.min(
          ...G.piles.map((p) => c.val - p[p.length - 1].val).filter((n) => n > 0)
        )
    )
    if (autoSelect === -1) {
      events.setActivePlayers({
        currentPlayer: "playerSelection",
        minMoves: 1,
        maxMoves: 1,
      })
    } else {
      if (G.piles[autoSelect].length >= 5) {
        G.players[ctx.currentPlayer].score += devourPileScore(G, autoSelect)
        G.piles[autoSelect] = []
      }
      G.piles[autoSelect].push(c)
      c.justPlayed = true
      delete curr.resolveOrder
      delete curr.playedCard
      events.endTurn()
    }
  }
}

const devourPileScore = (G: GameState, pileIndex: number): number =>
  G.piles[pileIndex].reduce((score, { bulls }) => score + bulls, 0)

const choosePileMove: Move<GameState> = (
  { G, ctx, playerID, events },
  pileIndex: number
) => {
  G.players[ctx.currentPlayer].score += devourPileScore(G, pileIndex)
  G.piles[pileIndex] = []
  const c = G.players[ctx.currentPlayer].playedCard!
  G.piles[pileIndex].push(c)
  c.justPlayed = true
  delete G.players[ctx.currentPlayer].resolveOrder
  delete G.players[ctx.currentPlayer].playedCard
  events.endStage()
}

const roundEnd = ({ G }: { G: GameState }) => {
  return Object.values(G.players).every(
    (p) => p.hand.length === 0 && p.playedCard === undefined
  )
}

const gameEnd = ({ G, ctx }: { G: GameState; ctx: Ctx }) => {
  if (
    roundEnd({ G }) &&
    Object.values(G.players).some((p) => p.score >= GAME_END_THRESHOLD)
  ) {
    console.log(G)
    return findByMin(Object.entries(G.players), ([_id, p]) => p.score)[0]
  }
}

export const SixNimmt: Game<GameState> = {
  name: "6Nimmt!",
  setup,
  // playerView,

  turn: {
    minMoves: 1,
    maxMoves: 1,
  },

  phases: {
    play: {
      start: true,
      turn: {
        activePlayers: ActivePlayers.ALL_ONCE,
        minMoves: 1,
      },
      moves: { playCard },
      endIf: ({ G }) => Object.values(G.players).every((p) => p.playedCard),
      onEnd: ({ G }) => {
        for (const pile of G.piles) {
          for (const card of pile) {
            card.justPlayed = false
          }
        }
      },
      next: "pileSelection",
    },
    pileSelection: {
      moves: {},
      turn: {
        onBegin: autoSelect,
        maxMoves: 1,
        order: {
          ...TurnOrder.CUSTOM_FROM("resolveOrder"),
          next: ({ ctx }) => {
            if (ctx.playOrderPos < ctx.numPlayers - 1) {
              return ctx.playOrderPos + 1
            }
          },
        },
        stages: {
          playerSelection: {
            moves: {
              choosePileMove,
            },
          },
        },
      },
      next: ({ G }) => (roundEnd({ G }) ? "reset" : "play"),
    },
    reset: {
      moves: {},
      turn: {
        maxMoves: 0,
      },
      onBegin: ({ G, ctx, events, random }) => {
        setupRound({ players: G.players, ctx, random })
        events.endPhase
      },
      next: "play",
    },
  },
  endIf: gameEnd,
}
