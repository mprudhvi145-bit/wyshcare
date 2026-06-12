# Access Matrix

Canonical session roles:

| Session role | staffRole | Allowed frontend zones |
| --- | --- | --- |
| `PATIENT` | - | `/patient/*` |
| `STAFF` | `DOCTOR` | `/doctor/*` |
| `STAFF` | `NURSE` | `/nurse/*` |
| `STAFF` | `ICU` | `/icu/*` |
| `STAFF` | `BILLING` | billing APIs only |
| `ADMIN` | - | `/admin/*`, `/icu/*` |

Validation sources:

- `backend/tests/auth.contract.test.mjs`
- `backend/tests/rbac.access-matrix.test.mjs`
- `backend/tests/rls.patient-isolation.test.js`
