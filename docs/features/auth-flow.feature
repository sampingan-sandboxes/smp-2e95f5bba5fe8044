Feature: Cognito auth flow
  Sign-in redirect, callback token exchange, session validity, silent refresh, sign-out.

  Scenario: Sign-in saves PKCE state and redirects to the authorize endpoint
    When sign-in with Google is started
    Then the browser is redirected to a URL starting with "https://test.auth.example.com/oauth2/authorize"
    And the authorize URL has query "response_type" equal to "code"
    And the authorize URL has query "scope" equal to "openid email profile"
    And the authorize URL has query "identity_provider" equal to "Google"
    And the authorize URL has query "code_challenge_method" equal to "S256"
    And the authorize URL carries a non-empty "code_challenge"
    And the authorize URL "state" matches the saved PKCE state

  Scenario: The callback rejects a Cognito error param
    When the callback is handled for URL "http://localhost/auth/callback?error=access_denied"
    Then the callback is rejected with a message containing "access_denied"

  Scenario: The callback rejects a state mismatch
    Given a saved PKCE state with verifier "v-1" and state "expected-state"
    When the callback is handled for URL "http://localhost/auth/callback?code=abc&state=WRONG"
    Then the callback is rejected with a message containing "State mismatch"

  Scenario: The callback exchanges the code and stores the session
    Given a saved PKCE state with verifier "v-1" and state "s-1"
    And the token endpoint will return id token "id-1", access token "ac-1", refresh token "rf-1", expiring in 3600 seconds
    When the callback is handled for URL "http://localhost/auth/callback?code=the-code&state=s-1"
    Then the token request used grant type "authorization_code" with code "the-code"
    And the returned session has id token "id-1"
    And the stored session has id token "id-1"

  Scenario: The callback surfaces a failed token exchange
    Given a saved PKCE state with verifier "v-1" and state "s-1"
    And the token endpoint will fail with status 400 and body "invalid_grant"
    When the callback is handled for URL "http://localhost/auth/callback?code=the-code&state=s-1"
    Then the callback is rejected with a message containing "Token exchange failed"

  Scenario: getCurrentUser returns a live session
    Given a stored session expiring in 3600 seconds
    Then the current user is present

  Scenario: getCurrentUser ignores an expired session
    Given a stored session that expired 10 seconds ago
    Then there is no current user

  Scenario: ensureValidTokens keeps a comfortably valid session unchanged
    Given a stored session expiring in 3600 seconds
    When valid tokens are ensured
    Then the ensured session is present
    And no token refresh request was made

  Scenario: ensureValidTokens refreshes a session that is expiring soon
    Given a stored session with refresh token "rf-1" expiring in 10 seconds
    And the token endpoint will return id token "id-2", access token "ac-2", expiring in 3600 seconds
    When valid tokens are ensured
    Then a token refresh request was made with refresh token "rf-1"
    And the ensured session has id token "id-2"

  Scenario: ensureValidTokens keeps a still-valid session when refresh fails
    Given a stored session with refresh token "rf-1" expiring in 30 seconds
    And the token endpoint will fail with status 500 and body "server_error"
    When valid tokens are ensured
    Then the ensured session has id token "id-1"

  Scenario: ensureValidTokens clears an expired unrefreshable session
    Given a stored session that expired 10 seconds ago
    When valid tokens are ensured
    Then there is no ensured session
    And the stored session was cleared

  Scenario: Signing out clears the session and redirects to logout
    Given a stored session expiring in 3600 seconds
    When the user signs out
    Then the stored session was cleared
    And the browser is redirected to a URL starting with "https://test.auth.example.com/logout"
