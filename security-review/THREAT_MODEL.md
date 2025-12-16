Threat Model

Steggy is designed with an explicit, limited threat model.

Adversaries Considered
	•	Passive observers intercepting images
	•	Automated content scanning systems
	•	Casual inspection of image files
	•	Opportunistic adversaries without original image access

Adversaries Not Defended Against
	•	Adversaries with access to the original cover image
	•	Advanced forensic analysts
	•	Compromised user devices
	•	Malware on the endpoint
	•	Keylogging or screen capture
	•	Traffic correlation or behavioral analysis

Assumptions
	•	The user controls the input image
	•	The user understands that steganography may raise suspicion
	•	The user does not reuse cover images
	•	Cryptographic keys are handled securely by the user

Steggy does not claim protection outside these assumptions.
