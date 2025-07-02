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

* `set_player_name`
* `start_game`
* `make_move`
* `end_game`
* `get_game_state`
* `get_correct_bottles`
* `get_player_points`
* `get_player_name`
* `get_all_player_points`
* `upgrade`

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

---
