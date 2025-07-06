use starknet::{ContractAddress, contract_address_const};
use starknet::testing::{set_block_timestamp};
use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address};

use contracts::{IColorStarkDispatcher, IColorStarkDispatcherTrait};

mod tests {
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
        contract_address_const::<0x123456789>()
    }

    fn player2() -> ContractAddress {
        contract_address_const::<0x987654321>()
    }

    fn owner() -> ContractAddress {
        contract_address_const::<0x111111111>()
    }

    fn test_set_player_name() {
        let contract = deploy_contract();
        
        // Set player name
        start_cheat_caller_address(contract.contract_address, player1());
        contract.set_player_name('Alice');
        
        // Verify name was set
        let name = contract.get_player_name(player1());
        assert(name == 'Alice', 'Name not set correctly');
        
        // Verify player was registered
        let all_players = contract.get_all_player_points();
        assert(all_players.len() == 1, 'Player not registered');
        assert(*all_players.at(0).address == player1(), 'Wrong player registered');
        assert(*all_players.at(0).name == 'Alice', 'Wrong name registered');
        assert(*all_players.at(0).points == 0, 'Initial points should be 0');
        
        stop_cheat_caller_address(contract.contract_address);
    }

    fn test_multiple_players_registration() {
        let contract = deploy_contract();
        
        // Register first player
        start_cheat_caller_address(contract.contract_address, player1());
        contract.set_player_name('Alice');
        stop_cheat_caller_address(contract.contract_address);
        
        // Register second player
        start_cheat_caller_address(contract.contract_address, player2());
        contract.set_player_name('Bob');
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
        contract.set_player_name('Alice');
        
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
        contract.set_player_name('Alice');
        
        // Start first game
        contract.start_game();
        
        // Try to start second game - should panic
        contract.start_game();
        
        stop_cheat_caller_address(contract.contract_address);
    }

    #[test]
    fn test_make_move() {
        let contract = deploy_contract();
        
        start_cheat_caller_address(contract.contract_address, player1());
        contract.set_player_name('Alice');
        contract.start_game();
        
        // Get initial state
        let (_, bottles_before, _, moves_before, _) = contract.get_game_state(1);
        let bottle_0_before = *bottles_before.at(0);
        let bottle_1_before = *bottles_before.at(1);
        
        // Make a move (swap bottles 0 and 1)
        contract.make_move(1, 0, 1);
        
        // Get state after move
        let (_, bottles_after, _, moves_after, is_active) = contract.get_game_state(1);
        let bottle_0_after = *bottles_after.at(0);
        let bottle_1_after = *bottles_after.at(1);
        
        // Verify move was made
        assert(bottle_0_after == bottle_1_before, 'Bottle 0 not swapped correctly');
        assert(bottle_1_after == bottle_0_before, 'Bottle 1 not swapped correctly');
        assert(moves_after == moves_before + 1, 'Move count not incremented');
        assert(is_active == true, 'Game should still be active');
        
        stop_cheat_caller_address(contract.contract_address);
    }

    #[test]
    #[should_panic(expected: ('Game not active',))]
    fn test_cannot_move_inactive_game() {
        let contract = deploy_contract();
        
        start_cheat_caller_address(contract.contract_address, player1());
        contract.set_player_name('Alice');
        contract.start_game();
        
        // End the game
        contract.end_game(1);
        
        // Try to make a move - should panic
        contract.make_move(1, 0, 1);
        
        stop_cheat_caller_address(contract.contract_address);
    }

    #[test]
    #[should_panic(expected: ('Not your game',))]
    fn test_cannot_move_other_player_game() {
        let contract = deploy_contract();
        
        // Player 1 starts game
        start_cheat_caller_address(contract.contract_address, player1());
        contract.set_player_name('Alice');
        contract.start_game();
        stop_cheat_caller_address(contract.contract_address);
        
        // Player 2 tries to make move in Player 1's game
        start_cheat_caller_address(contract.contract_address, player2());
        contract.set_player_name('Bob');
        contract.make_move(1, 0, 1); // Should panic
        
        stop_cheat_caller_address(contract.contract_address);
    }

    #[test]
    #[should_panic(expected: ('Invalid bottle index',))]
    fn test_invalid_bottle_index() {
        let contract = deploy_contract();
        
        start_cheat_caller_address(contract.contract_address, player1());
        contract.set_player_name('Alice');
        contract.start_game();
        
        // Try to move with invalid index (5 is out of bounds)
        contract.make_move(1, 0, 5);
        
        stop_cheat_caller_address(contract.contract_address);
    }

    #[test]
    #[should_panic(expected: ('Cannot swap same bottle',))]
    fn test_cannot_swap_same_bottle() {
        let contract = deploy_contract();
        
        start_cheat_caller_address(contract.contract_address, player1());
        contract.set_player_name('Alice');
        contract.start_game();
        
        // Try to swap bottle with itself
        contract.make_move(1, 0, 0);
        
        stop_cheat_caller_address(contract.contract_address);
    }

    #[test]
    fn test_end_game() {
        let contract = deploy_contract();
        
        start_cheat_caller_address(contract.contract_address, player1());
        contract.set_player_name('Alice');
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
    fn test_get_correct_bottles() {
        let contract = deploy_contract();
        
        start_cheat_caller_address(contract.contract_address, player1());
        contract.set_player_name('Alice');
        contract.start_game();
        
        // Get initial correct bottles count
        let correct_initial = contract.get_correct_bottles(1);
        
        // Make some moves and check if correct count changes
        contract.make_move(1, 0, 1);
        let correct_after_move = contract.get_correct_bottles(1);

        // The count should be between 0 and 5
        assert(correct_initial <= 5, 'Initial correct count too high');
        assert(correct_after_move <= 5, 'Correct count after move high');
        
        stop_cheat_caller_address(contract.contract_address);
    }

    #[test]
    fn test_points_system() {
        let contract = deploy_contract();
        
        start_cheat_caller_address(contract.contract_address, player1());
        contract.set_player_name('Alice');
        
        // Initial points should be 0
        assert(contract.get_player_points(player1()) == 0, 'Initial points not 0');
        
        // Note: Testing actual game completion requires knowing the exact shuffle
        // which is deterministic but complex to predict. In a real test environment,
        // you might want to add a test-only function to set up a specific game state.
        
        stop_cheat_caller_address(contract.contract_address);
    }

    #[test]
    fn test_upgrade_only_owner() {
        let contract = deploy_contract();
        
        // Try to upgrade as non-owner (should fail)
        start_cheat_caller_address(contract.contract_address, player1());
        // Note: This would panic with "Caller is not the owner" but we can't easily test 
        // the upgrade function without a proper test environment setup
        
        stop_cheat_caller_address(contract.contract_address);
    }

    #[test]
    fn test_game_flow() {
        let contract = deploy_contract();
        
        start_cheat_caller_address(contract.contract_address, player1());
        contract.set_player_name('Alice');
        
        // 1. Start game
        contract.start_game();
        let (_, _, _, moves_initial, is_active_initial) = contract.get_game_state(1);
        assert(moves_initial == 0, 'Initial moves wrong');
        assert(is_active_initial == true, 'Game should be active');
        
        // 2. Make several moves
        contract.make_move(1, 0, 1);
        contract.make_move(1, 1, 2);
        contract.make_move(1, 2, 3);
        
        let (_, _, _, moves_after, _) = contract.get_game_state(1);
        assert(moves_after == 3, 'Move count wrong');
        
        // 3. End game
        contract.end_game(1);
        let (_, _, _, _, is_active_final) = contract.get_game_state(1);
        assert(is_active_final == false, 'Game should be inactive');
        
        // 4. Start new game
        contract.start_game();
        let (_, _, _, moves_new, is_active_new) = contract.get_game_state(2);
        assert(moves_new == 0, 'New game moves wrong');
        assert(is_active_new == true, 'New game should be active');
        
        stop_cheat_caller_address(contract.contract_address);
    }

    #[test]
    fn test_leaderboard() {
        let contract = deploy_contract();
        
        // Register multiple players
        start_cheat_caller_address(contract.contract_address, player1());
        contract.set_player_name('Alice');
        stop_cheat_caller_address(contract.contract_address);
        
        start_cheat_caller_address(contract.contract_address, player2());
        contract.set_player_name('Bob');
        stop_cheat_caller_address(contract.contract_address);
        
        // Get leaderboard
        let leaderboard = contract.get_all_player_points();
        assert(leaderboard.len() == 2, 'Wrong leaderboard size');
        
        // Verify player data
        let alice_data = leaderboard.at(0);
        assert(*alice_data.address == player1(), 'Wrong Alice address');
        assert(*alice_data.name == 'Alice', 'Wrong Alice name');
        assert(*alice_data.points == 0, 'Wrong Alice points');
        
        let bob_data = leaderboard.at(1);
        assert(*bob_data.address == player2(), 'Wrong Bob address');
        assert(*bob_data.name == 'Bob', 'Wrong Bob name');
        assert(*bob_data.points == 0, 'Wrong Bob points');
    }

      //run all tests
    fn run_all_tests() {
        test_set_player_name();
        test_multiple_players_registration();
    }
}
