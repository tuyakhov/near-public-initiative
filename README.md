# Public initiative voting app

Create an initiative, collect NEAR tokens for it and compete with other initiatives to win and get funded.

Users can vote for public initiatives by attaching NEAR tokens as contributions.

The initiative with the most contributions wins and it's creator receives all the collected funds

## Contract

A simple contract that allows people to collect funds for public initiatives and decide which initiative should be implemented receive all the collected funds.

```ts
// ------------------------------------
// contract initialization
// ------------------------------------

/**
 * initialize contract with owner ID and other config data
 *
 * (note: this method is called "constructor" in the singleton contract code)
 */
function init(owner: AccountId, allow_anonymous: bool = true): void

// ------------------------------------
// public methods
// ------------------------------------

/**
 * creates an initiative that users can vote for
 */
function create_initiative(): u32

/**
 * votes for an initiative
 */
function vote(initiative: u32): void

/**
 * lists all votes and contributtions of an initiative
 */
function list_votes(initiative: u32): void

// ------------------------------------
// owner methods
// ------------------------------------
/**
 * selects the winning initiative and transfer all the contributions to the initiative creator 
 */
function finalize_voting(): void

```


## Usage

### Development

To deploy the contract for development, follow these steps:

1. clone this repo locally
2. run `yarn` to install dependencies
3. run `./scripts/1.dev-deploy.sh` to deploy the contract (this uses `near dev-deploy`)

**Your contract is now ready to use.**

To use the contract you can do any of the following:

_Public scripts_

```sh
2.create-initiative.sh    # create an initiative, need to attach NEAR tokens as an initial contribution
3.vote-for-initiative.sh  # vote for an initiative by attaching NEAR tokens
4.finalize-voting.sh      # select the initiative that has the most contributions and transfer to the creator
```

_Owner scripts_

```sh
o-report.sh             # generate a summary report of the contract state
o-transfer.sh           # transfer received funds to the owner account
```

### Production

It is recommended that you deploy the contract to a subaccount under your MainNet account to make it easier to identify you as the owner

1. clone this repo locally
2. run `./scripts/x-deploy.sh` to rebuild, deploy and initialize the contract to a target account

   requires the following environment variables
   - `NEAR_ENV`: Either `testnet` or `mainnet`
   - `OWNER`: The owner of the contract and the parent account.  The contract will be deployed to `thanks.$OWNER`

3. run `./scripts/x-remove.sh` to delete the account

   requires the following environment variables
   - `NEAR_ENV`: Either `testnet` or `mainnet`
   - `OWNER`: The owner of the contract and the parent account.  The contract will be deployed to `thanks.$OWNER`
