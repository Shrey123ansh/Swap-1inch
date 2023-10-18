import React, { useEffect, useContext } from "react";
import { Input, Popover, Radio, Modal, message } from "antd";
import { DexContext } from "../Context/InchDexContext";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import tokenList from "../tokenList.json";

function Swap(props) {
  const {
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
    allowance,
    swapValue,
    modifyToken,
    ApproveToken,
  } = useContext(DexContext);

  const { isConnected,address } = props;
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    messageApi.destroy();
    if (loading) {
      messageApi.open({
        type: "loading",
        content: "Transaction is Pending...",
        duration: 0,
      });
    }
  }, [loading]);

  useEffect(() => {
    messageApi.destroy();
    if (isSuccess) {
      messageApi.open({
        type: "success",
        content: "Transaction Successful",
        duration: 1.5,
      });
    }
  }, [isSuccess]);

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
          <Input
            placeholder="0"
            value={Number(tokenOneAmount) ? Number(tokenTwoAmount) : 0}
            disabled={true}
          />
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
        {/* <div className="swapButton" disabled={!(Number(tokenOneAmount)) || !isConnected || !(Number(tokenTwoAmount)) } onClick={SwapResponce}>Swap</div> */}
        {(allowance < swapValue) && (tokenList[0].address !== tokenOne.address) ? (
          <div
            className="swapButton"
            disabled={
               !isConnected
            }
            onClick={ApproveToken}
          >
            Approve
          </div>
        ) : (
          <div
            className="swapButton"
            disabled={
              !Number(tokenOneAmount) || !address || !Number(tokenTwoAmount)
            }
            onClick={DexSwap}
          >
            Swap
          </div>
        )}
      </div>
    </>
  );
}

export default Swap;
