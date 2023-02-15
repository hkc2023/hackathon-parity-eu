## zkNFT

- a zk privacy nft project based on manta, beside public nft mint and transfer, user can also private their nft transfer.
- Current manta only support asset privacy, by integration pallet_uniques or other NFT standard with manta-pay, we can support NFT privacy. and we can expand this idea to croos chain nft privacy if we want.
- pallet_uniques used for NFT behaviour, and adding support NFT on manta-pay, integration NFT with asset-manager, also works with manta-sdk to make e2e works.

## Features

Runtime:

- NFT Private Mint
- NFT Private Transfer
- NFT Public Transfer

Frontend:

- NFT Collection Create
- NFT Item Mint,support upload image to IPFS
- NFT ToPrivate Transact
- NFT PrivateTransfer Transact
- NFT PublicTransfer Transact
- NFT View Public
- NFT View Private

## Components

- Zknft with NFT feature supported
- signer
- frontend


## NOTES

IPFS demo project: https://app.infura.io/dashboard/explorer/2JLWqhTvTCl9Zzx7Qi93w8WjqW2

start frontend:
- REACT_APP_IPFSSK=$IPFSSK yarn craco start

## Cross chain extension

As mentioned in the project description extending zk-privacy to other chains is a natural progression of this code-base.
We've provided example code on how to use XCM in order to mint a private NFT from another chain, like Moonbeam.
This example code is embedded into a button in the front-end, and upon clicking it a user can send a cross chain message that instructs Calamari to create a new collection and mint a new public NFT, and then privatize it. We've provided an example using Metamask wallet and an example using polkadot-js wallet.
An updated demo can also be found in the supporting documents. 

Runtime:

- Create unique accounts on Calamari from multilocation of senders
- Extend barriers to allow DescendOrigin with Trnasact instructions 

Frontend:

- `Mint Remote` button

SDK:

- Update methods only return payloads not submit them
- Polkadot-js example
- Metamask example

To get the example going you need a local network Kusama - Calamari - Moonbeam.
You have to build all of these yourself and launch with zombienet or polkadot-launch.
Then you need bump weight limits, register assets and fund XCM account.

You can skip these by connecting to Moonbase Alpha permanent testnet

Then you need to build the Manta-Signer SDK.

For Manta-Signer you can simply download it and run it, or follow instructions in the github repo to build yourself.

For SDK you need to build manta.js package:

1. go to crate/wallet yarn && yarn build
2. go to sdk/package yarn && yarn build && npx tsc
3. import manta.js in your project

You can see how to use it in examples section, where you can test with polkadot-js or metamask wallet.

You can also see in the Front-end code, which is recorded in the demo video.

- Name and summary of the project
Remote zkNFT

- Names/pseudonyms of team members and contact information 
ghz

- The category of submission
nft

- An overview of what problem is being addressed
Cross chain creation adn privatizaiton of NFTs

- How the project uses Substrate or other technology
It uses XCM to transport a message from one chain with instruction to transact on another.

- A list of tech stack 
1. Runtime with pallet-uniques and manta-pay
2. XCM code to hash accounts and barrier to allow DescendOrigin instructions
3. SDK + example
4. Front-end