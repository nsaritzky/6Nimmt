import { Lobby } from "boardgame.io/react"
import { LobbyClient } from "boardgame.io/client"
import { SixNimmt } from "./Game"
import SixNimmtBoard from "./Board"
import { useCallback, useEffect, useRef, useState } from "react"
import { LobbyAPI } from "boardgame.io"
import { Button } from "flowbite-react"
import useInterval from "./use-interval"

interface PlayerData {
  playerID: string
  credentials: string
}

type LocalData = Record<string, PlayerData>

const server = "http://localhost:8000"
const client = new LobbyClient({ server })

const newMatch = async (n: number) =>
  await client.createMatch("6Nimmt!", { numPlayers: n })

const SixNimmtLobby = () => (
  <Lobby
    gameServer={`http://$:8008`}
    lobbyServer={`http://${window.location.hostname}:8008`}
    gameComponents={[{ game: SixNimmt, board: SixNimmtBoard }]}
  />
)

export const BespokeLobby = () => {
  const [matchList, setMatchList] = useState([] as LobbyAPI.Match[])
  const [numPlayers, setNumPlayers] = useState(2)
  const [playerData, setPlayerData] = useState({} as LocalData)

  useEffect(() => {
    setPlayerData(JSON.parse(localStorage.getItem("playerData") || ""))
  }, [])

  useEffect(() => {
    localStorage.setItem("playerData", JSON.stringify(playerData))
  }, [playerData])

  useInterval(async () => {
    try {
      const { matches } = await client.listMatches("6Nimmt!")
      if (JSON.stringify(matches) != JSON.stringify(matchList)) {
        setMatchList(matches)
      }
    } catch (error) {
      console.log(error)
    }
  }, 2000)

  const onSubmit = (e: any) => {
    e.preventDefault()
    const id = newMatch(numPlayers)
  }

  const NewGame = () => (
    <form onSubmit={onSubmit}>
      <input
        type="number"
        name="numPlayers"
        min="2"
        max="10"
        value={numPlayers}
        onChange={(e) => setNumPlayers(parseInt(e.target.value))}
      />
      <input type="submit" value="Submit" />
    </form>
  )

  const updateMatches = useCallback(async () => {
    const { matches } = await client.listMatches("6Nimmt!")
    setMatchList(matches)
  }, [])

  const Match = ({ m }: { m: LobbyAPI.Match }) => {
    const [joined, setJoined] = useState(!!playerData[m.matchID])

    const onMatchClick = async (id: string) => {
      try {
        if (joined) {
          await client.leaveMatch("6Nimmt!", m.matchID, playerData[m.matchID])
        } else {
          const { playerID, playerCredentials: credentials } = await client.joinMatch(
            "6Nimmt!",
            id,
            {
              playerID: "0",
              playerName: "Nathan",
            }
          )
          setPlayerData((pd) =>
            Object.assign({}, pd, { [id]: { playerID, credentials } })
          )

          await updateMatches()
        }
      } catch (error) {
        console.log(error)
      }
      updateMatches()
    }

    useEffect(() => {
      setJoined(!!playerData[m.matchID])
    }, [playerData[m.matchID]])

    const takenSpots = Object.values(m.players).filter((p) => p.name).length
    const totalSpots = Object.values(m.players).length
    return (
      <>
        <div className="flex justify-between p-2 m-2 w-48 items-center border">
          <span>{`${takenSpots} / ${totalSpots} Players`}</span>
          <div className="pl-2">
            <Button
              size="xs"
              outline={true}
              color={joined ? "failure" : undefined}
              type="button"
              name="join"
              value="Join"
              onClick={async () => await onMatchClick(m.matchID)}
            >
              {joined ? "Leave" : "Join"}
            </Button>
          </div>
        </div>
      </>
    )
  }

  const Matches = ({ matches }: { matches: LobbyAPI.Match[] }) => {
    return (
      <div>
        {matches.map((m) => (
          <Match m={m} key={m.matchID} />
        ))}
      </div>
    )
  }

  return (
    <>
      <NewGame />
      <Matches matches={matchList} />
    </>
  )
}

export default SixNimmtLobby
