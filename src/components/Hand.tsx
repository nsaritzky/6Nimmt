import { SetStateAction, useState } from "react"
import { SixNimmt } from "../Game"
import { Card } from "../Board"
import type { GameState, card } from "../types"

interface CardButtonProps {
  card: card
  onClick: () => void
  key: number
  selected: boolean
}

interface HandProps {
  G: GameState
  playerID: string
  selectedCard: number | null
  onClick: (n: number) => void
  active: boolean
}

const CardButton = ({ card, onClick, key, selected }: CardButtonProps) => {
  return (
    <button
      className={`animate-in fade-in my-1 mx-1 min-w-max rounded ${
        selected ? "bg-blue-500" : "bg-blue-300"
      }`}
      onClick={onClick}
      key={key}
    >
      <Card card={card} />
    </button>
  )
}

const Hand = ({ G, playerID, selectedCard, onClick }: HandProps) => {
  return (
    <div className="flex flex-wrap justify-start">
      {G.players[playerID!].hand.map((card, i) =>
        CardButton({
          card,
          onClick: () => onClick(i),
          key: i,
          selected: i === selectedCard,
        })
      )}
    </div>
  )
}

export default Hand
