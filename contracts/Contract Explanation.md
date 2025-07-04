# ColorStark Cairo 1.0 Contract Explained

## Overview

The `ColorStark` contract is a gamified application built in Cairo 1.0 on Starknet. It allows players to:

* Register with a name
* Start a color-matching game
* Swap colors to match a target configuration
* Earn points for solving the puzzle
* View their scores and rankings
* End the game manually if needed
* Upgrade the contract logic using OpenZeppelin components

### Latest Updates

**Frontend Integration Improvements**: Added dedicated functions for efficient game state management, eliminating the need for frontend applications to iterate through game IDs to find active games. These improvements provide instant game loading and seamless user experience.

---

## Imports

```rust
use starknet::{ContractAddress, ClassHash};
use core::array::Array;
use core::pedersen::pedersen;
```

* `ContractAddress`: Starknet address type.
* `ClassHash`: For contract upgrade logic.
* `Array`: Dynamic array from Cairo core.
* `pedersen`: Hashing function used for deterministic randomization.

---

## Module: `types`

Defines custom types:

### `Color` Enum

```rust
#[derive(Copy, Drop, Serde, starknet::Store, PartialEq)]
#[allow(starknet::store_no_default_variant)]
pub enum Color {
    Red: u8,
    Blue: u8,
    Green: u8,
    Yellow: u8,
    Purple: u8,
}
```

* Enum representing possible bottle colors.
* Implements traits for storage, serialization, copying, etc.

### `PlayerData` Struct

```rust
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct PlayerData {
    pub address: ContractAddress,
    pub name: felt252,
    pub points: u256,
}
```

* Contains metadata for each player.

---

## Interface Trait: `IColorStark`

Defines public contract methods:

### Core Game Functions
* `set_player_name` - Register player with a name
* `start_game` - Initialize a new color-matching game
* `make_move` - Swap bottle positions during gameplay
* `end_game` - Manually terminate an active game

### Game State Queries
* `get_game_state` - Retrieve complete game information
* `get_correct_bottles` - Count bottles in correct positions

### Player Data Functions
* `get_player_points` - Get player's total score
* `get_player_name` - Retrieve player's registered name
* `get_all_player_points` - Get leaderboard data

### Frontend Integration Functions
* `get_player_active_game` - Get player's current active game ID
* `get_next_game_id` - Get the next game ID to be assigned
* `has_active_game` - Check if player has an active game (boolean)
* `get_player_game_history` - Get all game IDs for a specific player

### Admin Functions
* `upgrade` - Upgrade contract implementation

---

## Contract Definition: `ColorStark`

### Storage

```rust
#[storage]
struct Storage {
    game_state: Map<u256, Game>,
    player_games: Map<ContractAddress, u256>,
    player_points: Map<ContractAddress, u256>,
    player_names: Map<ContractAddress, felt252>,
    players: Map<u256, ContractAddress>,
    player_count: u256,
    next_game_id: u256,
    bottles: Map<(u256, u8), Color>,
    target: Map<(u256, u8), Color>,
    
    #[substorage(v0)]
    upgradeable: UpgradeableComponent::Storage,
    #[substorage(v0)]
    ownable: OwnableComponent::Storage,
}
```

* Stores games, players, colors, scores, and OpenZeppelin subcomponents.

### Game Struct

```rust
#[derive(Copy, Drop, Serde, starknet::Store)]
struct Game {
    player: ContractAddress,
    moves: u8,
    is_active: bool,
    seed: u256,
}
```

* Tracks state for an individual game.

### Constructor

```rust
#[constructor]
fn constructor(ref self: ContractState) {
    let owner = get_caller_address();
    self.ownable.initializer(owner);
    self.next_game_id.write(1);
    self.player_count.write(0);
}
```

* Initializes the contract owner, and sets game and player counters.

---

## Contract Implementation: `ColorStarkImpl`

### `set_player_name`

* Saves player name
* Adds player to leaderboard if new

### `start_game`

* Validates player doesn't already have an active game using `has_active_game()`
* Initializes game with random color order using Pedersen hashing
* Stores both the game and target configurations

### `make_move`

* Swaps bottle colors
* Checks if player has won
* If complete, awards 10 points and ends the game

### `end_game`

* Allows players to manually end their game

### `get_game_state`

* Returns player, current bottles, target, move count, and status

### `get_correct_bottles`

* Counts how many bottles match the target

### `get_player_points` and `get_player_name`

* Return player's points or name

### `get_all_player_points`

* Builds leaderboard from all registered players

### `upgrade`

* Allows the contract owner to upgrade contract class

---

## New Frontend Integration Functions

These functions were added to streamline frontend integration and eliminate the need for inefficient game ID discovery patterns.

### `get_player_active_game`

```rust
fn get_player_active_game(self: @ContractState, player: ContractAddress) -> u256
```

* **Purpose**: Directly retrieve a player's current active game ID
* **Returns**: Game ID as u256 (returns 0 if no active game)
* **Benefits**: Eliminates need to iterate through all game IDs to find active games
* **Usage**: Frontend can instantly load the current game state

### `get_next_game_id`

```rust
fn get_next_game_id(self: @ContractState) -> u256
```

* **Purpose**: Get the next game ID that will be assigned when creating a new game
* **Returns**: The upcoming game ID as u256
* **Benefits**: Allows frontend to predict and track game creation
* **Usage**: Frontend can immediately set the correct game ID after calling `start_game`

### `has_active_game`

```rust
fn has_active_game(self: @ContractState, player: ContractAddress) -> bool
```

* **Purpose**: Check if a player currently has an active game
* **Returns**: Boolean indicating active game status
* **Benefits**: Simple validation without loading full game state
* **Usage**: Frontend can show appropriate UI (start game vs continue game)

### `get_player_game_history`

```rust
fn get_player_game_history(self: @ContractState, player: ContractAddress) -> Array<u256>
```

* **Purpose**: Retrieve all game IDs associated with a specific player
* **Returns**: Array of game IDs (both active and completed)
* **Benefits**: Enables game history features and analytics
* **Usage**: Frontend can display player's game history and statistics

## Integration Benefits

The addition of these functions transforms the frontend experience:

**Before**: Frontend had to iterate through potentially hundreds of game IDs to find a player's active game, leading to:
- Slow game loading times
- Unreliable state discovery
- Complex error handling
- Poor user experience

**After**: Frontend can directly query player-specific data, resulting in:
- Instant game state loading
- Reliable game ID tracking
- Clean, simple code
- Smooth user experience

---

## Internal Functions

### `is_player_registered`

* Scans all players to see if one is already registered

### `shuffle_colors`

* Performs deterministic shuffling using seed and Pedersen hash

### `remove_at_index`

* Removes one element from an array

---

## Game Flow Summary

1. Player registers with `set_player_name`
2. Starts a game with `start_game`
3. Makes moves via `make_move` to match colors
4. Earns 10 points if all bottles are correct
5. Can call `end_game` to quit manually
6. View progress with `get_game_state` or leaderboard with `get_all_player_points`

---

## Features Summary

* 🎮 Interactive game logic with shuffling and matching
* 🔒 Upgradability via OpenZeppelin
* 🧑‍🤝‍🧑 Leaderboard support
* 👑 Owner-only upgrade rights
* ⚡ Optimized frontend integration functions
* 🚀 Instant game state loading
---
