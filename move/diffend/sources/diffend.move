/// Module: diffend
module diffend::diffend {
    use std::string::{String, utf8};
    use sui::random::Random;
  	use sui::random;
    use sui::balance::{Balance, zero};
    use sui::sui::SUI;
    use sui::coin::{ Coin};
    use sui::coin::{into_balance, from_balance};
    use sui::{clock::Clock};

    const USER_HAS_JOINED: u64 = 1;
    const BET_NOT_ENOUGH: u64 = 2;
    const DIFF_HAS_ENDED: u64 = 3;
    const DIFF_HAS_NOT_ENDED: u64 = 4;
    const REWARD_CLAIMED: u64 = 5;
    const CAN_NOT_VOTE_SELF: u64 = 6;
    const VOTE_NOT_FOUND: u64 = 7;
    // share the bet reward to voters
    const Share_Rate: u64 = 10;

    //divergence
    public struct Diff has key, store {
        id: UID,
        title: String,
        desc: String,
        user_a: address,
        user_b: address,
        desc_a: String,
        desc_b: String,
        bet_amount: u64,
        bet_a: u64,
        bet_b: u64,
        end_timestamp_ms: u64,
        is_random: bool,
        winner: address,
        reward_claimed: bool,
        votes: vector<Vote>,
    }

    public struct History has key, store {
        id: UID,
        record: vector<Diff>,
    }

    public struct Pool has key, store {
        id: UID,
        balance: Balance<SUI>,
    }

    public struct Vote has key, store {
        id: UID,
        user: address,
        desc: String,
        vote: address,
        claim_reward: bool,
    }

    public struct DIFFEND has drop {}

    fun init(_witness: DIFFEND, ctx: &mut TxContext) {
        let history = History {
            id: object::new(ctx),
            record: vector::empty<Diff>(),
        };
        let pool = Pool {
            id: object::new(ctx),
            balance: zero(),
        };
        transfer::share_object(history);
        transfer::share_object(pool);
    }

    entry fun create_diff(history: &mut History, title: String, desc: String,  bet_amount: u64, end_timestamp_ms: u64, is_random: bool, ctx: &mut TxContext) {
        let diff = Diff {
            id: object::new(ctx),
            title: title,
            desc: desc,
            user_a: @0x999,
            user_b: @0x999,
            desc_a: utf8(b""),
            desc_b: utf8(b""),
            bet_amount: bet_amount,
            bet_a: 0,
            bet_b: 0,
            end_timestamp_ms: end_timestamp_ms,
            is_random: is_random,
            winner: @0x999,
            reward_claimed: false,
            votes: vector::empty<Vote>(),
        };
        history.record.push_back(diff);
    }

    entry fun join_diff_a(pool: &mut Pool, diff: &mut Diff, desc: String, bet: Coin<SUI>, clock: &Clock, r: &Random, ctx: &mut TxContext) {
        assert!(diff.user_a == @0x999, USER_HAS_JOINED);
        assert!(clock.timestamp_ms() < diff.end_timestamp_ms, DIFF_HAS_ENDED);
        let bet_amount = bet.balance().value();
        assert!(bet_amount > diff.bet_amount, BET_NOT_ENOUGH);
        diff.user_a = ctx.sender();
        diff.desc_a = desc;
        diff.bet_a = diff.bet_amount;
        // if the diff is random and user_b has joined, then calculate the winner
        if (diff.is_random && diff.user_b != @0x999) {
            winRandomDiff(pool, diff, bet, r, ctx);
        }else {
            pool.balance.join(bet.into_balance());
        };
    }

    entry fun join_diff_b(pool: &mut Pool, diff: &mut Diff, desc: String,  bet: Coin<SUI>, r: &Random, ctx: &mut TxContext) {
        assert!(diff.user_b == @0x999, USER_HAS_JOINED);
        let bet_amount = bet.balance().value();
        assert!(bet_amount > diff.bet_amount, BET_NOT_ENOUGH);
        diff.user_b = ctx.sender();
        diff.desc_b = desc;
        diff.bet_b = diff.bet_amount;
        // if the diff is random and user_a has joined, then calculate the winner
        if (diff.is_random && diff.user_a != @0x999) {
            winRandomDiff(pool, diff, bet, r, ctx);
        }else {
            pool.balance.join(bet.into_balance());
        };
    }

    fun winRandomDiff(pool: &mut Pool, diff: &mut Diff,  bet: Coin<SUI>, r: &Random, ctx: &mut TxContext) {
        let points = getRandomPoints(r, ctx);
        let reward = pool.balance.split(diff.bet_amount);

        if (points < 5) {
            diff.winner = diff.user_a;
            transfer::public_transfer(from_balance(reward, ctx), diff.user_a);
            transfer::public_transfer(bet, diff.user_a);
        } else {
            // if winner is user_b , transfer the reward to user_b and return
            diff.winner = diff.user_b;
            transfer::public_transfer(from_balance(reward, ctx), diff.user_b);
            transfer::public_transfer(bet, diff.user_b);
        };
    }

    fun getRandomPoints(r: &Random, ctx: &mut TxContext): u64 {
    	random::generate_u64_in_range(&mut random::new_generator(r, ctx), 0, 10)
  	}

    entry fun vote_diff(diff: &mut Diff, vote_user: address, desc: String, clock: &Clock, ctx: &mut TxContext) {
        assert!(diff.user_a != @0x999 && diff.user_b != @0x999, USER_HAS_JOINED);
        assert!(clock.timestamp_ms() < diff.end_timestamp_ms, DIFF_HAS_ENDED);
        assert!(ctx.sender() != diff.user_a && ctx.sender() != diff.user_b, CAN_NOT_VOTE_SELF);
        let vote = Vote {
            id: object::new(ctx),
            user: ctx.sender(),
            desc: desc,
            vote: vote_user,
            claim_reward: false,
        };
        diff.votes.push_back(vote);
    }

    entry fun claim_reward(pool: &mut Pool, diff: &mut Diff, clock: &Clock, r: &Random, ctx: &mut TxContext) {
        assert!(diff.user_a != @0x999 && diff.user_b != @0x999 && diff.is_random == false, USER_HAS_JOINED);
        assert!(clock.timestamp_ms() > diff.end_timestamp_ms, DIFF_HAS_NOT_ENDED);

        // if the winner is not decided, then calculate the winner
        if (diff.winner == @0x999) {
            calculateWinner(diff, r, ctx);
        };

        // winner claim the reward
        if (diff.winner == ctx.sender()) {
            assert!(diff.reward_claimed == false, REWARD_CLAIMED);
            let amount_after_share = diff.bet_amount * (100 - Share_Rate) / 100;
            let reward = pool.balance.split(diff.bet_amount  + amount_after_share);
            diff.reward_claimed = true;

            transfer::public_transfer(from_balance(reward, ctx), diff.winner);
            return
        }


    }

    entry fun claim_reward_voter(pool: &mut Pool, diff: &mut Diff, vote: &mut Vote, clock: &Clock, r: &Random, ctx: &mut TxContext) {
        assert!(diff.user_a != @0x999 && diff.user_b != @0x999 && diff.is_random == false, USER_HAS_JOINED);
        assert!(clock.timestamp_ms() > diff.end_timestamp_ms, DIFF_HAS_NOT_ENDED);
        assert!(diff.votes.contains(vote), VOTE_NOT_FOUND);
        // if the winner is not decided, then calculate the winner
        if (diff.winner == @0x999) {
            calculateWinner(diff, r, ctx);
        };
        if (diff.votes.contains(vote)) {
            assert!(vote.claim_reward == false, REWARD_CLAIMED);
            vote.claim_reward = true;
            // share the reward to voters
            let share_balance = diff.bet_amount * Share_Rate / 100 / diff.votes.length();
            let reward = pool.balance.split(share_balance);
            vote.claim_reward = true;
            transfer::public_transfer(from_balance(reward, ctx), vote.user);
        }
    }

    fun calculateWinner(diff: &mut Diff, r: &Random, ctx: &mut TxContext) {
        let mut count_a = 0;
            let mut count_b = 0;
            let mut i = 0;
            while (i < diff.votes.length()) {
                if (diff.votes[i].vote == diff.user_a) {
                    count_a = count_a + 1u64;
                } else {
                    count_b =  count_b + 1;
                };
                i = i + 1;
            };
            if (count_a > count_b) {
                diff.winner = diff.user_a;
            } else if (count_a < count_b) {
                diff.winner = diff.user_b;
            } else {
                // if the votes are equal, then calculate the winner by random
                let points = getRandomPoints(r, ctx);
                if (points < 5) {
                    diff.winner = diff.user_a;
                } else {
                    diff.winner = diff.user_b;
                };
            }
    }

}
