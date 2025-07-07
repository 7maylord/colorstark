# ColorStark Game

The ColorStark Game is a decentralized, on-chain game built on StarkNet, where players match colored bottles to a target configuration to earn points. Players connect their StarkNet wallet, set a display name, start a game, swap bottles off-chain to match the target, and submit their solution to compete on a global leaderboard. The game uses a Cairo smart contract for game logic and a Next.js frontend with TypeScript and Starknet-React for a seamless user experience.

## Contract Deployment

The ColorStark smart contract is deployed on:

- **Network:** Sepolia Testnet
- **Contract Address:** 0x0600ede956780c61a9db05e17404075f5f0d2fd75ec2e458d383afef09282b68
- **Starkscan:** [View on Starkscan](https://sepolia.starkscan.co/contract/0x0600ede956780c61a9db05e17404075f5f0d2fd75ec2e458d383afef09282b68)


## Features

- **Wallet Integration**: Connect with Argent X or Braavos to interact with the game on StarkNet.
- **Player Profiles**: Set a display name and track points and moves earned from winning games.
- **Gameplay**: Start a game with 5 colored bottles (Red, Blue, Green, Yellow, Purple), swap bottles off-chain to match a target configuration, and earn 10 points for a complete match by submitting your result on-chain.
- **Leaderboard**: View all players' names, points, and moves, sorted by highest score.
- **Responsive UI**: Built with Next.js and Tailwind CSS for a modern, user-friendly interface.
- **Type Safety**: Uses TypeScript for robust frontend development.
- **Rich Events**: The contract emits events for all major actions (name set, game started, completed, ended) for analytics and off-chain tracking.

## How It Works

1. **Set Name**: Enter a name (max 31 chars) and set it on-chain.
2. **Start Game**: Start a new game; the contract generates a random target and shuffled bottles.
3. **Swap Bottles**: Swap bottles off-chain in the UI to match the target configuration.
4. **Submit Result**: When you think you have the correct arrangement, submit your result on-chain. The contract verifies your solution and awards points if correct.
5. **End Game**: You can end a game early on-chain (no points awarded).
6. **Leaderboard**: View your progress and compare with others.

## Example Gameplay

1. Player sets their name and starts a game.
2. The contract emits a `GameStarted` event and provides a random target and shuffled bottles.
3. The player swaps bottles in the UI until the arrangement matches the target.
4. The player submits the result. If correct, the contract emits a `GameCompleted` event and awards 10 points.
5. The player can end a game early with the "End Game" button, which calls the contract and emits a `GameEnded` event.
6. All actions are reflected in the leaderboard and event logs.

## Project Structure

```
colorstark/
├── contracts/
│   ├── src/
│   │   └── lib.cairo
│   └── tests/
│       └── test_contract.cairo
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── abi/
│   │   ├── app/
│   │   ├── components/
│   │   ├── config/
│   │   ├── hooks/
│   │   └── utils/
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── yarn.lock
├── .gitignore
└── README.md
```

- `contracts/`: Contains the Cairo smart contract and Scarb configuration for building and deploying.
- `frontend/`: Contains the Next.js frontend with TypeScript, Starknet-React, and Tailwind CSS.

## Prerequisites

- **Node.js (v16 or later)**: [Install Node.js](https://nodejs.org/)
- **Yarn**: Install globally with `npm install -g yarn`.
- **Starknet Wallet**: Install Argent X or Braavos browser extension.
- **Scarb**: Cairo build toolchain ([Install Scarb](https://docs.swmansion.com/scarb/)).
- **Starknet Foundry (v0.38.2)**: For contract deployment ([Install Starknet Foundry](https://foundry-rs.github.io/starknet-foundry/)).
- **Starknet Devnet (v0.2.4)**: For local testing ([Install Devnet](https://github.com/Shard-Labs/starknet-devnet)).
- **Git**: For cloning the repository.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/7mayord/colorstark.git
cd colorstark
```

### 2. Install Frontend Dependencies

Navigate to the frontend directory and install dependencies using Yarn:

```bash
cd frontend
yarn install
```

### 3. Compile the Smart Contract

Navigate to the contracts directory and compile the Cairo contract using Scarb:

```bash
cd ../contracts
scarb build
```

This generates the compiled contract and ABI in `target/dev/`.

### 4. Deploy the Smart Contract

#### Option 1: Local Devnet

Start a local StarkNet Devnet:

```bash
starknet-devnet
```

Declare and deploy the contract using Starknet Foundry's sncast:

```bash
# Declare the contract, note the class hash returned
sncast --url http://localhost:5050 declare --contract-name ColorStark
# Deploy the contract (replace <CLASS_HASH> and <OWNER_ADDRESS> with your values) Note contract address returned
sncast --url http://localhost:5050 deploy --class-hash <CLASS_HASH> --constructor-args <OWNER_ADDRESS>
```

- `<OWNER_ADDRESS>` should be the StarkNet address that will have admin/upgrade rights for the contract (typically your wallet address).
- The constructor requires this owner address as a parameter.

.

#### Option 2: Sepolia Testnet

Configure your StarkNet account:

```bash
export STARKNET_ACCOUNT=~/.starknet_accounts/starknet_open_zeppelin_accounts.json
export STARKNET_KEYSTORE=~/.starknet_accounts/starknet_open_zeppelin_key.json
```

Declare and deploy: make sure you have a RPC url from alchemy or infura

```bash
# Declare the contract, note the class hash returned
sncast --url https://yourRPCURL declare --contract-name ColorStark
# Deploy the contract (replace <CLASS_HASH> and <OWNER_ADDRESS> with your values) Note contract address returned
sncast --url https://yourRPCURL deploy --class-hash <CLASS_HASH> --constructor-args <OWNER_ADDRESS>
```

- `<OWNER_ADDRESS>` should be the StarkNet address that will have admin/upgrade rights for the contract.

### 5. Update Contract Address

Update the contract address in your `.env` file:

```
NEXT_PUBLIC_CONTRACT_ADDRESS='YOUR_DEPLOYED_CONTRACT_ADDRESS'
```

### 6. Update Contract ABI

After compiling the contract, copy the full ABI from `contracts/target/dev/contracts_ColorStark.contract_class.json` and update the `abi` field in `frontend/src/abi/color_stark.json`.

## Running the Application

### Start the Frontend

```bash
cd frontend
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Connect Wallet
- Use Argent X or Braavos, set to the same network as your contract (e.g., Sepolia or Devnet).
- Click "Connect Wallet" to link your wallet.

### Interact with the Game
- **Set Name**: Enter a name (max 31 chars) and set it on-chain.
- **Start Game**: Click "Start Game" to initialize a game with 5 colored bottles and a target configuration.
- **Swap Bottles**: Click two bottles to swap their positions off-chain, aiming to match the target.
- **Submit Result**: Click "Submit Result" to send your solution to the contract. If correct, you earn 10 points and the game ends.
- **End Game**: Click "End Game" to manually terminate an active game on-chain (no points awarded).
- **Leaderboard**: View all players' names, points, and moves, sorted by highest score.

## Building for Production

### Build the Frontend

```bash
cd frontend
yarn build
```

### Preview Locally

```bash
yarn start
```

### Deploy to Hosting (e.g., Vercel)
- Push the frontend directory to a Git repository.
- Import into Vercel and deploy.
- Set environment variables (e.g., `NEXT_PUBLIC_CONTRACT_ADDRESS`) in your Vercel dashboard.

## Testing

- **Contract Testing**: Write tests in `contracts/tests/` using Starknet Foundry. Run tests with:
  ```bash
  cd contracts
  scarb test
  ```
- **Testnet Testing**: Use Sepolia testnet with STRK tokens from a faucet (e.g., Starknet Faucet). Verify transactions on Starkscan or Voyager.

## Troubleshooting

- **Wallet Issues**: Ensure Argent X or Braavos is installed and set to the correct network. Check `window.starknet` in the browser console.
- **Devnet Issues**: Ensure `starknet-devnet` is running (v0.2.4). Use Docker if local setup fails.
- **Node/Scarb Issues**: Ensure you have the correct Node.js version and Scarb installed. If you encounter issues, check the official documentation for each tool.

## Features for Contributors

- **Randomized Bottles**: Integrate a StarkNet oracle for random bottle configurations.
- **NFT Rewards**: Add NFT-based rewards (e.g., unique bottle skins) via a separate contract.
- **Improved UX**: Add animations for bottle swaps
- **Leaderboard Optimization**: Use off-chain indexing (e.g., The Graph) for large-scale leaderboards.
- **Mainnet Deployment**: Deploy to StarkNet mainnet after thorough testing.

## Contributing

Contributions are welcome! Please:
- Use Prettier and ESLint for code formatting and linting.
- Open issues or pull requests for bugs, features, or improvements.
- Add frontend tests if possible (Jest, React Testing Library).

## Resources

- [Starknet-React Documentation](https://apibara.github.io/starknet-react/)
- [Starknet Documentation](https://docs.starknet.io/)
- [Scarb Documentation](https://docs.swmansion.com/scarb/)
- [Starknet Foundry Documentation](https://foundry-rs.github.io/starknet-foundry/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT License. See [LICENSE](LICENSE) for details.