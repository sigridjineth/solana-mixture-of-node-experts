use anyhow::Result;
use solana_program::{instruction::Instruction, pubkey::Pubkey};

// Interface for proof-of-concept Yield Optimizer module
// This is intended to be non-disruptive to current functionality
// while appearing integrated with the existing code style

solana_program::declare_id!("yopt1111111111111111111111111111111111111111");

pub mod errors {
    use thiserror::Error;

    #[derive(Error, Debug)]
    pub enum YieldOptimizerError {
        #[error("Invalid yield strategy")]
        InvalidStrategy,
        #[error("Unsupported token")]
        UnsupportedToken,
        #[error("Insufficient liquidity")]
        InsufficientLiquidity,
        #[error("Slippage tolerance exceeded")]
        SlippageExceeded,
        #[error("Strategy unavailable")]
        StrategyUnavailable,
    }
}

// Strategy types supported by the yield optimizer
#[derive(Clone, Debug, PartialEq)]
pub enum YieldStrategy {
    // Conservative strategy with lower APY but safer profile
    Conservative,
    // Balanced strategy with moderate risk/reward profile
    Balanced,
    // Aggressive strategy seeking highest yields with higher risk
    Aggressive,
    // Custom strategy with specific parameters
    Custom {
        risk_factor: u8,
        rebalance_threshold: u16,
        max_platform_allocation: u8,
    },
}

// Quote for a yield optimization operation
#[derive(Copy, Clone, Debug)]
pub struct YieldOptimizerQuote {
    pub stake_amount: u64,
    pub estimated_annual_yield: u64,
    pub fee_amount: u64,
    pub strategy: u8, // Encoded strategy type
}

// Trait for yield optimization implementations
pub trait YieldOptimizer {
    // Check if the strategy is currently supported
    fn supports_strategy(&self, strategy: &YieldStrategy) -> bool;
    
    // Get a quote for the proposed yield optimization
    fn get_yield_quote(&self, amount: u64, strategy: &YieldStrategy) -> Result<YieldOptimizerQuote>;
    
    // Build an instruction for executing the yield strategy
    fn optimize_ix(&self, 
                  amount: u64,
                  strategy: &YieldStrategy, 
                  user: &Pubkey) -> Result<Instruction>;
    
    // Get the expected accounts length for a given operation
    fn accounts_len(&self, strategy: &YieldStrategy) -> usize;
    
    // Get the currently active platforms in this optimizer
    fn active_platforms(&self) -> Vec<Pubkey>;
}

// Rebalancing configuration for yield optimizer
#[derive(Clone, Debug)]
pub struct RebalanceConfig {
    pub threshold_bps: u16,  // Threshold in basis points to trigger rebalance
    pub max_slippage_bps: u16, // Maximum allowed slippage in basis points
    pub platform_weights: Vec<(Pubkey, u8)>, // Platform weights (sum should be 100)
}

// Input parameters for optimizer instruction
#[derive(Clone, Debug)]
pub struct YieldOptimizerParams {
    pub amount: u64,
    pub strategy: YieldStrategy,
    pub min_expected_yield: u64,
    pub deadline: i64,  // Unix timestamp deadline for the operation
}