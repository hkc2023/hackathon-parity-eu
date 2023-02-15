## Private NFTs via XCM

This hackathon entry is an extension to the [zkNFT project](https://github.com/ParityAsia/hackathon-2022-winter/tree/main/teams/32-zkNFT#introduce), which was subimitted to the Parity Asia Hackathon.

We've extended the runtime code and provided examples on how to use the XCM features in order to mint a private NFT from another chain, such as Moonbeam. We've provided example code using both Metamask wallet, as well as Polkadot-JS wallet.

Furthermore this example code is also embeded into a button in our project's makeshift front-end. Upon clicking that button a user can send a cross chain message that instructs Calamari to create a new collection and mint a new public NFT, and then privatize it.

## Name and summary of the project
Remote zkNFT

## Names/pseudonyms of team members and contact information 
ghz

## The category of submission
NFT.

## An overview of what problem is being addressed
Using privacy features from one chain on another chain via XCM.

## How the project uses Substrate or other technology
It uses XCM to transport a message from one chain with instruction to transact on another.

## Architecture:

This product extends the architecture of the previous project `Runtime -> SDK -> Signer -> Front-end`, on 3 layers.

* `Runtime`
    - Added a `Barrier` to process `DescendOrigin + WithdrawAsset + BuyExecution + Transact` xcm instructions.
    - Added a hasher to convert Multilocations to unique 32byte addresses, in order for every user on every chain to have a unique mapped account on the destination chain, that only they control.

* `SDK`
    - Extended SDK to return TX paykoads to be used in XCM messages, instead of submitting them directly on-chain
    - Added example code that can be run without a front-end. Includes both Metamask and Polkadot-JS wallet variants.

* `Front-end`
    - Integrated the new SDK code into a "Mint Remote" button

## Build Instrucitons

### Runtime

*You can skip these steps by connecting to Moonbase Alpha permanent testnet, where they are already set up*

To get the example going you need to launch a local network with a relay chain and two parachains. In our specific example we'll be using Rococo, Calamari and Moonbase.

You can either download the binaries from the corresponding official release pages or build them yourself by cloning each repository and running `cargo b --release` in the root of the project. 

Once you have the binaries you can start the network with a tool like [zombienet](https://github.com/paritytech/zombienet) or [polkadot-launch](https://github.com/paritytech/polkadot-launch). You can find a reference polakdot-launch config at the bottom of the page

Once the network is started you need to register each parachain's asset via the AssetManager pallet and set a random value for units/sec. Example of how to do this can be found [here](https://github.com/Manta-Network/Manta/blob/manta/.github/ISSUE_TEMPLATE/calamari_xcm_onboarding.md#registering-your-asset-on-dolphin) 

With the assets registered you need to bump the default xcmp-queue pallet weight limits, specifically the weight decay parameter to `0` and the max individual weight limit to `125000000000`. This will allow for our heavier extrinsics to be executed over xcm.

The final consideration of our design is how will transaction fees be paid for the transaction sent over via xcm. The way the XCM V2 works, this has to be an account on Manta and the fees will have to be native Manta token. In order to make this account unique for each sender on another chain, we simply hash it. You can see this [derivative address generator tool](https://github.com/PureStake/xcm-tools#derivated-address-calculator-script) on how to generate this account in TypeScript code. Once you've generated it, it needs to be funded via a balances transfer with the native token on Manta. 
In future improvements of this project, the account can be funded automatically by the sender by batching a token transfer, and the sender can get the Manta token through a DEX or a Faucet.

### Manta-Signer

Now that you have the runtime setup, you need to build the Manta SDK and Manta-Signer.

For Manta-Signer you can download it from the [official release page](https://github.com/Manta-Network/manta-signer/releases) and run it. You will have to follow the UX prompts to create your account but once it is created simply leave the app running in the background.

You can also build Manta-Signer yourself by following the instrucitons in the repository `README` file.

### Manta SDK
For SDK you need to build manta.js package:

1. `cd src/sdk/wallet/ && yarn && yarn build`
2. `cd src/sdk/sdk/package/ && yarn && yarn build`
3. Import into your project by adding `"manta.js": "file:/{LOCAL PATH OF sdk/manta-js/package}` to your project's package.json
4. `yarn upgrade manta.js` in your project's directory

You can see how to use it in examples section, where you can test with [Polkadot-JS wallet example](https://github.com/hkc2023/hackathon-parity-eu/blob/main/src/sdk/examples/asset-webpack-ts/index.ts#L105) or [Metamask wallet example](https://github.com/hkc2023/hackathon-parity-eu/blob/main/src/sdk/examples/asset-webpack-ts/index.ts#L154).

Before building the SDK make sure to edit [this config file](https://github.com/hkc2023/hackathon-parity-eu/blob/main/src/sdk/sdk/package/manta-config.json#L6-L20) with the node addresses which you're planning to connect to.

If you are running the metamask example, you need to connect your metamask to your local network or Moonbase Alpha.

### Front-End
Finally if you want to try the front-end from our demo video you can:

1. Go to the root of the front-end project
2. `yarn`
3. `yarn start`

### Reference Polkadot Launch Config

```
{
    "relaychain": {
        "bin": "/Users/ghz/Parity/polkadot/target/release/polkadot",
        "chain": "rococo-local",
        "nodes": [
            {
                "name": "alice",
                "wsPort": 9944,
                "port": 30444,
                "flags": [
                    "--rpc-cors=all",
                    "--execution=wasm",
                    "--wasm-execution=compiled",
                    "-ldebug=info"
                ]
            },
            {
                "name": "bob",
                "wsPort": 9955,
                "port": 30555,
                "flags": [
                    "--rpc-cors=all",
                    "--execution=wasm",
                    "--wasm-execution=compiled",
                    "-ldebug=info"
                ]
            },
            {
                "name": "charlie",
                "wsPort": 9966,
                "port": 30666,
                "flags": [
                    "--rpc-cors=all",
                    "--execution=wasm",
                    "--wasm-execution=compiled",
                    "-ldebug=info"
                ]
            }
        ],
        "genesis": {
            "runtime": {
                "runtime_genesis_config": {
                    "configuration": {
                        "config": {
                            "validation_upgrade_frequency": 5,
                            "validation_upgrade_delay": 5
                        }
                    }
                }
            }
        }
    },
    "parachains": [
        {
            "bin": "/Users/ghz/workspace/Manta-Network/hackathon/src/zkNFT/target/release/manta",
            "chain": "dolphin-dev",
            "nodes": [
                {
                    "wsPort": 9801,
                    "port": 31201,
                    "name": "alice",
                    "flags": [
                        "--rpc-cors=all",
                        "--rpc-port=9971",
                        "--rpc-methods=unsafe",
                        "--execution=native",
                        "-ldebug=info"
                    ]
                }
            ]
        },
        {
            "bin": "/Users/ghz/workspace/moonbeam/target/release/moonbeam",
			"chain": "moonbase-local",
			"nodes": [
				{
					"wsPort": 9803,
					"port": 31203,
					"name": "alice",
					"flags": [
						"--rpc-cors=all",
						"--rpc-port=9973",
                        "--rpc-methods=unsafe",
						"--execution=native",
						"-ldebug=info"
					]
				},
				{
					"wsPort": 9802,
					"port": 31202,
					"name": "bob",
					"flags": [
						"--rpc-cors=all",
						"--rpc-port=9972",
                        "--rpc-methods=unsafe",
						"--execution=wasm",
						"--wasm-execution=compiled"
					]
				}
			]
		}
    ],
	"simpleParachains": [],
	"hrmpChannels": [
		{
			"sender": 2084,
			"recipient": 1000,
			"maxCapacity": 1000,
			"maxMessageSize": 102400
		},
		{
			"sender": 1000,
			"recipient": 2084,
			"maxCapacity": 1000,
			"maxMessageSize": 102400
		}
	],
	"types": {},
	"finalization": false 
}
```