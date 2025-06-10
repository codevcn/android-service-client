import axios from "axios"
import { useEffect, useState } from "react"

type TApiResponse = {
  content: string
}

const FAQ = () => {
  const [data, setData] = useState<TApiResponse>()

  const pingToServer = () => {
    axios
      .get("http://localhost:8080/api/ping", { withCredentials: true })
      .then((res) => {
        console.log(">>> res data", res.data)
        setData(res.data)
      })
      .catch((err) => {
        console.log(">>> err", err)
      })
  }

  useEffect(() => {
    pingToServer()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">FAQ</h1>
      {data ? <p>{data.content}</p> : <p>Loading...</p>}
    </div>
  )
}

export default FAQ
