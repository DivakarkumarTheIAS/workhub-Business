$errors = npx tsc -p tsconfig.app.json 2>&1
$errors | Out-File -FilePath build_errors_clean.txt -Encoding utf8
