import React, { useState, useEffect, useRef } from "react";
import tokenList from "../tokenList.json";
import axios from "axios";
import { OneInchContractAddress } from "../Context/constants";

//INTERNAL IMPORT
import {
  ChechIfWalletConnected,
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
  const [allowance, setAllowance] = useState(null);

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

  const ApproveToken = async () => {
    try {
      const connectAccount = await ChechIfWalletConnected();
      setAccount(connectAccount);
      // console.log(connectAccount);

      const IERC20contract = await connectingWithERC20Contract();
      // console.log(IERC20contract);

      let amount = parseFloat(tokenOneAmount ? tokenOneAmount : 1);
      amount = amount * Math.pow(10, tokenOne.decimals);

      const hash1 = await IERC20contract.approve(
        OneInchContractAddress,
        amount
      );
      setLoading(true);
      await hash1.wait();
      setLoading(false);
      setSuccess(true);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const CheckAllowance = async () => {
    try {
      const connectAccount = await ChechIfWalletConnected();
      setAccount(connectAccount);

      const IERC20contract = await connectingWithERC20Contract();
      const allowance = await IERC20contract.allowance(
        connectAccount,
        OneInchContractAddress
      );
      setAllowance(Number(allowance));
      // console.log(Number(allowance));
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    CheckAllowance();
  }, [tokenOne]);

  const DexSwap = async () => {
    try {
      const connectAccount = await ChechIfWalletConnected();
      setAccount(connectAccount);

      const response = await axios.get(
        `https://dexswapinch.onrender.com/swapTokenData`,
        {
          params: {
            addressOne: tokenOne,
            addressTwo: tokenTwo,
            tokenOneAmount: tokenOneAmount,
            address: connectAccount,
            slippage: slippage,
          },
        }
      );

      const params = new ethers.Interface(OneinchContractabi)
        .decodeFunctionData("swap", response.data.tx.data)
        .toObject();

      const arr = [];
      Object.keys(params.desc).forEach(function (key) {
        arr.push(params.desc[key]);
      });

      let amount = parseFloat(tokenOneAmount);
      amount = amount * Math.pow(10, tokenOne.decimals);

      const Inchcontract = await connectingWithContract();

      const hash = await Inchcontract.swap(
        params.executor,
        arr,
        params.permit,
        params.data,
        tokenOne.address === tokenList[0].address
          ? { value: amount.toString() }
          : { value: 0 }
      );

      setLoading(true);
      await hash.wait();
      setLoading(false);
      setSuccess(true);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const changeAmount = async (e) => {
    setTokenOneAmount(String(e.target.value));
    if (Number(e.target.value)) {
      const res = await axios.get(
        `https://dexswapinch.onrender.com/tokenPrice`,
        {
          params: {
            addressOne: tokenOne,
            addressTwo: tokenTwo,
            tokenOneAmount: e.target.value,
          },
        }
      );
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
    const res0 = await axios.get(
      `https://dexswapinch.onrender.com/tokenPrice`,
      {
        params: { addressOne: one, addressTwo: two, tokenOneAmount: "1" },
      }
    );

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
        loading,
        isSuccess,
        slippage,
        tokenOneAmount,
        tokenTwoAmount,
        tokenOne,
        tokenTwo,
        prices,
        isOpen,
        allowance,
        setIsOpen,
        DexSwap,
        changeAmount,
        handleSlippageChange,
        switchTokens,
        openModal,
        modifyToken,
        ApproveToken,
      }}
    >
      {children}
    </DexContext.Provider>
  );
};
