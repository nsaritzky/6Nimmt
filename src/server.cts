import { Server, Origins, FlatFile } from "boardgame.io/server"
import { SixNimmt } from "./Game"

const server = Server({
  // Provide the definitions for your game(s).
  games: [SixNimmt],

  // Provide the database storage class to use.

  origins: [
    // Allow your game site to connect.
    "https://www.nsaritzky.github.io",
    // Allow localhost to connect, except when NODE_ENV is 'production'.
    Origins.LOCALHOST,
  ],
  db: new FlatFile({
    dir: "./storage.db",
    logging: false,
  }),
})

server.run(8000)
