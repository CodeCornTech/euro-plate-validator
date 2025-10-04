```php
require 'EuroPlateValidator.php';

var_dump(validate_plate('AB 123 CD', ['IT']));
var_dump(validate_plate('AB12 CDE', ['UK','IE']));
var_dump(validate_plate('ZG 1234-AB', ['HR','SI','HU']));
```