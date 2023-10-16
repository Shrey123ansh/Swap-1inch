import "./App.css";
import Header from "./components/Header";
import React, { useContext,useState,useEffect } from "react";
import Swap from "./components/Swap";
import { Routes, Route } from "react-router-dom";
import {
  connectWallet,
  ChechIfWalletConnected,
} from "./Utils/apiFeature";

function App() {
  const [account, setAccount] = useState("");

  const fetchData = async () => {
    try {
      const connectAccount = await connectWallet();
      setAccount(connectAccount);
    } catch (error) {
      // setError("Please Install And Connect Your Wallet");
      console.log(error);
    }
  };
  

  return (
    <div className="App">
      <Header connect={fetchData} isConnected={ChechIfWalletConnected} address={account} />
      <div className="mainWindow">
        <Routes>
          <Route path="/" element={<Swap isConnected={ChechIfWalletConnected} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
