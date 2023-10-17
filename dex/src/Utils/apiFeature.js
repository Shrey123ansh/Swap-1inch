import {
  OneinchContractabi,
  OneInchContractAddress,
} from "../Utils/constants";
const { ethers } = require("ethers");

export const ChechIfWalletConnected = async () => {
  try {
    if (!window.ethereum) return console.log("Install MateMask");

    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    const firstAccount = accounts[0]?.toLowerCase();

    window.ethereum.on("chainChanged", (chainId) => {
      window.location.reload();
    });

    window.ethereum.on("accountsChanged", async () => {
      const firstAccount = accounts[0]?.toLowerCase();
      await ChechIfWalletConnected();
    });

    if (accounts.length) {
      const firstAccount = accounts[0]?.toLowerCase();
      return firstAccount;
    } else {
      console.log("No accounts found.");
    }
  } catch (error) {
    return;
  }
};

export const connectWallet = async () => {
  try {
    if (!window.ethereum) return console.log("Install MetaMask");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const firstAccount = accounts[0]?.toLowerCase();
    return firstAccount;
  } catch (error) {
    console.log(error);
  }
};

const fetchContract = (signerOrProvider) =>
  new ethers.Contract(
    OneInchContractAddress,
    OneinchContractabi,
    signerOrProvider
  );

export const connectingWithContract = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = fetchContract(signer);
    // console.log(contract);
    return contract;
  } catch (error) {
    console.log("MetaMask not installed; using read-only defaults");
  }
};

