import { Dispatch, useState } from "react"
import type { Action } from "../lobby-reducer"

interface Props {
  userName: string
  dispatch: Dispatch<Action>
}

const UsernameForm = ({ userName, dispatch }: Props) => {
  const [name, setName] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setName(e.target.value)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch({ type: "setUsername", name })
  }
  return userName == "" ? (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="username"
        type="text"
        name="username"
        value={name}
        onChange={handleChange}
      />
      <input
        type="submit"
        value="Submit"
        className="px-4 py-2 m-2 bg-blue-400 rounded"
      />
    </form>
  ) : (
    <div className="flex justify-between">
      {`Hello, ${userName} `}{" "}
      <a
        href="#"
        className="text-blue-600"
        onClick={() => dispatch({ type: "setUsername", name: "" })}
      >
        change username
      </a>
    </div>
  )
}

export default UsernameForm
