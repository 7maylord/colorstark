Color Bottle Matching Game
The Color Bottle Matching Game is a decentralized, on-chain game built on StarkNet, where players match colored bottles to a target configuration to earn points. Players can connect their StarkNet wallet, set a display name, start a game, swap bottles to match the target, and compete on a global leaderboard. The game uses a Cairo smart contract for game logic and a Next.js frontend with TypeScript and Starknet-React for a seamless user experience.
Features

Wallet Integration: Connect with Argent X or Braavos to interact with the game on StarkNet.
Player Profiles: Set a display name and track points earned from winning games.
Gameplay: Start a game with 5 colored bottles (Red, Blue, Green, Yellow, Purple), swap bottles to match a target configuration, and earn 10 points for a complete match.
Leaderboard: View all players’ names and points, sorted by highest score.
Responsive UI: Built with Next.js and Tailwind CSS for a modern, user-friendly interface.
Type Safety: Uses TypeScript for robust frontend development.

Project Structure
color-bottle-game/
├── contracts/
│   ├── src/
│   │   └── color_bottle_game.cairo
│   └── scarb.toml
├── frontend/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── WalletConnector.tsx
│   │   ├── PlayerInfo.tsx
│   │   ├── GameControls.tsx
│   │   ├── GameBoard.tsx
│   │   ├── Leaderboard.tsx
│   │   └── StarknetProvider.tsx
│   ├── hooks/
│   │   └── useStarknet.ts
│   ├── utils/
│   │   └── index.ts
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── tsconfig.json
├── README.md


contracts/: Contains the Cairo smart contract and Scarb configuration for building and deploying.
frontend/: Contains the Next.js frontend with TypeScript, Starknet-React, and Tailwind CSS.

Prerequisites

Node.js (v16 or later): Install Node.js
Yarn: Install globally with npm install -g yarn.
Starknet Wallet: Install Argent X or Braavos browser extension.
Scarb: Cairo build toolchain (Install Scarb).
Starknet Foundry (v0.38.2): For contract deployment (Install Starknet Foundry).
Starknet Devnet (v0.2.4): For local testing (Install Devnet).
Git: For cloning the repository.

Installation
1. Clone the Repository
git clone https://github.com/7mayord/colorstark.git
cd colorstark

2. Install Frontend Dependencies
Navigate to the frontend directory and install dependencies using Yarn:
cd frontend
yarn install

This installs:

@starknet-react/core, @starknet-react/chains, starknet for StarkNet integration.
next, react, react-dom for the frontend.
tailwindcss, postcss, autoprefixer for styling.
TypeScript and related type definitions.

3. Compile the Smart Contract
Navigate to the contract directory and compile the Cairo contract using Scarb:
cd contracts
scarb build

This generates the compiled contract and ABI in target/dev/.
4. Deploy the Smart Contract
Option 1: Local Devnet
Start a local StarkNet Devnet:
starknet-devnet

Declare and deploy the contract using Starknet Foundry’s sncast:
# Declare the contract
sncast --url http://localhost:5050 declare --contract-name ColorBottleGame

Note the class hash returned.
# Deploy the contract
sncast --url http://localhost:5050 deploy --class-hash <CLASS_HASH>

Note the contract address returned.
Option 2: Sepolia Testnet
Configure your StarkNet account:
export STARKNET_ACCOUNT=~/.starknet_accounts/starknet_open_zeppelin_accounts.json
export STARKNET_KEYSTORE=~/.starknet_accounts/starknet_open_zeppelin_key.json

Declare and deploy:
sncast --url https://api.starknet.io/v0_7_1 declare --contract-name ColorBottleGame
sncast --url https://api.starknet.io/v0_7_1 deploy --class-hash <CLASS_HASH>

5. Update Contract Address
Update the contractAddress in frontend/hooks/useStarknet.ts with the deployed contract address:
const contractAddress = 'YOUR_DEPLOYED_CONTRACT_ADDRESS'; // e.g., 0x123...

6. Update Contract ABI
After compiling the contract, copy the full ABI from contracts/target/dev/color_bottle_game_ColorBottleGame.contract_class.json and update the abi field in frontend/hooks/useStarknet.ts.
Running the Application

Start the Frontend:
cd frontend
yarn dev

Open http://localhost:3000 in your browser.

Connect Wallet:

Use Argent X or Braavos, set to the same network as your contract (e.g., Sepolia or Devnet).
Click “Connect Wallet” to link your wallet.


Interact with the Game:

Set Name: Enter a name (e.g., “Alice”) and click “Set Name” to update your leaderboard profile.
Start Game: Click “Start Game” to initialize a game with 5 colored bottles (Red, Blue, Green, Yellow, Purple) and a target configuration.
Make Moves: Click two bottles to swap their positions, aiming to match the target. Track moves and correct bottles (e.g., “3/5”).
Win Game: Match all 5 bottles to earn 10 points, automatically ending the game.
End Game: Click “End Game” to manually terminate an active game.
Leaderboard: View all players’ names and points, sorted by highest score.



Building for Production

Build the Frontend:
cd frontend
yarn build


Preview Locally:
yarn start


Deploy to Hosting (e.g., Vercel):

Push the frontend directory to a Git repository.
Import into Vercel and deploy, ensuring Yarn is selected as the package manager.
Set environment variables (e.g., NEXT_PUBLIC_CONTRACT_ADDRESS) in Vercel if needed.



Testing

Contract Testing: Write tests in contracts/src/tests/ using Starknet Foundry. Run tests with:
cd contracts
scarb test


Frontend Testing: Add unit tests with Jest in frontend. Install Jest:
yarn add --dev jest @testing-library/react @testing-library/jest-dom

Configure Jest and write tests for components like GameBoard.tsx.

Testnet Testing: Use Sepolia testnet with STRK tokens from a faucet (e.g., Starknet Faucet). Verify transactions on Starkscan or Voyager.


Troubleshooting

Wallet Issues: Ensure Argent X or Braavos is installed and set to the correct network. Check window.starknet in the browser console.
Contract Errors: Verify the contract address and ABI in useStarknet.ts. Debug transactions on Starkscan/Voyager.
Devnet Issues: Ensure starknet-devnet is running (v0.2.4). Use Docker if local setup fails.
TypeScript Errors: Run yarn build to catch type issues early.

Future Enhancements

Randomized Bottles: Integrate a StarkNet oracle for random bottle configurations.
NFT Rewards: Add NFT-based rewards (e.g., unique bottle skins) via a separate contract.
Improved UX: Add animations for bottle swaps and toast notifications for transaction status using react-toastify.
Leaderboard Optimization: Use off-chain indexing (e.g., The Graph) for large-scale leaderboards.
Mainnet Deployment: Deploy to StarkNet mainnet after thorough testing, updating StarknetProvider.tsx to use mainnet.

Resources

Starknet-React Documentation
Starknet Documentation
Scarb Documentation
Starknet Foundry Documentation
Next.js Documentation
Tailwind CSS Documentation

License
MIT License. See LICENSE for details.