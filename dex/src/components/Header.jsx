import React from "react";
import { Link } from "react-router-dom";
function Header(props) {

  const {address, connect} = props;

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
        {address == "" ? (
              <div className="connectButton" onClick={()=> connect()}>
                <span>Connect Wallet</span>
              </div>
            ):(
              <div className="connectButton" >
                {(address.slice(0,4) +"..." +address.slice(38))}
              </div>
            )}
      </div>
    </header>
  );
}

export default Header;
