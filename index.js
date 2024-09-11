const express = require("express")
const cors = require("cors")
const connectDB = require("./db.js")
const port = 3000

const app = express()
app.use(express.json())

app.use(cors())
connectDB()

app.get("/", (req, res) => {
  const items = itemModel.find()
  res.json(items)
})

app.listen(port, () => {
  console.log("app is running")
})