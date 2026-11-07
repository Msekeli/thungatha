# Scout integration contract

This document is retained as a pointer to the current integration design.

Thungatha is a consumer of Thungatha Scout. Scout owns extraction, vacancy validation, publication eligibility, description sanitisation and the export response contract.

See [Scout integration](./scout-integration.md) for the verified GET export endpoint, authentication header, pagination, field mapping, environment configuration and synchronisation behavior.

The integration must not introduce a push contract or require changes to Scout's published API.
