try {
    Set-Location C:\\Programs\\dynamodb
    java -D"java.library.path=./DynamoDBLocal_lib" -jar DynamoDBLocal.jar
} catch {
    Set-Location $PSScriptRoot
    Write-Host "Failed to start DynamoDB Local"
}
