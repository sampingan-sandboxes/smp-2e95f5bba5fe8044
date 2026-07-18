Feature: Token and PKCE helpers
  The pure helpers behind the auth flow: PKCE generation, ID-token decoding, and
  session-scoped storage.

  Scenario: A code verifier is base64url encoded random of 32 bytes
    When a code verifier is generated
    Then it is a non-empty base64url string
    And it decodes to 32 bytes

  Scenario: A state value is base64url encoded random of 16 bytes
    When a state value is generated
    Then it is a non-empty base64url string
    And it decodes to 16 bytes

  Scenario: The code challenge is the deterministic S256 digest of the verifier
    Given a code verifier "test-verifier-fixed-value"
    When the code challenge is derived
    Then the challenge is a non-empty base64url string
    And deriving the challenge again yields the same value
    And the challenge differs from the verifier

  Scenario: Decoding an ID token exposes its profile claims
    Given an ID token carrying name "Jane Doe", email "jane@example.com", picture "https://img/x.png"
    When the ID token is decoded
    Then the decoded claims are name "Jane Doe", email "jane@example.com", picture "https://img/x.png"

  Scenario Outline: Initials come from the name, then email, then a placeholder
    Given claims with name <name> and email <email>
    When the initials are computed
    Then the initials are "<initials>"

    Examples:
      | name        | email              | initials |
      | "Jane Doe"  | "jane@example.com" | JD       |
      | "Prince"    | "p@example.com"    | P        |
      | <none>      | "kai@example.com"  | K        |
      | <none>      | <none>             | ?        |

  Scenario: Tokens round-trip through storage
    Given tokens with id token "id-1", access token "ac-1", expiring in 3600 seconds
    When the tokens are saved
    Then reading the tokens returns id token "id-1" and access token "ac-1"
    When the tokens are cleared
    Then reading the tokens returns nothing

  Scenario: Reading tokens when none are stored returns nothing
    Then reading the tokens returns nothing

  Scenario: PKCE state is single-use
    Given a saved PKCE state with verifier "v-1" and state "s-1"
    When the PKCE state is read and cleared
    Then it returns verifier "v-1" and state "s-1"
    When the PKCE state is read and cleared
    Then it returns nothing
