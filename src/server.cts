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
    "0.0.0.0",
  ],
  db: new FlatFile({
    dir: "./storage.db",
    logging: false,
  }),
})

const PORT = process.env.PORT || 8080
server.run(8080)
