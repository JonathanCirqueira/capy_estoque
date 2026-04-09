<?php

declare(strict_types=1);

test('that true is true', function () {
    $result = true;
    expect($result)->toBe($result);
});
