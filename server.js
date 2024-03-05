const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
dotenv.config({ path: ".env" });
const server = http.createServer(app);
const io = socketIo(server);

let total_amount = 0;
let total_contribution = 0;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
// Enable CORS for all routes and origins
app.use(cors());

// Serve your HTML files
app.get("/index", (req, res) => {
  res.sendFile(__dirname, 'public', 'index.html');
});

app.get("/admin", (req, res) => {
  res.sendFile(__dirname, 'public', 'admin.html');
});

app.get("/*", (_, res) => {
  return res.status(200).json({error: "invalid route"});
})

app.post("/admin", (req, res) => {
  const amount = parseFloat(req.body.amount);
  if (!isNaN(amount)) {
    handleDonation({ amount });
  }
  res.redirect("/admin");
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("request_initial_data", () => {
    io.emit("update", { total_amount, total_contribution });
  });

  socket.on("donation", (message) => {
    handleDonation(message);
  });
});

function handleDonation(message) {
  const amount = parseFloat(message.amount);
  const contribution = calculateContribution(amount);

  total_amount += amount;
  total_contribution += contribution;

  io.emit("update", { total_amount, total_contribution });
}

function calculateContribution(amount) {
  return (amount * 2) / 1500;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// If you need to restrict to specific origins, you can configure it like so:
app.use(
  cors({
    origin: "",
  })
);
