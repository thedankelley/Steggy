# Steggy Test Vectors

This folder contains known-good images and payloads
used to verify Steggy functionality.

## How to Create a Test Vector

1. Embed a known message into an image
2. Compute SHA-256 of:
   - Original image
   - Stego image
   - Extracted payload
3. Record hashes here

## Why This Matters

Test vectors allow:
- Regression testing
- External cryptographic review
- Reproducible verification
