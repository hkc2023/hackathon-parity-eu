// @ts-nocheck
import React, { useEffect, useState } from "react";
import classNames from 'classnames';
import { useNft } from "contexts/nftContext";
import { useTxStatus } from "contexts/txStatusContext";
import MantaLoading from 'components/Loading';

import { ethers } from 'ethers';
import ContractInterface from './XcmTransactorABI.json';
import { u8aToHex, numberToU8a } from '@polkadot/util';
import detectEthereumProvider from '@metamask/detect-provider';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';

import * as sdk from 'manta.js';

const sendTransactXCMFromMoonbeamEthereum = async () => {
        if (typeof window.ethereum !== 'undefined') {
          console.log('MetaMask is installed!');
        }

        const metamask = await detectEthereumProvider({
          mustBeMetaMask: true
        });
        console.log("metamask provider: ", metamask);
        
        const ethersProvider = new ethers.providers.Web3Provider(metamask);
        const signer = ethersProvider.getSigner();
        const address: string = '0x000000000000000000000000000000000000080d';
        const contract = new ethers.Contract(address, ContractInterface, signer);

        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        console.log("Accounts: ", accounts);

        const encodedCallData = await createNFTMintAndPrivatizationPayload(); 

        let assetLocation = {
            parents: 1,
            // Size of array is 1, meaning is an X1 interior
            interior: [
                // Selector Parachain, ID = 2084 Calamari
                // let calamariId = 2084;
                // console.log(u8aToHex(numberToU8a(calamariId)));
                "0x0000000824",
            ]
        };

        const createReceipt = await contract.transactThroughSignedMultilocation(
          assetLocation,
          assetLocation,
          BigInt(90000000000), // transact_weith_at_most
          encodedCallData.method.toHex(),
          BigInt(100000000000000), // fee_amount
          BigInt(100000000000), // overall_weight
        );
        await createReceipt.wait();
        console.log("Receipt: ", createReceipt);
}

const createNFTMintAndPrivatizationPayload = async (): Promise<any> =>  {
  const env = sdk.Environment.Development;
  const net = sdk.Network.Dolphin;
  const mantaSdk = await sdk.init(env,net);
  
  // todo: this is hardcoded Alith on Calamari , gotta port the xcmTools code for generaing it...
  const admin = "0x036fa5d08c7ea3182c4c1a5d0e882b1cef05d79a760fd6ba4ad8279918e500cc";
  // todo: should optional to pass if you want to use an existing collection
  const [createCollection, collectionId] = await mantaSdk.createCollectionPayload(admin);
  console.log("createCollection payload : ", createCollection.method.toHex());

  const itemId = 1; // todo: should be user input
  const ipfsCID = "Test"; // todo: should be user input
  let [mintPublicNFT, assetId] = await mantaSdk.mintNFTAndSetMetadataPayload(collectionId,itemId,admin,ipfsCID);
  console.log("mintPublicNFT payload : ", mintPublicNFT.method.toHex());
  console.log("Asset ID: ", assetId.toHex());

  // todo: do i need this ? Not for to-private at least.
  await mantaSdk.initalWalletSync();
  
  // let assetId = 9; // todo: wrong assetid panics the runtime
  let assetIdArray = mantaSdk.numberToAssetIdArray(assetId);
  // todo: this should be string ... leftover from last hackathon
  const amount = "1";
  const onlySign = true;
  let privatizeNFT = await mantaSdk.toPrivateNftSign(assetIdArray, amount, onlySign);
  console.log("Privatize nft payload: ", privatizeNFT);

  // todo: need to return the "0x" , do i even need that XCMPayload helper ?
  let finalPrivatizeNFT = "0x"+privatizeNFT;
  const batchAll = await mantaSdk.api.tx.utility.batch([createCollection, mintPublicNFT, finalPrivatizeNFT]);
  console.log("Create collection, mint public nft and privatize it: ", batchAll.method.toHex());
  return batchAll;
}

const CreateRemote = () => {

  // const [collectionId, setCollectionId] = useState("");
  // const [itemId, setItemId] = useState("");
  // const [address, setAddress] = useState("");
  // const [file, setFile] = useState(null);
  // const [fileName, setFileName] = useState("");
  // //const disabled = txStatus?.isProcessing();
  const [disabled, setDisabled] = useState(false);

  const { txStatus } = useTxStatus();

  // const { mintNFT } = useNft();


  // // Only allow user to attempt to Mint NFT after all fields have been filled in.
  // useEffect(() => {

  //   if (collectionId && itemId && file) {
  //     setDisabled(false);
  //   } else {
  //     setDisabled(true);
  //   }

  // }, [collectionId, itemId, file]);


  const onClick = async () => {
    if (disabled) {
      return;
    }
    setDisabled(true);
    // await mintNFT(collectionId, itemId, address, file);

    await sendTransactXCMFromMoonbeamEthereum();

    // setFile(null);
    // setFileName("");
    // setAddress("");
    // setItemId("");
    // setCollectionId("");
    // setDisabled(false);
  };


  // const onChangeCollectionId = (value) => {
  //   setCollectionId(value);
  // };

  // const onChangeItemId = (value) => {
  //   setItemId(value);
  // };

  // const onChangeAddress = (value) => {
  //   setAddress(value);
  // };

  // const retrieveFile = (e) => {
  //   const data = e.target.files[0];
  //   let name = e.target.files[0].name;

  //   if (name.length > 12) {
  //     name = name.substr(0, 3)
  //       + "..." + name.substr(name.length - 6);
  //   }
  //   setFileName(name);
  //   const reader = new window.FileReader();
  //   reader.readAsArrayBuffer(data);
  //   reader.onloadend = () => {
  //     console.log("Buffer data: ", Buffer(reader.result));
  //     setFile(Buffer(reader.result));
  //   };

  //   e.preventDefault();  
  // };

  return (
  <>
    {/* <br/>
    <hr></hr>
    <br/>
    <input
      id="collectionIdInput"
      placeholder="Collection ID"
      onChange={(e) => onChangeCollectionId(e.target.value)}
          className={classNames(
            'w-25 pl-3 pt-1 text-2xl font-bold text-black dark:text-white manta-bg-gray outline-none rounded-2xl',
      )}
      onKeyPress={(event) => {
        if (!/[0-9]/.test(event.key)) {
          event.preventDefault();
        }
      }}
      value={collectionId}
    />

    <br/>
    <br/>
    <input
      id="itemIdInput"
      placeholder="Item ID"
      onChange={(e) => onChangeItemId(e.target.value)}
          className={classNames(
            'w-25 pl-3 pt-1 text-2xl font-bold text-black dark:text-white manta-bg-gray outline-none rounded-2xl',
      )}
      onKeyPress={(event) => {
        if (!/[0-9]/.test(event.key)) {
          event.preventDefault();
        }
      }}
      value={itemId}
    />
    <br/>
    <br/>
    <input
      id="addressInput"
      placeholder="Address"
      onChange={(e) => onChangeAddress(e.target.value)}
          className={classNames(
            'w-25 pl-3 pt-1 text-2xl font-bold text-black dark:text-white manta-bg-gray outline-none rounded-2xl',
      )}
      value={address}
    />

    <br/> 
    <br/>
    <label className={classNames('py-2 px-3 btn-hover unselectable-text', 'text-center rounded-full btn-primary w-full')}>
      <input className={classNames('hidden')} type="file" onChange={retrieveFile} />
      Upload Image      
    </label>
    <label className={classNames('text-white')}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{fileName}</label> */}

    <br/>
    <br/>
    <div>
      {txStatus?.isProcessing() ? (
        <MantaLoading className="py-4" />
      ) : (
        <button
          id="mintButton"
          onClick={onClick}
          className={classNames(
            'py-3 px-5 cursor-pointer text-xl btn-hover unselectable-text',
            'text-center rounded-full btn-primary w-full',
            { disabled: disabled }
          )}
        >
          {"Mint Remote"}
        </button>
      )}
    </div>
  </>
  );
};

export default CreateRemote;