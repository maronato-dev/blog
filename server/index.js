/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-useless-escape */

const path = require("path")
const express = require("express")
const compression = require("compression")

const port = 3000
const app = express()

const distFolder = path.resolve(__dirname, "../dist")

// Prerender crawler requests
app.use(
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("prerender-node")
    .set("host", `blog.${process.env.DOMAIN}`)
    .set("prerenderServiceUrl", `${process.env.PRERENDER_URL}`)
    // eslint-disable-next-line prettier/prettier
    .blacklisted([".*.js", ".*.html", ".*.css", ".*.svg", ".*.ico"])
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
