import { Local, SocketIO } from "boardgame.io/multiplayer"
import { Client } from "boardgame.io/react"
import { SixNimmt } from "./Game"
import SixNimmtBoard from "./Board"
import BespokeLobby from "./lobby-reducer"

const SixNimmtClient = Client({
  game: SixNimmt,
  board: SixNimmtBoard,
  multiplayer: SocketIO({ server: "sixnimmt.fly.dev:8080" }),
  debug: false,
  /* enhancer:
   *   window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), */
})

const App = () => (
  <div>
    {/* <h1 className="font-serif">Player 0</h1>
    <SixNimmtClient playerID="0" />
    <h1>Player 1</h1>
    <SixNimmtClient playerID="1" /> */}
    <BespokeLobby SixNimmtClient={SixNimmtClient} />
  </div>
)

export default App
