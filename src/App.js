import copy from "copy-to-clipboard"
import logo from "./logo.svg"
import "./App.css"
import { useEffect, useState, waiting } from "react"
import produce from "immer"

function useLoadURL(url) {
  const [state, setState] = useState({
    loaded: false,
    loadingURL: undefined,
  })
  useEffect(() => {
    let run = async () => {
      setState((state) =>
        produce(state, (state) => {
          state.loadingURL = url
        })
      )
      let response = await fetch(url)
      let responseBody = await response.json()
      setState((state) =>
        produce(state, (state) => {
          state.result = responseBody
        })
      )
      return responseBody
    }
    run()
  }, [url])
  return [state.loaded, state.result]
}

function Modal({ children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "0px",
        bottom: "0px",
        backgroundColor: "rgba(255,255,255,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          padding: "20px",
          borderRadius: "4px",
          backgroundColor: "white",
          border: "1px solid black",
          position: "relative",
        }}
      >
        <div onClick={onClose} style={{ position: "absolute", top: "5px", right: "5px" }}>
          X
        </div>
        {children}
      </div>
    </div>
  )
}

function App() {
  const [state, setState] = useState({
    query: "",
  })
  let displayURL = state.query
    ? `https://api.giphy.com/v1/gifs/search?api_key=5Muqe6HOngq40S9xI6ZQJ7jDfvZUoS5f&q=${state.query}`
    : "https://api.giphy.com/v1/gifs/trending?api_key=5Muqe6HOngq40S9xI6ZQJ7jDfvZUoS5f"
  let [loaded, result] = useLoadURL(displayURL)
  if (!result) return "loading"
  let data = result.data

  let filteredData = data // getFilteredData()

  let gifListElements = filteredData.map((element) => {
    let downsizedImage = element.images.downsized

    return (
      <img
        onClick={() => {
          setState((state) =>
            produce(state, (state) => {
              state.focused = element
            })
          )
        }}
        className="giflist-element"
        src={downsizedImage.url}
      />
    )
  })

  let gifListView = <div className="giflist">{gifListElements}</div>

  let getFocusedView = () => {
    if (!state.focused) return null
    debugger
    let downsizedImage = state.focused.images.downsized

    return (
      <Modal
        onClose={() => {
          setState((state) =>
            produce(state, (state) => {
              state.focused = undefined
            })
          )
        }}
      >
        <p style={{ textAlign: "center" }}>{state.focused.title}</p>
        <img
          style={{
            margin: "5px",
            border: "none",
            height: `${downsizedImage.height}px`,
          }}
          src={downsizedImage.url}
        />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <table border="1" style={{ borderCollapse: "collapse" }}>
            <tr>
              <td>rating</td>
              <td>{state.focused.rating}</td>
            </tr>
            {state.focused.username && (
              <tr>
                <td>username</td>
                <td>{state.focused.username}</td>
              </tr>
            )}
          </table>
        </div>
        <button
          onClick={() => {
            copy(state.focused.url)
          }}
        >
          copy
        </button>
      </Modal>
    )
  }

  let focusedView = getFocusedView()

  let searchBox = (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <span style={{ marginRight: "10px" }}>Search</span>
      <input
        value={state.query}
        onChange={(evt) => {
          let q = evt.target.value
          setState((state) =>
            produce(state, (state) => {
              state.query = q
            })
          )
        }}
        type="text"
      />
    </div>
  )

  return (
    <>
      {focusedView}
      {searchBox}
      {gifListView}
    </>
  )
}

export default App
