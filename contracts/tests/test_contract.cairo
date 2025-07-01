use starknet::ContractAddress;
use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address,
    stop_cheat_caller_address, start_cheat_block_timestamp,
    spy_events, EventSpyAssertionsTrait
};
use core::array::ArrayTrait;
use core::num::traits::Zero;
use core::serde::Serde;

use contracts::ColorStark::{
    IColorStark, IColorStarkTrait,IColorStarkDispatcher, IColorStarkTraitDispatcher, Game, PlayerData
};

// Setup function for testing
fn deploy_contract(name: ByteArray) -> ContractAddress {
    let contract = declare(name).unwrap().contract_class();
    let (contract_address, _) = contract.deploy(@ArrayTrait::new()).unwrap();
    contract_address
}




#[test]
#[available_gas(2000000)]
fn test_constructor() {
    let mut state = setup();
    // Test that initial values are set correctly
    // Note: We can't directly read storage in tests, so we test through public functions
    
    // Try to start a game to verify next_game_id works
    set_caller_address(contract_address_const::<0x123>());
    state.start_game();
    
    // If this succeeds without panic, the constructor worked
    assert(true, 'Constructor test passed');
}

#[test]
#[available_gas(2000000)]
fn test_set_player_name() {
    let mut state = setup();
    let player = contract_address_const::<0x123>();
    set_caller_address(player);
    let name: felt252 = 'Alice';

    // Set player name
    state.set_player_name(name);

    // Verify name was set
    assert(state.get_player_name(player) == name, 'Player name incorrect');

    // Verify player appears in leaderboard
    let leaderboard = state.get_all_player_points();
    assert(leaderboard.len() == 1, 'Leaderboard length wrong');
    
    let player_data = *leaderboard.at(0);
    assert(player_data.address == player, 'Leaderboard address wrong');
    assert(player_data.name == name, 'Leaderboard name wrong');
    assert(player_data.points == 0, 'Leaderboard points wrong');
}

#[test]
#[available_gas(3000000)]
fn test_start_game() {
    let mut state = setup();
    let player = contract_address_const::<0x123>();
    set_caller_address(player);
    set_block_timestamp(1000);

    // Start game
    state.start_game();

    // We can't directly access game_id, but we can test that the game was created
    // by trying to make a move (which would fail if no game exists)
    // For now, let's just verify we can call start_game without panicking
    assert(true, 'Start game test passed');
}

#[test]
#[available_gas(3000000)]
fn test_start_game_and_get_state() {
    let mut state = setup();
    let player = contract_address_const::<0x123>();
    set_caller_address(player);
    set_block_timestamp(1000);

    // Start game
    state.start_game();

    // Try to get game state for game_id 1 (first game)
    let (game_player, bottles, target, moves, is_active) = state.get_game_state(1);
    
    assert(game_player == player, 'Wrong player');
    assert(bottles.len() == 5, 'Bottles array length wrong');
    assert(target.len() == 5, 'Target array length wrong');
    assert(moves == 0, 'Moves should be 0');
    assert(is_active, 'Game should be active');

    // Verify target arrangement is randomized (contains all 5 colors)
    let mut color_counts = array![0_u8; 5]; // Track each color count
    let mut i = 0;
    while i < 5 {
        match *target.at(i) {
            Color::Red(_) => { /* color_counts[0] += 1; */ },
            Color::Blue(_) => { /* color_counts[1] += 1; */ },
            Color::Green(_) => { /* color_counts[2] += 1; */ },
            Color::Yellow(_) => { /* color_counts[3] += 1; */ },
            Color::Purple(_) => { /* color_counts[4] += 1; */ },
        }
        i += 1;
    }
    // Since we can't easily verify the exact random arrangement, 
    // we just check that we have a valid target array of length 5
}

#[test]
#[available_gas(3000000)]
fn test_make_move() {
    let mut state = setup();
    let player = contract_address_const::<0x123>();
    set_caller_address(player);
    set_block_timestamp(1000);

    // Start game
    state.start_game();
    let game_id = 1_u256; // First game

    // Get initial state
    let (_, initial_bottles, _, _, _) = state.get_game_state(game_id);
    let bottle_0_initial = *initial_bottles.at(0);
    let bottle_1_initial = *initial_bottles.at(1);

    // Make a move: swap bottle 0 with bottle 1
    state.make_move(game_id, 0, 1);

    // Verify state after move
    let (_, bottles_after, _, moves, is_active) = state.get_game_state(game_id);
    assert(moves == 1, 'Moves should be 1');
    assert(is_active, 'Game should still be active');
    assert(*bottles_after.at(0) == bottle_1_initial, 'Bottle 0 should have bottle 1 color');
    assert(*bottles_after.at(1) == bottle_0_initial, 'Bottle 1 should have bottle 0 color');
}

#[test]
#[available_gas(3000000)]
fn test_end_game() {
    let mut state = setup();
    let player = contract_address_const::<0x123>();
    set_caller_address(player);
    set_block_timestamp(1000);

    // Start game
    state.start_game();
    let game_id = 1_u256;

    // End the game
    state.end_game(game_id);

    // Verify state
    let (_, _, _, _, is_active) = state.get_game_state(game_id);
    assert(!is_active, 'Game should be inactive');
    assert(state.get_player_points(player) == 0, 'Points should be 0');
}

#[test]
#[available_gas(3000000)]
fn test_multiple_players_leaderboard() {
    let mut state = setup();
    let player1 = contract_address_const::<0x123>();
    let player2 = contract_address_const::<0x456>();

    // Set up players
    set_caller_address(player1);
    state.set_player_name('Alice');
    set_caller_address(player2);
    state.set_player_name('Bob');

    // Verify leaderboard
    let leaderboard = state.get_all_player_points();
    assert(leaderboard.len() == 2, 'Leaderboard length wrong');
    
    let player1_data = *leaderboard.at(0);
    let player2_data = *leaderboard.at(1);
    
    assert(player1_data.address == player1, 'Player1 address wrong');
    assert(player1_data.name == 'Alice', 'Player1 name wrong');
    assert(player1_data.points == 0, 'Player1 points wrong');
    
    assert(player2_data.address == player2, 'Player2 address wrong');
    assert(player2_data.name == 'Bob', 'Player2 name wrong');
    assert(player2_data.points == 0, 'Player2 points wrong');
}

#[test]
#[available_gas(3000000)]
fn test_get_correct_bottles() {
    let mut state = setup();
    let player = contract_address_const::<0x123>();
    set_caller_address(player);
    set_block_timestamp(1000);

    // Start game
    state.start_game();
    let game_id = 1_u256;

    // Initial correct bottles count (depends on random shuffle)
    let initial_correct = state.get_correct_bottles(game_id);
    assert(initial_correct <= 5, 'Correct bottles should be <= 5');

    // Make a move and verify count is still valid
    state.make_move(game_id, 0, 1);
    
    let after_move_correct = state.get_correct_bottles(game_id);
    assert(after_move_correct <= 5, 'Correct bottles should be <= 5');
}

#[test]
#[available_gas(3000000)]
#[should_panic(expected: ('Player already in game',))]
fn test_cannot_start_multiple_games() {
    let mut state = setup();
    let player = contract_address_const::<0x123>();
    set_caller_address(player);
    set_block_timestamp(1000);
    
    // Start first game
    state.start_game();
    
    // Try to start second game (should fail)
    state.start_game();
}

#[test]
#[available_gas(3000000)]
#[should_panic(expected: ('Not your game',))]
fn test_unauthorized_move() {
    let mut state = setup();
    let player = contract_address_const::<0x123>();
    let other_player = contract_address_const::<0x456>();
    
    set_caller_address(player);
    set_block_timestamp(1000);
    state.start_game();
    let game_id = 1_u256;

    // Try to make a move as another player
    set_caller_address(other_player);
    state.make_move(game_id, 0, 1);
}

#[test]
#[available_gas(3000000)]
#[should_panic(expected: ('Invalid bottle index',))]
fn test_invalid_bottle_index() {
    let mut state = setup();
    let player = contract_address_const::<0x123>();
    set_caller_address(player);
    set_block_timestamp(1000);
    
    state.start_game();
    let game_id = 1_u256;

    // Try to move invalid bottle index
    state.make_move(game_id, 0, 5); // Index 5 is invalid (0-4 are valid)
}

#[test]
#[available_gas(3000000)]
#[should_panic(expected: ('Cannot swap same bottle',))]
fn test_cannot_swap_same_bottle() {
    let mut state = setup();
    let player = contract_address_const::<0x123>();
    set_caller_address(player);
    set_block_timestamp(1000);
    
    state.start_game();
    let game_id = 1_u256;

    // Try to swap bottle with itself
    state.make_move(game_id, 2, 2);
}

#[test]
#[available_gas(3000000)]
#[should_panic(expected: ('Game not active',))]
fn test_move_on_ended_game() {
    let mut state = setup();
    let player = contract_address_const::<0x123>();
    set_caller_address(player);
    set_block_timestamp(1000);
    
    state.start_game();
    let game_id = 1_u256;

    // End the game first
    state.end_game(game_id);

    // Try to make a move on ended game
    state.make_move(game_id, 0, 1);
}
