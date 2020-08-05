/* eslint-disable no-useless-escape */
import path from "path"
import express from "express"
import compression from "compression"
import morgan from "morgan"
import * as rfs from "rotating-file-stream"

const port = 3000
const app = express()

const distFolder = path.resolve(__dirname, "../dist")
const logsFolder = path.resolve(__dirname, "./logs")

const accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  maxFiles: 20,
  maxSize: "30M",
  path: logsFolder,
})
app.use(
  morgan(
    // eslint-disable-next-line quotes
    ':remote-addr - [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms',
    { stream: accessLogStream }
  )
)
app.use(morgan("tiny"))

// Prerender crawler requests
app.use(
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("prerender-node")
    .set("host", `blog.${process.env.DOMAIN}`)
    .set("prerenderServiceUrl", `${process.env.PRERENDER_URL}`)
    // eslint-disable-next-line prettier/prettier
    .blacklisted([".*\.js", ".*\.html", ".*\.css", ".*\.svg", ".*\.ico"])
)

// Production static server
app.use(compression())

app.use(
  express.static(distFolder, {
    maxAge: 31536000000,
  })
)

app.get("*", (_req, res) => {
  res.sendFile(path.resolve(distFolder, "./index.html"))
})

app.listen(port)
console.log("Server started on port " + port)
