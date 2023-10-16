import React from "react";
import { Link } from "react-router-dom";
import {
  connectWallet,
} from "../Utils/apiFeature";
function Header(props) {

  const {address, isConnected, connect} = props;

  return (
    <header>
      <div className="leftH">
        <Link to="/" className="link">
          <div className="headerItem">Swapping</div>
        </Link>
      </div>
      <div className="rightH">
        <div className="headerItem">
          <img src="https://cdn.moralis.io/eth/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png" alt="polygon" className="eth" />
          Polygon
        </div>
        <div className="connectButton" onClick={connect}>
          {isConnected ? (address.slice(0,4) +"..." +address.slice(38)) : "Connect"}
        </div>
      </div>
    </header>
  );
}

export default Header;
