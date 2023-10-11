import React, { useState, useEffect,useRef } from "react";
import { Input, Popover, Radio, Modal, message } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import tokenList from "../tokenList.json";
import axios from "axios";
import { useSendTransaction, useWaitForTransaction } from "wagmi";


function Swap(props) {
  const { address, isConnected } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [slippage, setSlippage] = useState(1);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);
  const [pricesinUSD, setPricesinUSD] = useState(null);
  const [txDetails, setTxDetails] = useState({
    to:null,
    data: null,
    value: null,
  }); 


  const {data, sendTransaction} = useSendTransaction({
    request: {
      from: address,
      to: String(txDetails.to),
      data: String(txDetails.data),
      value: String(txDetails.value),
    }
  })

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

  const [render,setRender]=useState(true);
  const timerId = useRef();

  async function outputAmount() {      
    const res = await axios.get(`http://localhost:5001/tokenPrice`, {
        params: {addressOne: tokenOne, addressTwo: tokenTwo, tokenOneAmount: tokenOneAmount}
      })
  
      let decimals = Number(`1E${tokenTwo.decimals}`)
      setTokenTwoAmount((Number(res.data.toAmount)/decimals).toFixed(4));
      setPrices((Number(res.data.toAmount)/decimals).toFixed(4));
  }

  useEffect(()=>{
    timerId.current = setInterval(()=>{
    setRender(prev => !prev)},15000)
    return () => {
      outputAmount();
      clearInterval(timerId.current)}
  }, [render])

  async function changeAmount(e) {
    setTokenOneAmount(String(e.target.value));
    if(e.target.value){
      
      const res = await axios.get(`http://localhost:5001/tokenPrice`, {
        params: {addressOne: tokenOne, addressTwo: tokenTwo, tokenOneAmount: e.target.value}
      })

      let decimals = Number(`1E${tokenTwo.decimals}`)
      setTokenTwoAmount((Number(res.data.toAmount)/decimals).toFixed(4));

    }else{
      setTokenTwoAmount(null);
    }
  }
 
  async function fetchDexSwap(){

    const allowance = await axios.get(`http://localhost:5001/check`, {
        params: {addressOne: tokenOne, address: address}
      })
      console.log(allowance.data.allowance); //0 for usdt to matic

          if (allowance.data.allowance === "0") {
            const approve = await axios.get(`http://localhost:5001/getApproval`, {
            params: {addressOne: tokenOne}
          })
          setTxDetails(approve.data);
          return;
          }

      const tx = await axios.get(`http://localhost:5001/getTransaction`, {
        params: {addressOne: tokenOne, addressTwo: tokenTwo, tokenOneAmount: tokenOneAmount, address: address, slippage: slippage}
      })
      setTxDetails(tx.data.tx);
   
  }

  function switchTokens() {
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
  }

  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(i){
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
    } else {
      setTokenTwo(tokenList[i]);
    }
    setIsOpen(false);
  }
  useEffect(()=>{

      if(txDetails.to && isConnected){
        sendTransaction();
      }
  }, [txDetails])

  async function outputForSingleToken(one,two) {      
      const res0 = await axios.get(`http://localhost:5001/tokenPrice`, {
        params: {addressOne: one, addressTwo: two, tokenOneAmount: "1"}
      })

      let decimals = Number(`1E${tokenTwo.decimals}`)
      setPrices((Number(res0.data.toAmount)/decimals).toFixed(4));
  }

  useEffect(()=>{
    outputForSingleToken(tokenOne,tokenTwo);
  }, [tokenOne,tokenTwo])

  useEffect(()=>{

    messageApi.destroy();

    if(isLoading){
      messageApi.open({
        type: 'loading',
        content: 'Transaction is Pending...',
        duration: 0,
      })
    }    

  },[isLoading])

  useEffect(()=>{
    messageApi.destroy();
    if(isSuccess){
      messageApi.open({
        type: 'success',
        content: 'Transaction Successful',
        duration: 1.5,
      })
    }else if(txDetails.to){
      messageApi.open({
        type: 'error',
        content: 'Transaction Failed',
        duration: 1.50,
      })
    }


  },[isSuccess])


  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className="modalContent">
          {tokenList?.map((e, i) => {
            return (
              <div
                className="tokenChoice"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <img src={e.img} alt={e.ticker} className="tokenLogo" />
                <div className="tokenChoiceNames">
                  <div className="tokenName">{e.name}</div>
                  <div className="tokenTicker">{e.ticker}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
          <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement="bottomRight"
          >
            <SettingOutlined className="cog" />
          </Popover>
        </div>
        <div className="inputs">
          <Input
            placeholder="0"
            value={tokenOneAmount}
            onChange={changeAmount}
          />
          <Input placeholder="0" value={tokenTwoAmount} disabled={true} />
          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className="switchArrow" />
          </div>
          <div className="assetOne" onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          <div className="assetTwo" onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt="assetOneLogo" className="assetLogo" />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
        </div>
        <div className="home-container16">
          <div className="home-container17">
            <span className="home-text10">1</span>
            <span className="home-text11">{tokenOne.ticker}</span>
            <span className="home-text12">=</span>
            <span className="home-text13">{prices}</span>
            <span className="home-text14">{tokenTwo.ticker}</span>
          </div>
          <div className="home-container18">
            <img
              alt="image"
              src="/fees-removebg-preview-200w.png"
              className="home-image2"
            />
            <span className="home-text16">~$0.01</span>
          </div>
        </div>
        <div className="swapButton" disabled={!tokenOneAmount || !isConnected} onClick={fetchDexSwap}>Swap</div>
      </div>
    </>
  );
}

export default Swap;


  // async function outputAmount() {      
  //       const res = await axios.get(`http://localhost:5001/tokenPrice`, {
  //           params: {addressOne: tokenOne, addressTwo: tokenTwo, tokenOneAmount: tokenOneAmount}
  //         })
      
  //         let decimals = Number(`1E${tokenTwo.decimals}`)
  //         setTokenTwoAmount((Number(res.data.toAmount)/decimals).toFixed(5));
  //     }
  

//   async function fetchPrices(){
//     const res = await axios.get(`http://localhost:5001/tokenPriceInUSD`, {
//       params: {address: tokenTwo}
//     })
//     setPricesinUSD(res.data.usdPrice)
//     console.log(pricesinUSD)
// }


  
