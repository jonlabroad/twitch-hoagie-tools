
Remove-Item dist.zip
cd dist
7z a ../dist.zip ./*
cd ..
#aws s3 cp ./build.zip s3://gitlab-companion/release/gitlab-companion.zip