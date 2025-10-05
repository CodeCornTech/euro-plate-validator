#!/bin/bash
# aggiungi il file di test
git add scripts/test-samples.mjs package.json
git commit -m "test: add per-country sample tests (3 positives each) and negatives"

# esegui i test
npm run test:samples

# bump versione (patch)
npm version patch -m "chore(release): v%s - add sample tests and minor fixes"

# push + tag
git push && git push --tags

# publish
npm publish --access public
