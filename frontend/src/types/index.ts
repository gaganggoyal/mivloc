export interface Profile {
  id: string
  display_name: string
  email: string
  phone: string | null
  username: string | null   // unique handle; also the invite/referral code
  referral_code: string
  invited_by: string | null
  created_at: string
}

export interface Chat {
  id: string
  user_a: string
  user_b: string
  chat_key: string | null      // random per-chat encryption key (base64)
  code_salt_a: string | null   // user_a's personal unlock code
  code_check_a: string | null
  code_salt_b: string | null   // user_b's personal unlock code
  code_check_b: string | null
  created_at: string
}

export interface DbMessage {
  id: string
  chat_id: string
  sender_id: string
  ciphertext: string
  created_at: string
}

/** A message as held in UI state. plaintext is null while locked. */
export interface UiMessage extends DbMessage {
  plaintext: string | null
}

export interface OneTimeRoom {
  slug: string
  creator: string
  created_at: string
}
