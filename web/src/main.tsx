import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { routes } from "@app/routes"
import "@app/index.css"

const router = createBrowserRouter(routes)

ReactDOM.createRoot(document.getElementById("root") as HTMLDivElement)
.render(
  <RouterProvider router={router} />
)


