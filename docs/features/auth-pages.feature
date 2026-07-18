Feature: Auth pages
  The login page starts sign-in; the callback page completes it and routes onward.

  Scenario: The login page renders the Google sign-in button
    When the login page is rendered
    Then the heading "Playbook" is shown
    And a button labelled "Continue with Google" is shown

  Scenario: Clicking the login button starts sign-in
    When the login page is rendered
    And the "Continue with Google" button is clicked
    Then sign-in with Google was started

  Scenario: The callback page completes sign-in and routes home
    Given the callback will succeed with id token "id-1"
    When the callback page is rendered
    Then the signed-in handler receives the tokens
    And the app navigates to "/"

  Scenario: The callback page shows an error when sign-in fails
    Given the callback will fail with "State mismatch — possible CSRF, aborting sign-in"
    When the callback page is rendered
    Then the page shows "Sign-in failed: State mismatch — possible CSRF, aborting sign-in"

  Scenario: The callback runs the exchange only once
    Given the callback will succeed with id token "id-1"
    When the callback page is rendered
    Then the callback handler ran exactly once
