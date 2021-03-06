# Mandrill Sugared

[![Build Status](https://semaphoreci.com/api/v1/projects/771722c0-6cc7-4738-bd88-c56ec1f6c055/488172/badge.svg)](https://semaphoreci.com/calebmorris/mandrill-sugared-2)

A simplified Mandrill wrapper for ease of use and hooking into known locations
 in the workflow for logging.

# Example

- [`sendEmail`](examples/sendEmail.js)
- [`sendEmailTemplate`](examples/sendTemplate.js)

# API

## Construction

### Options
- `whitelist` Whitelisted emails requires any emails to be of one of these patterns
  - Ex: `[ 'test@example.com', /^.*@example.com$/ ]`
- `blacklist` Blacklisted emails - black overrides white or filters out base
  - Ex: `[ 'badEmail@example.com', /^.*@badDomain.com$/ ]`
- `hooks` Loggin hooks
  - `sendEmailBlocked`
  - `sendEmailCompleted`
  - `sendEmailFailed`
  - `sendTemplateBlocked`
  - `sendTemplateCompleted`
  - `sendTemplateFailed`
