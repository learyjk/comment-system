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

const addComment = async (comment) => {
  await base("Comments").create(
    {
      post_id: comment.pageId,
      name: comment.name,
      body: comment.comment,
    },

    function (err, records) {
      if (err) {
        console.error(err);
        return;
      }
      // records.forEach(function (record) {
      //   console.log(record.getId());
      // });
    }
  );
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

app.post("/webhooks/addComment", async (req, res) => {
  console.log("req.body", req.body);
  console.log("POST request sent to /webhooks/addComment");
  try {
    await addComment(req.body.data);
    res.status(201).send();
  } catch (error) {
    console.log("error adding comment", error);
    res.status(500).send();
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.listen(port2, () => {
  console.log(`Example app listening on port ${port2}`);
});
