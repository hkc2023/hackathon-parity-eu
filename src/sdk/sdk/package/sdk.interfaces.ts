import { ApiPromise } from '@polkadot/api';
import { Wallet } from 'manta-wasm-wallet';
import { Environment, Network } from './sdk';

export type Version = string;
export type Address = string;
export type TransferAmount = string;

// Must be a uint8Array of length 32.
export type AssetId = Uint8Array;

enum AssetType {
  FT = "FT",
  NFT = "NFT",
  SBT = "SBT",
  PFT = "PFT"
}

export type AssetTypes = AssetType;

export interface InitApiResult {
  api: ApiPromise,
  signer: string
}

export interface InitWasmResult {
  wasm: any,
  wasmWallet: Wallet,
  wasmApi: any
}

export interface IMantaSdk {

  api: ApiPromise;
  signer: string;
  wasm: any;
  wasmWallet: Wallet;
  network: Network;
  environment: Environment;
  wasmApi: any;

  convertPrivateAddressToJson(address: string): any
  numberToAssetIdArray(assetIdNumber: number): AssetId;
  assetIdArrayToNumber(assetId: AssetId): number;
  networks(): any;
  setNetwork(network: Network): Promise<void>
  setEnvironment(environment: Environment): Promise<void>
  privateAddress(): Promise<Address>;
  initalWalletSync(): Promise<void>;
  walletSync(): Promise<void>;
  signerVersion(): Promise<Version>;
  assetMetaData(asset_id: AssetId): Promise<any>;
  privateBalance(asset_id: AssetId): Promise<string>;
  publicBalance(asset_id: AssetId, address:string): Promise<any>;
  publicTransfer(asset_id: AssetId, amount: TransferAmount, address: Address): Promise<any>
  
  toPrivateSign(asset_id: AssetId, amount: TransferAmount, onlySign: boolean): Promise<any>;
  privateTransfer(asset_id: AssetId, amount: TransferAmount, address: Address, onlySign: boolean): Promise<any>;
  toPublic(asset_id: AssetId, amount: TransferAmount, onlySign: boolean): Promise<any>;
  
  // mantaPay
  toPrivateNFT(asset_id: AssetId): Promise<void>;
  privateTransferNFT(asset_id: AssetId, address: Address): Promise<void>;
  toPublicNFT(asset_id: AssetId): Promise<void>;
  
  toPrivateSBT(asset_id: AssetId): Promise<void>;
  toPublicSBT(asset_id: AssetId): Promise<void>;
  privateTransferSBT(asset_id: AssetId, address: Address): Promise<void>;

  createCollection(): Promise<any>;
  createCollectionPayload(admin:string): Promise<[any, any]>;
  mintNFT(collectionId: number, itemId: number, address: string): Promise<void>;
  updateNFTMetadata(collectionId: number, itemId: number, metadata:any): Promise<void>;
  getNFTMetadata(collectionId: number, itemId: number): Promise<any>;
  publicTransferNFT(asset_id: AssetId, address: Address): Promise<void>;
  viewAllNFTsInCollection(collectionId:number, address:string): Promise<any>;
  getNFTOwner(assetId: AssetId): Promise<string>;
  mintNFTAndSetMetadata(collectionId: number, itemId: number, address: string, metadata: any): Promise<any>;
  mintNFTAndSetMetadataPayload(collectionId: number, itemId: number, address: string, metadata: any): Promise<[any, any]>;
  assetIdFromCollectionAndItemId(collectionId: number, itemId: number): Promise<any>;
}