# Qdiary

Qdiary is a web service that allows users to make diary notes. 
The data is saved in a special cloud service called 
[Hashstorage](https://github.com/fomalhaut88/hashstorage) 
that provides an extrememly high safety. It uses 
[AES-256](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)
encryption so nobody can view the original data including the owner of the cloud.
The website has minimalistic and friendly interface, it supports multiple diaries.

## Run from source

Step 1. Create a file `.env.production` with the defined Hashstorage root. For example: `VUE_APP_HASHSTORAGE_ROOT=https://hashstorage2.alexfomalhaut.com`

Step 2. `docker build -t qdiary .`

Step 3. `docker run -it -p 8080:80 --restart=always --name=qdiary-app -d qdiary`
