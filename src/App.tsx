import './App.css'
import { SocketContextProvider } from './socket/SocketContext'

function App() {
  return (
    <SocketContextProvider>
      <div className="app">
        <h1>Chat App</h1>
        <p>Ready for UI development!</p>
      </div>
    </SocketContextProvider>
  )
}

export default App
