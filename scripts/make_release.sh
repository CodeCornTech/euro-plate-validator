#!/bin/bash

gh release create v"$(node -p "require('./package.json').version")" \
    --title "v$(node -p "require('./package.json').version")" \
    --notes "• Multi-country EU plates (car & IT motorcycle)  
• CLI: npx @codecorn/euro-plate-validator \"AB 123 CD\" --countries IT --type car  
• PHP variant in php_variant/  
• Build ignores php_variant, bin, node_modules, dist"
