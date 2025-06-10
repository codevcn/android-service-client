import { createContext } from "react"

export const EventSourceContext = createContext<React.MutableRefObject<EventSource | null>>({
  current: null,
})
