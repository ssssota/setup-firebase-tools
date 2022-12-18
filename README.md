# setup-firebase-tools

This action provides the [firebase-tools](https://github.com/firebase/firebase-tools)(CLI) with auth setting.

## Usage

```yml
steps:
- uses: actions/checkout@v3
- uses: ssssota/setup-firebase-tools@v1
  with:
    firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
- run: firebase deploy
```

## Inputs

- `firebaseServiceAccount`: Firebase service account key (JSON)
