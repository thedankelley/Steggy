# Steggy Test Vectors

These test vectors verify correctness and reproducibility.

All hashes use SHA-256.

---

## Plaintext

File: plaintext.txt

Expected content:
"Steggy test message."

---

## AES Test

Password:
test-password-123

---

## PGP Test

Public/Private key pair generated via Steggy UI.
Keys are included for verification only.

---

## Images

image-input.png is a fixed PNG with no metadata.

image-output-*.png are generated outputs.

---

## Verification

1. Upload image-output-aes.png
2. Enter AES password
3. Extract payload
4. Result must equal plaintext.txt
