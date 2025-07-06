use core::array::Array;
use core::pedersen::pedersen;
use starknet::{ClassHash, ContractAddress};

pub mod types {
    use starknet::ContractAddress;
    // use core::serde::Serde;
    // use starknet::Store;

    #[derive(Copy, Drop, Serde, starknet::Store, PartialEq)]
    #[allow(starknet::store_no_default_variant)]
    pub enum Color {
        Red: u8,
        Blue: u8,
        Green: u8,
        Yellow: u8,
        Purple: u8,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    pub struct PlayerData {
        pub address: ContractAddress,
        pub name: felt252,
        pub points: u256,
        pub moves: u256,
    }
}
use contracts::types::{Color, PlayerData};

#[starknet::interface]
pub trait IColorStark<TContractState> {
    fn set_player_name(ref self: TContractState, name: felt252);
    fn start_game(ref self: TContractState);
    fn make_move(ref self: TContractState, game_id: u256, bottle_from: u8, bottle_to: u8);
    fn end_game(ref self: TContractState, game_id: u256);
    fn get_game_state(
        self: @TContractState, game_id: u256,
    ) -> (ContractAddress, Array<Color>, Array<Color>, u8, bool);
    fn get_correct_bottles(self: @TContractState, game_id: u256) -> u8;
    fn get_player_points(self: @TContractState, player: ContractAddress) -> u256;
    fn get_player_name(self: @TContractState, player: ContractAddress) -> felt252;
    fn get_all_player_points(self: @TContractState) -> Array<PlayerData>;

    // New functions for better frontend integration
    fn get_player_active_game(self: @TContractState, player: ContractAddress) -> u256;
    fn get_next_game_id(self: @TContractState) -> u256;
    fn has_active_game(self: @TContractState, player: ContractAddress) -> bool;
    fn get_player_game_history(self: @TContractState, player: ContractAddress) -> Array<u256>;

    fn upgrade(ref self: TContractState, new_class_hash: ClassHash);
}

#[starknet::contract]
pub mod ColorStark {
    use core::array::{Array, ArrayTrait};
    use core::pedersen::pedersen;
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::upgrades::upgradeable::UpgradeableComponent;
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use starknet::{ClassHash, ContractAddress, get_block_timestamp, get_caller_address};
    use super::{Color, PlayerData};

    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;

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

    #[derive(Copy, Drop, Serde, starknet::Store)]
    struct Game {
        player: ContractAddress,
        moves: u8,
        is_active: bool,
        seed: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        // Custom game events
        PlayerNameSet: PlayerNameSet,
        GameStarted: GameStarted,
        MoveMade: MoveMade,
        GameCompleted: GameCompleted,
        GameEnded: GameEnded,
    }

    #[derive(Drop, starknet::Event)]
    struct PlayerNameSet {
        #[key]
        player: ContractAddress,
        name: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct GameStarted {
        #[key]
        player: ContractAddress,
        #[key]
        game_id: u256,
        starting_bottles: Array<Color>,
        target_bottles: Array<Color>,
    }

    #[derive(Drop, starknet::Event)]
    struct MoveMade {
        #[key]
        player: ContractAddress,
        #[key]
        game_id: u256,
        bottle_from: u8,
        bottle_to: u8,
        moves: u8,
        correct_bottles: u8,
    }

    #[derive(Drop, starknet::Event)]
    struct GameCompleted {
        #[key]
        player: ContractAddress,
        #[key]
        game_id: u256,
        final_moves: u8,
        points_earned: u256,
        total_points: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct GameEnded {
        #[key]
        player: ContractAddress,
        #[key]
        game_id: u256,
        moves: u8,
        was_completed: bool,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.ownable.initializer(owner);
        self.next_game_id.write(1);
        self.player_count.write(0);
    }

    #[abi(embed_v0)]
    impl ColorStarkImpl of super::IColorStark<ContractState> {
        fn set_player_name(ref self: ContractState, name: felt252) {
            let player = get_caller_address();
            self.player_names.entry(player).write(name);
            if !self.is_player_registered(player) {
                let count = self.player_count.read();
                self.players.entry(count).write(player);
                self.player_count.write(count + 1);
            }

            self.emit(PlayerNameSet { player, name });
        }

        fn start_game(ref self: ContractState) {
            let player = get_caller_address();
            assert(!self.has_active_game(player), 'Player already in game');
            let game_id = self.next_game_id.read();

            let seed: u256 = pedersen(
                pedersen(get_block_timestamp().into(), player.into()), game_id.try_into().unwrap(),
            )
                .into();

            let colors = array![
                Color::Red(0), Color::Blue(1), Color::Green(2), Color::Yellow(3), Color::Purple(4),
            ];

            let shuffled_starting_colors = self.shuffle_colors(colors.clone(), seed);
            let shuffled_target_colors = self
                .shuffle_colors(colors, pedersen(seed.try_into().unwrap(), 'target').into());

            let game = Game { player, moves: 0, is_active: true, seed };

            let mut i: u8 = 0;
            while i < 5 {
                self.bottles.entry((game_id, i)).write(*shuffled_starting_colors.at(i.into()));
                self.target.entry((game_id, i)).write(*shuffled_target_colors.at(i.into()));
                i += 1;
            }

            self.game_state.entry(game_id).write(game);
            self.player_games.entry(player).write(game_id);
            self.next_game_id.write(game_id + 1);

            self
                .emit(
                    GameStarted {
                        player,
                        game_id,
                        starting_bottles: shuffled_starting_colors.clone(),
                        target_bottles: shuffled_target_colors.clone(),
                    },
                );
        }

        fn make_move(ref self: ContractState, game_id: u256, bottle_from: u8, bottle_to: u8) {
            let player = get_caller_address();
            let game = self.game_state.entry(game_id).read();
            assert(game.is_active, 'Game not active');
            assert(game.player == player, 'Not your game');
            assert(bottle_from < 5 && bottle_to < 5, 'Invalid bottle index');
            assert(bottle_from != bottle_to, 'Cannot swap same bottle');

            let color_from = self.bottles.entry((game_id, bottle_from)).read();
            let color_to = self.bottles.entry((game_id, bottle_to)).read();
            self.bottles.entry((game_id, bottle_from)).write(color_to);
            self.bottles.entry((game_id, bottle_to)).write(color_from);

            let mut game = game;
            game.moves += 1;
            self.game_state.entry(game_id).write(game);

            let moves = self.player_moves.entry(player).read();
            self.player_moves.entry(player).write(moves + 1);

            let correct = self.get_correct_bottles(game_id);

            self
                .emit(
                    MoveMade {
                        player,
                        game_id,
                        bottle_from,
                        bottle_to,
                        moves: game.moves,
                        correct_bottles: correct,
                    },
                );

            if correct == 5 {
                let current_points = self.player_points.entry(player).read();
                let points_earned = 10_u256;
                let new_total_points = current_points + points_earned;
                self.player_points.entry(player).write(new_total_points);
                let mut game = self.game_state.entry(game_id).read();
                game.is_active = false;
                self.game_state.entry(game_id).write(game);
                self.player_games.entry(player).write(0);

                self
                    .emit(
                        GameCompleted {
                            player,
                            game_id,
                            final_moves: game.moves,
                            points_earned,
                            total_points: new_total_points,
                        },
                    );
            }
        }

        fn end_game(ref self: ContractState, game_id: u256) {
            let player = get_caller_address();
            let mut game = self.game_state.entry(game_id).read();
            assert(game.is_active, 'Game not active');
            assert(game.player == player, 'Not your game');

            game.is_active = false;
            self.game_state.entry(game_id).write(game);
            self.player_games.entry(player).write(0);

            self.emit(GameEnded { player, game_id, moves: game.moves, was_completed: false });
        }

        fn get_game_state(
            self: @ContractState, game_id: u256,
        ) -> (ContractAddress, Array<Color>, Array<Color>, u8, bool) {
            let game = self.game_state.entry(game_id).read();
            let mut bottles = array![];
            let mut target = array![];
            let mut i: u8 = 0;
            while i < 5 {
                bottles.append(self.bottles.entry((game_id, i)).read());
                target.append(self.target.entry((game_id, i)).read());
                i += 1;
            }
            (game.player, bottles, target, game.moves, game.is_active)
        }

        fn get_correct_bottles(self: @ContractState, game_id: u256) -> u8 {
            let mut correct: u8 = 0;
            let mut i: u8 = 0;
            while i < 5 {
                if self
                    .bottles
                    .entry((game_id, i))
                    .read() == self
                    .target
                    .entry((game_id, i))
                    .read() {
                    correct += 1;
                }
                i += 1;
            }
            correct
        }

        fn get_player_points(self: @ContractState, player: ContractAddress) -> u256 {
            self.player_points.entry(player).read()
        }

        fn get_player_name(self: @ContractState, player: ContractAddress) -> felt252 {
            self.player_names.entry(player).read()
        }

        fn get_all_player_points(self: @ContractState) -> Array<PlayerData> {
            let mut result = array![];
            let count = self.player_count.read();
            let mut i: u256 = 0;
            while i < count {
                let player = self.players.entry(i).read();
                result
                    .append(
                        PlayerData {
                            address: player,
                            name: self.player_names.entry(player).read(),
                            points: self.player_points.entry(player).read(),
                            moves: self.player_moves.entry(player).read(),
                        },
                    );
                i += 1;
            }
            result
        }

        // functions for better frontend integration
        fn get_player_active_game(self: @ContractState, player: ContractAddress) -> u256 {
            self.player_games.entry(player).read()
        }

        fn get_next_game_id(self: @ContractState) -> u256 {
            self.next_game_id.read()
        }

        fn has_active_game(self: @ContractState, player: ContractAddress) -> bool {
            let game_id = self.player_games.entry(player).read();
            if game_id == 0 {
                return false;
            }
            let game = self.game_state.entry(game_id).read();
            game.is_active
        }

        fn get_player_game_history(self: @ContractState, player: ContractAddress) -> Array<u256> {
            let mut history = array![];
            let next_id = self.next_game_id.read();
            let mut i: u256 = 1;

            while i < next_id {
                let game = self.game_state.entry(i).read();
                if game.player == player {
                    history.append(i);
                }
                i += 1;
            }

            history
        }


        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.ownable.assert_only_owner();
            self.upgradeable.upgrade(new_class_hash);
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn is_player_registered(self: @ContractState, player: ContractAddress) -> bool {
            let count = self.player_count.read();
            let mut i: u256 = 0;
            let mut found = false;
            while i < count {
                if self.players.entry(i).read() == player {
                    found = true;
                    break;
                }
                i += 1;
            }
            found
        }

        fn shuffle_colors(self: @ContractState, colors: Array<Color>, seed: u256) -> Array<Color> {
            let mut shuffled = array![];
            let mut remaining = colors;
            let mut current_seed = seed;

            while !remaining.is_empty() {
                let len = remaining.len();
                let index: u32 = (current_seed % len.into()).try_into().unwrap();
                shuffled.append(*remaining.at(index));
                remaining = self.remove_at_index(remaining, index);
                current_seed = pedersen(current_seed.try_into().unwrap(), index.into()).into();
            }

            shuffled
        }

        fn remove_at_index(
            self: @ContractState, mut arr: Array<Color>, index: u32,
        ) -> Array<Color> {
            let mut result = array![];
            let mut i: u32 = 0;
            while i < arr.len() {
                if i != index {
                    result.append(*arr.at(i));
                }
                i += 1;
            }
            result
        }
    }
}
