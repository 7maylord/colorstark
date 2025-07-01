use starknet::{ContractAddress, ClassHash};
use core::array::{Array, array};

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
    fn upgrade(ref self: TContractState, new_class_hash: ClassHash);
}

#[starknet::contract]
pub mod ColorStark {
    use core::array::ArrayTrait;
    use core::pedersen::pedersen;
    use starknet::{ContractAddress, get_caller_address, ClassHash};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess, Map, StoragePathEntry};

    use openzeppelin::upgrades::upgradeable::UpgradeableComponent;
    use openzeppelin::access::ownable::OwnableComponent;

    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        game_state: Map<u256, Game>,
        player_games: Map<ContractAddress, u256>,
        player_points: Map<ContractAddress, u256>,
        player_names: Map<ContractAddress, felt252>,
        players: Map<u256, ContractAddress>,
        player_count: u256,
        next_game_id: u256,

        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    struct Game {
        player: ContractAddress,
        bottles: Map<u8, Color>,
        target: Map<u8, Color>,
        moves: u8,
        is_active: bool,
        seed: felt252,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    enum Color {
        Red: u8,
        Blue: u8,
        Green: u8,
        Yellow: u8,
        Purple: u8,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    struct PlayerData {
        address: ContractAddress,
        name: felt252,
        points: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        self.ownable.initializer(owner);
        self.next_game_id.write(1);
        self.player_count.write(0);
    }

    #[abi(embed_v0)]
    impl ColorStarkImpl of super::IColorStark<ContractState> {
        fn set_player_name(ref self: ContractState, name: felt252) {
            let player = get_caller_address();
            self.player_names.write(player, name);
            if !self.is_player_registered(player) {
                let count = self.player_count.read();
                self.players.write(count, player);
                self.player_count.write(count + 1);
            }
        }

        fn start_game(ref self: ContractState) {
            let player = get_caller_address();
            assert(self.player_games.read(player) == 0, 'Player already in game');
            let game_id = self.next_game_id.read();

            // Create randomness from block timestamp, player address, and game_id
            let seed = pedersen(
                pedersen(starknet::get_block_timestamp().into(), player.into()), game_id,
            );

            let colors = array![
                Color::Red(0), Color::Blue(1), Color::Green(2), Color::Yellow(3), Color::Purple(4),
            ];

            // Generate two different random arrangements
            let shuffled_starting_colors = self.shuffle_colors(colors.clone(), seed);
            let shuffled_target_colors = self.shuffle_colors(colors, pedersen(seed, 'target'));

            let mut game = Game {
                player,
                bottles: Map::default(),
                target: Map::default(),
                moves: 0,
                is_active: true,
                seed,
            };

            // Set both arrangements as random
            let mut i: u8 = 0;
            while i < 5 {
                game.bottles.write(i, *shuffled_starting_colors.at(i.into()));
                game.target.write(i, *shuffled_target_colors.at(i.into()));
                i += 1;
            }

            self.game_state.write(game_id, game);
            self.player_games.write(player, game_id);
            self.next_game_id.write(game_id + 1);
        }

        fn make_move(ref self: ContractState, game_id: u256, bottle_from: u8, bottle_to: u8) {
            let player = get_caller_address();
            let mut game = self.game_state.read(game_id);
            assert(game.is_active, 'Game not active');
            assert(game.player == player, 'Not your game');
            assert(bottle_from < 5 && bottle_to < 5, 'Invalid bottle index');
            assert(bottle_from != bottle_to, 'Cannot swap same bottle');

            // Perform the swap
            let color_from = game.bottles.read(bottle_from);
            let color_to = game.bottles.read(bottle_to);
            game.bottles.write(bottle_from, color_to);
            game.bottles.write(bottle_to, color_from);
            game.moves += 1;

            // Update the game state
            self.game_state.write(game_id, game);

            // Check if puzzle is solved
            let correct = self.get_correct_bottles(game_id);
            if correct == 5 {
                let current_points = self.player_points.read(player);
                self.player_points.write(player, current_points + 10);

                // End the game
                game.is_active = false;
                self.game_state.write(game_id, game);
                self.player_games.write(player, 0);
            }
        }

        fn end_game(ref self: ContractState, game_id: u256) {
            let player = get_caller_address();
            let mut game = self.game_state.read(game_id);
            assert(game.is_active, 'Game not active');
            assert(game.player == player, 'Not your game');

            game.is_active = false;
            self.game_state.write(game_id, game);
            self.player_games.write(player, 0);
        }

        fn get_game_state(
            self: @ContractState, game_id: u256,
        ) -> (ContractAddress, Array<Color>, Array<Color>, u8, bool) {
            let game = self.game_state.read(game_id);
            let mut bottles = array![];
            let mut target = array![];
            let mut i: u8 = 0;
            while i < 5 {
                bottles.append(game.bottles.read(i));
                target.append(game.target.read(i));
                i += 1;
            }
            (game.player, bottles, target, game.moves, game.is_active)
        }

        fn get_correct_bottles(self: @ContractState, game_id: u256) -> u8 {
            let game = self.game_state.read(game_id);
            let mut correct: u8 = 0;
            let mut i: u8 = 0;
            while i < 5 {
                if game.bottles.read(i) == game.target.read(i) {
                    correct += 1;
                }
                i += 1;
            }
            correct
        }

        fn get_player_points(self: @ContractState, player: ContractAddress) -> u256 {
            self.player_points.read(player)
        }

        fn get_player_name(self: @ContractState, player: ContractAddress) -> felt252 {
            self.player_names.read(player)
        }

        fn get_all_player_points(self: @ContractState) -> Array<PlayerData> {
            let mut result = array![];
            let count = self.player_count.read();
            let mut i: u256 = 0;
            while i < count {
                let player = self.players.read(i);
                result
                    .append(
                        PlayerData {
                            address: player,
                            name: self.player_names.read(player),
                            points: self.player_points.read(player),
                        },
                    );
                i += 1;
            }
            result
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
                if self.players.read(i) == player {
                    found = true;
                    break;
                }
                i += 1;
            }
            found
        }

        fn shuffle_colors(
            self: @ContractState, colors: Array<Color>, seed: felt252,
        ) -> Array<Color> {
            let mut shuffled = array![];
            let mut remaining = colors;
            let mut current_seed = seed;

            while !remaining.is_empty() {
                let len: u32 = remaining.len();
                let index: u32 = (current_seed.into() % len.into()).try_into().unwrap();
                shuffled.append(*remaining.at(index));
                remaining = self.remove_at_index(remaining, index);
                current_seed = pedersen(current_seed, index.into());
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
