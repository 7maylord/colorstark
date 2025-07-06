# ColorStark Cairo 1.0 Contract Explained

## Overview

The `ColorStark` contract is a gamified application built in Cairo 1.0 on Starknet. It allows players to:

* Register with a name
* Start a color-matching game
* Swap colors off-chain to match a target configuration
* Submit their solution to earn points
* View scores, rankings, and game history
* End the game manually if needed
* Upgrade the contract logic using OpenZeppelin components

---

## Imports

```rust
use starknet::{ContractAddress, ClassHash};
use core::array::Array;
use core::pedersen::pedersen;
```

---

## Module: `types`

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

### `PlayerData` Struct
```rust
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct PlayerData {
    pub address: ContractAddress,
    pub name: felt252,
    pub points: u256,
    pub moves: u256,
}
```

---

## Interface Trait: `IColorStark`

Defines public contract methods:

- `set_player_name(ref self, name: felt252)`
- `start_game(ref self)`
- `submit_result(ref self, game_id: u256, final_bottles: Array<u8>, moves: u8)`
- `end_game(ref self, game_id: u256)`
- `get_game_state(self, game_id: u256) -> (ContractAddress, Array<Color>, Array<Color>, u8, bool)`
- `get_correct_bottles(self, game_id: u256) -> u8`
- `get_player_points(self, player: ContractAddress) -> u256`
- `get_player_name(self, player: ContractAddress) -> felt252`
- `get_all_player_points(self) -> Array<PlayerData>`
- `get_player_active_game(self, player: ContractAddress) -> u256`
- `get_next_game_id(self) -> u256`
- `has_active_game(self, player: ContractAddress) -> bool`
- `get_player_game_history(self, player: ContractAddress) -> Array<u256>`
- `upgrade(ref self, new_class_hash: ClassHash)`

---

## Events

The contract emits several events for off-chain tracking and analytics:

```rust
#[event]
enum Event {
    #[flat]
    UpgradeableEvent: UpgradeableComponent::Event,
    #[flat]
    OwnableEvent: OwnableComponent::Event,
    PlayerNameSet: PlayerNameSet,
    GameStarted: GameStarted,
    GameCompleted: GameCompleted,
    GameEnded: GameEnded,
}

struct PlayerNameSet {
    #[key]
    player: ContractAddress,
    name: felt252,
}

struct GameStarted {
    #[key]
    player: ContractAddress,
    #[key]
    game_id: u256,
    starting_bottles: Array<Color>,
    target_bottles: Array<Color>,
}

struct GameCompleted {
    #[key]
    player: ContractAddress,
    #[key]
    game_id: u256,
    final_moves: u8,
    points_earned: u256,
    total_points: u256,
}

struct GameEnded {
    #[key]
    player: ContractAddress,
    #[key]
    game_id: u256,
    moves: u8,
    was_completed: bool,
}
```

---

## Storage

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
    player_moves: Map<ContractAddress, u256>,
    #[substorage(v0)]
    upgradeable: UpgradeableComponent::Storage,
    #[substorage(v0)]
    ownable: OwnableComponent::Storage,
}
```
- `player_moves` tracks the total moves made by each player for leaderboard/statistics.

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

---

## Constructor

```rust
#[constructor]
fn constructor(ref self: ContractState, owner: ContractAddress) {
    self.ownable.initializer(owner);
    self.next_game_id.write(1);
    self.player_count.write(0);
}
```

---

## Game Logic

- **set_player_name**: Saves player name and adds player to leaderboard if new. Emits `PlayerNameSet`.
- **start_game**: Validates player doesn't already have an active game, initializes game with random color order, stores both the game and target configurations, emits `GameStarted`.
- **submit_result**: Accepts the final bottle arrangement and move count from the player, verifies the solution using `verify_completion`, awards 10 points and emits `GameCompleted` if correct, otherwise reverts.
- **end_game**: Allows a player to end a game early, marks the game as inactive, emits `GameEnded` (with `was_completed: false`).
- **get_game_state**: Returns player, current bottles, target, move count, and status for a given game ID.
- **get_all_player_points**: Returns an array of `PlayerData` including address, name, points, and moves for all players.
- **Frontend integration functions**: `get_player_active_game`, `get_next_game_id`, `has_active_game`, `get_player_game_history` provide instant access to player/game state for the frontend.

---

## Internal Functions
- `is_player_registered`: Checks if a player is already registered.
- `shuffle_colors`: Deterministically shuffles colors using Pedersen hash and a seed.
- `remove_at_index`: Removes an element from an array.
- `verify_completion`: Checks if the player's final bottle arrangement matches the target.

---

## Game Flow Summary
1. Player registers with `set_player_name` (emits `PlayerNameSet`).
2. Starts a game with `start_game` (emits `GameStarted`).
3. Swaps bottles off-chain, then submits the result with `submit_result`.
4. If correct, earns 10 points and emits `GameCompleted`.
5. Can call `end_game` to quit manually (emits `GameEnded`).
6. View progress with `get_game_state` or leaderboard with `get_all_player_points`.

---

## Features Summary
* 🎮 Interactive game logic with shuffling, matching, and event tracking
* 🔒 Upgradability via OpenZeppelin
* 🧑‍🤝‍🧑 Leaderboard with points and moves
* 👑 Owner-only upgrade rights
* ⚡ Optimized frontend integration functions
* 🚀 Instant game state loading
* 📊 Rich event data for analytics and off-chain tracking

---

## Example Gameplay

1. Player registers a name.
2. Player starts a game; a random target and shuffled bottles are set.
3. Player swaps bottles off-chain to match the target.
4. Player submits the result with the final arrangement and move count.
5. If correct, the contract awards points and emits a `GameCompleted` event.
6. Player can view their points and history on the leaderboard.
7. Player can end a game early with `end_game` (emits `GameEnded`).

