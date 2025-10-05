<?php
/**
 * Euro Plate Validator (PHP) – Russia excluded
 * Supporta auto e, per l’Italia, anche moto.
 */

function europlate_normalize(string $s): string
{
    $s = strtoupper($s);
    $s = preg_replace('/\s+/', ' ', $s);
    return trim($s);
}

function europlate_rx_map(): array
{
    return [
        'IT' => [
            'name' => 'Italy',
            'car' => [
                '/^(?!EE)[A-HJ-NP-RTV-Z]{2}\s?\d{3}\s?[A-HJ-NP-RTV-Z]{2}$/'
                #'/^(?!EE)[A-HJ-NP-RTZ]{2}\s?\d{3}\s?[A-HJ-NP-RTZ]{2}$/'
                #  '/^(?!EE)[A-HJ-NP-RTV-Z]{2}\s?\d{3}\s?[A-HJ-NP-RTV-Z]{2}$/'
            ],
            'motorcycle' => [
                '/^[A-HJ-NP-RTZ]{2}\s?\d{5}$/'
                # '/^[A-HJ-NP-RTV-Z]{2}\s?\d{5}$/'
            ]
        ],
        'UK' => [
            'name' => 'United Kingdom',
            'car' => [
                '/^[A-Z]{2}\d{2}\s?[A-Z]{3}$/',
                '/^[A-Z]{1,3}\s?\d{1,4}\s?[A-Z]{0,3}$/'
            ]
        ],
        'DE' => ['name' => 'Germany', 'car' => ['/^[A-Z]{1,3}-[A-Z]{1,2}\s?\d{1,4}$/']],
        'FR' => ['name' => 'France', 'car' => ['/^[A-Z]{2}-\d{3}-[A-Z]{2}$/']],
        'ES' => ['name' => 'Spain', 'car' => ['/^\d{4}\s?[BCDFGHJKLMNPRSTVWXYZ]{3}$/']],

        'PT' => [
            'name' => 'Portugal',
            'car' => [
                '/^\d{2}-[A-Z]{2}-\d{2}$/',
                '/^[A-Z]{2}-\d{2}-\d{2}$/',
                '/^\d{2}-\d{2}-[A-Z]{2}$/'
            ]
        ],
        'NL' => [
            'name' => 'Netherlands',
            'car' => [
                '/^[A-Z]{2}-\d{3}-[A-Z]{2}$/',
                '/^\d{2}-[A-Z]{3}-\d$/',
                '/^\d-[A-Z]{3}-\d{2}$/',
                '/^[A-Z]{2}-[A-Z]{2}-\d{2}$/',
                '/^\d{2}-[A-Z]{2}-[A-Z]{2}$/',
                '/^[A-Z]{3}-\d{2}-[A-Z]$/'
            ]
        ],
        'BE' => [
            'name' => 'Belgium',
            'car' => [
                '/^[1-9]-[A-Z]{3}-\d{3}$/',
                '/^[A-Z]{3}-\d{3}$/'
            ]
        ],
        'CH' => ['name' => 'Switzerland', 'car' => ['/^[A-Z]{2}\s?\d{1,6}$/']],
        'AT' => ['name' => 'Austria', 'car' => ['/^[A-Z]{1,3}\s?\d{1,4}\s?[A-Z]{0,2}$/']],
        'IE' => ['name' => 'Ireland', 'car' => ['/^\d{2,3}-[A-Z]{1,2}-\d{1,6}$/']],
        'LU' => [
            'name' => 'Luxembourg',
            'car' => [
                '/^\d{4,6}$/',
                '/^\d{1,2}-\d{3,4}$/'
            ]
        ],
        'DK' => ['name' => 'Denmark', 'car' => ['/^[A-Z]{2}\s?\d{2}\s?\d{3}$/']],
        'SE' => ['name' => 'Sweden', 'car' => ['/^[A-Z]{3}\s?\d{2}[A-Z0-9]$/']],
        'NO' => ['name' => 'Norway', 'car' => ['/^[A-Z]{2}\s?\d{5}$/']],
        'FI' => ['name' => 'Finland', 'car' => ['/^[A-Z]{3}-\d{3}$/']],
        'PL' => ['name' => 'Poland', 'car' => ['/^[A-Z]{1,3}\s?[A-Z0-9]{4,5}$/']],
        'CZ' => ['name' => 'Czechia', 'car' => ['/^\d[A-Z]{2}\s?\d{4}$/']],
        'SK' => ['name' => 'Slovakia', 'car' => ['/^[A-Z]{2}\s?\d{3,4}[A-Z]{0,2}$/']],
        'HU' => [
            'name' => 'Hungary',
            'car' => [
                '/^[A-Z]{3}-\d{3}$/',
                '/^[A-Z]{2}\d{2}-[A-Z]{2}$/'
            ]
        ],
        'RO' => ['name' => 'Romania', 'car' => ['/^[A-Z]{1,2}\s?\d{2,3}\s?[A-Z]{3}$/']],
        'BG' => ['name' => 'Bulgaria', 'car' => ['/^[A-Z]{1,2}\s?\d{4}\s?[A-Z]{1,2}$/']],
        'SI' => ['name' => 'Slovenia', 'car' => ['/^[A-Z]{2}-\d{3,4}-[A-Z]{1,2}$/']],
        'HR' => ['name' => 'Croatia', 'car' => ['/^[A-Z]{2}\s?\d{3,4}-[A-Z]{2}$/']],
        'GR' => ['name' => 'Greece', 'car' => ['/^[A-Z]{3}-\d{4}$/']],
        'LT' => ['name' => 'Lithuania', 'car' => ['/^[A-Z]{3}\s?\d{3}$/']],
        'LV' => ['name' => 'Latvia', 'car' => ['/^[A-Z]{2}-\d{4}$/']],
        'EE' => ['name' => 'Estonia', 'car' => ['/^\d{3}\s?[A-Z]{3}$/']],
        'UA' => ['name' => 'Ukraine', 'car' => ['/^[A-Z]{2}\s?\d{4}\s?[A-Z]{2}$/']]
    ];
}

/**
 * @param string $plate
 * @param array $countries es: ['IT','FR']
 * @param string $vehicleType "car"|"motorcycle"|"any"
 */
function validate_plate(string $plate, array $countries = [], string $vehicleType = "any"): array
{
    $norm = europlate_normalize($plate);
    $map = europlate_rx_map();

    $picks = $countries ? array_values(array_intersect($countries, array_keys($map))) : array_keys($map);

    if ($norm === '')
        return ['isValid' => false, 'matches' => [], 'checked' => $picks, 'errors' => ['empty']];
    if (!$picks)
        return ['isValid' => false, 'matches' => [], 'checked' => [], 'errors' => ['no_countries_selected']];

    $matches = [];
    foreach ($picks as $c) {
        $def = $map[$c];
        $ok = false;
        if ($vehicleType === "car" || $vehicleType === "any") {
            foreach (($def['car'] ?? []) as $rx) {
                if (preg_match($rx, $norm)) {
                    $ok = true;
                    break;
                }
            }
        }
        if (!$ok && ($vehicleType === "motorcycle" || $vehicleType === "any")) {
            foreach (($def['motorcycle'] ?? []) as $rx) {
                if (preg_match($rx, $norm)) {
                    $ok = true;
                    break;
                }
            }
        }
        if ($ok)
            $matches[] = ['country' => $c, 'name' => $def['name']];
    }

    return [
        'isValid' => (bool) count($matches),
        'matches' => $matches,
        'checked' => $picks,
        'errors' => $matches ? null : ['no_match']
    ];
}
