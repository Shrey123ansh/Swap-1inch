import "./App.css";
import Header from "./components/Header";
import Swap from "./components/Swap";
import { Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  connectWallet,
  ChechIfWalletConnected,
} from "./Utils/apiFeature";

// import { useContext } from "react";
// import { useConnect, useAccount } from "wagmi";
// import { MetaMaskConnector } from "wagmi/connectors/metaMask";
// import { isWallectConnected,connectWallet,connectAccount } from './services/blockchain'

function App() {

  // const { address, isConnected } = useAccount();
  // const { connect } = useConnect({
  //   connector: new MetaMaskConnector(),
  // });
  // const { address } = connectWallet();

  const [connectAccount, setAccount] = useState("");
  // const [isConnected, setIsConnected] = useState(false);

  
  const connectedWallet = async () => {
    try {  
      if (!window.ethereum) return console.log("Install MetaMask");
      const firstAccount  = await connectWallet();
      setAccount(firstAccount);
      // setIsConnected(true);
      return firstAccount;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    connectedWallet();
  }, [])
  


  return (
    <div className="App">
      <Header connect={connectWallet} isConnected={ChechIfWalletConnected} address={connectAccount} />
      <div className="mainWindow">
        <Routes>
          <Route path="/" element={<Swap isConnected={ChechIfWalletConnected} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
