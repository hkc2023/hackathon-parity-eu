// @ts-ignore
import * as sdk from 'manta.js';
import BN from 'bn.js';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';

const test_config = {
    ws_address: "ws://127.0.0.1:9803",
    private_key: '0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133',
}

// Get Polkadot JS Signer and Polkadot JS account address.
const getPolkadotSignerAndAddress = async () => {
    const extensions = await web3Enable('Polkadot App');
    if (extensions.length === 0) {
        throw new Error("Polkadot browser extension missing. https://polkadot.js.org/extension/");
    }
    const allAccounts = await web3Accounts();
    let account = allAccounts[0];

    const injector = await web3FromSource(account.meta.source);
    const polkadotSigner = injector.signer;
    const polkadotAddress = account.address;
    return {
        polkadotSigner,
        polkadotAddress
    }
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

type XcmTransactThroughSignedParams = [
    {
      V1: {
        parents: 1;
        interior: {
          X1: {
            Parachain: number;
          };
        };
      };
    },
    {
      currency: {
        AsMultiLocation: {
          V1: {
            parents: 1;
            interior: { X1: { Parachain: number } };
          };
        };
      };
      /**
       * fee
       */
      feeAmount: bigint;
    },
    /**
     * callHash
     */
    string,
    {
      /**
       * txWeight
       */
      transactRequiredWeightAtMost: bigint;
      overallWeight: bigint;
    },
  ];

const sendTransactXCMFromMoonbeamPolkadotJS = async () => {
        let nodeAddress = test_config.ws_address;
        const wsProvider = new WsProvider(nodeAddress);
        const api = await ApiPromise.create({provider: wsProvider});
        const keyringECDSA = new Keyring({ type: 'ethereum' });
        const alith = keyringECDSA.addFromUri(test_config.private_key);

        const encodedCallData = await createNFTMintAndPrivatizationPayload();
        const params: XcmTransactThroughSignedParams = [
            {
                V1: {
                  parents: 1,
                  interior: {
                    X1: {
                      Parachain: 2084,
                    }
                  }
                }
              },
              {
                currency: {
                  AsMultiLocation: {
                    V1: {
                      parents: 1,
                      interior: { X1: { Parachain: 2084 } },
                    }
                  }
                },
                // todo: can be low, only needed for the XCM backend fee, not the Transact execution
                feeAmount: BigInt(100000000000000), 
              },
               encodedCallData.method.toHex(),
              {
                transactRequiredWeightAtMost:  BigInt(90000000000), // todo: need to figure out a proper value
                overallWeight: BigInt(100000000000), // todo: need to figure out a proper value
              }
        ];
        const transactThroughSigned = await api.tx.xcmTransactor.transactThroughSigned(params[0], params[1], params[2], params[3]);
        console.log("moonbeam transactor payload: ", transactThroughSigned.method.toHex());
        await transactThroughSigned.signAndSend(alith);
}

// @ts-ignore

import { ethers } from 'ethers';
import ContractInterface from './XcmTransactorABI.json';
import { u8aToHex, numberToU8a } from '@polkadot/util';
import detectEthereumProvider from '@metamask/detect-provider';

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

async function main() {
    //await sendTransactXCMFromMoonbeamPolkadotJS();
    await sendTransactXCMFromMoonbeamEthereum();
    console.log("END");
}

main();
