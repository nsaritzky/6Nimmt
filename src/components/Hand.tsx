import { SetStateAction, useState } from "react"
import { SixNimmt } from "../Game"
import { Card } from "../Board"
import type { GameState, card } from "../types"

interface CardButtonProps {
  card: card
  onClick: () => void
  key: number
  selected: boolean
  active: boolean
}

interface HandProps {
  G: GameState
  playerID: string
  selectedCard: number | null
  onClick: (n: number) => void
  active: boolean
}

const CardButton = ({ card, onClick, key, selected, active }: CardButtonProps) => {
  return (
    <button
      className={`animate-in fade-in my-1 mx-1 min-w-max rounded ${
        active
          ? selected
            ? "bg-blue-500"
            : "hover:bg-blue-400 bg-blue-300"
          : "bg-blue-300"
      }`}
      onClick={onClick}
      key={key}
    >
      <Card card={card} />
    </button>
  )
}

const Hand = ({ G, playerID, selectedCard, onClick, active }: HandProps) => {
  const sortedHand = G.players[playerID!].hand.sort((a, b) => a.val - b.val)

  return (
    <div className="flex flex-wrap justify-start m-4">
      {sortedHand.map((card, i) =>
        CardButton({
          card,
          onClick: () => onClick(i),
          key: i,
          selected: i === selectedCard,
          active,
        })
      )}
    </div>
  )
}

export default Hand
