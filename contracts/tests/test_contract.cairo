use contracts::{IColorStarkDispatcher, IColorStarkDispatcherTrait};
use snforge_std::{
    ContractClassTrait, DeclareResultTrait, declare, start_cheat_caller_address,
    stop_cheat_caller_address,
};
use starknet::testing::set_block_timestamp;
use starknet::{ClassHash, ContractAddress};
use super::*;

// Helper function to deploy the contract
fn deploy_contract() -> IColorStarkDispatcher {
    let contract = declare("ColorStark").unwrap().contract_class();
    let owner_address = owner();
    let (contract_address, _) = contract.deploy(@array![owner_address.into()]).unwrap();
    IColorStarkDispatcher { contract_address }
}

// Helper addresses
fn player1() -> ContractAddress {
    0x1.try_into().unwrap()
}

fn player2() -> ContractAddress {
    0x2.try_into().unwrap()
}

fn owner() -> ContractAddress {
    0x3.try_into().unwrap()
}

#[test]
fn test_set_player_name() {
    let contract = deploy_contract();

    // Set player name
    start_cheat_caller_address(contract.contract_address, player1());
    contract.set_player_name('Cece');

    // Verify name was set
    let name = contract.get_player_name(player1());
    assert(name == 'Cece', 'Name not set correctly');

    // Verify player was registered
    let all_players = contract.get_all_player_points();
    assert(all_players.len() == 1, 'Player not registered');
    assert(*all_players.at(0).address == player1(), 'Wrong player registered');
    assert(*all_players.at(0).name == 'Cece', 'Wrong name registered');
    assert(*all_players.at(0).points == 0, 'Initial points should be 0');

    stop_cheat_caller_address(contract.contract_address);
}

#[test]
fn test_multiple_players_registration() {
    let contract = deploy_contract();

    // Register first player
    start_cheat_caller_address(contract.contract_address, player1());
    contract.set_player_name('Cece');
    stop_cheat_caller_address(contract.contract_address);

    // Register second player
    start_cheat_caller_address(contract.contract_address, player2());
    contract.set_player_name('Olu');
    stop_cheat_caller_address(contract.contract_address);

    // Verify both players are registered
    let all_players = contract.get_all_player_points();
    assert(all_players.len() == 2, 'Both players not registered');

    // Check individual player points
    assert(contract.get_player_points(player1()) == 0, 'Player1 points wrong');
    assert(contract.get_player_points(player2()) == 0, 'Player2 points wrong');
}

#[test]
fn test_start_game() {
    let contract = deploy_contract();

    // Set player name first
    start_cheat_caller_address(contract.contract_address, player1());
    contract.set_player_name('Cece');

    // Set a specific timestamp for deterministic testing
    set_block_timestamp(12345);

    // Start game
    contract.start_game();

    // Get game state
    let (player, bottles, target, moves, is_active) = contract.get_game_state(1);

    // Verify game state
    assert(player == player1(), 'Wrong player');
    assert(bottles.len() == 5, 'Wrong number of bottles');
    assert(target.len() == 5, 'Wrong number of targets');
    assert(moves == 0, 'Initial moves should be 0');
    assert(is_active == true, 'Game should be active');

    stop_cheat_caller_address(contract.contract_address);
}

#[test]
#[should_panic(expected: ('Player already in game',))]
fn test_cannot_start_multiple_games() {
    let contract = deploy_contract();

    start_cheat_caller_address(contract.contract_address, player1());
    contract.set_player_name('Cece');

    // Start first game
    contract.start_game();

    // Try to start second game - should panic
    contract.start_game();

    stop_cheat_caller_address(contract.contract_address);
}

#[test]
fn test_end_game() {
    let contract = deploy_contract();

    start_cheat_caller_address(contract.contract_address, player1());
    contract.set_player_name('Cece');
    contract.start_game();

    // End the game
    contract.end_game(1);

    // Verify game is inactive
    let (_, _, _, _, is_active) = contract.get_game_state(1);
    assert(is_active == false, 'Game should be inactive');

    // Verify player can start new game
    contract.start_game();
    let (_, _, _, _, is_active_new) = contract.get_game_state(2);
    assert(is_active_new == true, 'New game should be active');

    stop_cheat_caller_address(contract.contract_address);
}


#[test]
fn test_leaderboard() {
    let contract = deploy_contract();

    // Register multiple players
    start_cheat_caller_address(contract.contract_address, player1());
    contract.set_player_name('Cece');
    stop_cheat_caller_address(contract.contract_address);

    start_cheat_caller_address(contract.contract_address, player2());
    contract.set_player_name('Olu');
    stop_cheat_caller_address(contract.contract_address);

    // Get leaderboard
    let leaderboard = contract.get_all_player_points();
    assert(leaderboard.len() == 2, 'Wrong leaderboard size');

    // Verify player data
    let cece_data = leaderboard.at(0);
    assert(*cece_data.address == player1(), 'Wrong Cece address');
    assert(*cece_data.name == 'Cece', 'Wrong Cece name');
    assert(*cece_data.points == 0, 'Wrong Cece points');

    let olu_data = leaderboard.at(1);
    assert(*olu_data.address == player2(), 'Wrong Olu address');
    assert(*olu_data.name == 'Olu', 'Wrong Olu name');
    assert(*olu_data.points == 0, 'Wrong Olu points');
}

#[test]
fn test_get_player_active_game() {
    let contract = deploy_contract();
    start_cheat_caller_address(contract.contract_address, player1());
    contract.set_player_name('Cece');
    contract.start_game();
    let game_id = contract.get_player_active_game(player1());
    assert(game_id == 1, 'Active game id should be 1');
    contract.end_game(1);
    let no_game = contract.get_player_active_game(player1());
    assert(no_game == 0, 'No active game after ending');
    stop_cheat_caller_address(contract.contract_address);
}

#[test]
fn test_get_next_game_id() {
    let contract = deploy_contract();
    start_cheat_caller_address(contract.contract_address, player1());
    contract.set_player_name('Cece');
    let next_id = contract.get_next_game_id();
    assert(next_id == 1, 'Next game id should be 1');
    contract.start_game();
    let next_id2 = contract.get_next_game_id();
    assert(next_id2 == 2, 'Next game id should increment');
    stop_cheat_caller_address(contract.contract_address);
}

#[test]
fn test_has_active_game() {
    let contract = deploy_contract();
    start_cheat_caller_address(contract.contract_address, player1());
    contract.set_player_name('Cece');
    assert(contract.has_active_game(player1()) == false, 'Should not have active game');
    contract.start_game();
    assert(contract.has_active_game(player1()) == true, 'Should have active game');
    contract.end_game(1);
    assert!(contract.has_active_game(player1()) == false, "Should not have active game after end");
    stop_cheat_caller_address(contract.contract_address);
}

#[test]
fn test_get_player_game_history() {
    let contract = deploy_contract();
    start_cheat_caller_address(contract.contract_address, player1());
    contract.set_player_name('Cece');
    contract.start_game();
    contract.end_game(1);
    contract.start_game();
    let history = contract.get_player_game_history(player1());
    assert!(history.len() == 2, "should have two games in history");
    stop_cheat_caller_address(contract.contract_address);
}


#[test]
#[should_panic(expected: ('Caller is not the owner',))]
fn test_upgrade_fails_for_non_owner() {
    let contract = deploy_contract();
    start_cheat_caller_address(contract.contract_address, player1());

    let new_class_hash: ClassHash = 0x1.try_into().unwrap();
    contract.upgrade(new_class_hash);
}


#[test]
fn test_upgrade_only_owner() {
    let contract = deploy_contract();
    start_cheat_caller_address(contract.contract_address, owner());

    let new_class_hash: ClassHash = 0x1.try_into().unwrap();
    contract.upgrade(new_class_hash);
    stop_cheat_caller_address(contract.contract_address);
}

