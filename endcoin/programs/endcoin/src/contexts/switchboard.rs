use anchor_lang::{prelude::*, solana_program};
use switchboard_solana::{AggregatorAccountData, AggregatorHistoryBuffer, SwitchboardDecimal};
use std::convert::TryInto;
use crate::errors::SwitchboardClientError;

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ReadFeedParams {
pub max_confidence_interval: Option<f64>,
}

// READ FEED
#[derive(Accounts)]
#[instruction(params: ReadFeedParams)]
pub struct Switchboard<'info> {
pub aggregator: AccountLoader<'info, AggregatorAccountData>,
}

// READ HISTORY
#[derive(Accounts)]
#[instruction(params: ReadHistoryParams)]
pub struct SwitchboardHistory<'info> {
#[account(
    has_one = history_buffer @ SwitchboardClientError::InvalidHistoryBuffer
)]
pub aggregator: AccountLoader<'info, AggregatorAccountData>,
/// CHECK: verified in the aggregator has_one check
pub history_buffer: AccountInfo<'info>,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ReadHistoryParams {
pub timestamp: Option<i64>,
}

impl<'info> Switchboard<'info> {
pub fn read_feed(&mut self, params: ReadFeedParams) -> Result<()> {
    let feed = &self.aggregator.load()?;

    // get result
    let val: f64 = feed.get_result()?.try_into()?;

    // check whether the feed has been updated in the last 300 seconds
    feed.check_staleness(
        solana_program::clock::Clock::get().unwrap().unix_timestamp,
        300,
    )
    .map_err(|_| error!(SwitchboardClientError::StaleFeed))?;

    // check feed does not exceed max_confidence_interval
    if let Some(max_confidence_interval) = params.max_confidence_interval {
        feed.check_confidence_interval(SwitchboardDecimal::from_f64(max_confidence_interval))
            .map_err(|_| error!(SwitchboardClientError::ConfidenceIntervalExceeded))?;
    }

    msg!("Current feed result is {}!", val);

    Ok(())
}
}
impl<'info> SwitchboardHistory<'info> {
pub fn read_history(&mut self, params: ReadHistoryParams) -> Result<()> {
    let history_buffer = AggregatorHistoryBuffer::new(&self.history_buffer)?;

    let timestamp: i64;
    if let Some(i) = params.timestamp {
        timestamp = i;
    } else {
        // one hour ago
        timestamp = Clock::get()?.unix_timestamp - 3600;
    }

    let value_at_timestamp: f64 = history_buffer
        .lower_bound(timestamp)
        .unwrap()
        .value
        .try_into()?;
    msg!("Result {:?}!", value_at_timestamp);

    Ok(())
}
}

