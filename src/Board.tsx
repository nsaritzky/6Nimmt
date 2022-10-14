import type { BoardProps } from "boardgame.io/react"
import type { GameState, card } from "./types"
import ScoreTable from "./components/scoreTable"
import Hand from "./components/Hand"
/* import Button from "@mui/material/Button" */
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core"
import { Ctx } from "boardgame.io"
import { useState } from "react"
import { Transition } from "@headlessui/react"

interface SixNimmtProps extends BoardProps<GameState> {}
interface CardProps {
  card: card
  key?: number
}

interface EndTurnButtonProps {
  endTurn: () => void
  disabled: boolean
  phase: string
}

interface selectPileButtonProps {
  selectPileMove: () => void
  key: number
  disabled: boolean
}

interface HandProps {
  hand: card[]
  playCard: () => void
  active: boolean
}

interface pileProps {
  cards: card[]
  /* key: number */
}

interface pileButtonProps {
  cards: card[]
  key: number
  index: number
  disabled: boolean
  selectPileMove: () => void
}

export const Card = ({ card, key }: CardProps) => {
  return (
    <div className="card" key={key || ""}>
      <div className="text-center">{card.val}</div>
      <div className="text-center">{card.bulls}</div>
    </div>
  )
}

const EndTurnButton = ({ endTurn, disabled, phase }: EndTurnButtonProps) => {
  const onClick = () => {
    if (phase === "pileSelection") {
    }
  }
  return (
    <button
      className="btn bg-green-400 disabled:bg-green-200"
      onClick={endTurn}
      disabled={disabled}
    >
      Confirm
    </button>
  )
}

const SelectPileButton = ({ selectPileMove, disabled, key }: selectPileButtonProps) => (
  <button
    className="btn bg-slate-400 disabled:bg-slate-100"
    onClick={selectPileMove}
    key={key}
    disabled={disabled}
  >
    {key}
  </button>
)

const Pile = ({ cards }: pileProps) => {
  return (
    <div className="flex py-2 px-1 shadow group-hover:bg-slate-100">
      {cards.map((c, i) => (
        <div className="card mx-1 bg-blue-300 group-hover:bg-blue-400" key={i}>
          <Card card={c} />
        </div>
      ))}
    </div>
  )
}

const PileButton = ({ cards, selectPileMove, disabled, index }: pileButtonProps) => {
  return (
    <div>
      <button
        onClick={selectPileMove}
        disabled={disabled}
        aria-label={`pile ${index}`}
        className={"m-2 p-2" + (!disabled ? " group" : "")}
      >
        <Pile cards={cards} />
      </button>
    </div>
  )
}

const SixNimmtBoard = ({ G, ctx, events, playerID, moves }: SixNimmtProps) => {
  const [selectedCard, selectCard] = useState(null as number | null)

  const playerActive = Boolean(ctx.activePlayers && playerID! in ctx.activePlayers)

  const handActive = ctx.phase === "play" && playerActive

  const onSubmit = () => {
    if (ctx.phase === "play") {
      moves["playCard"](selectedCard, playerID)
      selectCard(null)
    }
  }

  return (
    <div className="space-y-1">
      <Hand
        G={G}
        playerID={playerID!}
        selectedCard={selectedCard}
        active={handActive}
        onClick={(n: number) => {
          if (handActive) {
            selectCard(n)
          }
        }}
      />
      {G.players[playerID!].playedCard && (
        <div aria-label="played card" className="card bg-purple-200">
          <Card card={G.players[playerID!].playedCard!} />
        </div>
      )}
      <section aria-label="piles" className="flex-1 flex-col">
        {G.piles.map((cards, key) => (
          <PileButton
            cards={cards}
            key={key}
            index={key}
            selectPileMove={() => moves.choosePileMove(key)}
            disabled={(ctx.activePlayers || {})[playerID!] != "playerSelection"}
          />
        ))}
      </section>
      <div className="flex justify-center">
        <EndTurnButton endTurn={onSubmit} disabled={!playerActive} phase={ctx.phase} />
      </div>
      <ScoreTable G={G} />
    </div>
  )
}

export default SixNimmtBoard
