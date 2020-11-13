import Axios from "axios"

export default ({ req }) => {
  if (typeof window === "undefined") {
    // on the server
    return Axios.create({
      baseURL: "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers,
    })
  } else {
    // in the browser
    return Axios.create({ baseURL: "/" })
  }
}
