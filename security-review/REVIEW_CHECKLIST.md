Security Review Checklist

Reviewers are encouraged to verify:

Core Logic
	•	Container parsing correctness
	•	Header validation
	•	CRC calculation
	•	Failure semantics

Cryptography
	•	AES-GCM parameter correctness
	•	PBKDF2 configuration
	•	Correct encryption and decryption order
	•	No custom crypto primitives

Steganography
	•	LSB embedding behavior
	•	Capacity calculation accuracy
	•	Fragment handling
	•	Decoy separation

UX and Safety
	•	No silent fallback
	•	Clear failure messaging
	•	Explicit threat model visibility

Offline Behavior
	•	No network calls
	•	No telemetry
	•	No remote dependencies
