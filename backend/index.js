import fetch from "node-fetch";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Moralis from "moralis";
const app = express();
const port = 5001;
dotenv.config();
// https://dexswapinch.onrender.com
app.use(cors());
app.use(express.json());

app.get("/tokenPrice", async (req, res) => {
  const { query } = req;

  let amount = parseFloat(query.tokenOneAmount);
  let am = amount * Math.pow(10, query.addressOne.decimals);

  try {
    fetch(
      `https://api-dzap.1inch.io/v5.2/137/quote?src=${
        query.addressOne.address
      }&dst=${query.addressTwo.address}&amount=${am.toString()}`
    )
      .then((response) => response.json())
      .then((response) => {
        return res.status(200).json(response);
      });
  } catch (e) {
    console.log(`Something went wrong ${e}`);
    return res.status(400).json();
  }
});

app.get("/swapTokenData", (req, res) => {
  const { query } = req;

  let amount = parseFloat(query.tokenOneAmount);
  let am = amount * Math.pow(10, query.addressOne.decimals);

  try {
    const response = fetch(
      `https://api-dzap.1inch.io/v5.2/137/swap?src=${
        query.addressOne.address
      }&dst=${query.addressTwo.address}&amount=${am.toString()}&from=${
        query.address
      }&slippage=${query.slippage}&disableEstimate=true&compatibility=true`
    )
      .then((response) => response.json())
      .then((response) => {
        return res.status(200).json(response);
      });
  } catch (e) {
    console.log(`Something went wrong ${e}`);
    return res.status(400).json();
  }
});

app.get("/check", (req, res) => {
  const { query } = req;
  try {
    const response = fetch(
      `https://api-dzap.1inch.io/v5.2/137/approve/allowance?tokenAddress=${query.addressOne.address}&walletAddress=${query.address}`
    )
      .then((response) => response.json())
      .then((response) => {
        // console.log(response);
        return res.status(200).json(response);
      });
  } catch (e) {
    console.log(`Something went wrong ${e}`);
    return res.status(400).json();
  }
});

app.get("/getApproval", (req, res) => {
  const { query } = req;
  // console.log(query);

  try {
    const response = fetch(
      `https://api-dzap.1inch.io/v5.2/137/approve/transaction?tokenAddress=${query.addressOne.address}`
    )
      .then((response) => response.json())
      .then((response) => {
        console.log("not approved")
        return res.status(200).json(response);
      });
  } catch (e) {
    console.log(`Something went wrong ${e}`);
    return res.status(400).json();
  }
});

app.listen(port, () => {
  console.log(`Listening for API Calls`, port);
});
