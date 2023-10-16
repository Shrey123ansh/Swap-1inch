import React, { useState, useEffect, useRef } from "react";
import tokenList from "../tokenList.json";
import axios from "axios";

//INTERNAL IMPORT
import {
  ChechIfWalletConnected,
  connectWallet,
  connectingWithContract,
} from "../Utils/apiFeature";

import { OneinchContractabi, IERC20abi } from "../Context/constants";

const { ethers } = require("ethers");
export const DexContext = React.createContext();

export const DexInchProvider = ({ children }) => {
  const [connectAccount, setAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setSuccess] = useState(false);

  const [changeToken, setChangeToken] = useState(1);
  const [tokenOneAmount, setTokenOneAmount] = useState(0);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(0);
  const [slippage, setSlippage] = useState(1);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [prices, setPrices] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  //CREATE ACCOUNT

  const fetchContractERC20 = (signerOrProvider) =>
    new ethers.Contract(tokenOne.address, IERC20abi, signerOrProvider);

  const connectingWithERC20Contract = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = fetchContractERC20(signer);
      // console.log(contract);
      return contract;
    } catch (error) {
      console.log("MetaMask not installed; using read-only defaults");
    }
  };

  const DexSwap = async () => {
    try {
      const contract = await connectingWithContract();
      // console.log(contract);

      const connectAccount = await connectWallet();
      setAccount(connectAccount);
      // console.log(connectAccount);

      const responseParams = await SwapResponce();

      const inter = new ethers.Interface(OneinchContractabi);

      const data = inter
        .decodeFunctionData("swap", responseParams.data.tx.data)
        .toObject().data;
      const executor = inter
        .decodeFunctionData("swap", responseParams.data.tx.data)
        .toObject().executor;
      const permit = inter
        .decodeFunctionData("swap", responseParams.data.tx.data)
        .toObject().permit;
      const json = inter
        .decodeFunctionData("swap", responseParams.data.tx.data)
        .toObject().desc;

      const arr = [];
      Object.keys(json).forEach(function (key) {
        arr.push(json[key]);
      });

      // console.log(arr);

      let amount = parseFloat(tokenOneAmount);
      amount = amount * Math.pow(10, tokenOne.decimals);

      const hash = await contract.swap(executor, arr, permit, data, {
        value: amount.toString(),
      });

      setLoading(true);
      await hash.wait();
      setLoading(false);
      setSuccess(true);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const SwapResponce = async () => {
    const connectAccount = await ChechIfWalletConnected();
    setAccount(connectAccount);
    // console.log(connectAccount,"hello");
    try {

      const contract = await connectingWithERC20Contract();
      const allowance = await axios.get(`https://dexswapinch.onrender.com/check`, {
        params: { addressOne: tokenOne, address: connectAccount },
      });
      // console.log(contract);
      // const allowance2 = await contract.allowance(connectAccount,connectAccount);
      // console.log(allowance.data.allowance); //0 for usdt to matic

      // if (allowance.data.allowance === 0) {
      // if (allowance2 === 0) {
        // const approve = await axios.get(`https://dexswapinch.onrender.com/getApproval`, {
        //   params: { addressOne: tokenOne },
        // });
        // or
        // await contract.approve(connectAccount,0);
        // console.log("not working")
      //   return;
      // }

      const res = await axios.get(`https://dexswapinch.onrender.com/swapTokenData`, {
        params: {
          addressOne: tokenOne,
          addressTwo: tokenTwo,
          tokenOneAmount: tokenOneAmount,
          address: connectAccount,
          slippage: slippage,
        },
      });

      return res;
    } catch (error) {
      console.log(error);
    }
  };

  const changeAmount = async (e) => {
    setTokenOneAmount(String(e.target.value));
    if (Number(e.target.value)) {
      const res = await axios.get(`https://dexswapinch.onrender.com/tokenPrice`, {
        params: {
          addressOne: tokenOne,
          addressTwo: tokenTwo,
          tokenOneAmount: e.target.value,
        },
      });
      let decimals = Number(`1E${tokenTwo.decimals}`);
      setTokenTwoAmount((Number(res.data.toAmount) / decimals).toFixed(4));
    } else {
      setTokenTwoAmount(0);
    }
  };

  const [render, setRender] = useState(true);
  const timerId = useRef();

  const outputAmount = async () => {
    const res = await axios.get(`https://dexswapinch.onrender.com/tokenPrice`, {
      params: {
        addressOne: tokenOne,
        addressTwo: tokenTwo,
        tokenOneAmount: tokenOneAmount,
      },
    });
    if (typeof res.data.toAmount === Number) {
      let decimals = Number(`1E${tokenTwo.decimals}`);
      setTokenTwoAmount((Number(res.data.toAmount) / decimals).toFixed(4));
      setPrices((Number(res.data.toAmount) / decimals).toFixed(4));
    }
  };

  useEffect(() => {
    timerId.current = setInterval(() => {
      setRender((prev) => !prev);
    }, 15000);
    return () => {
      outputAmount();
      clearInterval(timerId.current);
    };
  }, [render]);

  const outputForSingleToken = async (one, two) => {
    const res0 = await axios.get(`https://dexswapinch.onrender.com/tokenPrice`, {
      params: { addressOne: one, addressTwo: two, tokenOneAmount: "1" },
    });

    let decimals = Number(`1E${tokenTwo.decimals}`);
    setPrices((Number(res0.data.toAmount) / decimals).toFixed(6));
  };

  useEffect(() => {
    outputForSingleToken(tokenOne, tokenTwo);
  }, [tokenOne, tokenTwo]);

  function handleSlippageChange(e) {
    setSlippage(e.target.value);
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

  function modifyToken(i) {
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
    } else {
      setTokenTwo(tokenList[i]);
    }
    setIsOpen(false);
  }

  return (
    <DexContext.Provider
      value={{
        connectAccount,
        // fetchData,
        loading,
        isSuccess,
        slippage,
        tokenOneAmount,
        tokenTwoAmount,
        tokenOne,
        tokenTwo,
        prices,
        isOpen,
        setIsOpen,
        DexSwap,
        changeAmount,
        handleSlippageChange,
        switchTokens,
        openModal,
        modifyToken,
      }}
    >
      {children}
    </DexContext.Provider>
  );
};
