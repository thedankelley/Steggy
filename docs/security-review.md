# Steggy 2.0 Security Review Guide

This document is intended for independent reviewers.

## Determinism
- All payload encoding is deterministic given identical inputs.
- Hashes are exposed in UI for verification.

## No Network Access
- No network requests are made.
- All operations occur client-side.

## Modules of Interest
- core/steggy-core.js
- core/steggy-crc.js
- modules/steggy-pgp.js
- modules/steggy-fragment.js

## Threat Model Mapping
| Threat | Mitigation |
|------|------------|
| Metadata leakage | Metadata stripping |
| Payload detection | Decoy payloads |
| Forced extraction | Fragmentation |
| Message compromise | PGP + AES |

## Reviewer Mode
Reviewers may:
- Disable embed
- Validate CRC
- Recompute hashes
