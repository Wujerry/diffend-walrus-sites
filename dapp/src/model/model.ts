export interface DiffModel {
  bet_a: string
  bet_amount: string
  bet_b: string
  desc: string
  desc_a: string
  desc_b: string
  end_timestamp_ms: string
  id: { id: string }
  is_random: boolean
  reward_claimed: boolean
  title: string
  user_a: string
  user_b: string
  votes: VoteModel[]
  winner: string
}

export interface VoteModel {
  id: { id: string }
  user: string
  desc: string
  note: string
  claim_reward: boolean
}
