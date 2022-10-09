require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;

var Airtable = require("airtable");
Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_API_KEY,
});
var base = Airtable.base(process.env.AIRTABLE_BASE_ID);

const getRecords = async () => {
  const records = await base("Comments").select().firstPage();
  return recrods;
};

const getRecordsByPostId = async (postId) => {
  const records = await base("Comments")
    .select({ filterByFormula: `post_id=${postId}`, view: "Grid view" })
    .firstPage();
  return records;
};

app.get("/", (req, res) => {
  console.log("get request to /");
  res.send("Hello There");
});

app.get("/comments", async (req, res) => {
  const records = await getRecordsByPostId(2);
  console.log("records", records);
  console.log(Array.isArray(records));
  records.forEach((record) => {
    console.log(record);
  });
  let newRecords = records.map((record) => {
    return { ...record._rawJson };
  });
  res.send(newRecords);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
