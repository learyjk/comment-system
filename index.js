require("dotenv").config();
const express = require("express");
var bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const port = 3000;
const port2 = 3001;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(morgan("tiny"));

var Airtable = require("airtable");
Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_API_KEY,
});
var base = Airtable.base(process.env.AIRTABLE_BASE_ID);

const getRecords = async () => {
  const records = await base("Comments").select().firstPage();
  return records;
};

const getRecordsByPostId = async (pageId) => {
  try {
    const records = await base("Comments")
      .select({
        filterByFormula: `post_id="${pageId}"`,
        view: "Grid view",
      })
      .firstPage();
    return records;
  } catch (error) {
    console.log("getRecordsByPostId error", error);
    return error;
  }
};

app.get("/", (req, res) => {
  console.log("get request to /");
  res.send("Hello There");
});

app.get("/comments", async (req, res) => {
  console.log("req.query", req.query);
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  });
  try {
    const records = await getRecordsByPostId(req.query.pageId);
    let newRecords = records.map((record) => {
      return { ...record._rawJson };
    });
    res.json(newRecords);
  } catch (error) {
    console.log("GET /comments error", error);
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.listen(port2, () => {
  console.log(`Example app listening on port ${port2}`);
});
