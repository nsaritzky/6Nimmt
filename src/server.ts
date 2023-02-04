import { Server, Origins, FlatFile } from "boardgame.io/server"
import { SixNimmt } from "./Game"

const server = Server({
  // Provide the definitions for your game(s).
  games: [SixNimmt],

  // Provide the database storage class to use.

  origins: [
    // Allow your game site to connect.
    "https://nsaritzky.github.io",
    // Allow localhost to connect, except when NODE_ENV is 'production'.
    Origins.LOCALHOST_IN_DEVELOPMENT,
  ],
  db: new FlatFile({
    dir: "./storage.db",
    logging: true,
  }),
})

export {}
const PORT = process.env.PORT || 8000

server.run(typeof PORT === "string" ? parseInt(PORT) : PORT)
